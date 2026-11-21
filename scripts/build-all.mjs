// Builds every app in apps/<subject>/<name>/ (skipping folders that start with
// "_") into dist/<subject>/<name>/ and writes dist/index.html, the landing page.
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { landing } from './landing.mjs';

const dirs = (path) =>
  readdirSync(path, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => d.name)
    .sort();

const paths = dirs('apps').flatMap((subject) => dirs(`apps/${subject}`).map((name) => `${subject}/${name}`));

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');

const apps = [];
for (const path of paths) {
  const metaPath = `apps/${path}/app.json`;
  if (!existsSync(metaPath)) throw new Error(`${metaPath} is missing`);
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  for (const key of ['title', 'summary', 'level']) {
    if (!meta[key]) throw new Error(`${metaPath} needs a "${key}"`);
  }
  execSync(`pnpm --filter ./apps/${path} build`, { stdio: 'inherit' });
  apps.push({ name: path, ...meta });
}

writeFileSync('dist/index.html', landing(apps));
writeFileSync('dist/.nojekyll', '');
console.log(`Built ${apps.length} app(s) into dist/`);
