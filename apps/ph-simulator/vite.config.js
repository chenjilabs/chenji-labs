import { defineConfig } from 'vite';

const name = 'ph-simulator';

// BASE_PATH is set by CI to "/<repo-name>/". Locally it falls back to the default.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? `${process.env.BASE_PATH ?? '/chem-lab/'}${name}/` : '/',
  build: { outDir: `../../dist/${name}`, emptyOutDir: true },
}));
