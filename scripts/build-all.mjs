// Builds the whole site:
//   1. reads every apps/<subject>/<name>/app.json (folders starting with "_" are skipped)
//   2. validates the metadata (scripts/meta.mjs) and stops on any error
//   3. builds each experiment, drafts included, into dist/<subject>/<name>/
//   4. writes dist/index.html, the landing page, from the published experiments
//   5. runs the build checks in scripts/checks.mjs and stops if any fails
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { checkSite, formatSizes } from './checks.mjs';
import { landing } from './landing.mjs';
import { validateApps } from './meta.mjs';

const dirs = (path) =>
  readdirSync(path, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => d.name)
    .sort();

const fail = (lines) => {
  for (const line of lines) console.error(`✖ ${line}`);
  process.exit(1);
};

// 1. Read metadata
const found = [];
const readErrors = [];
for (const subject of dirs('apps')) {
  for (const name of dirs(`apps/${subject}`)) {
    const path = `${subject}/${name}`;
    const file = `apps/${path}/app.json`;
    if (!existsSync(file)) { readErrors.push(`${file} is missing`); continue; }
    try {
      found.push({ path, file, meta: JSON.parse(readFileSync(file, 'utf8')) });
    } catch (e) {
      readErrors.push(`${file} is not valid JSON: ${e.message}`);
    }
  }
}
if (readErrors.length) fail(readErrors);

// 2. Validate
const { errors, warnings, apps } = validateApps(found);
for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) fail([`${errors.length} metadata error(s):`, ...errors]);

// 3. Build
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
for (const app of apps) execSync(`pnpm --filter ./apps/${app.path} build`, { stdio: 'inherit' });

// 4. Landing page
writeFileSync('dist/index.html', landing(apps));
writeFileSync('dist/.nojekyll', '');
const drafts = apps.filter((a) => a.status === 'draft').length;
console.log(`Built ${apps.length} experiment(s) into dist/${drafts ? ` (${drafts} draft, not listed)` : ''}.`);

// 5. Checks: size budget, no remote requests, required sections, noscript
const { rows, failures } = checkSite('dist', apps);
console.log(`First-load size (HTML + JS + CSS):\n${formatSizes(rows)}`);
if (failures.length) fail([`${failures.length} check(s) failed:`, ...failures]);
console.log('Checks passed: size budget, no remote requests, required sections, noscript.');
