import type { APIRoute } from 'astro';
import { getStationById } from '../../../utils/meteoStations';
import { getProxiedWebcam } from '../../../utils/webcams';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const station = params.id ? getStationById(params.id) : undefined;
  if (!station) {
    return new Response(null, { status: 404 });
  }

  const webcam = await getProxiedWebcam(station.id, station.sourceId);
  if (!webcam) {
    // Fetch failed or source failed the freshness gate — unavailable, not broken.
    return new Response(null, { status: 503 });
  }

  return new Response(new Uint8Array(webcam.buffer), {
    headers: {
      'Content-Type': webcam.contentType,
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    },
  });
};
