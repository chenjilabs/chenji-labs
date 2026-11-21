// The science model: pure functions only, no DOM, so they can be tested in
// Node and moved into a shared package unchanged. State units in every name or
// comment, and throw RangeError for inputs outside the model's limits.

/**
 * TODO: replace with the real model, for example pressure(n, T, V) in kPa.
 * @param {number} x
 */
export function model(x) {
  if (!(Number.isFinite(x) && x > 0)) throw new RangeError(`x must be a positive number, got ${x}`);
  return 2 * x;
}
