// Tests the pure logic behind the DOM helpers. The helpers themselves need a
// browser and are exercised by the experiments' builds.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SCIENCE_PARTS, judge, missingScienceParts } from './index.js';

const options = [
  { correct: false, why: 'Diluting lowers [H⁺], so the pH rises.' },
  { correct: true, why: '[H⁺] falls tenfold, so the pH rises by 1.' },
];

test('judge: a correct choice says so, with its explanation', () => {
  assert.deepEqual(judge(options, 1), { status: 'correct', message: '✓ Correct. [H⁺] falls tenfold, so the pH rises by 1.' });
});

test('judge: a wrong choice explains why it is wrong', () => {
  assert.deepEqual(judge(options, 0), { status: 'incorrect', message: '✗ Not quite. Diluting lowers [H⁺], so the pH rises.' });
});

test('judge: no choice asks for one, and the message never relies on colour', () => {
  assert.deepEqual(judge(options, -1), { status: 'none', message: 'Choose an answer first.' });
  assert.equal(judge(options, 5).status, 'none');
  // The status is carried by the words "Correct" / "Not quite", not only by styling.
  assert.match(judge(options, 1).message, /Correct/);
  assert.match(judge(options, 0).message, /Not quite/);
});

test('judge: a question without a correct option is a mistake in the page', () => {
  assert.throws(() => judge([{ correct: false, why: '' }], 0));
});

test('science sections need an equation, assumptions, limits and sources', () => {
  assert.deepEqual(SCIENCE_PARTS, ['equation', 'assumptions', 'limits', 'sources']);
  assert.deepEqual(missingScienceParts(['equation', 'sources']), ['assumptions', 'limits']);
  assert.deepEqual(missingScienceParts(SCIENCE_PARTS), []);
});
