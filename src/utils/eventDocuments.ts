import type { Locale } from '../i18n';
import type { Event, LocalizedText } from '../types/event';

export interface EventDocumentLink {
  label: string;
  url: string;
}

export interface StandardDocumentLabels {
  bando: LocalizedText;
  iscrizione: LocalizedText;
  istruzioni: LocalizedText;
  classifica: LocalizedText;
}

function localize(field: LocalizedText, locale: Locale): string {
  return field[locale] || field.it;
}

export function getAvailableDocuments(
  event: Event,
  locale: Locale,
  labels: StandardDocumentLabels
): EventDocumentLink[] {
  const docs: EventDocumentLink[] = [];

  const standardEntries: Array<{ key: keyof StandardDocumentLabels; label: LocalizedText }> = [
    { key: 'bando', label: labels.bando },
    { key: 'iscrizione', label: labels.iscrizione },
    { key: 'istruzioni', label: labels.istruzioni },
    { key: 'classifica', label: labels.classifica },
  ];

  for (const { key, label } of standardEntries) {
    const url = event.documents?.[key];
    if (url) {
      docs.push({ label: localize(label, locale), url });
    }
  }

  for (const doc of event.additionalDocuments ?? []) {
    docs.push({ label: localize(doc.label, locale), url: doc.url });
  }

  return docs;
}

export function groupRegattasByYear(events: Event[]): Map<number, Event[]> {
  const regattas = events.filter((event) => event.type === 'regata');
  const byYear = new Map<number, Event[]>();

  for (const regata of regattas) {
    const year = new Date(regata.date).getFullYear();
    const yearRegattas = byYear.get(year) ?? [];
    yearRegattas.push(regata);
    byYear.set(year, yearRegattas);
  }

  for (const [year, yearRegattas] of byYear) {
    yearRegattas.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    byYear.set(year, yearRegattas);
  }

  return byYear;
}

export function getRegattaYears(byYear: Map<number, Event[]>): number[] {
  return [...byYear.keys()].sort((a, b) => b - a);
}
