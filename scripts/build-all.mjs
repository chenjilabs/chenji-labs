// Builds every app in apps/ (skipping folders that start with "_") into dist/<app>/
// and writes dist/index.html, the landing page that links to them.
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { landing } from './landing.mjs';

const names = readdirSync('apps', { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => d.name)
  .sort();

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');

const apps = [];
for (const name of names) {
  const metaPath = `apps/${name}/app.json`;
  if (!existsSync(metaPath)) throw new Error(`apps/${name}/app.json is missing`);
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  for (const key of ['title', 'summary', 'level']) {
    if (!meta[key]) throw new Error(`apps/${name}/app.json needs a "${key}"`);
  }
  execSync(`pnpm --filter ./apps/${name} build`, { stdio: 'inherit' });
  apps.push({ name, ...meta });
}

writeFileSync('dist/index.html', landing(apps));
writeFileSync('dist/.nojekyll', '');
console.log(`Built ${apps.length} app(s) into dist/`);
