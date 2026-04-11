---
description: Run lint and build to verify the project compiles cleanly
---

Verify the project is in a healthy state before committing or deploying.

Run these in order, stopping at the first failure:

1. `pnpm lint` (or `npm run lint` if no pnpm lockfile) — ESLint with `eslint-config-next`.
2. `pnpm build` (or `npm run build`) — full Next.js 16 production build. Surfaces type errors and RSC/SSR issues that lint misses.

For each step: show the command, whether it passed, and if it failed, the relevant error lines only (not the full log).

If everything passes, end with a one-line summary: `✓ lint + build clean`.

Do **not** attempt to auto-fix issues — just report. If the user wants fixes, they'll ask.
