# Contributing

Thanks for helping students learn chemistry by doing. Every pull request is reviewed by a maintainer before it is merged.

## The short version

1. Fork the repo and create a branch.
2. For a new experiment run `pnpm new-app <kebab-case-name>`. For a fix, edit the existing app.
3. Run `pnpm test` and `pnpm build`.
4. Open a pull request and complete the template.
5. A maintainer reviews it. CI must pass and at least one maintainer must approve.

## What every experiment needs

- **One concept per app.** Keep it focused so it loads fast and can be linked from a lesson.
- **Correct chemistry.** Put formulas, constants and units in a plain JS file with tests (see `apps/ph-simulator/src/chem.js`). State assumptions in the app, for example "25 °C" or "ideal gas". Link your sources in the PR.
- **A "What to try" section** with prompts students can act on, and a short answer they can reveal afterwards.
- **`app.json`** with `title`, `summary`, `level` and optional `tags`.
- **Works on a phone** (down to about 360 px wide) and with a keyboard. Label controls, keep text readable, and respect `prefers-reduced-motion`.
- **Self-contained.** No analytics, trackers or runtime calls to other sites. Add a dependency only when it is worth the weight.
- **Assets you may share.** Images, fonts and text must be your own or under a licence that allows reuse. Say which in the PR.

## Reviewing

Reviewers check the chemistry first, then usability, then code. Reviews are about the work, never the person. Be specific, and suggest a fix when you can. See the [Code of Conduct](CODE_OF_CONDUCT.md).

## Reporting a problem

Use the issue templates: **Bug report** for something wrong or broken, **Experiment idea** for a concept you would like built.
