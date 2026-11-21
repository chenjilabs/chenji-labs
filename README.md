# Chenji Labs

**The future of digital science labs.**

Free, open source simulations that let learners run science practicals in the browser: change a setting and see what happens. We start with chemistry, with a focus on physical chemistry, and will grow into the other physical sciences. Every experiment is a small, static web page. All experiments live in this one repository and are published together on GitHub Pages.

Live site: https://chenjilabs.github.io/chenji-labs/

Where the project is going: [docs/PRD.md](docs/PRD.md).

## Run it locally

Requires Node 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm --filter ph-simulator dev     # work on one app
pnpm test                          # chemistry tests
pnpm build                         # builds every app and the landing page into dist/
```

## Add an experiment

```bash
pnpm new-app gas-laws
```

This copies `apps/_template` to `apps/gas-laws`. Fill in `app.json` (it feeds the landing page), build the app, then open a pull request. Read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## Layout

```
apps/
  _template/      copied by `pnpm new-app` (never built)
  ph-simulator/   one folder per experiment
packages/
  chem-core/      science models and datasets (elements, formulas); no page code
  reagents/       the chemical store: reagent data, indicators, hazards
scripts/          build-all and new-app helpers
.github/          CI, deploy, PR and issue templates, CODEOWNERS
```

## Licence

MIT. See [LICENSE](LICENSE).
