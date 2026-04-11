---
description: Safely sync the current branch with the latest main
---

Bring the current branch up to date with `main` without destroying local work.

Steps:

1. `git status` — if the tree is dirty, stop and ask whether to stash or commit first. Do not auto-stash.
2. `git fetch origin` — get the latest refs.
3. Show `git log --oneline HEAD..origin/main` so the user sees what's incoming.
4. Ask the user: **rebase** or **merge**? Default recommendation is rebase for a feature branch, merge if the branch is shared with others. Wait for the answer — do not guess.
5. Run the chosen command. If conflicts occur, stop immediately, list the conflicting files, and hand control back to the user. Do **not** attempt to resolve conflicts automatically.
6. After success, run `pnpm install` only if `pnpm-lock.yaml` / `package.json` changed, and `pnpm build` if the user asks.

Never run `git reset --hard`, `git push --force`, or drop stashes as part of this command.
