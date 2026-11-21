// Creates a new experiment from templates/experiment.
// Usage: pnpm new-app <subject> <name>    e.g. pnpm new-app chemistry gas-laws
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const [subject, name] = process.argv.slice(2);
if (!subject || !name || !KEBAB.test(subject) || !KEBAB.test(name)) {
  console.error('Usage: pnpm new-app <subject> <name>   e.g. pnpm new-app chemistry gas-laws (both kebab-case)');
  process.exit(1);
}
const dest = join('apps', subject, name);
if (existsSync(dest)) {
  console.error(`${dest} already exists.`);
  process.exit(1);
}

const title = name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
cpSync(join('templates', 'experiment'), dest, { recursive: true });

(function fill(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) fill(p);
    else writeFileSync(p, readFileSync(p, 'utf8').replaceAll('__APP_NAME__', name).replaceAll('__APP_TITLE__', title));
  }
})(dest);

console.log(`Created ${dest} as a draft (it builds, but stays off the landing page). Next:
  pnpm install
  pnpm --filter ./${dest.replaceAll('\\', '/')} dev
Fill in app.json and every TODO, write science.js tests first, then set "status": "published".`);
