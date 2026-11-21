import test from 'node:test';
import assert from 'node:assert/strict';
import { GZIP_BUDGET, REQUIRED_SECTIONS, hasNoscript, measure, missingSections, remoteRequests } from './checks.mjs';

const urls = (type, text) => remoteRequests(type, text).map((r) => r.url);

// --- Sections ---------------------------------------------------------------

const allSections = REQUIRED_SECTIONS.explorer.map((s) => `<section data-section="${s}"></section>`).join('');

test('an explorer needs aim, conditions, what to try, check, science and next steps', () => {
  assert.deepEqual(REQUIRED_SECTIONS.explorer, ['aim', 'conditions', 'what-to-try', 'check-understanding', 'science', 'next-steps']);
  assert.deepEqual(missingSections(allSections, 'explorer'), []);
});

test('missing sections are named', () => {
  const html = allSections.replace('data-section="science"', '').replace("data-section=\"aim\"", '');
  assert.deepEqual(missingSections(html, 'explorer'), ['aim', 'science']);
});

// --- noscript ---------------------------------------------------------------

test('a page needs a non-empty <noscript> message', () => {
  assert.equal(hasNoscript('<noscript><p>The simulation needs JavaScript.</p></noscript>'), true);
  assert.equal(hasNoscript('<noscript>  </noscript>'), false);
  assert.equal(hasNoscript('<p>No fallback</p>'), false);
});

// --- Size -------------------------------------------------------------------

test('sizes are summed raw and gzipped, and the budget is 150 KB', () => {
  const text = Buffer.from('a'.repeat(10_000));
  const { raw, gzip } = measure([{ path: 'a.js', bytes: text }, { path: 'b.css', bytes: text }]);
  assert.equal(raw, 20_000);
  assert.ok(gzip > 0 && gzip < 1000, `repetitive text compresses well, got ${gzip}`);
  assert.equal(GZIP_BUDGET, 150_000);
});

// --- Remote requests: HTML --------------------------------------------------

test('HTML: scripts, styles, images and iframes from other sites are caught', () => {
  const html = `
    <script src="https://cdn.example.com/lib.js"></script>
    <link rel="stylesheet" href="https://fonts.example.com/css">
    <img src="//images.example.com/a.png" srcset="./a.png 1x, https://img.example.com/b.png 2x">
    <iframe src='http://example.com/embed'></iframe>
    <form action="https://example.com/post"></form>`;
  assert.deepEqual(urls('.html', html), [
    'https://cdn.example.com/lib.js',
    'https://fonts.example.com/css',
    '//images.example.com/a.png',
    'https://img.example.com/b.png',
    'http://example.com/embed',
    'https://example.com/post',
  ]);
});

test('HTML: links that are only displayed, local assets and SVG namespaces are allowed', () => {
  const html = `
    <p>Source: <a href="https://example.com/textbook">a textbook</a></p>
    <script type="module" src="./assets/index.js"></script>
    <link rel="stylesheet" href="/test/chemistry/x/assets/index.css">
    <svg xmlns="http://www.w3.org/2000/svg"><use xlink:href="#icon"/></svg>`;
  assert.deepEqual(urls('.html', html), []);
});

test('HTML: inline styles that load fonts or images are caught', () => {
  const html = `<style>@import url("https://fonts.example.com/f.css"); body { background: url(https://x.example.com/bg.png) }</style>
    <div style="background-image: url('https://y.example.com/a.png')"></div>`;
  assert.deepEqual(urls('.html', html).sort(), [
    'https://fonts.example.com/f.css', 'https://x.example.com/bg.png', 'https://y.example.com/a.png',
  ]);
});

// --- Remote requests: CSS and JS --------------------------------------------

test('CSS: remote url() and @import are caught, local ones are not', () => {
  const css = `@import "https://fonts.example.com/a.css"; .a { background: url(./img.png) } @font-face { src: url(https://x.example.com/f.woff2) }`;
  assert.deepEqual(urls('.css', css), ['https://x.example.com/f.woff2', 'https://fonts.example.com/a.css']);
});

test('JS: fetch, dynamic import, beacons, sockets and src assignments are caught', () => {
  const js = `fetch("https://api.example.com/data");import("https://cdn.example.com/m.js");
    navigator.sendBeacon('https://t.example.com/b');new WebSocket("wss://live.example.com");
    img.src="https://images.example.com/a.png";x.open("GET","https://api.example.com/x");
    el.innerHTML='<img src="https://a.example.com/i.png">'`;
  assert.deepEqual(urls('.js', js).sort(), [
    'https://a.example.com/i.png', 'https://api.example.com/data', 'https://api.example.com/x',
    'https://cdn.example.com/m.js', 'https://images.example.com/a.png', 'https://t.example.com/b', 'wss://live.example.com',
  ].sort());
});

test('JS: URLs that are only data or display text are allowed', () => {
  const js = `const sources={pubchem:{url:"https://pubchem.ncbi.nlm.nih.gov/compound/Water"}};
    a.textContent="See https://example.com";document.createElementNS("http://www.w3.org/2000/svg","svg");
    el.innerHTML='<a href="https://example.com/book">book</a>';fetch("./data.json")`;
  assert.deepEqual(urls('.js', js), []);
});
