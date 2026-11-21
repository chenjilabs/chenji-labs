// Pure chemistry logic. No DOM here, so it can be tested with `node --test`.
// Assumes 25 °C (Kw = 1e-14) and a single acid or base in pure water.
import { reagent } from '@chenji/reagents';

export const KW = 1e-14;

// The substances offered, by id in the chemical store (@chenji/reagents).
export const SUBSTANCE_IDS = ['hcl', 'ch3cooh', 'naoh', 'nh3-aq'];

// k is Ka for a weak acid and Kb for a weak base. The store gives pKa of the
// acid form at 25 °C, so for a base Kb = Kw / Ka of its conjugate acid.
function fromStore(id) {
  const r = reagent(id);
  if (!r.acidBase) throw new Error(`${id} has no acid-base data in the store`);
  const { role, strength, pKa } = r.acidBase;
  const substance = { id, name: r.name, formula: r.formulaDisplay, kind: role, strength };
  if (strength === 'weak') {
    const ka = 10 ** -pKa[0];
    substance.k = role === 'acid' ? ka : KW / ka;
  }
  return substance;
}

export const SUBSTANCES = SUBSTANCE_IDS.map(fromStore);

// Finds x where f(x) = 0 for an increasing f, searching in log space.
function solve(f, lo = 1e-15, hi = 100) {
  let a = Math.log(lo);
  let b = Math.log(hi);
  for (let i = 0; i < 200; i++) {
    const mid = (a + b) / 2;
    if (f(Math.exp(mid)) > 0) b = mid;
    else a = mid;
  }
  return Math.exp((a + b) / 2);
}

// x is [H+] for an acid and [OH-] for a base. Charge balance, including water:
//   strong: x = c + Kw/x        weak: x = k·c/(k + x) + Kw/x
export function pH(substance, c) {
  const { kind, strength, k } = substance;
  const f = strength === 'strong' ? (x) => x - c - KW / x : (x) => x - (k * c) / (k + x) - KW / x;
  const x = solve(f);
  return kind === 'acid' ? -Math.log10(x) : -Math.log10(KW) + Math.log10(x);
}
