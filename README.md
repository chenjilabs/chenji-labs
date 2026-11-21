# Chenji Labs

**The future of digital science labs.**

Free, open source simulations that let learners run science practicals in the browser: change a setting and see what happens. We start with chemistry, with a focus on physical chemistry, and will grow into the other physical sciences. Every experiment is a small, static web page that works on an entry-level phone with no account and no install. All experiments live in this one repository and are published together on GitHub Pages.

Live site: https://chenjilabs.github.io/

Where the project is going: [docs/PRD.md](docs/PRD.md) and [docs/roadmap.md](docs/roadmap.md).

## Run it locally

Requires Node 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm --filter ./apps/chemistry/gas-laws dev   # work on one experiment
pnpm test                                     # every package, experiment and build-script test
pnpm build                                    # builds everything into dist/ and runs the checks
```

`pnpm build` writes `dist/index.html` (the landing page) and `dist/<subject>/<name>/` for each experiment. Asset URLs are relative, so the same build works at any address. Set `BASE_PATH` (for example `BASE_PATH=/test/ pnpm build`) to make them absolute under that path instead.

## Add an experiment

```bash
pnpm new-app chemistry boiling-points
```

This copies `templates/experiment` to `apps/chemistry/boiling-points` as a **draft**: it builds, but stays off the landing page until you set `"status": "published"`. Fill in `app.json` and every TODO, then open a pull request. Read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## What the build checks

`pnpm build` stops with a clear message if any of these fail:

- **Metadata:** every `app.json` has valid fields, and prerequisites exist, are at the same step or earlier, and form no cycle.
- **Size:** each experiment's first load (HTML + JS + CSS) is at most 150 KB gzipped. The sizes are printed every build.
- **No remote requests:** nothing in the built HTML, JS or CSS loads from another site.
- **Required sections:** every page has the sections its kind needs (Aim, Conditions, What to try, Check your understanding, Science behind this, Next steps).
- **No-JS fallback:** every page has a `<noscript>` message.

An experiment with no sources builds with a warning, until Gate 2.

## Layout

```
apps/
  chemistry/
    gas-laws/       one folder per experiment: app.json, index.html, src/
    ph-simulator/
packages/
  units/            constants, unit conversion, significant figures
  ui/               design tokens, shared styles, page helpers
  particles/        2D canvas particle box for explorers
  chem-core/        science models and datasets (elements, formulas)
  reagents/         the chemical store: reagent data, indicators, hazards
templates/
  experiment/       copied by `pnpm new-app`
scripts/            build-all, metadata rules, landing page, build checks, new-app
.github/            CI, deploy, PR and issue templates, CODEOWNERS
```

Packages are named `@chenjilabs/<name>` and used straight from source (no build step); experiments depend on them with `"workspace:*"`. Code moves into a package only when a second experiment needs it.

## Licence

MIT. See [LICENSE](LICENSE).
