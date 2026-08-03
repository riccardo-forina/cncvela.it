// Föhn (favonio) risk indicator via the Lugano−Zurich mean-sea-level pressure
// differential — the same documented regional method used by meteocentrale.ch
// and waterwind.it's Föhn charts. South Föhn (the event relevant to Lake
// Maggiore) is signaled by Lugano pressure exceeding Zurich's: ≥4 hPa for
// breakthrough in alpine valleys, ≥8 hPa to reach the lowlands (~2 hPa can be
// enough in spring). This is an indicator, not a guarantee — wind direction
// aloft matters too — always shown with a "verify real conditions" caveat.

const ZURICH = { lat: 47.377, lon: 8.542 };
const LUGANO = { lat: 46.004, lon: 8.951 };

const CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

export type FoehnLevel = 'bassa' | 'moderata' | 'alta';
export type FoehnTrend = 'up' | 'down' | 'stable';

export interface FoehnStatus {
  differentialHpa: number;
  level: FoehnLevel;
  trend: FoehnTrend;
}

declare global {
  var foehnCache: { data: FoehnStatus | null; timestamp: number } | undefined;
}

function levelForDifferential(hpa: number): FoehnLevel {
  if (hpa >= 8) return 'alta';
  if (hpa >= 4) return 'moderata';
  return 'bassa';
}

async function fetchPressureSeries(lat: number, lon: number): Promise<{ current: number; hourly: number[] } | null> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}&longitude=${lon}` +
      `&current=pressure_msl&hourly=pressure_msl` +
      `&timezone=Europe/Rome&forecast_days=3`,
    { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const current = data.current?.pressure_msl;
  const hourly = data.hourly?.pressure_msl;
  if (typeof current !== 'number' || !Array.isArray(hourly)) return null;
  return { current, hourly };
}

async function computeFoehnStatus(): Promise<FoehnStatus | null> {
  try {
    const [zurich, lugano] = await Promise.all([
      fetchPressureSeries(ZURICH.lat, ZURICH.lon),
      fetchPressureSeries(LUGANO.lat, LUGANO.lon),
    ]);
    if (!zurich || !lugano) return null;

    const differentialHpa = Math.round((lugano.current - zurich.current) * 10) / 10;

    // Trend: compare current differential to ~24h-ahead forecast differential.
    const futureIdx = Math.min(24, zurich.hourly.length - 1, lugano.hourly.length - 1);
    const futureDifferential = lugano.hourly[futureIdx] - zurich.hourly[futureIdx];
    const delta = futureDifferential - (lugano.current - zurich.current);

    let trend: FoehnTrend = 'stable';
    if (delta > 1) trend = 'up';
    else if (delta < -1) trend = 'down';

    return {
      differentialHpa,
      level: levelForDifferential(differentialHpa),
      trend,
    };
  } catch (error) {
    console.error('Error computing Föhn status:', error);
    return null;
  }
}

export async function getFoehnStatus(): Promise<FoehnStatus | null> {
  const now = Date.now();
  const cached = globalThis.foehnCache;
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const data = await computeFoehnStatus();
  globalThis.foehnCache = { data, timestamp: now };
  return data;
}
