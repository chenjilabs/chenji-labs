// Build checks, run by build-all.mjs on the built site. Plain Node, no
// dependencies. The rules are pure functions, tested in checks.test.mjs.
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { gzipSync } from 'node:zlib';

// --- Required sections -------------------------------------------------------

/**
 * The data-section names each kind of experiment must have, in page order.
 * This is the one place to change them. Phase 2 adds the practical-only
 * sections ("apparatus", "safety", "notebook") to `practical`.
 */
export const REQUIRED_SECTIONS = {
  explorer: ['aim', 'conditions', 'what-to-try', 'check-understanding', 'science', 'next-steps'],
  practical: ['aim', 'conditions', 'what-to-try', 'check-understanding', 'science', 'next-steps'],
};

/** Required sections missing from a page's HTML. */
export function missingSections(html, kind) {
  const present = new Set([...html.matchAll(/data-section\s*=\s*["']([a-z-]+)["']/g)].map((m) => m[1]));
  return (REQUIRED_SECTIONS[kind] ?? REQUIRED_SECTIONS.explorer).filter((s) => !present.has(s));
}

// --- No-JS fallback ----------------------------------------------------------

/** True when the page has a non-empty <noscript> message. */
export const hasNoscript = (html) => /<noscript\b[^>]*>\s*\S[\s\S]*?<\/noscript>/i.test(html);

// --- Size budget -------------------------------------------------------------

/** Gzipped first-load budget per experiment, in bytes (150 KB, 1 KB = 1000 bytes). */
export const GZIP_BUDGET = 150_000;

/** Raw and gzipped sizes of a set of files, given as { path, bytes } with Buffer bytes. */
export function measure(files) {
  return files.reduce(
    (sum, f) => ({ raw: sum.raw + f.bytes.length, gzip: sum.gzip + gzipSync(f.bytes, { level: 9 }).length }),
    { raw: 0, gzip: 0 }
  );
}

// --- No remote requests ------------------------------------------------------

/**
 * Absolute URLs that are allowed because nothing is ever fetched from them:
 * XML namespace identifiers, which browsers treat as names, not addresses.
 */
export const ALLOWED_URLS = [
  'http://www.w3.org/2000/svg',
  'http://www.w3.org/1999/xlink',
  'http://www.w3.org/1999/xhtml',
  'http://www.w3.org/XML/1998/namespace',
  'http://www.w3.org/1998/Math/MathML',
];

// Absolute: http(s)://, ws(s):// or protocol-relative //host.
const ABSOLUTE = /^\s*((https?|wss?):)?\/\/[^\s/]/i;
const isRemote = (url) => ABSOLUTE.test(url) && !ALLOWED_URLS.includes(url.trim());

/**
 * Attributes that make the browser load something. <a href> is deliberately
 * not here: a link is only followed if the learner clicks it, so source links
 * in "Science behind this" are allowed.
 */
const LOADING_ATTRIBUTES = /\s(src|srcset|href|action|formaction|poster|data|background|manifest|ping|xlink:href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

function remoteInHtml(html) {
  const found = [];
  for (const [, tag, attrs] of html.matchAll(/<([a-zA-Z][\w:-]*)\b([^>]*)>/g)) {
    if (tag.toLowerCase() === 'a') continue;
    for (const m of attrs.matchAll(LOADING_ATTRIBUTES)) {
      const value = m[2] ?? m[3] ?? m[4] ?? '';
      const urls = m[1].toLowerCase() === 'srcset' ? value.split(',').map((s) => s.trim().split(/\s+/)[0]) : [value];
      for (const url of urls) if (isRemote(url)) found.push({ url, where: `<${tag} ${m[1]}>` });
    }
  }
  // Inline <style> blocks and style="" attributes can load fonts and images too.
  for (const [, css] of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) found.push(...remoteInCss(css));
  for (const [, css] of html.matchAll(/\sstyle\s*=\s*"([^"]*)"/gi)) found.push(...remoteInCss(css));
  return found;
}

function remoteInCss(css) {
  const found = [];
  for (const m of css.matchAll(/url\(\s*['"]?([^'")\s]+)/gi)) if (isRemote(m[1])) found.push({ url: m[1], where: 'CSS url()' });
  for (const m of css.matchAll(/@import\s+(?:url\(\s*)?['"]?([^'")\s;]+)/gi)) if (isRemote(m[1])) found.push({ url: m[1], where: 'CSS @import' });
  return found;
}

/**
 * Code patterns in JavaScript that would fetch an absolute URL. Plain strings
 * that are only displayed or stored (for example a dataset's source links) are
 * not requests, so they are allowed.
 */
const JS_LOADERS = [
  [/\b(fetch|import|importScripts|sendBeacon|EventSource|WebSocket|Worker|SharedWorker)\s*\(\s*[`'"]([^`'"]+)/g, (m) => `${m[1]}()`],
  [/\.open\(\s*[`'"][A-Za-z]+[`'"]\s*,\s*[`'"]([^`'"]+)/g, () => 'XMLHttpRequest.open()'],
  [/\.(src|srcset|href|action|data|poster)\s*=\s*[`'"]([^`'"]+)/g, (m) => `.${m[1]} =`],
  [/\b(src|srcset)\s*=\s*\\?["']([^"'\\]+)/g, (m) => `${m[1]}= in HTML string`],
  [/url\(\s*\\?['"]?([^'")\s\\]+)/g, () => 'url() in a string'],
];

function remoteInJs(js) {
  const found = [];
  for (const [pattern, where] of JS_LOADERS) {
    for (const m of js.matchAll(pattern)) {
      const url = m[m.length - 1];
      if (isRemote(url)) found.push({ url, where: where(m) });
    }
  }
  return found;
}

/** Absolute URLs that a built file would load, as { url, where }, each URL once. */
export function remoteRequests(type, text) {
  const scan = { '.html': remoteInHtml, '.css': remoteInCss, '.js': remoteInJs, '.mjs': remoteInJs }[type];
  if (!scan) return [];
  const seen = new Set();
  return scan(text).filter(({ url }) => !seen.has(url) && seen.add(url));
}

// --- Running every check on dist/ --------------------------------------------

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]));

const kb = (bytes) => `${(bytes / 1000).toFixed(1)} KB`;

/**
 * Runs every check on each built experiment and on the landing page.
 * First-load size counts all HTML, JS and CSS in the experiment's folder.
 * @param {string} dist
 * @param {{ path: string, kind: string }[]} apps
 * @returns {{ rows: object[], failures: string[] }}
 */
export function checkSite(dist, apps) {
  const failures = [];
  const rows = [];
  const scan = (file) => {
    for (const { url, where } of remoteRequests(extname(file), readFileSync(file, 'utf8'))) {
      failures.push(`${file}: loads ${url} (${where}). Bundle it instead, or add it to ALLOWED_URLS in scripts/checks.mjs if nothing is fetched from it.`);
    }
  };

  for (const app of apps) {
    const dir = join(dist, app.path);
    const files = walk(dir).filter((f) => ['.html', '.js', '.css'].includes(extname(f)));
    const size = measure(files.map((f) => ({ path: f, bytes: readFileSync(f) })));
    rows.push({ path: app.path, ...size });
    if (size.gzip > GZIP_BUDGET) failures.push(`${app.path}: first load is ${kb(size.gzip)} gzipped, over the ${kb(GZIP_BUDGET)} budget.`);

    const html = readFileSync(join(dir, 'index.html'), 'utf8');
    const missing = missingSections(html, app.kind);
    if (missing.length) failures.push(`${app.path}: missing required section(s) for ${/^[aeiou]/.test(app.kind) ? 'an' : 'a'} ${app.kind}: ${missing.map((s) => `data-section="${s}"`).join(', ')}.`);
    if (!hasNoscript(html)) failures.push(`${app.path}: needs a <noscript> message saying the simulation needs JavaScript.`);
    files.forEach(scan);
  }
  scan(join(dist, 'index.html'));
  return { rows, failures };
}

/** The size table printed by the build. */
export const formatSizes = (rows) =>
  [`  ${'Experiment'.padEnd(28)} ${'Raw'.padStart(10)} ${'Gzipped'.padStart(10)}`,
    ...rows.map((r) => `  ${r.path.padEnd(28)} ${kb(r.raw).padStart(10)} ${kb(r.gzip).padStart(10)}`),
    `  Budget: ${kb(GZIP_BUDGET)} gzipped per experiment.`].join('\n');
