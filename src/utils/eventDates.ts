import { localeTags as LOCALE_TAGS } from '../i18n';
import type { Locale } from '../i18n';

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`);
}

export function formatEventDayMonth(dateStr: string, locale: Locale): string {
  return parseDate(dateStr).toLocaleDateString(LOCALE_TAGS[locale], {
    day: 'numeric',
    month: 'short',
  });
}

// German grammar wants the long month name with ordinal dots ("20.–24.
// Juli"); every other supported locale uses "20-24 lug"-style short form.
// A flag rather than a ternary so a future locale defaults to the short
// form for free instead of needing to be added to a condition.
const USES_DOTTED_RANGE: Record<Locale, boolean> = { it: false, en: false, de: true, fr: false };

/**
 * Formats an event date or date range for display.
 * Same month: "20-24 lug" (IT), "20-24 Jul" (EN), "20.–24. Juli" (DE), "20-24 juil." (FR)
 */
export function formatEventDateDisplay(
  startDate: string,
  endDate: string | undefined,
  locale: Locale
): string {
  if (!endDate || endDate === startDate) {
    return formatEventDayMonth(startDate, locale);
  }

  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    const startDay = start.getDate();
    const endDay = end.getDate();

    if (USES_DOTTED_RANGE[locale]) {
      const month = start.toLocaleDateString(LOCALE_TAGS[locale], { month: 'long' });
      return `${startDay}.–${endDay}. ${month}`;
    }

    const month = start.toLocaleDateString(LOCALE_TAGS[locale], { month: 'short' });
    return `${startDay}-${endDay} ${month}`;
  }

  return `${formatEventDayMonth(startDate, locale)} - ${formatEventDayMonth(endDate, locale)}`;
}
