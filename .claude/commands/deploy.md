---
description: Deploy the portfolio to Vercel (preview by default, prod with "prod" arg)
---

Deploy this Next.js portfolio to Vercel.

Arguments: $ARGUMENTS — pass `prod` or `production` for a production deploy. Default is a preview deploy.

Steps:

1. **Pre-flight**: confirm the working tree is clean (`git status`). If there are uncommitted changes, stop and ask the user whether to proceed — a dirty deploy should be intentional.
2. **Lint + build locally first** — run `pnpm lint` and `pnpm build`. Do not push a broken build to Vercel.
3. **Deploy**:
   - Preview: `vercel deploy`
   - Production: `vercel deploy --prod`
4. **Report**: print the deployment URL and inspect URL from the CLI output. For production, also remind the user to verify the root domain resolves.

Notes:
- This project is linked via `.vercel/project.json` if it exists; if not, run `vercel link` first and ask the user which project to link to — don't guess.
- If the Vercel CLI is outdated, mention it once but don't block the deploy.
- Do not create new Vercel projects, change environment variables, or modify `vercel.json` / `vercel.ts` as part of this command.
