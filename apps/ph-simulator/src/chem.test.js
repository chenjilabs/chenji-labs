import test from 'node:test';
import assert from 'node:assert/strict';
import { SUBSTANCES, pH } from './chem.js';

const by = (id) => SUBSTANCES.find((s) => s.id === id);
const near = (actual, expected, tol = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected}, got ${actual}`);

test('0.1 M HCl is pH 1', () => near(pH(by('hcl'), 0.1), 1));
test('0.01 M NaOH is pH 12', () => near(pH(by('naoh'), 0.01), 12));
test('0.1 M acetic acid is about pH 2.88', () => near(pH(by('acetic'), 0.1), 2.875));
test('0.1 M ammonia is about pH 11.12', () => near(pH(by('nh3'), 0.1), 11.125));
test('very dilute HCl stays just below 7', () => {
  const v = pH(by('hcl'), 1e-8);
  assert.ok(v > 6.97 && v < 7, `got ${v}`);
});
test('diluting a weak acid 10x changes pH by about 0.5', () => {
  const d = pH(by('acetic'), 0.01) - pH(by('acetic'), 0.1);
  near(d, 0.5, 0.02);
});
