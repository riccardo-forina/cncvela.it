const USER_AGENT = 'cncvela.it/1.0 (+https://www.cncvela.it; stazioni meteo lago)';
// These are unmonitored third-party hobbyist servers — one of them being slow
// or hung must not take the whole page down with it (it did: a hung fetch
// here blocked the entire SSR render, since every station is awaited before
// any HTML is emitted).
const FETCH_TIMEOUT_MS = 8000;
// 3h — dead/stale sources must not render (see plan). Started at 2h; bumped
// after observing Meina's real reporting cadence swing up to ~2h40m between
// updates on its own — 2h was flagging a station that wasn't actually dead,
// just slow. Maccagno's real outages (11h+) are still well caught by this.
const FRESHNESS_THRESHOLD_MS = 3 * 60 * 60 * 1000;
const CACHE_TTL_MS = 5 * 60 * 1000;

export interface ImageFetchResult {
  buffer: Buffer;
  contentType: string;
  lastModified: Date;
}

/** True if a Last-Modified timestamp is recent enough to treat as live. */
export function isWithinFreshnessThreshold(lastModified: Date): boolean {
  return Date.now() - lastModified.getTime() <= FRESHNESS_THRESHOLD_MS;
}

/**
 * Fetches a third-party image server-side and returns it with its
 * Last-Modified timestamp — WITHOUT gating on freshness. Sources with no
 * Last-Modified header at all (or a genuine fetch failure) return null;
 * everything else returns, staleness and all, so a caller that wants to
 * show "last known update" for a stale source (rather than nothing) can.
 * Use `isWithinFreshnessThreshold` to decide whether to actually treat the
 * result as live.
 */
export async function fetchImage(url: string): Promise<ImageFetchResult | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const lastModifiedHeader = res.headers.get('last-modified');
    if (!lastModifiedHeader) return null;
    const lastModified = new Date(lastModifiedHeader);
    if (Number.isNaN(lastModified.getTime())) return null;

    const arrayBuffer = await res.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType: res.headers.get('content-type') || 'image/jpeg',
      lastModified,
    };
  } catch {
    return null;
  }
}

/**
 * Fetches and gates on freshness in one step — sources with no Last-Modified
 * header, or one older than the threshold, are treated as unavailable
 * rather than served. Used where there's no "show it anyway, stale" UI (the
 * webcam proxy) — these are unmonitored volunteer feeds that die silently
 * (confirmed: several of the reference site's 8 sources were already
 * dead/stale when audited).
 */
export async function fetchFreshImage(url: string): Promise<ImageFetchResult | null> {
  const result = await fetchImage(url);
  if (!result || !isWithinFreshnessThreshold(result.lastModified)) return null;
  return result;
}

export interface ProxiedImage {
  status: 'fresh' | 'stale' | 'unavailable';
  buffer?: Buffer;
  contentType?: string;
  /** ISO string. Present whenever the source itself was reachable, even if stale — lets a caller show "last seen X ago" instead of nothing. */
  lastModified?: string;
}

declare global {
  var proxiedImageCache: Record<string, { data: ProxiedImage; timestamp: number }> | undefined;
}

/**
 * Fetch + freshness-gate + cache a webcam station's source image, keyed by
 * station id. Used by /api/webcam/[id]. `status: 'stale'` (as opposed to
 * 'unavailable') is what lets a caller still show a "last seen" timestamp
 * for a station that's reachable but too old to trust.
 */
export async function getProxiedImage(id: string, sourceUrl: string): Promise<ProxiedImage> {
  const now = Date.now();
  const cached = globalThis.proxiedImageCache?.[id];
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const fetched = await fetchImage(sourceUrl);
  let data: ProxiedImage;
  if (!fetched) {
    data = { status: 'unavailable' };
  } else if (!isWithinFreshnessThreshold(fetched.lastModified)) {
    data = { status: 'stale', lastModified: fetched.lastModified.toISOString() };
  } else {
    data = {
      status: 'fresh',
      buffer: fetched.buffer,
      contentType: fetched.contentType,
      lastModified: fetched.lastModified.toISOString(),
    };
  }

  globalThis.proxiedImageCache = {
    ...globalThis.proxiedImageCache,
    [id]: { data, timestamp: now },
  };

  return data;
}
