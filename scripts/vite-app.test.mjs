import test from 'node:test';
import assert from 'node:assert/strict';
import { appBase } from './vite-app.mjs';

test('without BASE_PATH, assets use relative URLs', () => {
  assert.equal(appBase(undefined, 'chemistry', 'gas-laws'), './');
  assert.equal(appBase('', 'chemistry', 'gas-laws'), './');
});

test('with BASE_PATH, assets live under /<base>/<subject>/<name>/', () => {
  assert.equal(appBase('/test/', 'chemistry', 'gas-laws'), '/test/chemistry/gas-laws/');
  assert.equal(appBase('/', 'chemistry', 'ph-simulator'), '/chemistry/ph-simulator/');
});

test('BASE_PATH must start and end with a slash', () => {
  assert.throws(() => appBase('test/', 'chemistry', 'x'), /must start and end with "\/"/);
  assert.throws(() => appBase('/test', 'chemistry', 'x'), /must start and end with "\/"/);
});
