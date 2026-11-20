# Chem Lab

Interactive chemistry experiments that run in the browser, so students can change a setting and see what happens. Every app is a small, static web page. All apps live in this one repository and are published together on GitHub Pages.

Live site: `https://<username>.github.io/<repo-name>/`

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
scripts/          build-all and new-app helpers
.github/          CI, deploy, PR and issue templates, CODEOWNERS
```

## Licence

MIT. See [LICENSE](LICENSE).
