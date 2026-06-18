import type { Locale } from '../i18n';
import type { Event } from '../types/event';
import type { DailyData } from './weather';

export interface MeteoPreviewBundle {
  event: Event;
  forecast: DailyData;
}

/** Dev-only: fake event + forecast for previewing the weather widget. */
export function createMeteoPreviewBundle(locale: Locale): MeteoPreviewBundle {
  const previewDate = new Date();
  previewDate.setDate(previewDate.getDate() + 2);
  const date = previewDate.toISOString().slice(0, 10);

  const dayName = previewDate.toLocaleDateString(
    locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-GB' : 'it-IT',
    { weekday: 'short', day: 'numeric' }
  );

  const forecast: DailyData = {
    date,
    dayName,
    weatherCode: 2,
    weatherDesc: locale === 'it' ? 'Poco nuvoloso' : locale === 'de' ? 'Teilweise bewölkt' : 'Partly cloudy',
    weatherIcon: '⛅',
    tempMax: 26,
    tempMin: 18,
    windMax: 9,
    windDirection: 'SE',
  };

  const event: Event = {
    id: '__dev-meteo-preview__',
    type: 'regata',
    title: {
      it: '[DEV] Anteprima meteo regata',
      en: '[DEV] Regatta weather preview',
      de: '[DEV] Regatta-Wettervorschau',
    },
    subtitle: {
      it: 'Evento finto — visibile solo in npm run dev',
      en: 'Fake event — visible in npm run dev only',
      de: 'Fake-Event — nur in npm run dev sichtbar',
    },
    date,
    endDate: date,
    time: '10:00',
    description: {
      it: 'Questo evento esiste solo in locale per mostrare il box previsioni meteo sulla card. Non viene salvato in events.json e non appare in produzione.',
      en: 'This event exists locally only to preview the weather box on the card. It is not saved to events.json and does not appear in production.',
      de: 'Dieses Event existiert nur lokal zur Vorschau der Wetterbox. Es wird nicht in events.json gespeichert und erscheint nicht in Produktion.',
    },
    status: 'open',
    documents: {},
    additionalDocuments: [],
  };

  return { event, forecast };
}

export function isMeteoPreviewEnabled(): boolean {
  return import.meta.env.DEV;
}
