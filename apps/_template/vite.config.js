import { defineConfig } from 'vite';

const name = '__APP_NAME__';

// Relative asset paths ("./assets/..."), so the built app works wherever the
// site is served: the domain root, a /<repo>/ subpath, or a local preview.
export default defineConfig({
  base: './',
  build: { outDir: `../../dist/${name}`, emptyOutDir: true },
});
