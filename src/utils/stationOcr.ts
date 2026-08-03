import { createWorker, type Worker } from 'tesseract.js';
import sharp from 'sharp';
import { fetchImage, isWithinFreshnessThreshold } from './webcams';
import { WIND_DIR_DEGREES } from './weather';

const CACHE_TTL_MS = 5 * 60 * 1000;
// tesseract.js spins up a worker thread and, on a cold serverless instance,
// downloads its core/wasm/language files — none of which respects an
// AbortSignal. A hang here (seen in production, unlike this session's local
// testing) would otherwise block the whole page's SSR render forever, since
// every station is awaited before any HTML is emitted.
const OCR_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export interface StationReading {
  tempC: number;
  windKmh: number;
  windKn: number;
  windDir: string;
  windDirDeg: number;
  pressureHpa: number;
  rainMm: number;
  rainRateMmh: number;
  /** Upstream Last-Modified, ISO string — shown as "agg. Xm fa" so a slow-but-not-dead station reads as trustworthy rather than just old. */
  lastModified: string;
}

/** Shape consumed by StationReadingRow.astro's compact table. */
export interface StationTableRow {
  id: string;
  name: string;
  attributionUrl: string;
  pressureHpa: number;
  rainMm: number;
}

// Matches the centrometeolombardo.com ticker's fixed field order:
// temp°C  humidity%  dewpoint°C  windSpeed km/h DIR  pressure hPa  rain mm  rainRate mm/h
// Humidity/dewpoint are intentionally NOT captured — dropped as a product
// decision (not useful for sailing), which also happens to sidestep OCR's
// most unreliable spot (the "%" glyph is prone to misreads at this
// resolution). There's deliberately no anchor on the dewpoint °C itself —
// it's sometimes dropped entirely by OCR (not just the ° glyph, the "C"
// too) — the lazy `.*?` just skips everything up to the next `km/h`
// unconditionally, which is reliable enough on its own to locate the wind
// field regardless of what the humidity/dewpoint noise looks like. A short
// tolerant gap before the compass letters absorbs stray OCR characters
// there too (observed: "km/hmWNW"). Every numeric field is captured
// loosely (digits, optionally with a decimal separator) and reconstructed
// by parseFlexibleDecimal — OCR sometimes drops the decimal point/space
// entirely, merging e.g. "6.4" into "64".
const TICKER_RE =
  /(\d+(?:[.\s]\d+)?)\s*°?C.*?(\d+(?:[.\s]\d+)?)\s*km\/?h.{0,3}?([NSEW]{1,3})(?=\s).*?(\d+(?:[.\s]\d+)?)\s*hPa.*?(\d+(?:[.\s]\d+)?)\s*mm.*?(\d+(?:[.\s]\d+)?)\s*mm/i;

/**
 * The ticker always renders exactly one decimal digit per field. OCR
 * sometimes preserves the "." or replaces it with a space, but occasionally
 * drops it entirely, merging the two digit groups (e.g. "6.4" -> "64").
 * Reconstruct consistently: if a separator survived, use it; otherwise the
 * last digit is the decimal.
 */
function parseFlexibleDecimal(raw: string): number {
  if (raw.includes('.')) return parseFloat(raw);
  if (/\s/.test(raw)) return parseFloat(raw.replace(/\s+/, '.'));
  if (raw.length <= 1) return parseFloat(raw);
  return parseFloat(`${raw.slice(0, -1)}.${raw.slice(-1)}`);
}

const kmhToKnots = (kmh: number): number => Math.round(kmh * 0.5399);

let workerPromise: Promise<Worker> | null = null;
async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    // Vercel's serverless functions have a read-only filesystem except /tmp
    // — tesseract.js needs somewhere writable to cache the language data.
    workerPromise = createWorker('eng', 1, { cachePath: '/tmp' }).then(async (worker) => {
      await worker.setParameters({
        tessedit_pageseg_mode: '7' as any, // single text line
        tessedit_char_whitelist: '0123456789.,°CNSEWkmh/PahT% ',
      });
      return worker;
    });
  }
  return workerPromise;
}

async function ocrTickerImage(buffer: Buffer, lastModified: Date): Promise<StationReading | null> {
  const upscaled = await sharp(buffer)
    .resize({ width: 1532 * 6, height: 40 * 6, kernel: 'lanczos3' })
    .grayscale()
    .threshold(180)
    .toBuffer();

  const worker = await getWorker();
  const { data } = await worker.recognize(upscaled);
  const m = data.text.trim().match(TICKER_RE);
  if (!m) return null;

  const windKmh = parseFlexibleDecimal(m[2]);
  const windDir = m[3].toUpperCase();

  return {
    tempC: parseFlexibleDecimal(m[1]),
    windKmh,
    windKn: kmhToKnots(windKmh),
    windDir,
    windDirDeg: WIND_DIR_DEGREES[windDir] ?? 0,
    pressureHpa: parseFlexibleDecimal(m[4]),
    rainMm: parseFlexibleDecimal(m[5]),
    rainRateMmh: parseFlexibleDecimal(m[6]),
    lastModified: lastModified.toISOString(),
  };
}

/** Result of a station lookup: a live reading, and/or the last time we know the source updated (even if too stale to treat as live) — lets a "greyed out" station still show "last seen X ago" instead of nothing. */
export interface StationLookupResult {
  reading: StationReading | null;
  lastKnownUpdate: string | null;
}

declare global {
  var stationOcrCache: Record<string, { data: StationLookupResult; timestamp: number }> | undefined;
}

/** Fetch + OCR + cache a station ticker reading, keyed by station id. OCR only runs if the source is within the freshness threshold; the timestamp itself is returned regardless, so a stale station can still show "last seen X ago". */
export async function getStationReading(id: string, sourceUrl: string): Promise<StationLookupResult> {
  const now = Date.now();
  const cached = globalThis.stationOcrCache?.[id];
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  let result: StationLookupResult = { reading: null, lastKnownUpdate: null };
  const fetched = await fetchImage(sourceUrl);
  if (fetched) {
    result.lastKnownUpdate = fetched.lastModified.toISOString();
    if (isWithinFreshnessThreshold(fetched.lastModified)) {
      try {
        result.reading = await withTimeout(
          ocrTickerImage(fetched.buffer, fetched.lastModified),
          OCR_TIMEOUT_MS,
          `OCR for station ${id}`
        );
      } catch (error) {
        console.error(`OCR failed for station ${id}:`, error);
      }
    }
  }

  globalThis.stationOcrCache = {
    ...globalThis.stationOcrCache,
    [id]: { data: result, timestamp: now },
  };

  return result;
}
