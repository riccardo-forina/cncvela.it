// Standard meteorological wind barb notation (WMO/NWS) — the same symbol
// set as NOAA's own charts, e.g.
// https://www.wpc.ncep.noaa.gov/dailywxmap/gifimages/windspeed.gif
// Each pennant (filled triangle) = 50kn, each full barb (long tick) = 10kn,
// one half barb (short tick) = 5kn. Speed is rounded to the nearest 5kn
// before counting — that's the standard convention, not an approximation
// specific to this site (a barb chart has no way to show "13kn" precisely;
// 13 reads as one full + one half, same symbol as 12-17).
//
// Orientation: this site's map marker already rotates a shape by the RAW
// wind-FROM compass degree with no +180 offset (see LakeWindMap.astro),
// which — given the shape's shaft extends "south" at 0° rotation — reads
// as "the shape points downwind", i.e. the intuitive "arrow shows where
// the wind is blowing to" convention already established by the old plain
// arrowhead. A textbook wind barb instead puts the feathers at the UPWIND
// end (shaft points toward where wind comes from) — deliberately not
// followed here, to avoid the barbs flying the opposite way from the
// arrow they're replacing. The barb feathers below are placed at the same
// end the old arrowhead occupied, so no rotation math changes.

export type BarbUnit = 'pennant' | 'full' | 'half';

const KNOTS_PER_PENNANT = 50;
const KNOTS_PER_FULL_BARB = 10;
const KNOTS_PER_HALF_BARB = 5;

/** Ordered outermost (tip) first, per the standard convention: pennants nearest the tip, half barb (if any) nearest the shaft. */
export function getBarbUnits(knots: number): BarbUnit[] {
  let remaining = Math.round(knots / 5) * 5;
  const units: BarbUnit[] = [];
  while (remaining >= KNOTS_PER_PENNANT) {
    units.push('pennant');
    remaining -= KNOTS_PER_PENNANT;
  }
  while (remaining >= KNOTS_PER_FULL_BARB) {
    units.push('full');
    remaining -= KNOTS_PER_FULL_BARB;
  }
  if (remaining >= KNOTS_PER_HALF_BARB) {
    units.push('half');
  }
  return units;
}

export type BarbShape =
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { kind: 'polygon'; points: string };

// Local, unrotated coordinate system matching the existing 36x36 marker
// viewBox and (18,8) pivot — see the orientation note above for why the
// shaft goes "down" (toward y=30) rather than up.
const PIVOT_X = 18;
const SHAFT_TOP_Y = 13; // starts just past the pivot circle's own radius
const SHAFT_BOTTOM_Y = 30;
const UNIT_SPACING = 4.5; // vertical gap between consecutive barbs/pennants
const FULL_BARB_DX = 8;
const FULL_BARB_DY = 4;
const HALF_BARB_DX = 4.5;
const HALF_BARB_DY = 2.2;
const PENNANT_DX = 8;

/** Pure geometry for a station marker: calm (just the circle) or a shaft with the right barbs/pennants for the given knot value. */
export function getWindBarbShapes(knots: number): BarbShape[] {
  const units = getBarbUnits(knots);
  const circle: BarbShape = { kind: 'circle', cx: PIVOT_X, cy: 8, r: 5 };

  if (units.length === 0) {
    // Calm: the station circle alone, no shaft — matches the standard
    // chart's "Calm" symbol (a plain circle, no barbs).
    return [circle];
  }

  const shapes: BarbShape[] = [
    circle,
    { kind: 'line', x1: PIVOT_X, y1: SHAFT_TOP_Y, x2: PIVOT_X, y2: SHAFT_BOTTOM_Y },
  ];

  // Working inward from the tip (SHAFT_BOTTOM_Y) toward the pivot, per the
  // standard convention (largest units nearest the tip).
  let y = SHAFT_BOTTOM_Y;
  for (const unit of units) {
    if (unit === 'pennant') {
      shapes.push({
        kind: 'polygon',
        points: `${PIVOT_X},${y} ${PIVOT_X},${y - UNIT_SPACING} ${PIVOT_X + PENNANT_DX},${y}`,
      });
    } else if (unit === 'full') {
      shapes.push({ kind: 'line', x1: PIVOT_X, y1: y, x2: PIVOT_X + FULL_BARB_DX, y2: y - FULL_BARB_DY });
    } else {
      shapes.push({ kind: 'line', x1: PIVOT_X, y1: y, x2: PIVOT_X + HALF_BARB_DX, y2: y - HALF_BARB_DY });
    }
    y -= UNIT_SPACING;
  }

  return shapes;
}
