import type { APIRoute } from 'astro';
import { getStationById } from '../../../utils/meteoStations';
import { getProxiedImage } from '../../../utils/webcams';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const station = params.id ? getStationById(params.id) : undefined;
  if (!station) {
    return new Response(null, { status: 404 });
  }

  const image = await getProxiedImage(station.id, station.sourceId);
  // The HTTP Last-Modified header needs an RFC 7231 date, not the ISO string ProxiedImage carries.
  const lastModifiedHeader = image.lastModified ? new Date(image.lastModified).toUTCString() : undefined;

  if (image.status === 'unavailable') {
    return new Response(null, { status: 404 });
  }

  // Stale: source is reachable but too old to trust — no body, but the
  // Last-Modified header still lets a client show "last seen X ago" rather
  // than nothing (see the OCR station script in LakeWindMap.astro).
  if (image.status === 'stale') {
    return new Response(null, {
      status: 503,
      headers: lastModifiedHeader ? { 'Last-Modified': lastModifiedHeader } : {},
    });
  }

  return new Response(new Uint8Array(image.buffer!), {
    headers: {
      'Content-Type': image.contentType!,
      'Cache-Control': 'public, max-age=60, s-maxage=60',
      ...(lastModifiedHeader ? { 'Last-Modified': lastModifiedHeader } : {}),
    },
  });
};
