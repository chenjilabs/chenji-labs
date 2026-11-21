# Contributing

Thanks for helping students learn science by doing. Every pull request is reviewed by a maintainer before it is merged.

## The short version

1. Fork the repo and create a branch.
2. For a new experiment run `pnpm new-app <subject> <name>`, for example `pnpm new-app chemistry boiling-points`. For a fix, edit the existing experiment.
3. Write the science and its tests first, then the page.
4. Run `pnpm test` and `pnpm build`. The build runs the same checks as CI.
5. Open a pull request and complete the template.
6. A maintainer reviews it. CI must pass and at least one maintainer must approve.

## What every experiment needs

- **One concept.** Keep it focused so it loads fast and can be linked from a lesson. Put a one-sentence aim at the top.
- **Correct science, in pure functions.** Put every formula, constant and unit in a plain JS module with no DOM code (see `apps/chemistry/gas-laws/src/gas-laws.js`). Test it against at least one textbook worked example and one limiting case. Never invent a citation, URL, ISBN or value: if you don't have a source yet, write "Source to be added by the project lead".
- **The required sections, as static HTML.** Each is marked with `data-section` so it reads without JavaScript and CI can check it:
  - `aim`;
  - `conditions` (every assumption, such as 25 °C or "ideal gas");
  - `what-to-try` (prompts with revealable answers);
  - `check-understanding` (a question whose feedback says why each option is right or wrong);
  - `science` (equation, assumptions, limits and sources);
  - `next-steps`.

  Add a `<noscript>` message too. The template has all of these stubbed.
- **`app.json`** with these fields:

  | Field | Required | Values |
  | --- | --- | --- |
  | `title`, `summary` | yes | Text |
  | `kind` | yes | `explorer` (change variables, watch a model) or `practical` (follow a method at the bench) |
  | `level` | yes | `junior-secondary`, `senior-secondary` or `first-year-university` |
  | `step` | yes | 1 to 6, the step on the learning path |
  | `prerequisites` | yes, may be empty | Experiments to do first, as `"subject/name"`; each must exist and be at the same step or earlier |
  | `status` | no | `draft` (builds, not listed) or `published` (the default) |
  | `sources` | not yet | `[{ "title": "…", "url": "…" }]` or with `"isbn"`; the build warns until there is one |
  | `tags` | no | Short topic names |
- **Works on a phone** (down to 360 px wide) and fully by keyboard. Label every control, meet WCAG 2.1 AA contrast, never carry information by colour alone, and respect `prefers-reduced-motion`.
- **Light and self-contained.** At most 150 KB gzipped on first load. No web fonts, remote images, analytics, cookies or requests to other sites. No new runtime dependencies without a written reason in the pull request.
- **Assets you may share.** Images, fonts and text must be your own or under a licence that allows reuse. Say which in the PR.

## Shared packages: extract on second use

Shared code lives in `packages/` (`units`, `ui`, `particles`, and so on). Use them instead of copying code between experiments. Write new code inside your experiment first. It moves into a package only when a second experiment needs it, so packages hold only code that's actually shared.

## Reviewing

Reviewers check the chemistry first, then the learner's experience, then the code. Reviews are about the work, never the person. Be specific, and suggest a fix when you can. See the [Code of Conduct](CODE_OF_CONDUCT.md).

## Reporting a problem

Use the issue templates: **Bug report** for something wrong or broken, **Experiment idea** for a concept you would like built.
