// Universal-indicator style colours. Single source for the beaker and the scale bar.
export const STOPS = [
  [0, '#e11d2e'], [2, '#ef4a23'], [4, '#f6a21e'], [6, '#e8d92a'], [7, '#4fb34a'],
  [8, '#23a58a'], [10, '#2a6fc2'], [12, '#5b3fb0'], [14, '#7a2a8f'],
];

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

export function colorAt(ph) {
  const p = Math.min(14, Math.max(0, ph));
  for (let i = 1; i < STOPS.length; i++) {
    const [p1, c1] = STOPS[i];
    if (p <= p1) {
      const [p0, c0] = STOPS[i - 1];
      const t = (p - p0) / (p1 - p0);
      const a = rgb(c0), b = rgb(c1);
      return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * t)).join(',')})`;
    }
  }
  return STOPS[STOPS.length - 1][1];
}

export const gradient = () =>
  `linear-gradient(90deg, ${STOPS.map(([p, c]) => `${c} ${(p / 14) * 100}%`).join(', ')})`;
