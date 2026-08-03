import type { Locale } from '../i18n';
import stationsData from '../data/meteo-stations.json';

// 'ocr': sourceId is a ticker image, read via client-side OCR (see
//   LakeWindMap.astro's client script and tickerParser.ts).
// 'json': sourceId is a JSON API URL returning a reading directly — no OCR
//   needed (see liveVcoStation.ts). Resolved server-side, like Föhn.
// 'photo': sourceId is a plain webcam image, no wind reading — proxied
//   as-is (see /api/webcam/[id] and webcams.ts).
export type StationDataType = 'ocr' | 'json' | 'photo';

export interface MeteoStation {
  id: string;
  name: { it: string; en?: string; de?: string };
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
