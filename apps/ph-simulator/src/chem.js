// Pure chemistry logic. No DOM here, so it can be tested with `node --test`.
// Assumes 25 °C (Kw = 1e-14) and a single acid or base in pure water.

export const KW = 1e-14;

export const SUBSTANCES = [
  { id: 'hcl', name: 'Hydrochloric acid', formula: 'HCl', kind: 'acid', strength: 'strong' },
  { id: 'acetic', name: 'Acetic acid', formula: 'CH₃COOH', kind: 'acid', strength: 'weak', k: 1.8e-5 },
  { id: 'naoh', name: 'Sodium hydroxide', formula: 'NaOH', kind: 'base', strength: 'strong' },
  { id: 'nh3', name: 'Ammonia', formula: 'NH₃', kind: 'base', strength: 'weak', k: 1.8e-5 },
];

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
