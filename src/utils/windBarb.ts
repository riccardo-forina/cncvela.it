// Standard meteorological wind barb notation (WMO/NWS). Geometry checked
// directly against windy.app's reference chart (higher resolution and
// clearer than NOAA's own GIF, which was the first source used here):
// https://windy.app/storage/posts/April2022/how-to-read-wind-barbs-windyapp.jpg
// Each pennant (filled triangle) = 50kn, each full barb (long tick) = 10kn,
// one half barb (short tick) = 5kn. Speed is rounded to the nearest 5kn
// before counting — that's the standard convention, not an approximation
// specific to this site (a barb chart has no way to show "13kn" precisely;
// 13 reads as one full + one half, same symbol as 12-17).
//
// Two symbols easy to conflate, confirmed distinct on the reference chart:
// **calm** (exactly 0kn) is the station dot alone, no shaft at all; any
// nonzero speed always draws a shaft, even if it rounds to zero barbs
// (1-4kn: bare shaft, dot, no feathers — a real, distinct symbol, not a
// simplification down to "calm").
//
// Orientation: a real wind barb's feathers sit at the UPWIND end — the
// shaft points toward where the wind is coming FROM, not where it's
// blowing to (the chart's own dot marks the calm/downwind end, feathers
// on the opposite end). The shapes below extend the shaft "south" of the
// pivot at 0° rotation (same span the old plain arrowhead used, so the
// geometry/pivot math is unchanged) — LakeWindMap.astro's marker adds
// +180° to the raw wind-FROM compass degree specifically to compensate
// for that, so a station reporting "wind from the north" ends up with
// barbs pointing north, not south. If this shape's default orientation
// ever changes, that +180 needs to move (or be removed) together with it.
//
// Barb/pennant lean: on the reference chart (shaft horizontal, dot on the
// right, tip on the left), every feather's free end points UP AND AWAY
// FROM THE DOT — i.e. further past the tip, not back toward the station.
// In this file's vertical local coordinates (tip at larger y, dot/pivot
// at smaller y), that means each feather's free endpoint has a LARGER y
// than its attachment point on the shaft, not smaller.

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
const SHAFT_BOTTOM_Y = 33;
const UNIT_SPACING = 4.5; // gap along the shaft between consecutive barbs/pennants
const FULL_BARB_DX = 8;
const FULL_BARB_DY = 4; // added to y (see "Barb/pennant lean" above — away from the pivot, past the tip)
const HALF_BARB_DX = 4.5;
const HALF_BARB_DY = 2.2;
const PENNANT_DX = 8;
const PENNANT_DY = 2.5;

/** Pure geometry for a station marker: calm (just the circle, exactly 0kn), a bare shaft (nonzero but rounds to no barbs), or a shaft with the right barbs/pennants. */
export function getWindBarbShapes(knots: number): BarbShape[] {
  const circle: BarbShape = { kind: 'circle', cx: PIVOT_X, cy: 8, r: 5 };

  if (knots === 0) {
    // True calm: the station circle alone, no shaft — the chart's own
    // "Calm" symbol is distinct from its "1kn" row (bare shaft, no
    // feathers), so this checks the exact value, not getBarbUnits' output.
    return [circle];
  }

  const shapes: BarbShape[] = [
    circle,
    { kind: 'line', x1: PIVOT_X, y1: SHAFT_TOP_Y, x2: PIVOT_X, y2: SHAFT_BOTTOM_Y },
  ];

  // Working inward from the tip (SHAFT_BOTTOM_Y) toward the pivot, per the
  // standard convention (largest units nearest the tip). Units may be
  // empty here (1-4kn) — shaft with no feathers, its own real symbol.
  let y = SHAFT_BOTTOM_Y;
  for (const unit of getBarbUnits(knots)) {
    if (unit === 'pennant') {
      shapes.push({
        kind: 'polygon',
        points: `${PIVOT_X},${y} ${PIVOT_X},${y - UNIT_SPACING} ${PIVOT_X + PENNANT_DX},${y + PENNANT_DY}`,
      });
    } else if (unit === 'full') {
      shapes.push({ kind: 'line', x1: PIVOT_X, y1: y, x2: PIVOT_X + FULL_BARB_DX, y2: y + FULL_BARB_DY });
    } else {
      shapes.push({ kind: 'line', x1: PIVOT_X, y1: y, x2: PIVOT_X + HALF_BARB_DX, y2: y + HALF_BARB_DY });
    }
    y -= UNIT_SPACING;
  }

  return shapes;
}
