// The elements dataset (data/elements.json) with lookups.
// Pure: no DOM, no browser APIs, so it runs unchanged in Node tests.
import data from '../data/elements.json' with { type: 'json' };

/** @typedef {{ z: number, symbol: string, name: string, mass: number, massLabel: string,
 *   massType: 'standard' | 'mass-number', group: number | null, period: number,
 *   block: 's' | 'p' | 'd' | 'f', sources: readonly string[], review: string }} Element */

/** All 118 elements in atomic-number order. ELEMENTS[z - 1] is element z. */
export const ELEMENTS = Object.freeze(
  data.elements.map((e) => Object.freeze({ ...e, sources: Object.freeze([...e.sources]) }))
);

/** Sources cited by the entries, keyed by id. */
export const SOURCES = Object.freeze(data.sources);

const bySymbol = new Map(ELEMENTS.map((e) => [e.symbol, e]));

/**
 * Looks up an element by symbol ("Fe") or atomic number (26).
 * @param {string | number} key
 * @returns {Element}
 */
export function element(key) {
  const e = typeof key === 'number' ? ELEMENTS[key - 1] : bySymbol.get(key);
  if (!e) throw new RangeError(`Unknown element: ${JSON.stringify(key)}`);
  return e;
}

/**
 * Atomic weight of an element, numerically equal to its molar mass in g/mol.
 * For elements with no standard atomic weight (massType "mass-number") this is
 * the mass number of the longest-lived isotope, so check massType when it matters.
 * @param {string | number} key
 */
export const atomicWeight = (key) => element(key).mass;
