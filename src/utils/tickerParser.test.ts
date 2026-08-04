import { describe, expect, it } from 'vitest';
import { parseTickerText } from './tickerParser';

const NOW = '2026-08-04T12:00:00.000Z';

describe('parseTickerText', () => {
  it('parses a clean ticker read', () => {
    const reading = parseTickerText(
      '35.1°C  46%  21.8°C  3.2 km/h NW  979.2 hPa  0.0 mm  0.0 mm/h',
      NOW
    );
    expect(reading).not.toBeNull();
    expect(reading?.tempC).toBe(35.1);
    expect(reading?.windKmh).toBe(3.2);
    expect(reading?.windDir).toBe('NW');
    expect(reading?.pressureHpa).toBe(979.2);
    expect(reading?.rainMm).toBe(0);
    expect(reading?.rainRateMmh).toBe(0);
  });

  it('reconstructs a decimal point OCR dropped by merging digits (6.4 -> 64)', () => {
    const reading = parseTickerText(
      '184°C  46%  218°C  64 km/h NW  9792 hPa  00 mm  00 mm/h',
      NOW
    );
    expect(reading?.tempC).toBe(18.4);
    expect(reading?.windKmh).toBe(6.4);
    expect(reading?.pressureHpa).toBe(979.2);
  });

  it('rejects a reading when OCR hallucinates implausible digits (regression: Pino reporting 10189.0 hPa for an actual 979.2 hPa)', () => {
    // OCR occasionally misreads the digit glyphs themselves, not just the
    // decimal separator — no amount of reconstruction logic recovers from
    // that. The only defense is a plausibility bound on the parsed value.
    const reading = parseTickerText(
      '35.1°C  46%  21.8°C  3.2 km/h NW  10189.0 hPa  0.0 mm  0.0 mm/h',
      NOW
    );
    expect(reading).toBeNull();
  });

  it('rejects implausible temperature the same way', () => {
    const reading = parseTickerText(
      '999.1°C  46%  21.8°C  3.2 km/h NW  979.2 hPa  0.0 mm  0.0 mm/h',
      NOW
    );
    expect(reading).toBeNull();
  });

  it('returns null when the ticker shape is not found at all', () => {
    expect(parseTickerText('garbage ocr output', NOW)).toBeNull();
  });
});
