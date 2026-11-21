import test from 'node:test';
import assert from 'node:assert/strict';
import { ELEMENTS, SOURCES, atomicWeight, element } from './elements.js';

const near = (actual, expected, tol) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected} ± ${tol}, got ${actual}`);

// --- Schema: the shape every entry must have ---------------------------------

test('there are 118 elements, in atomic-number order', () => {
  assert.equal(ELEMENTS.length, 118);
  ELEMENTS.forEach((e, i) => assert.equal(e.z, i + 1));
});

test('every entry has valid fields', () => {
  for (const e of ELEMENTS) {
    const at = `element ${e.z}`;
    assert.match(e.symbol, /^[A-Z][a-z]?$/, at);
    assert.match(e.name, /^[A-Z][a-z]+$/, at);
    assert.ok(Number.isFinite(e.mass) && e.mass > 0, at);
    assert.ok(['standard', 'mass-number'].includes(e.massType), at);
    assert.ok(e.period >= 1 && e.period <= 7, at);
    assert.ok(['s', 'p', 'd', 'f'].includes(e.block), at);
    assert.ok(e.group === null || (Number.isInteger(e.group) && e.group >= 1 && e.group <= 18), at);
    assert.equal(e.group === null, e.block === 'f', `${at}: only f-block elements have no group`);
    assert.ok(['needs-review', 'reviewed'].includes(e.review), at);
    assert.ok(e.sources.length > 0, `${at} cites no source`);
    for (const s of e.sources) assert.ok(SOURCES[s], `${at} cites unknown source "${s}"`);
  }
});

test('symbols and names are unique', () => {
  assert.equal(new Set(ELEMENTS.map((e) => e.symbol)).size, 118);
  assert.equal(new Set(ELEMENTS.map((e) => e.name)).size, 118);
});

test('massLabel matches mass and keeps the published precision', () => {
  for (const e of ELEMENTS) {
    if (e.massType === 'standard') {
      assert.match(e.massLabel, /^\d+\.\d+$/, `element ${e.z}`);
      assert.equal(Number(e.massLabel), e.mass, `element ${e.z}`);
    } else {
      assert.ok(Number.isInteger(e.mass), `element ${e.z}: a mass number is a whole number`);
      assert.equal(e.massLabel, `[${e.mass}]`, `element ${e.z}`);
    }
  }
});

test('every source has a title and an https link', () => {
  for (const [id, s] of Object.entries(SOURCES)) {
    assert.ok(s.title, id);
    assert.match(s.url, /^https:\/\//, id);
  }
});

// --- Chemistry: values checked against the sources --------------------------

test('exactly the elements with a standard atomic weight have massType "standard"', () => {
  // Every element up to bismuth except Tc and Pm, plus Th, Pa and U (CIAAW).
  const expected = ELEMENTS.map((e) => e.z).filter((z) => (z <= 83 && z !== 43 && z !== 61) || [90, 91, 92].includes(z));
  const actual = ELEMENTS.filter((e) => e.massType === 'standard').map((e) => e.z);
  assert.deepEqual(actual, expected);
});

test('atomic weights match the CIAAW abridged values', () => {
  const cases = { H: 1.008, C: 12.011, N: 14.007, O: 15.999, Na: 22.99, Cl: 35.45, Fe: 55.845, Cu: 63.546, Pb: 207.2, U: 238.03 };
  for (const [symbol, mass] of Object.entries(cases)) assert.equal(atomicWeight(symbol), mass, symbol);
  assert.equal(element('H').massLabel, '1.0080');
  assert.equal(element('Ne').massLabel, '20.180');
});

test('worked example: molar mass of water is 18.015 g/mol', () => {
  near(2 * atomicWeight('H') + atomicWeight('O'), 18.015, 0.0005);
});

test('worked example: molar mass of sodium chloride is 58.44 g/mol', () => {
  near(atomicWeight('Na') + atomicWeight('Cl'), 58.44, 0.005);
});

test('limiting case: atomic weight is never less than the atomic number, nor more than 2.6 times it', () => {
  // Hydrogen has the lowest ratio (about 1.008); the heaviest elements approach 2.5.
  for (const e of ELEMENTS) assert.ok(e.mass >= e.z && e.mass <= 2.6 * e.z, `element ${e.z}`);
});

test('periods have 2, 8, 8, 18, 18, 32 and 32 elements', () => {
  const sizes = [1, 2, 3, 4, 5, 6, 7].map((p) => ELEMENTS.filter((e) => e.period === p).length);
  assert.deepEqual(sizes, [2, 8, 8, 18, 18, 32, 32]);
});

test('blocks have 14 s, 36 p, 40 d and 28 f elements', () => {
  const count = (b) => ELEMENTS.filter((e) => e.block === b).length;
  assert.deepEqual([count('s'), count('p'), count('d'), count('f')], [14, 36, 40, 28]);
});

test('positions follow the IUPAC table, with Lu and Lr in group 3', () => {
  const cases = {
    H: [1, 1, 's'], He: [18, 1, 's'], C: [14, 2, 'p'], Na: [1, 3, 's'], Fe: [8, 4, 'd'],
    Br: [17, 4, 'p'], Ag: [11, 5, 'd'], La: [null, 6, 'f'], Yb: [null, 6, 'f'], Lu: [3, 6, 'd'],
    Hg: [12, 6, 'd'], Ac: [null, 7, 'f'], Lr: [3, 7, 'd'], Og: [18, 7, 'p'],
  };
  for (const [symbol, [group, period, block]] of Object.entries(cases)) {
    const e = element(symbol);
    assert.deepEqual([e.group, e.period, e.block], [group, period, block], symbol);
  }
});

test('names use IUPAC spellings', () => {
  assert.equal(element('Al').name, 'Aluminium');
  assert.equal(element('Cs').name, 'Caesium');
  assert.equal(element('S').name, 'Sulfur');
});

// --- Lookups ----------------------------------------------------------------

test('element() finds by symbol or atomic number', () => {
  assert.equal(element('Fe').z, 26);
  assert.equal(element(26).symbol, 'Fe');
  assert.equal(element(118).name, 'Oganesson');
});

test('element() rejects unknown keys', () => {
  for (const key of ['Xx', 'fe', '', 0, 119, 1.5]) assert.throws(() => element(key), RangeError, String(key));
});

test('entries cannot be changed by callers', () => {
  assert.ok(Object.isFrozen(ELEMENTS));
  assert.ok(Object.isFrozen(element('O')));
  assert.ok(Object.isFrozen(element('O').sources));
});
