import test from 'node:test';
import assert from 'node:assert/strict';
import { MODES, applyChange, initialState, pressure, volume } from './gas-laws.js';

const close = (actual, expected, relTol) =>
  assert.ok(Math.abs(actual - expected) <= Math.abs(expected) * relTol, `expected ${expected} (±${relTol * 100}%), got ${actual}`);

test('worked example: 1.000 mol at 273.15 K in 22.414 L exerts 101.325 kPa (within 0.05%)', () => {
  close(pressure(1, 273.15, 22.414), 101.325, 0.0005);
});

test('worked example: volume() inverts pressure()', () => {
  close(volume(1, 273.15, 101.325), 22.414, 0.0005);
});

test("Boyle's law: halving V doubles P", () => {
  close(pressure(1, 300, 10) / pressure(1, 300, 20), 2, 1e-12);
  const s = initialState({ V: 20 });
  const { state } = applyChange('boyle', s, { V: 10 });
  close(state.P / s.P, 2, 1e-12);
});

test("Charles's law: doubling T at constant P doubles V", () => {
  close(volume(1, 600, 100) / volume(1, 300, 100), 2, 1e-12);
  const s = initialState({ T: 200, V: 10 });
  const { state } = applyChange('charles', s, { T: 400 });
  close(state.V / s.V, 2, 1e-12);
  assert.equal(state.P, s.P);
});

test("Gay-Lussac's law: doubling T at constant V doubles P", () => {
  close(pressure(1, 600, 25) / pressure(1, 300, 25), 2, 1e-12);
  const s = initialState({ T: 250 });
  const { state } = applyChange('gay-lussac', s, { T: 500 });
  close(state.P / s.P, 2, 1e-12);
  assert.equal(state.V, s.V);
});

test('a non-positive n, V or T throws RangeError', () => {
  for (const bad of [0, -1, NaN]) {
    assert.throws(() => pressure(bad, 300, 25), RangeError);
    assert.throws(() => pressure(1, bad, 25), RangeError);
    assert.throws(() => pressure(1, 300, bad), RangeError);
    assert.throws(() => volume(bad, 300, 100), RangeError);
    assert.throws(() => volume(1, bad, 100), RangeError);
    assert.throws(() => volume(1, 300, bad), RangeError);
  }
});

test('each mode keeps its locked variable unchanged, whatever is changed', () => {
  const s = initialState();
  const everything = { n: 1.5, T: 450, V: 12, P: 999 };
  for (const [mode, { locked }] of Object.entries(MODES)) {
    const { state } = applyChange(mode, s, everything);
    assert.equal(state[locked], s[locked], `${mode} must keep ${locked}`);
  }
});

test('each mode only changes its inputs and its computed variable', () => {
  const s = initialState();
  for (const [mode, { inputs, computed }] of Object.entries(MODES)) {
    const { state } = applyChange(mode, s, { n: 1.2, T: 320, V: 20, P: 5 });
    for (const key of ['n', 'T', 'V', 'P']) {
      if (!inputs.includes(key) && key !== computed) assert.equal(state[key], s[key], `${mode} changed ${key}`);
    }
    close(state.P * state.V, state.n * 8.314462618 * state.T, 1e-12); // still obeys PV = nRT
  }
});

test("Charles's law refuses a volume outside the slider range, and says why", () => {
  const s = initialState({ T: 300, V: 40 });
  const { state, limited } = applyChange('charles', s, { T: 600 }); // would need 80 L
  assert.equal(state, s);
  assert.equal(limited.variable, 'V');
  close(limited.value, 80, 1e-12);
});

test('an unknown mode is an error', () => {
  assert.throws(() => applyChange('avogadro', initialState(), {}), RangeError);
});
