import type { Locale } from '../i18n';
import stationsData from '../data/meteo-stations.json';

export interface MeteoStation {
  id: string;
  name: { it: string; en?: string; de?: string };
  lat: number;
  lon: number;
  sourceId: string;
  attributionUrl: string;
  hasOcrReading: boolean;
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
