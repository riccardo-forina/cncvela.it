#!/usr/bin/env node
/**
 * Places a station marker on LakeWindMap.astro's hand-drawn lake SVG by its
 * real latitude — NOT by a linear lat/lon transform (tried that, it was
 * unreliable: extrapolating from a handful of anchor points doesn't respect
 * the actual bends of a hand-drawn shoreline, and there was no way to check
 * its own mistakes).
 *
 * Method instead: walk the ACTUAL drawn shoreline polygon. Split it into an
 * east chain and a west chain at its northernmost/southernmost points, map
 * each station's real latitude onto a fraction between Lake Maggiore's real
 * geographic extremes, and take the point at that same fractional arc-length
 * along the matching chain. The result is *on the shoreline by construction*
 * — it can't land on land or in open water — and follows every bend the
 * illustrator actually drew, rather than a straight-line guess.
 *
 * Usage: node scripts/compute-station-positions.mjs
 * Edit the STATIONS list below to add/change stations, then re-run.
 * Prints raw (pre-zoom-out) {top, left} for each — paste into
 * POSITION_OVERRIDES / CALDE_POSITION / ISPRA in LakeWindMap.astro.
 *
 * Also runs two automated checks before printing anything:
 *   1. North-south ordering must match real-latitude ordering.
 *   2. Every computed point must sample as lake-colored when the SVG is
 *      actually rasterized (not just "inside my own polygon math").
 * If either check fails, this script exits non-zero — treat that as a bug,
 * not something to eyeball past.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENT_PATH = join(__dirname, '../src/components/LakeWindMap.astro');

// Real geographic extremes of Lake Maggiore itself (OSM water polygon
// bounding box for the "Lago Maggiore" relation, id 11758 — the actual lake
// body, not a nearby town) — not eyeballed, looked up.
const LAKE_NORTH_LAT = 46.1798998;
const LAKE_SOUTH_LAT = 45.7224279;

// Stations to place. `shore` picks which chain of the drawn polygon to walk.
// `fractionNudge` (optional): pure-latitude placement is geographically
// correct but can land on the outer edge of a locally wide bay/bulge in the
// drawn shore, reading as "off" even though it's technically on the
// shoreline. Pino Tronzano is real — the bay at the very top of the lake is
// unusually wide, so latitude alone put it on the bay's outer edge instead
// of the narrower channel just below. Nudged forward along the same shore
// chain (checked visually against several candidates) to land at the neck
// where the bay narrows into the main channel — still comfortably north of
// Maccagno, still verified on-shore by the checks below, just not at the
// exact pure-latitude point.
const STATIONS = [
  { id: 'pino-tronzano', name: 'Pino Tronzano', lat: 46.099, shore: 'east', fractionNudge: 0.04 },
  { id: 'maccagno', name: 'Maccagno', lat: 46.043, shore: 'east' },
  { id: 'calde', name: 'Caldè', lat: 45.947, shore: 'east' },
  { id: 'ispra', name: 'Ispra', lat: 45.813, shore: 'east' },
  { id: 'baveno', name: 'Baveno', lat: 45.9089, shore: 'west' },
  { id: 'belgirate', name: 'Belgirate', lat: 45.8389, shore: 'west' },
  { id: 'meina', name: 'Meina', lat: 45.789, shore: 'west' },
  { id: 'arona', name: 'Arona', lat: 45.7598, shore: 'west' },
];

const VIEWBOX_W = 885;
const VIEWBOX_H = 1406;

// --- Extract the shoreline polygon from the component's own SVG source ---
const src = readFileSync(COMPONENT_PATH, 'utf8');
const match = src.match(/d="(M 751,65[^"]*)"/);
if (!match) throw new Error('Lake path not found in LakeWindMap.astro — did the SVG change?');
const mainRing = match[1].split(/z/i)[0]; // drop the small island sub-paths after the first close
const ring = [];
{
  const re = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g;
  let m;
  while ((m = re.exec(mainRing))) ring.push([parseFloat(m[1]), parseFloat(m[2])]);
}

// --- Split into east/west chains at the north/south extremes ---
let northIdx = 0, southIdx = 0;
for (let i = 1; i < ring.length; i++) {
  if (ring[i][1] < ring[northIdx][1]) northIdx = i;
  if (ring[i][1] > ring[southIdx][1]) southIdx = i;
}

function chainFrom(startIdx, endIdx) {
  const chain = [];
  let i = startIdx;
  while (true) {
    chain.push(ring[i]);
    if (i === endIdx) break;
    i = (i + 1) % ring.length;
  }
  return chain;
}

const chainA = chainFrom(northIdx, southIdx);
const chainB = chainFrom(southIdx, northIdx).reverse(); // reversed so both run north->south

const avgX = (chain) => chain.reduce((s, [x]) => s + x, 0) / chain.length;
const [eastChain, westChain] = avgX(chainA) > avgX(chainB) ? [chainA, chainB] : [chainB, chainA];

function cumulativeLengths(chain) {
  const lens = [0];
  for (let i = 1; i < chain.length; i++) {
    const [x1, y1] = chain[i - 1], [x2, y2] = chain[i];
    lens.push(lens[i - 1] + Math.hypot(x2 - x1, y2 - y1));
  }
  return lens;
}
const eastLens = cumulativeLengths(eastChain);
const westLens = cumulativeLengths(westChain);

function pointAtFraction(chain, lens, fraction) {
  const target = fraction * lens[lens.length - 1];
  let i = 1;
  while (i < lens.length && lens[i] < target) i++;
  const [x1, y1] = chain[i - 1], [x2, y2] = chain[Math.min(i, chain.length - 1)];
  const segLen = lens[i] - lens[i - 1];
  const t = segLen > 0 ? (target - lens[i - 1]) / segLen : 0;
  return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
}

// --- Compute each station's position ---
const results = STATIONS.map((station) => {
  const fraction = (LAKE_NORTH_LAT - station.lat) / (LAKE_NORTH_LAT - LAKE_SOUTH_LAT) + (station.fractionNudge ?? 0);
  const [chain, lens] = station.shore === 'east' ? [eastChain, eastLens] : [westChain, westLens];
  const [x, y] = pointAtFraction(chain, lens, fraction);
  return {
    ...station,
    fraction,
    svgX: x,
    svgY: y,
    rawTop: (y / VIEWBOX_H) * 100,
    rawLeft: (x / VIEWBOX_W) * 100,
  };
});

// --- Check 1: north-south order must match real-latitude order ---
const sortedByLat = [...results].sort((a, b) => b.lat - a.lat);
const sortedByComputedTop = [...results].sort((a, b) => a.rawTop - b.rawTop);
let orderOk = true;
for (let i = 0; i < sortedByLat.length; i++) {
  if (sortedByLat[i].id !== sortedByComputedTop[i].id) orderOk = false;
}
console.log(orderOk ? '✓ Ordering check passed (matches real-latitude order)' : '✗ ORDERING CHECK FAILED');
if (!orderOk) {
  console.log('  by latitude:    ', sortedByLat.map((s) => s.id).join(' > '));
  console.log('  by computed top:', sortedByComputedTop.map((s) => s.id).join(' > '));
}

// --- Check 2 + correction: every point must sample as lake-colored.
// Arc-length placement gets the *area* right by construction, but the
// interpolated point can still land within a pixel or two of the drawn
// boundary (rounding, or the boundary just happens to run through that
// exact spot). Rather than accept that as a failure, do a small, bounded
// nearest-lake-pixel search — this is safe now in a way it wasn't before,
// because the target area is already correct; this only fixes sub-pixel
// imprecision, not a wrong region. A large required search distance still
// fails the check below (that would indicate a real problem).
const pathD = match[1];
const testSvg = `<svg viewBox="0 0 ${VIEWBOX_W} ${VIEWBOX_H}" xmlns="http://www.w3.org/2000/svg"><rect width="${VIEWBOX_W}" height="${VIEWBOX_H}" fill="black"/><path fill="cyan" stroke="cyan" d="${pathD}"/></svg>`;
const raster = await sharp(Buffer.from(testSvg)).png().toBuffer();
const { data, info } = await sharp(raster).raw().ensureAlpha().toBuffer({ resolveWithObject: true });

function isLakePixel(px, py) {
  if (px < 0 || py < 0 || px >= info.width || py >= info.height) return false;
  const idx = (py * info.width + px) * info.channels;
  return data[idx + 1] > 100 && data[idx + 2] > 100 && data[idx] < 100;
}

function nearestLakePixel(px0, py0, maxRadius = 25) {
  if (isLakePixel(px0, py0)) return { px: px0, py: py0, dist: 0 };
  for (let r = 1; r <= maxRadius; r++) {
    let best = null;
    for (let dx = -r; dx <= r; dx++) {
      for (const dy of [-r, r]) {
        if (isLakePixel(px0 + dx, py0 + dy)) {
          const dist = Math.hypot(dx, dy);
          if (!best || dist < best.dist) best = { px: px0 + dx, py: py0 + dy, dist };
        }
      }
    }
    for (let dy = -r + 1; dy <= r - 1; dy++) {
      for (const dx of [-r, r]) {
        if (isLakePixel(px0 + dx, py0 + dy)) {
          const dist = Math.hypot(dx, dy);
          if (!best || dist < best.dist) best = { px: px0 + dx, py: py0 + dy, dist };
        }
      }
    }
    if (best) return best;
  }
  return null;
}

let onShoreOk = true;
const MAX_ACCEPTABLE_SNAP_PX = 8; // beyond this, the arc-length target itself is suspect
for (const r of results) {
  const px0 = Math.round(r.svgX), py0 = Math.round(r.svgY);
  const nearest = nearestLakePixel(px0, py0);
  if (!nearest) { onShoreOk = false; console.log(`✗ ${r.id}: no lake pixel found within search radius`); continue; }
  if (nearest.dist > MAX_ACCEPTABLE_SNAP_PX) {
    onShoreOk = false;
    console.log(`✗ ${r.id}: nearest lake pixel is ${nearest.dist.toFixed(1)}px away — target area looks wrong, not just imprecise`);
    continue;
  }
  if (nearest.dist > 0) {
    console.log(`  (${r.id}: snapped ${nearest.dist.toFixed(1)}px to nearest lake pixel — within tolerance)`);
    r.svgX = nearest.px;
    r.svgY = nearest.py;
    r.rawTop = (r.svgY / VIEWBOX_H) * 100;
    r.rawLeft = (r.svgX / VIEWBOX_W) * 100;
  }
}
console.log(onShoreOk ? '✓ On-shore check passed (every point is on/near the drawn shoreline)' : '✗ ON-SHORE CHECK FAILED');

if (process.env.DEBUG_NEIGHBORHOOD) {
  const target = results.find((r) => r.id === process.env.DEBUG_NEIGHBORHOOD);
  const px0 = Math.round(target.svgX), py0 = Math.round(target.svgY);
  console.log(`\nNeighborhood around ${target.id} (${px0},${py0}):`);
  for (let dy = -5; dy <= 5; dy++) {
    let row = '';
    for (let dx = -5; dx <= 5; dx++) {
      const px = px0 + dx, py = py0 + dy;
      const idx = (py * info.width + px) * info.channels;
      const isLake = data[idx + 1] > 100 && data[idx + 2] > 100 && data[idx] < 100;
      row += isLake ? '#' : '.';
    }
    console.log(row);
  }
}

if (!orderOk || !onShoreOk) {
  console.error('\nOne or more automated checks failed — do not apply these positions.');
  process.exit(1);
}

// --- Render a debug visualization to actually look at ---
let markers = '';
for (const r of results) {
  markers += `<circle cx="${r.svgX}" cy="${r.svgY}" r="7" fill="magenta"/>`;
  markers += `<text x="${r.svgX + 10}" y="${r.svgY + 4}" fill="white" font-size="20" font-family="sans-serif">${r.name}</text>`;
}
const debugSvg = `<svg viewBox="0 0 ${VIEWBOX_W} ${VIEWBOX_H}" xmlns="http://www.w3.org/2000/svg"><rect width="${VIEWBOX_W}" height="${VIEWBOX_H}" fill="black"/><path fill="#0e2a3a" stroke="cyan" stroke-width="2" d="${pathD}"/>${markers}</svg>`;
const debugPath = join(__dirname, '../debug-station-positions.png');
await sharp(Buffer.from(debugSvg)).png().toFile(debugPath);
console.log(`\nDebug render written to ${debugPath} — look at it before applying anything.\n`);

// --- Print results ---
console.log('Raw (pre-zoom-out) top/left for POSITION_OVERRIDES / CALDE_POSITION / ISPRA:\n');
for (const r of results) {
  console.log(`${r.id.padEnd(16)} raw top: ${r.rawTop.toFixed(1)}, left: ${r.rawLeft.toFixed(1)}`);
}
