# Maintaining

## One-time setup on GitHub

1. **Settings → Pages → Source: GitHub Actions.** The `Deploy` workflow publishes `main`.
2. **Settings → Branches → add a rule for `main`:**
   - Require a pull request before merging
   - Require 1 approval, and review from Code Owners
   - Dismiss stale approvals when new commits are pushed
   - Require status checks to pass: `build`
   - Block force pushes
3. **`.github/CODEOWNERS`** names who must review. Keep it current as reviewers join.
4. **Settings → Actions → General**: for pull requests from forks, require approval for first-time contributors.
5. Commit `pnpm-lock.yaml` with every dependency change. CI installs with `pnpm install --frozen-lockfile`, so a stale lockfile fails the build.

## What CI checks

`pnpm test` runs every package, experiment and build-script test. `pnpm build` then validates every `app.json`, builds each experiment and runs the build checks in `scripts/checks.mjs`:

- **Size:** each experiment's first load must be at most 150 KB gzipped.
- **No remote requests:** nothing may be loaded from another site.
- **Required sections:** every section required for the experiment's kind must be present.
- **No-JS fallback:** every page needs a `<noscript>` message.

The rules live in one place each:

| Rule | Where |
| --- | --- |
| Metadata fields and allowed values | `scripts/meta.mjs` |
| Required sections per kind | `REQUIRED_SECTIONS` in `scripts/checks.mjs` |
| URLs allowed by the remote-request check | `ALLOWED_URLS` in `scripts/checks.mjs`. These are XML namespaces only, and each new entry needs a reason. Links in `<a href>` and URLs kept only as data (such as a dataset's sources) are already allowed, because nothing loads them. |
| Size budget | `GZIP_BUDGET` in `scripts/checks.mjs` |

Experiments without `sources` build with a warning. Those warnings must be gone before Gate 2.

## Reviewing and merging

Review order: chemistry accuracy, then the learner's experience, then code. A pull request that fails the chemistry review gets no code review. Squash-merge, so each change is one commit.

When the base of a stacked pull request merges, its branch is deleted automatically, and GitHub then closes the pull request stacked on it. To avoid that, retarget the stacked pull request to `main` before merging its base.
