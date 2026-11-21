import test from 'node:test';
import assert from 'node:assert/strict';
import { GHS, REAGENTS, SOURCES, hasReagent, reagent } from './reagents.js';

const near = (actual, expected, tol) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected} ± ${tol}, got ${actual}`);
const HEX = /^#[0-9a-f]{6}$/;

// --- Schema -----------------------------------------------------------------

test('the store holds the 16 reagents the roadmap starts with', () => {
  assert.deepEqual(REAGENTS.map((r) => r.id).sort(), [
    'ch3cooh', 'cu', 'cuso4', 'h2so4', 'hcl', 'methyl-orange', 'mg', 'na2co3',
    'na2s2o3', 'naoh', 'nh3-aq', 'phenolphthalein', 'universal-indicator', 'water', 'zn', 'znso4',
  ]);
});

test('every entry has valid fields', () => {
  for (const r of REAGENTS) {
    const at = `reagent ${r.id}`;
    assert.match(r.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, at);
    assert.ok(r.name, at);
    assert.ok(['aqueous', 'solid', 'liquid', 'gas'].includes(r.state), at);
    assert.ok(r.appearance && r.appearance.length > 5, `${at} needs an appearance in words`);
    assert.ok(r.displayColour === null || HEX.test(r.displayColour), at);
    assert.ok(['needs-review', 'reviewed'].includes(r.review), at);
    assert.ok(r.sources.length > 0, `${at} cites no source`);
    for (const s of r.sources) assert.ok(SOURCES[s], `${at} cites unknown source "${s}"`);
  }
});

test('ids are unique', () => {
  assert.equal(new Set(REAGENTS.map((r) => r.id)).size, REAGENTS.length);
});

test('only mixtures have no formula', () => {
  for (const r of REAGENTS) {
    assert.equal(r.formula === null, r.mixture === true, r.id);
    assert.equal(r.molarMass === null, r.formula === null, r.id);
  }
});

test('hazards name the form they apply to and use known pictograms', () => {
  for (const r of REAGENTS) {
    assert.ok(r.hazards.appliesTo, `${r.id} must say which form the pictograms apply to`);
    assert.equal(new Set(r.hazards.ghs).size, r.hazards.ghs.length, r.id);
    for (const code of r.hazards.ghs) assert.ok(GHS[code], `${r.id}: unknown pictogram ${code}`);
  }
  assert.deepEqual(Object.keys(GHS), ['GHS01', 'GHS02', 'GHS03', 'GHS04', 'GHS05', 'GHS06', 'GHS07', 'GHS08', 'GHS09']);
});

test('acid-base data is consistent', () => {
  for (const r of REAGENTS.filter((x) => x.acidBase)) {
    const { role, strength, pKa } = r.acidBase;
    assert.ok(['acid', 'base'].includes(role), r.id);
    assert.ok(['strong', 'weak'].includes(strength), r.id);
    if (strength === 'weak') assert.ok(pKa?.some((v) => typeof v === 'number'), `${r.id}: a weak ${role} needs a pKa`);
    if (role === 'acid' && strength === 'strong') assert.equal(pKa[0], null, `${r.id}: first step of a strong acid is complete`);
    if (role === 'base' && strength === 'strong') assert.equal(pKa, undefined, `${r.id}: strong bases list no pKa`);
    const values = (pKa ?? []).filter((v) => v !== null);
    for (const v of values) assert.ok(v > -2 && v < 16, `${r.id}: pKa ${v} out of range`);
    assert.deepEqual(values, [...values].sort((a, b) => a - b), `${r.id}: pKa values rise with each step`);
  }
});

test('indicator scales run in order of rising pH, within 0 to 14', () => {
  for (const r of REAGENTS.filter((x) => x.indicator)) {
    const { scale } = r.indicator;
    assert.ok(scale.length >= 2, r.id);
    for (const point of scale) {
      assert.ok(point.pH >= 0 && point.pH <= 14, r.id);
      assert.ok(point.name, `${r.id}: every colour is named in words`);
      assert.ok(point.hex === null || HEX.test(point.hex), r.id);
    }
    for (let i = 1; i < scale.length; i++) assert.ok(scale[i].pH > scale[i - 1].pH, r.id);
  }
});

test('every source has a title and an https link', () => {
  for (const [id, s] of Object.entries(SOURCES)) {
    assert.ok(s.title, id);
    assert.match(s.url, /^https:\/\//, id);
  }
});

// --- Chemistry: worked examples ---------------------------------------------

test('worked examples: molar masses computed by chem-core, in g/mol', () => {
  const cases = { hcl: 36.458, naoh: 39.997, h2so4: 98.072, ch3cooh: 60.052, na2co3: 105.988, cuso4: 159.602, na2s2o3: 158.097, water: 18.015 };
  for (const [id, mass] of Object.entries(cases)) near(reagent(id).molarMass, mass, 0.0005);
});

test('worked example: 0.100 mol/dm³ ethanoic acid has pH 2.88', () => {
  // Weak acid, small dissociation: pH = ½(pKa − log c)
  const { pKa } = reagent('ch3cooh').acidBase;
  near(0.5 * (pKa[0] - Math.log10(0.1)), 2.88, 0.005);
});

test('worked example: 0.100 mol/dm³ aqueous ammonia has pH 11.13', () => {
  // pKb = 14.00 − pKa(NH₄⁺); pOH = ½(pKb − log c); pH = 14.00 − pOH
  const pKb = 14 - reagent('nh3-aq').acidBase.pKa[0];
  near(14 - 0.5 * (pKb - Math.log10(0.1)), 11.125, 0.005);
});

test('indicator ranges match the textbook values', () => {
  assert.deepEqual(reagent('phenolphthalein').indicator.scale.map((p) => p.pH), [8.2, 10.0]);
  assert.deepEqual(reagent('methyl-orange').indicator.scale.map((p) => p.pH), [3.1, 4.4]);
  assert.equal(reagent('universal-indicator').indicator.scale.find((p) => p.pH === 7).name, 'green');
});

test('the concentrated acids and alkali are marked corrosive', () => {
  for (const id of ['hcl', 'h2so4', 'ch3cooh', 'naoh', 'nh3-aq']) assert.ok(reagent(id).hazards.ghs.includes('GHS05'), id);
});

// --- Lookups ----------------------------------------------------------------

test('reagent() finds by id, and formulas are formatted for display', () => {
  assert.equal(reagent('h2so4').name, 'Sulfuric acid');
  assert.equal(reagent('h2so4').formulaDisplay, 'H₂SO₄');
  assert.equal(reagent('ch3cooh').formulaDisplay, 'CH₃COOH');
  assert.equal(reagent('universal-indicator').formulaDisplay, null);
});

test('reagent() rejects unknown ids, and hasReagent() reports them', () => {
  assert.throws(() => reagent('HCl'), RangeError);
  assert.throws(() => reagent('nitric-acid'), RangeError);
  assert.equal(hasReagent('hcl'), true);
  assert.equal(hasReagent('nitric-acid'), false);
});

test('entries cannot be changed by callers', () => {
  assert.ok(Object.isFrozen(REAGENTS));
  assert.ok(Object.isFrozen(reagent('hcl')));
  assert.ok(Object.isFrozen(reagent('hcl').hazards.ghs));
  assert.ok(Object.isFrozen(reagent('phenolphthalein').indicator.scale[1]));
});
