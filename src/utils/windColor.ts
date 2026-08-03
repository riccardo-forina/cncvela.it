// Wind-speed color tiers (5-level system), matching the map legend and the
// "Vento oggi" hourly chart. Pure/isomorphic — shared with the client-side
// station-marker script in LakeWindMap.astro, which is the only place this
// runs today (map markers are all client-upgraded now, see that file).

export interface WindColors {
  arrow: string;
  badge: string;
  border: string;
  text: string;
  glow: string;
  pulse: string;
}

export function getWindColor(knots: number): WindColors {
  if (knots < 3) {
    return {
      arrow: '#38bdf8',
      badge: 'rgba(56, 189, 248, 0.15)',
      border: 'rgba(56, 189, 248, 0.4)',
      text: '#7dd3fc',
      glow: 'rgba(56, 189, 248, 0.3)',
      pulse: 'bg-sky-400',
    };
  } else if (knots < 7) {
    return {
      arrow: '#34d399',
      badge: 'rgba(52, 211, 153, 0.15)',
      border: 'rgba(52, 211, 153, 0.5)',
      text: '#6ee7b7',
      glow: 'rgba(52, 211, 153, 0.4)',
      pulse: 'bg-emerald-400',
    };
  } else if (knots < 11) {
    // Yellow, not amber: amber and the orange tier right below it read as
    // basically the same color — yellow gives real hue separation.
    return {
      arrow: '#facc15',
      badge: 'rgba(250, 204, 21, 0.15)',
      border: 'rgba(250, 204, 21, 0.5)',
      text: '#fde047',
      glow: 'rgba(250, 204, 21, 0.4)',
      pulse: 'bg-yellow-400',
    };
  } else if (knots < 16) {
    return {
      arrow: '#fb923c',
      badge: 'rgba(251, 146, 60, 0.2)',
      border: 'rgba(251, 146, 60, 0.6)',
      text: '#fdba74',
      glow: 'rgba(251, 146, 60, 0.5)',
      pulse: 'bg-orange-400',
    };
  } else {
    return {
      arrow: '#f87171',
      badge: 'rgba(248, 113, 113, 0.2)',
      border: 'rgba(248, 113, 113, 0.6)',
      text: '#fca5a5',
      glow: 'rgba(248, 113, 113, 0.5)',
      pulse: 'bg-red-400',
    };
  }
}
