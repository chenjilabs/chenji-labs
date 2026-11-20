// Usage: pnpm new-app gas-laws
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const name = process.argv[2];
if (!name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
  console.error('Usage: pnpm new-app <kebab-case-name>   e.g. pnpm new-app gas-laws');
  process.exit(1);
}
const dest = join('apps', name);
if (existsSync(dest)) {
  console.error(`${dest} already exists.`);
  process.exit(1);
}

const title = name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
cpSync('apps/_template', dest, { recursive: true });

(function fill(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) fill(p);
    else writeFileSync(p, readFileSync(p, 'utf8').replaceAll('__APP_NAME__', name).replaceAll('__APP_TITLE__', title));
  }
})(dest);

console.log(`Created ${dest}. Next:\n  pnpm install\n  pnpm --filter ${name} dev`);
