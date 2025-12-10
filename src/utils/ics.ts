/**
 * Generate calendar URLs for events
 */

interface CalendarEvent {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  location?: string;
}

/**
 * Generate Google Calendar URL - opens directly in browser to add event
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  // Format: YYYYMMDDTHHMMSS (local time, no Z suffix for local events)
  const formatGoogleDate = (dateStr: string, timeStr?: string): string => {
    const datePart = dateStr.replace(/-/g, '');
    if (timeStr) {
      const timePart = timeStr.replace(':', '') + '00';
      return `${datePart}T${timePart}`;
    }
    return datePart;
  };

  const startDate = formatGoogleDate(event.date, event.time);
  
  // End date: if multi-day use endDate, otherwise add 2 hours for timed events or use same day for all-day
  let endDate: string;
  if (event.endDate) {
    endDate = formatGoogleDate(event.endDate, event.time);
  } else if (event.time) {
    // Add 2 hours to start time
    const [hours, minutes] = event.time.split(':').map(Number);
    const endHours = String(hours + 2).padStart(2, '0');
    const endTime = `${endHours}:${String(minutes).padStart(2, '0')}`;
    endDate = formatGoogleDate(event.date, endTime);
  } else {
    endDate = startDate;
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description,
    location: event.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook.com calendar URL
 */
export function generateOutlookUrl(event: CalendarEvent): string {
  const formatOutlookDate = (dateStr: string, timeStr?: string): string => {
    if (timeStr) {
      return `${dateStr}T${timeStr}:00`;
    }
    return `${dateStr}T00:00:00`;
  };

  const startDate = formatOutlookDate(event.date, event.time);
  const endDate = event.endDate 
    ? formatOutlookDate(event.endDate, event.time)
    : formatOutlookDate(event.date, event.time ? 
        `${String(parseInt(event.time.split(':')[0]) + 2).padStart(2, '0')}:${event.time.split(':')[1]}` 
        : '23:59');

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    startdt: startDate,
    enddt: endDate,
    location: event.location || '',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate ICS data URL (fallback for Apple Calendar and others)
 */
export function generateICSUrl(event: CalendarEvent): string {
  const formatDate = (dateStr: string, timeStr?: string): string => {
    const datePart = dateStr.replace(/-/g, '');
    if (timeStr) {
      const timePart = timeStr.replace(':', '') + '00';
      return `${datePart}T${timePart}`;
    }
    return datePart;
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const startDate = formatDate(event.date, event.time);
  const endDate = event.endDate 
    ? formatDate(event.endDate, event.time)
    : formatDate(event.date, event.time ? 
        `${String(parseInt(event.time.split(':')[0]) + 2).padStart(2, '0')}:${event.time.split(':')[1]}` 
        : undefined);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CNC Caldè//Circolo Nautico Caldè//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    event.location ? `LOCATION:${escapeText(event.location)}` : '',
    `UID:${event.date}-${event.title.toLowerCase().replace(/\s+/g, '-')}@cncvela.it`,
    `DTSTAMP:${formatDate(new Date().toISOString().split('T')[0])}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
}

export function generateICSFilename(title: string, date: string): string {
  const slug = title.toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slug}-${date}.ics`;
}

