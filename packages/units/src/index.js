// Measurement standards: constants, unit conversions and number formatting.
// Pure: no DOM, no browser APIs. Depends on nothing.

/** Molar gas constant, J/(mol·K) (CODATA 2018 exact value, from NA × k). */
export const R = 8.314462618;

/** 0 °C in kelvin. */
export const ZERO_CELSIUS_IN_KELVIN = 273.15;

/** 1 standard atmosphere in kilopascals. */
export const KPA_PER_ATM = 101.325;

/** Cubic metres in one litre (1 L = 1 dm³). */
export const M3_PER_LITRE = 1e-3;

export const celsiusToKelvin = (c) => c + ZERO_CELSIUS_IN_KELVIN;
export const kelvinToCelsius = (k) => k - ZERO_CELSIUS_IN_KELVIN;
export const litresToCubicMetres = (l) => l * M3_PER_LITRE;
export const cubicMetresToLitres = (m3) => m3 / M3_PER_LITRE;
export const kPaToAtm = (kPa) => kPa / KPA_PER_ATM;
export const atmToKPa = (atm) => atm * KPA_PER_ATM;

const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };

/** Writes an integer exponent as superscript: -6 -> "⁻⁶". */
export const superscript = (n) => [...String(n)].map((ch) => SUPERSCRIPT[ch]).join('');

/**
 * Formats a number to n significant figures. Values from 0.001 up to (not
 * including) 1 000 000 use plain decimals ("101.3", "0.00123"); anything
 * smaller or larger uses "1.23 × 10⁶". Zero keeps its trailing zeros ("0.00").
 * @param {number} value
 * @param {number} n significant figures, 1 to 21
 */
export function formatSig(value, n) {
  if (!Number.isInteger(n) || n < 1 || n > 21) throw new RangeError(`Significant figures must be an integer from 1 to 21, got ${n}`);
  if (!Number.isFinite(value)) throw new RangeError(`Cannot format ${value}`);
  if (value === 0) return (0).toFixed(n - 1);
  const sign = value < 0 ? '-' : '';
  // toExponential rounds first, so 9.999 to 3 s.f. becomes 1.00e+1, with the right exponent.
  const [mantissa, exp] = Math.abs(value).toExponential(n - 1).split('e');
  const e = Number(exp);
  if (e >= -3 && e < 6) return sign + Number(`${mantissa}e${e}`).toFixed(Math.max(0, n - 1 - e));
  return `${sign}${mantissa} × 10${superscript(e)}`;
}

/**
 * Compact two-significant-figure format used for concentrations: plain
 * decimals from 0.001 upwards ("0.032", "1"), otherwise "3.2 × 10⁻⁵".
 * (Moved unchanged from the pH simulator.)
 * @param {number} c
 */
export function formatScientific(c) {
  if (c >= 0.001) return String(Number(c.toPrecision(2)));
  const [m, e] = c.toExponential(1).split('e');
  return `${m} × 10${superscript(Number(e))}`;
}
