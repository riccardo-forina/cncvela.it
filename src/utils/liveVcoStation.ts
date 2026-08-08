// Meteo Live VCO (meteolivevco.it) runs a real amateur station network
// around Lake Maggiore's west shore with a clean JSON API per station.
// Field names differ slightly between stations on this network (wind_from
// vs wind_dir, with/without a _text suffix) — confirmed by sampling
// several; this tolerates both.

const FETCH_TIMEOUT_MS = 8000;
// Same threshold as the other station/webcam sources (prealpinoStation.ts,
// webcams.ts) — dead/stale sources must not render as live, for the same
// reason.
const FRESHNESS_THRESHOLD_MS = 3 * 60 * 60 * 1000;
const CACHE_TTL_MS = 5 * 60 * 1000;

export interface LiveVcoReading {
  windKn: number;
  windDirDeg: number;
  pressureHpa: number;
  rainMm: number;
  /** ISO string, from the API's own `timestamp` field. */
  lastModified: string;
}

const kmhToKnots = (kmh: number): number => Math.round(kmh * 0.5399);

declare global {
  var liveVcoCache: Record<string, { data: LiveVcoReading | null; timestamp: number }> | undefined;
}

/** Fetch + freshness-gate + cache a Meteo Live VCO station reading, keyed by station id. */
export async function getLiveVcoReading(id: string, apiUrl: string): Promise<LiveVcoReading | null> {
  const now = Date.now();
  const cached = globalThis.liveVcoCache?.[id];
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  let result: LiveVcoReading | null = null;
  try {
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.timestamp === 'number') {
        const lastModified = new Date(data.timestamp * 1000);
        if (Date.now() - lastModified.getTime() <= FRESHNESS_THRESHOLD_MS) {
          result = {
            windKn: kmhToKnots(data.wind_speed ?? 0),
            windDirDeg: data.wind_from ?? data.wind_dir ?? 0,
            pressureHpa: data.pressure,
            rainMm: data.rain_day ?? 0,
            lastModified: lastModified.toISOString(),
          };
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching live VCO station ${id}:`, error);
  }

  globalThis.liveVcoCache = {
    ...globalThis.liveVcoCache,
    [id]: { data: result, timestamp: now },
  };

  return result;
}
