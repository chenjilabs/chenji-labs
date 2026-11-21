import test from 'node:test';
import assert from 'node:assert/strict';
import { molarMass, parseFormula, toDisplay } from './formula.js';

const counts = (f) => Object.fromEntries(parseFormula(f));
const near = (actual, expected, tol) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected} ± ${tol}, got ${actual}`);

test('parses simple formulas', () => {
  assert.deepEqual(counts('H2O'), { H: 2, O: 1 });
  assert.deepEqual(counts('NaCl'), { Na: 1, Cl: 1 });
  assert.deepEqual(counts('Mg'), { Mg: 1 });
  assert.deepEqual(counts('C20H14O4'), { C: 20, H: 14, O: 4 });
});

test('adds repeated elements together', () => {
  assert.deepEqual(counts('CH3COOH'), { C: 2, H: 4, O: 2 });
});

test('multiplies out brackets, including nested ones', () => {
  assert.deepEqual(counts('Ca(OH)2'), { Ca: 1, O: 2, H: 2 });
  assert.deepEqual(counts('Al2(SO4)3'), { Al: 2, S: 3, O: 12 });
  assert.deepEqual(counts('K4[Fe(CN)6]'), { K: 4, Fe: 1, C: 6, N: 6 });
});

test('handles hydrates written with ·, . or *', () => {
  const expected = { Cu: 1, S: 1, O: 9, H: 10 };
  assert.deepEqual(counts('CuSO4·5H2O'), expected);
  assert.deepEqual(counts('CuSO4.5H2O'), expected);
  assert.deepEqual(counts('CuSO4*5H2O'), expected);
  assert.deepEqual(counts('Na2CO3·H2O'), { Na: 2, C: 1, O: 4, H: 2 });
});

test('rejects formulas that are not valid', () => {
  for (const bad of ['', 'h2o', 'Xx', 'H2O)', '(H2O', 'Ca()2', 'H0', 'H02', '2H2O', 'H2O·', 'Na+', 'H2 O', '[H2O)']) {
    assert.throws(() => parseFormula(bad), SyntaxError, bad);
  }
});

test('worked examples: molar masses in g/mol', () => {
  near(molarMass('H2O'), 18.015, 0.0005);
  near(molarMass('NaCl'), 58.44, 0.005);
  near(molarMass('CH3COOH'), 60.052, 0.0005);
  near(molarMass('H2SO4'), 98.072, 0.0005);
  near(molarMass('Ca(OH)2'), 74.092, 0.0005);
  near(molarMass('Al2(SO4)3'), 342.132, 0.0005);
  near(molarMass('CuSO4·5H2O'), 249.677, 0.0005);
});

test('limiting case: a single atom has the molar mass of its element', () => {
  near(molarMass('C'), 12.011, 1e-9);
  near(molarMass('U'), 238.03, 1e-9);
});

test('limiting case: a hydrate is the sum of its parts', () => {
  near(molarMass('CuSO4·5H2O'), molarMass('CuSO4') + 5 * molarMass('H2O'), 1e-9);
});

test('formats formulas for display', () => {
  assert.equal(toDisplay('H2SO4'), 'H₂SO₄');
  assert.equal(toDisplay('CH3COOH'), 'CH₃COOH');
  assert.equal(toDisplay('Ca(OH)2'), 'Ca(OH)₂');
  assert.equal(toDisplay('CuSO4.5H2O'), 'CuSO₄·5H₂O');
  assert.equal(toDisplay('C20H14O4'), 'C₂₀H₁₄O₄');
  assert.equal(toDisplay('Mg'), 'Mg');
  assert.throws(() => toDisplay('Xx2'), SyntaxError);
});
