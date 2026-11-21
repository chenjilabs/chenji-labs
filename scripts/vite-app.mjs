// Shared Vite config for every experiment in apps/<subject>/<name>/.
//
// Asset URLs: by default they are relative ("./assets/..."), so one build works
// at the domain root, under /<repo>/, or in a local preview. If BASE_PATH is set
// (for example BASE_PATH=/test/), assets are absolute under it instead:
// /test/<subject>/<name>/assets/... The repo name is never hard-coded.
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The base URL for an app's built assets.
 * @param {string | undefined} basePath value of BASE_PATH, such as "/test/"
 * @param {string} subject e.g. "chemistry"
 * @param {string} name e.g. "gas-laws"
 */
export function appBase(basePath, subject, name) {
  if (!basePath) return './';
  if (!basePath.startsWith('/') || !basePath.endsWith('/')) {
    throw new Error(`BASE_PATH must start and end with "/", for example "/test/"; got "${basePath}"`);
  }
  return `${basePath}${subject}/${name}/`;
}

/**
 * Vite config for the app whose vite.config.js passes its import.meta.url.
 * @param {string} configUrl import.meta.url of apps/<subject>/<name>/vite.config.js
 */
export function appConfig(configUrl) {
  const dir = dirname(fileURLToPath(configUrl));
  const name = basename(dir);
  const subject = basename(dirname(dir));
  return ({ command }) => ({
    base: command === 'build' ? appBase(process.env.BASE_PATH, subject, name) : '/',
    build: { outDir: join(dir, '..', '..', '..', 'dist', subject, name), emptyOutDir: true },
  });
}
