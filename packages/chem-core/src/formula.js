// Chemical formulas: parse "CuSO4·5H2O" into element counts, work out molar mass,
// and format for display ("CuSO₄·5H₂O"). Pure: runs unchanged in Node tests.
import { atomicWeight, element } from './elements.js';

// Separators accepted between the parts of a hydrate or adduct: "·", "." or "*".
const DOT = /[·.*]/;

/**
 * Parses a neutral formula into element counts, in order of first appearance.
 * Supports nested () and [] groups, counts after an element or group, and
 * hydrates with a leading coefficient ("CuSO4·5H2O"). Charges are not supported.
 * @param {string} formula
 * @returns {Map<string, number>}
 */
export function parseFormula(formula) {
  if (typeof formula !== 'string' || formula.length === 0) throw new SyntaxError('Empty formula');
  let i = 0;
  const fail = (why) => {
    throw new SyntaxError(`${why} at position ${i + 1} in "${formula}"`);
  };

  const readCount = () => {
    const m = /^[0-9]+/.exec(formula.slice(i));
    if (!m) return 1;
    if (m[0].startsWith('0')) fail('A count cannot be zero or start with 0');
    i += m[0].length;
    return Number(m[0]);
  };

  // group := (Element | "(" sequence ")" | "[" sequence "]") count?
  const readSequence = (closer) => {
    const counts = new Map();
    const add = (sym, n) => counts.set(sym, (counts.get(sym) ?? 0) + n);
    while (i < formula.length) {
      const ch = formula[i];
      if (ch === closer) return counts;
      if (DOT.test(ch)) break;
      let inner;
      if (ch === '(' || ch === '[') {
        i += 1;
        inner = readSequence(ch === '(' ? ')' : ']');
        if (formula[i] !== (ch === '(' ? ')' : ']')) fail(`Missing "${ch === '(' ? ')' : ']'}"`);
        i += 1;
        if (inner.size === 0) fail('Empty brackets');
      } else {
        const m = /^[A-Z][a-z]?/.exec(formula.slice(i));
        if (!m) fail(`Unexpected "${ch}"`);
        try {
          element(m[0]);
        } catch {
          fail(`Unknown element "${m[0]}"`);
        }
        i += m[0].length;
        inner = new Map([[m[0], 1]]);
      }
      const n = readCount();
      for (const [sym, c] of inner) add(sym, c * n);
    }
    if (closer) fail(`Missing "${closer}"`);
    return counts;
  };

  const total = new Map();
  let first = true;
  while (i < formula.length || first) {
    if (!first) {
      if (!DOT.test(formula[i])) fail(`Unexpected "${formula[i]}"`);
      i += 1;
    }
    const coefficient = first ? 1 : readCount();
    const start = i;
    const part = readSequence(null);
    if (i === start || part.size === 0) fail('Expected an element');
    for (const [sym, c] of part) total.set(sym, (total.get(sym) ?? 0) + c * coefficient);
    first = false;
  }
  return total;
}

/**
 * Molar mass in g/mol from IUPAC abridged standard atomic weights.
 * Not rounded: round for display with the precision the context needs.
 * @param {string} formula
 */
export function molarMass(formula) {
  let sum = 0;
  for (const [sym, n] of parseFormula(formula)) sum += atomicWeight(sym) * n;
  return sum;
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';

/**
 * Display form with subscript counts and a middle dot: "CuSO4.5H2O" -> "CuSO₄·5H₂O".
 * A hydrate's leading coefficient stays full size.
 * @param {string} formula
 */
export function toDisplay(formula) {
  parseFormula(formula); // reject anything that is not a valid formula
  return formula
    .replace(/[.*]/g, '·')
    .replace(/(?<=[A-Za-z)\]])[0-9]+/g, (digits) => [...digits].map((d) => SUB[Number(d)]).join(''));
}
