import { defineConfig } from 'vite';
import { appConfig } from '../../../scripts/vite-app.mjs';

// Builds into dist/<subject>/<name>/. See scripts/vite-app.mjs for BASE_PATH.
export default defineConfig(appConfig(import.meta.url));
