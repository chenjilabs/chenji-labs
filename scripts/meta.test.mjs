import test from 'node:test';
import assert from 'node:assert/strict';
import { findCycles, validateApps } from './meta.mjs';

const meta = (overrides = {}) => ({
  title: 'Gas laws', summary: 'One sentence.', step: 2, kind: 'explorer', level: 'senior-secondary',
  prerequisites: [], sources: [{ title: 'A textbook', isbn: '000' }], ...overrides,
});
const app = (path, overrides) => ({ path, file: `apps/${path}/app.json`, meta: meta(overrides) });
const errorsOf = (apps) => validateApps(apps).errors;

test('valid metadata passes with no errors or warnings', () => {
  const result = validateApps([app('chemistry/gas-laws'), app('chemistry/ph-simulator', { step: 3, prerequisites: ['chemistry/gas-laws'] })]);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
});

test('errors name the file and the field', () => {
  const [error] = errorsOf([app('chemistry/gas-laws', { step: 9 })]);
  assert.equal(error, 'apps/chemistry/gas-laws/app.json: "step" must be a whole number from 1 to 6 (got 9)');
});

test('step must be a whole number from 1 to 6', () => {
  for (const step of [0, 7, 2.5, '2', undefined]) assert.equal(errorsOf([app('chemistry/a', { step })]).length, 1, String(step));
  for (const step of [1, 6]) assert.deepEqual(errorsOf([app('chemistry/a', { step })]), []);
});

test('kind, level and status must hold allowed values', () => {
  assert.match(errorsOf([app('chemistry/a', { kind: 'game' })])[0], /"kind" must be one of "practical", "explorer"/);
  assert.match(errorsOf([app('chemistry/a', { level: 'Secondary school' })])[0], /"level" must be one of "junior-secondary"/);
  assert.match(errorsOf([app('chemistry/a', { status: 'hidden' })])[0], /"status" must be one of "draft", "published"/);
  assert.deepEqual(errorsOf([app('chemistry/a', { kind: 'practical', level: 'first-year-university', status: 'draft' })]), []);
});

test('title and summary are required', () => {
  assert.equal(errorsOf([app('chemistry/a', { title: '', summary: undefined })]).length, 2);
});

test('status defaults to published', () => {
  const { apps } = validateApps([app('chemistry/a')]);
  assert.equal(apps[0].status, 'published');
  assert.equal(apps[0].subject, 'chemistry');
  assert.equal(apps[0].name, 'a');
});

test('prerequisites are required, but may be empty', () => {
  assert.match(errorsOf([app('chemistry/a', { prerequisites: undefined })])[0], /"prerequisites" is required/);
  assert.deepEqual(errorsOf([app('chemistry/a', { prerequisites: [] })]), []);
});

test('every prerequisite must exist and look like subject/name', () => {
  assert.match(errorsOf([app('chemistry/a', { prerequisites: ['chemistry/missing'] })])[0], /"chemistry\/missing" does not exist/);
  assert.match(errorsOf([app('chemistry/a', { prerequisites: ['gas-laws'] })])[0], /must look like "subject\/name"/);
  assert.match(errorsOf([app('chemistry/a', { prerequisites: ['chemistry/a'] })])[0], /cannot list the experiment itself/);
});

test("a prerequisite's step must be the same or earlier", () => {
  const later = [app('chemistry/a', { step: 2, prerequisites: ['chemistry/b'] }), app('chemistry/b', { step: 3 })];
  assert.match(errorsOf(later)[0], /"chemistry\/b" is at step 3, after this experiment's step 2/);
  const same = [app('chemistry/a', { step: 3, prerequisites: ['chemistry/b'] }), app('chemistry/b', { step: 3 })];
  assert.deepEqual(errorsOf(same), []);
});

test('prerequisite cycles are rejected', () => {
  const apps = [
    app('chemistry/a', { prerequisites: ['chemistry/b'] }),
    app('chemistry/b', { prerequisites: ['chemistry/c'] }),
    app('chemistry/c', { prerequisites: ['chemistry/a'] }),
  ];
  const errors = errorsOf(apps);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^Prerequisite cycle: chemistry\/a → chemistry\/b → chemistry\/c → chemistry\/a$/);
  assert.deepEqual(findCycles([app('chemistry/a'), app('chemistry/b', { prerequisites: ['chemistry/a'] })]), []);
});

test('a missing source is a warning, not an error', () => {
  const result = validateApps([app('chemistry/a', { sources: undefined }), app('chemistry/b', { sources: [] })]);
  assert.deepEqual(result.errors, []);
  assert.equal(result.warnings.length, 2);
  assert.match(result.warnings[0], /apps\/chemistry\/a\/app.json: no "sources" yet/);
});

test('sources, when present, need a title and a url or isbn', () => {
  assert.match(errorsOf([app('chemistry/a', { sources: [{ title: 'No link' }] })])[0], /"sources" entry 1 needs a "title" and a "url" or "isbn"/);
  assert.match(errorsOf([app('chemistry/a', { sources: 'a book' })])[0], /"sources" must be a list/);
});
