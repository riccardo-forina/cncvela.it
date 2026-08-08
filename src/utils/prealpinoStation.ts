// Centro Geofisico Prealpino (astrogeo.va.it) runs a second amateur station
// network around Lake Maggiore/Varese, independent of both
// centrometeolombardo.com (ocr) and Meteo Live VCO (json). Its station pages
// are plain server-rendered HTML — no image ticker, no JSON API. The client
// refreshes via `location.reload()` every 2 minutes; there is no AJAX
// endpoint to call instead (confirmed by reading the page source, not
// guessed). The upside over OCR: the numbers are real text nodes, not pixels
// tesseract has to guess at.
//
// Confirmed live against two stations (2026-08-08): plm (Pino Lago Maggiore
// - Molo) and legg (Leggiuno Quicchio) — same template, same field order.
// Wind direction is inconsistently either a full Italian word ("Sud") or an
// English-style 16-point abbreviation ("SSE") depending on the station/
// reading; both were seen for real, not assumed — see DIRECTION_TO_DEGREES.

import { WIND_DIR_DEGREES } from './weather';

const USER_AGENT = 'cncvela.it/1.0 (+https://www.cncvela.it; stazioni meteo lago)'; // matches webcams.ts's convention
const FETCH_TIMEOUT_MS = 8000;
// Same threshold as the OCR/JSON/webcam sources — a dead/stale source must
// not render as live.
const FRESHNESS_THRESHOLD_MS = 3 * 60 * 60 * 1000;
const CACHE_TTL_MS = 5 * 60 * 1000;

export interface PrealpinoReading {
  windKn: number;
  windDirDeg: number;
  pressureHpa: number;
  rainMm: number;
  /** ISO string, converted from the page's "Aggiornato alle ore HH:MM del giorno DD/MM/YYYY" (Europe/Rome local). */
  lastModified: string;
}

const kmhToKnots = (kmh: number): number => Math.round(kmh * 0.5399);

// The 8 primary/intercardinal points the page spells out in Italian when a
// reading lands exactly on one; anything in between comes through as a
// 16-point English-style abbreviation already covered by WIND_DIR_DEGREES
// (e.g. "SSE"). Keyed lowercase, hyphens/spaces stripped, for matching.
const ITALIAN_DIR_TO_CODE: Record<string, keyof typeof WIND_DIR_DEGREES> = {
  nord: 'N',
  nordest: 'NE',
  est: 'E',
  sudest: 'SE',
  sud: 'S',
  sudovest: 'SW',
  ovest: 'W',
  nordovest: 'NW',
};

function directionToDegrees(raw: string): number {
  const normalized = raw.trim().toLowerCase().replace(/[\s-]/g, '');
  const code = ITALIAN_DIR_TO_CODE[normalized] ?? (raw.trim().toUpperCase() as keyof typeof WIND_DIR_DEGREES);
  return WIND_DIR_DEGREES[code] ?? 0;
}

// Plausibility bounds, same rationale as tickerParser.ts's: this makes a
// mis-scraped or template-changed page fail closed (falls back to the
// existing stale/last-seen UI) instead of ever rendering a garbage number.
const PLAUSIBLE_RANGES = {
  windKmh: [0, 200],
  pressureHpa: [900, 1100],
  rainMm: [0, 500],
} as const;

const isPlausible = (value: number, [min, max]: readonly [number, number]): boolean =>
  Number.isFinite(value) && value >= min && value <= max;

interface RawReading {
  hour: number;
  minute: number;
  day: number;
  month: number;
  year: number;
  windKmh: number;
  windDir: string;
  pressureHpa: number;
  rainMm: number;
}

// Anchored on the page's own fixed (confirmed on two stations) label text
// rather than position, so incidental whitespace/formatting differences
// don't matter — only the label wording has to stay stable.
const TIMESTAMP_RE = /Aggiornato alle ore:\s*(\d{1,2}):(\d{2})\s*del giorno\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/;
// "...da h 00 <humidity> <rainFrom00> <rainLast30> ND ND" — only the rain
// figure (2nd number) is used; humidity isn't part of this site's data model.
const RAIN_RE = /da h 00\s+[\d.]+\s+([\d.]+)\s+[\d.]+\s+ND\s+ND/;
// "...Tendenza 3h <windKmh> <windDir> <windRunKm> <gustKmh> <gustDir> (h HH.MM) <pressureHpa> <tendenza>"
const WIND_PRESSURE_RE =
  /Tendenza 3h\s+([\d.]+)\s+([A-Za-zÀ-ÿ-]+)\s+[\d.]+\s+[\d.]+\s+[A-Za-zÀ-ÿ-]+\s*\(h[^)]*\)\s+([\d.]+)/;

/** Pure parse: strip tags, extract the fixed fields, reject implausible values. Exported for testing. */
export function parsePrealpinoHtml(html: string): RawReading | null {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');

  const ts = text.match(TIMESTAMP_RE);
  const rain = text.match(RAIN_RE);
  const windPressure = text.match(WIND_PRESSURE_RE);
  if (!ts || !rain || !windPressure) return null;

  const windKmh = parseFloat(windPressure[1]);
  const pressureHpa = parseFloat(windPressure[3]);
  const rainMm = parseFloat(rain[1]);

  if (
    !isPlausible(windKmh, PLAUSIBLE_RANGES.windKmh) ||
    !isPlausible(pressureHpa, PLAUSIBLE_RANGES.pressureHpa) ||
    !isPlausible(rainMm, PLAUSIBLE_RANGES.rainMm)
  ) {
    return null;
  }

  return {
    hour: parseInt(ts[1], 10),
    minute: parseInt(ts[2], 10),
    day: parseInt(ts[3], 10),
    month: parseInt(ts[4], 10),
    year: parseInt(ts[5], 10),
    windKmh,
    windDir: windPressure[2],
    pressureHpa,
    rainMm,
  };
}

/**
 * The page's timestamp is Europe/Rome wall-clock time with no UTC offset
 * given. Rather than hardcode CET/CEST, derive the current real offset by
 * comparing true-UTC-now to Rome-local-now (same technique as weather.ts's
 * fetchForecast), then apply that same offset to the parsed wall-clock
 * fields. Good enough for freshness gating within a few hours; not meant
 * for dates far from "now".
 */
function romeWallClockToDate(year: number, month: number, day: number, hour: number, minute: number): Date {
  const now = new Date();
  const romeNowParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(now);
  const part = (type: string) => Number(romeNowParts.find((p) => p.type === type)?.value ?? 0);
  const romeNowAsUtc = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour') % 24, part('minute'), part('second'));
  const offsetMs = now.getTime() - romeNowAsUtc;
  return new Date(Date.UTC(year, month - 1, day, hour, minute) + offsetMs);
}

declare global {
  var prealpinoCache: Record<string, { data: PrealpinoReading | null; timestamp: number }> | undefined;
}

/** Fetch + freshness-gate + cache a Prealpino station reading, keyed by station id. */
export async function getPrealpinoReading(id: string, pageUrl: string): Promise<PrealpinoReading | null> {
  const now = Date.now();
  const cached = globalThis.prealpinoCache?.[id];
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  let result: PrealpinoReading | null = null;
  try {
    const res = await fetch(pageUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (res.ok) {
      const html = await res.text();
      const raw = parsePrealpinoHtml(html);
      if (raw) {
        const lastModified = romeWallClockToDate(raw.year, raw.month, raw.day, raw.hour, raw.minute);
        if (Date.now() - lastModified.getTime() <= FRESHNESS_THRESHOLD_MS) {
          result = {
            windKn: kmhToKnots(raw.windKmh),
            windDirDeg: directionToDegrees(raw.windDir),
            pressureHpa: raw.pressureHpa,
            rainMm: raw.rainMm,
            lastModified: lastModified.toISOString(),
          };
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching Prealpino station ${id}:`, error);
  }

  globalThis.prealpinoCache = {
    ...globalThis.prealpinoCache,
    [id]: { data: result, timestamp: now },
  };

  return result;
}
