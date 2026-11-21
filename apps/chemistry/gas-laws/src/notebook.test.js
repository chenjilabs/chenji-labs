import test from 'node:test';
import assert from 'node:assert/strict';
import { COLUMNS, MAX_ROWS, createNotebook, formatRow, toRow } from './notebook.js';

const reading = { n: 1, T: 300, V: 25, P: 99.78 };

test('a row holds P, V, T and the derived PV and V/T', () => {
  const row = toRow(reading);
  assert.equal(row.PV, 99.78 * 25);
  assert.equal(row.VT, 25 / 300);
});

test('column headers carry units', () => {
  assert.deepEqual(COLUMNS.map((c) => c.label), ['P / kPa', 'V / L', 'T / K', 'PV / kPa·L', '(V/T) / L·K⁻¹']);
});

test('rows are formatted to 4 significant figures', () => {
  assert.deepEqual(formatRow(toRow(reading)), ['99.78', '25.00', '300.0', '2495', '0.08333']);
});

test(`the notebook holds at most ${MAX_ROWS} rows and says when it is full`, () => {
  const book = createNotebook();
  for (let i = 1; i <= MAX_ROWS; i++) assert.equal(book.record(reading).ok, true);
  assert.equal(book.full, true);
  const extra = book.record(reading);
  assert.equal(extra.ok, false);
  assert.match(extra.message, /full/);
  assert.equal(book.rows.length, MAX_ROWS);
});

test('clear empties the notebook', () => {
  const book = createNotebook();
  book.record(reading);
  book.clear();
  assert.equal(book.rows.length, 0);
  assert.equal(book.full, false);
});

test('callers cannot change recorded rows through the rows list', () => {
  const book = createNotebook();
  book.record(reading);
  book.rows.push(toRow(reading));
  assert.equal(book.rows.length, 1);
});
