// Ideal gas science model. Pure: no DOM, so it is tested in Node and can move
// into chem-core unchanged in Phase 2.
//
// Units: P in kPa, V in L, T in K, n in mol. With V in litres and P in
// kilopascals, PV = nRT works directly, because 1 kPa × 1 L = 1 J.
import { R, cubicMetresToLitres, litresToCubicMetres } from '@chenjilabs/units';

/** Slider ranges for the inputs, and the allowed range for a computed volume. */
export const RANGES = {
  T: { min: 100, max: 600, step: 5 },
  V: { min: 1, max: 50, step: 0.5 },
  n: { min: 0.1, max: 2, step: 0.1 },
};

const positive = (values) => {
  for (const [name, v] of Object.entries(values)) {
    if (!(Number.isFinite(v) && v > 0)) throw new RangeError(`${name} must be a positive number, got ${v}`);
  }
};

/** Pressure in kPa from P = nRT/V. */
export function pressure(n, T, V) {
  positive({ n, T, V });
  return (n * R * T) / litresToCubicMetres(V) / 1000;
}

/** Volume in L from V = nRT/P. */
export function volume(n, T, P) {
  positive({ n, T, P });
  return cubicMetresToLitres((n * R * T) / (P * 1000));
}

/**
 * The three laws. Each holds one variable constant (locked), lets the learner
 * change the inputs, and computes one variable. The amount of gas, n, is a
 * setup input in every mode: "fixed unless you change it".
 */
export const MODES = {
  boyle: { name: "Boyle's law", locked: 'T', inputs: ['V', 'n'], computed: 'P' },
  'gay-lussac': { name: "Gay-Lussac's law", locked: 'V', inputs: ['T', 'n'], computed: 'P' },
  charles: { name: "Charles's law", locked: 'P', inputs: ['T', 'n'], computed: 'V' },
};

/** A consistent starting state, with P computed from n, T and V. */
export function initialState({ n = 1, T = 300, V = 25 } = {}) {
  return { n, T, V, P: pressure(n, T, V) };
}

/**
 * Applies the learner's changes under a mode. Changes to anything other than
 * the mode's inputs are ignored, so the locked variable never moves. The
 * computed variable is recalculated. If a computed volume would leave
 * RANGES.V, nothing changes and `limited` explains why.
 * @param {keyof MODES} mode
 * @param {{ n: number, T: number, V: number, P: number }} state
 * @param {Partial<{ n: number, T: number, V: number, P: number }>} changes
 * @returns {{ state: object, limited: null | { variable: string, value: number, max: number, min: number } }}
 */
export function applyChange(mode, state, changes) {
  const m = MODES[mode];
  if (!m) throw new RangeError(`Unknown mode "${mode}"`);
  const next = { ...state };
  for (const key of m.inputs) if (key in changes) next[key] = changes[key];

  if (m.computed === 'P') next.P = pressure(next.n, next.T, next.V);
  else next.V = volume(next.n, next.T, next.P);

  if (m.computed === 'V' && (next.V < RANGES.V.min || next.V > RANGES.V.max)) {
    return { state, limited: { variable: 'V', value: next.V, min: RANGES.V.min, max: RANGES.V.max } };
  }
  return { state: next, limited: null };
}
