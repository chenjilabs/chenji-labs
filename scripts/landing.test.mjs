import test from 'node:test';
import assert from 'node:assert/strict';
import { groupForLanding, landing } from './landing.mjs';

const app = (path, extra = {}) => {
  const [subject, name] = path.split('/');
  return { path, subject, name, title: name, summary: `About ${name}.`, level: 'senior-secondary', step: 1, prerequisites: [], status: 'published', ...extra };
};

const apps = [
  app('chemistry/ph-simulator', { title: 'pH simulator', step: 3, prerequisites: ['chemistry/gas-laws'] }),
  app('chemistry/gas-laws', { title: 'Gas laws', step: 2 }),
  app('chemistry/atoms', { title: 'Atomic structure', step: 2 }),
  app('physics/circuits', { title: 'Circuits', step: 1 }),
  app('chemistry/draft-one', { title: 'Unfinished', step: 1, status: 'draft' }),
];

test('groups by subject, then orders by step, then by title', () => {
  const groups = groupForLanding(apps);
  assert.deepEqual(groups.map((g) => g.subject), ['chemistry', 'physics']);
  assert.deepEqual(groups[0].apps.map((a) => a.path), ['chemistry/atoms', 'chemistry/gas-laws', 'chemistry/ph-simulator']);
});

test('drafts are left off the landing page', () => {
  const html = landing(apps);
  assert.ok(!html.includes('Unfinished'));
  assert.ok(!html.includes('draft-one'));
});

test('each experiment shows its step, title, summary and level, linked by path', () => {
  const html = landing(apps);
  assert.match(html, /<a class="card" href="\.\/chemistry\/gas-laws\/">\s*<span class="step">Step 2<\/span>\s*<span class="t">Gas laws<\/span>\s*<span class="s">About gas-laws\.<\/span>\s*<span class="m">Senior secondary<\/span>/);
  assert.match(html, /<h2>Chemistry<\/h2>/);
  assert.match(html, /<h2>Physics<\/h2>/);
});

test('prerequisites appear as "Do first" links, outside the card link', () => {
  const html = landing(apps);
  assert.match(html, /<\/a>\s*<p class="pre">Do first: <a href="\.\/chemistry\/gas-laws\/">Gas laws<\/a><\/p>/);
  assert.equal((html.match(/Do first/g) ?? []).length, 1);
});

test('text is escaped', () => {
  const html = landing([app('chemistry/x', { title: '<script>alert(1)</script>' })]);
  assert.ok(!html.includes('<script>alert'));
  assert.match(html, /&lt;script&gt;/);
});

test('keeps the page shell: title, tagline and colour bar', () => {
  const html = landing(apps);
  assert.match(html, /<title>Chenji Labs: Digital Science Labs<\/title>/);
  assert.match(html, /The future of digital science labs\./);
  assert.match(html, /body::before/);
});
