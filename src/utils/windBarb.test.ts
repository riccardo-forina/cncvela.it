import { describe, expect, it } from 'vitest';
import { getBarbUnits, getWindBarbShapes } from './windBarb';

// Expected values transcribed directly from the reference chart
// (https://www.wpc.ncep.noaa.gov/dailywxmap/gifimages/windspeed.gif),
// one representative knot value per row.
describe('getBarbUnits', () => {
  it('matches the standard WMO/NWS wind barb chart', () => {
    expect(getBarbUnits(0)).toEqual([]);
    expect(getBarbUnits(2)).toEqual([]); // Calm: 1-2kn
    expect(getBarbUnits(5)).toEqual(['half']); // 3-7kn
    expect(getBarbUnits(10)).toEqual(['full']); // 8-12kn
    expect(getBarbUnits(15)).toEqual(['full', 'half']); // 13-17kn
    expect(getBarbUnits(20)).toEqual(['full', 'full']); // 18-22kn
    expect(getBarbUnits(25)).toEqual(['full', 'full', 'half']); // 23-27kn
    expect(getBarbUnits(30)).toEqual(['full', 'full', 'full']); // 28-32kn
    expect(getBarbUnits(40)).toEqual(['full', 'full', 'full', 'full']); // 38-42kn
    expect(getBarbUnits(50)).toEqual(['pennant']); // 48-52kn
    expect(getBarbUnits(60)).toEqual(['pennant', 'full']); // 58-62kn
    expect(getBarbUnits(65)).toEqual(['pennant', 'full', 'half']); // 63-67kn
    expect(getBarbUnits(105)).toEqual(['pennant', 'pennant', 'half']); // 103-107kn
  });

  it('rounds to the nearest 5kn (a barb chart has no finer resolution)', () => {
    expect(getBarbUnits(13)).toEqual(getBarbUnits(15));
    expect(getBarbUnits(17)).toEqual(getBarbUnits(15));
  });
});

describe('getWindBarbShapes', () => {
  it('renders calm (exactly 0kn) as just the station circle, no shaft', () => {
    const shapes = getWindBarbShapes(0);
    expect(shapes).toEqual([{ kind: 'circle', cx: 18, cy: 8, r: 5 }]);
  });

  it('renders 1-4kn as a bare shaft with no feathers, distinct from calm', () => {
    const shapes = getWindBarbShapes(2);
    expect(shapes).toHaveLength(2);
    expect(shapes[0]).toMatchObject({ kind: 'circle' });
    expect(shapes[1]).toMatchObject({ kind: 'line', x1: 18, x2: 18 });
  });

  it('leans each feather away from the pivot, toward the tip', () => {
    const shapes = getWindBarbShapes(20); // two full barbs
    const barbs = shapes.filter((s) => s.kind === 'line' && s.x1 !== s.x2) as Extract<
      ReturnType<typeof getWindBarbShapes>[number],
      { kind: 'line' }
    >[];
    expect(barbs.length).toBeGreaterThan(0);
    for (const barb of barbs) {
      expect(barb.y2).toBeGreaterThan(barb.y1);
    }
  });

  it('renders a shaft plus one shape per barb/pennant unit for a live reading', () => {
    const shapes = getWindBarbShapes(20); // two full barbs
    // circle + shaft line + 2 barb lines
    expect(shapes).toHaveLength(4);
    expect(shapes[0]).toMatchObject({ kind: 'circle' });
    expect(shapes[1]).toMatchObject({ kind: 'line', x1: 18, x2: 18 }); // the shaft itself
  });

  it('renders a pennant as a filled polygon, not a line', () => {
    const shapes = getWindBarbShapes(50);
    const pennant = shapes.find((s) => s.kind === 'polygon');
    expect(pennant).toBeDefined();
  });
});
