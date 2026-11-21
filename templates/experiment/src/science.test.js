import test from 'node:test';
import assert from 'node:assert/strict';
import { model } from './science.js';

// Every science function needs at least one worked example from a textbook
// (with its source) and one limiting case. Replace these stubs.
test.todo('worked example: a textbook problem, with the source in a comment');
test.todo('limiting case: what happens at an extreme of the range');

test('invalid input throws RangeError', () => {
  assert.throws(() => model(0), RangeError);
});
