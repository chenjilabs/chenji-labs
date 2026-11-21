import test from 'node:test';
import assert from 'node:assert/strict';
import {
  R, atmToKPa, celsiusToKelvin, cubicMetresToLitres, formatScientific, formatSig,
  kPaToAtm, kelvinToCelsius, litresToCubicMetres, superscript,
} from './index.js';

const near = (actual, expected, tol = 1e-12) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected}, got ${actual}`);

test('R is the CODATA molar gas constant', () => assert.equal(R, 8.314462618));

test('temperature: 0 °C is 273.15 K, 100 °C is 373.15 K, 0 K is -273.15 °C', () => {
  near(celsiusToKelvin(0), 273.15);
  near(celsiusToKelvin(100), 373.15);
  near(kelvinToCelsius(0), -273.15);
});

test('volume: 1 L is 0.001 m³ and 22.414 L is 0.022414 m³', () => {
  near(litresToCubicMetres(1), 0.001);
  near(litresToCubicMetres(22.414), 0.022414);
  near(cubicMetresToLitres(1), 1000);
});

test('pressure: 1 atm is 101.325 kPa', () => {
  near(atmToKPa(1), 101.325);
  near(kPaToAtm(101.325), 1);
  near(kPaToAtm(202.65), 2);
});

test('every conversion round-trips', () => {
  for (const x of [-40, 0, 1e-6, 0.5, 25, 273.15, 1e6]) {
    near(kelvinToCelsius(celsiusToKelvin(x)), x, 1e-9);
    near(celsiusToKelvin(kelvinToCelsius(x)), x, 1e-9);
    near(cubicMetresToLitres(litresToCubicMetres(x)), x, Math.abs(x) * 1e-12);
    near(litresToCubicMetres(cubicMetresToLitres(x)), x, Math.abs(x) * 1e-12);
    near(atmToKPa(kPaToAtm(x)), x, Math.abs(x) * 1e-12);
    near(kPaToAtm(atmToKPa(x)), x, Math.abs(x) * 1e-12);
  }
});

test('formatSig: ordinary values', () => {
  assert.equal(formatSig(101.325, 4), '101.3');
  assert.equal(formatSig(123.456, 2), '120');
  assert.equal(formatSig(8.314462618, 3), '8.31');
  assert.equal(formatSig(22.414, 5), '22.414');
  assert.equal(formatSig(1, 3), '1.00');
});

test('formatSig: zero keeps its significant zeros', () => {
  assert.equal(formatSig(0, 1), '0');
  assert.equal(formatSig(0, 3), '0.00');
  assert.equal(formatSig(-0, 2), '0.0');
});

test('formatSig: negative values', () => {
  assert.equal(formatSig(-273.15, 3), '-273');
  assert.equal(formatSig(-0.0012345, 3), '-0.00123');
  assert.equal(formatSig(-4.5e-7, 2), '-4.5 × 10⁻⁷');
});

test('formatSig: very large and very small values use × 10ⁿ', () => {
  assert.equal(formatSig(6.02214076e23, 4), '6.022 × 10²³');
  assert.equal(formatSig(1234567, 3), '1.23 × 10⁶');
  assert.equal(formatSig(0.00012345, 2), '1.2 × 10⁻⁴');
  assert.equal(formatSig(1e-14, 2), '1.0 × 10⁻¹⁴');
});

test('formatSig: rounding that carries into a new power of ten', () => {
  assert.equal(formatSig(9.999, 3), '10.0');
  assert.equal(formatSig(999999, 2), '1.0 × 10⁶');
  assert.equal(formatSig(0.0009999, 2), '0.0010');
});

test('formatSig: rejects bad input', () => {
  for (const n of [0, -1, 1.5, 22]) assert.throws(() => formatSig(1, n), RangeError);
  for (const v of [NaN, Infinity, -Infinity]) assert.throws(() => formatSig(v, 3), RangeError);
});

test('formatScientific keeps the pH simulator behaviour', () => {
  assert.equal(formatScientific(1), '1');
  assert.equal(formatScientific(0.1), '0.1');
  assert.equal(formatScientific(10 ** -1.5), '0.032');
  assert.equal(formatScientific(0.001), '0.001');
  assert.equal(formatScientific(10 ** -3.25), '5.6 × 10⁻⁴');
  assert.equal(formatScientific(1e-6), '1.0 × 10⁻⁶');
});

test('superscript writes signed exponents', () => {
  assert.equal(superscript(-14), '⁻¹⁴');
  assert.equal(superscript(23), '²³');
});
