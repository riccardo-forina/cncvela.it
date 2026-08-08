import type { Locale } from '../i18n';
import stationsData from '../data/meteo-stations.json';

// 'json': sourceId is a JSON API URL returning a reading directly (Meteo
//   Live VCO network — see liveVcoStation.ts). Resolved server-side, like
//   Föhn.
// 'html': sourceId is a plain server-rendered HTML station page (Centro
//   Geofisico Prealpino's astrogeo.va.it network) — the reading is scraped
//   from real text nodes (see prealpinoStation.ts). Resolved server-side,
//   like 'json'.
// 'photo': sourceId is a plain webcam image, no wind reading — proxied
//   as-is (see /api/webcam/[id] and webcams.ts).
// 'iframe': sourceId is a third-party embeddable player URL (e.g. Windy's
//   webcam widget), no wind reading. Rendered directly as an <iframe>,
//   not proxied — the third party serves and freshness-checks it
//   themselves, we just point at their embed.
//
// There used to be a fifth type, 'ocr' — client-side tesseract.js OCR of a
// ticker image (centrometeolombardo.com network). Removed 2026-08-08 once
// every station on that network had a same-quality or better replacement
// on the html/json networks (Pino Tronzano -> Pino Lago Maggiore - Molo,
// Meina -> Ranco Imbarcadero); no OCR-only source was left active. See git
// history for tickerParser.ts if this ever needs resurrecting.
export type StationDataType = 'json' | 'html' | 'photo' | 'iframe';

export interface MeteoStation {
  id: string;
  name: { it: string; en?: string; de?: string; fr?: string };
  lat: number;
  lon: number;
  sourceId: string;
  attributionUrl: string;
  dataType: StationDataType;
  active: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const stations: MeteoStation[] = (stationsData.items as Array<Omit<MeteoStation, 'id'>>).map((item) => ({
  id: slugify(item.name.it),
  ...item,
}));

export function getAllStations(): MeteoStation[] {
  return stations;
}

export function getActiveStations(): MeteoStation[] {
  return stations.filter((s) => s.active);
}

export function getStationById(id: string): MeteoStation | undefined {
  return stations.find((s) => s.id === id && s.active);
}

export function localizeStationName(station: MeteoStation, locale: Locale): string {
  return station.name[locale] || station.name.it;
}
