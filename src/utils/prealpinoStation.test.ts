import { describe, expect, it } from 'vitest';
import { parsePrealpinoHtml } from './prealpinoStation';

// Real snippets from live pages (fetched and read, not fabricated) —
// astrogeo.va.it/rete_meteo/stazione.php, 2026-08-08 20:00 (ora solare).
// Full pages have a lot of surrounding chrome (nav, Facebook widget, GTM);
// only the parser-relevant block is kept here.
const PINO_MOLO_SNIPPET = `
  Aggiornato alle ore: 20:00 del giorno 08/08/2026 (ora solare)
  TEMPERATURA RADIAZIONE SOLARE Attuale Minima Massima Suolo Indice di calore W/mq
  29.9 20.8 (h 05.30) 32.7 (h 17.40) ND 25.7 0
  UMIDITA' RELATIVA PIOGGIA EVAPO- TRASPIRAZIONE % Dalle ore 00 (mm) Ultimi 30 min (mm) Neve al suolo (cm) da h 00
  2 0.0 0.0 ND ND
  VENTO PRESSIONE ATMOSFERICA Velocita (km/h) Direzione attuale Vento filato da h 00 (km) Raffica Max (km/h) Attuale (hPa) Tendenza 3h
  11.1 Sud 80.7 22.7 ESE (h 17.30) 1018.7 1.7
`;

const LEGGIUNO_SNIPPET = `
  Aggiornato alle ore: 20:00 del giorno 08/08/2026 (ora solare)
  TEMPERATURA RADIAZIONE SOLARE Attuale Minima Massima Suolo Indice di calore W/mq
  25.8 19.0 (h 04.50) 34.6 (h 15.10) ND 27 0
  UMIDITA' RELATIVA PIOGGIA EVAPO- TRASPIRAZIONE % Dalle ore 00 (mm) Ultimi 30 min (mm) Neve al suolo (cm) da h 00
  60 0.0 0.0 ND ND
  VENTO PRESSIONE ATMOSFERICA Velocita (km/h) Direzione attuale Vento filato da h 00 (km) Raffica Max (km/h) Attuale (hPa) Tendenza 3h
  3.1 SSE 64.4 21.5 NE (h 02.50) 1012.3 2.3
`;

describe('parsePrealpinoHtml', () => {
  it('parses a reading with an Italian cardinal direction word (Pino Lago Maggiore - Molo)', () => {
    const reading = parsePrealpinoHtml(PINO_MOLO_SNIPPET);
    expect(reading).not.toBeNull();
    expect(reading?.windKmh).toBe(11.1);
    expect(reading?.windDir).toBe('Sud');
    expect(reading?.pressureHpa).toBe(1018.7);
    expect(reading?.rainMm).toBe(0);
    expect(reading).toMatchObject({ hour: 20, minute: 0, day: 8, month: 8, year: 2026 });
  });

  it('parses a reading with a 16-point abbreviation direction (Leggiuno Quicchio)', () => {
    const reading = parsePrealpinoHtml(LEGGIUNO_SNIPPET);
    expect(reading).not.toBeNull();
    expect(reading?.windKmh).toBe(3.1);
    expect(reading?.windDir).toBe('SSE');
    expect(reading?.pressureHpa).toBe(1012.3);
  });

  it('rejects a page whose shape does not match (template changed / wrong page)', () => {
    expect(parsePrealpinoHtml('<html><body>not a station page</body></html>')).toBeNull();
  });

  it('rejects an implausible pressure the same way tickerParser does', () => {
    const bad = PINO_MOLO_SNIPPET.replace('1018.7', '10189.0');
    expect(parsePrealpinoHtml(bad)).toBeNull();
  });
});
