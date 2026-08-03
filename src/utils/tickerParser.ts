// Pure parsing for the centrometeolombardo.com ticker image's OCR'd text.
// No Node/browser-specific APIs — shared between (in principle) any future
// server use and the client-side OCR pipeline in LakeWindMap.astro, which is
// where this actually runs today (see that file for why: tesseract.js's WASM
// OCR was too slow under Vercel's serverless CPU allocation, so recognition
// moved to the visitor's own browser).

import { WIND_DIR_DEGREES } from './weather';

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

/** Shape consumed by the compact station table (built client-side, see LakeWindMap.astro). */
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

/** Parse raw OCR text into a structured reading, or null if the ticker's fixed shape wasn't found. */
export function parseTickerText(text: string, lastModified: string): StationReading | null {
  const m = text.trim().match(TICKER_RE);
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
    lastModified,
  };
}
