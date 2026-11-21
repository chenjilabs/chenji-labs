import test from 'node:test';
import assert from 'node:assert/strict';
import { KW, SUBSTANCES, pH } from './chem.js';

const by = (id) => SUBSTANCES.find((s) => s.id === id);
const near = (actual, expected, tol = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected}, got ${actual}`);

test('0.1 M HCl is pH 1', () => near(pH(by('hcl'), 0.1), 1));
test('0.01 M NaOH is pH 12', () => near(pH(by('naoh'), 0.01), 12));
// Exact solutions with pKa 4.76 (ethanoic acid) and 9.25 (ammonium ion):
test('0.1 M ethanoic acid is about pH 2.88', () => near(pH(by('ch3cooh'), 0.1), 2.88));
test('0.1 M aqueous ammonia is about pH 11.12', () => near(pH(by('nh3-aq'), 0.1), 11.12));
test('very dilute HCl stays just below 7', () => {
  const v = pH(by('hcl'), 1e-8);
  assert.ok(v > 6.97 && v < 7, `got ${v}`);
});
test('diluting a weak acid 10x changes pH by about 0.5', () => {
  const d = pH(by('ch3cooh'), 0.01) - pH(by('ch3cooh'), 0.1);
  near(d, 0.5, 0.02);
});

// The substances now come from the chemical store (@chenji/reagents).
test('substances come from the store, with names and display formulas', () => {
  assert.deepEqual(SUBSTANCES.map((s) => s.id), ['hcl', 'ch3cooh', 'naoh', 'nh3-aq']);
  assert.equal(by('ch3cooh').name, 'Ethanoic acid');
  assert.equal(by('ch3cooh').formula, 'CH₃COOH');
  assert.equal(by('nh3-aq').formula, 'NH₃');
  assert.deepEqual(SUBSTANCES.map((s) => `${s.kind} ${s.strength}`), ['acid strong', 'acid weak', 'base strong', 'base weak']);
});

test('weak-acid and weak-base constants follow from the stored pKa values', () => {
  near(by('ch3cooh').k, 1.74e-5, 0.01e-5); // Ka = 10^-4.76
  near(by('nh3-aq').k, 1.78e-5, 0.01e-5); // Kb = Kw / 10^-9.25
  near(by('nh3-aq').k * 10 ** -9.25, KW, 1e-18); // Ka × Kb = Kw
  assert.equal(by('hcl').k, undefined);
});
