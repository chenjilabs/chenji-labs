# Maintaining

One-time setup on GitHub:

1. **Settings → Pages → Source: GitHub Actions.** The `Deploy` workflow publishes `main`.
2. **Settings → Branches → add a rule for `main`:**
   - Require a pull request before merging
   - Require 1 approval, and review from Code Owners
   - Dismiss stale approvals when new commits are pushed
   - Require status checks to pass: `build`
   - Block force pushes
3. **Edit `.github/CODEOWNERS`**: replace `@your-github-username` with your username or a team.
4. **Settings → Actions → General**: for pull requests from forks, require approval for first-time contributors.
5. After the first `pnpm install`, commit `pnpm-lock.yaml`, then change the CI install step to `pnpm install --frozen-lockfile`.

Review order: chemistry accuracy, then student usability, then code. Squash-merge so each experiment is one commit.
