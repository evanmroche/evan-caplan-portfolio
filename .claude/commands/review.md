---
description: Review recent changes for quality, a11y, and Next.js 16 compliance
---

Review the uncommitted changes (or the most recent commit if the tree is clean) against this project's standards.

Focus on:
1. **Next.js 16 correctness** — This project uses Next.js 16.2.0 with React 19. APIs may have changed from your training data. If anything looks uncertain (route handlers, `params`/`searchParams`, caching, metadata, Server vs Client components), read `node_modules/next/dist/docs/` before making claims.
2. **React 19 patterns** — verify hooks usage, Server Component boundaries (`"use client"` only when needed), and that async Server Components are used where appropriate.
3. **Accessibility** — semantic HTML, keyboard navigation, ARIA only when needed, color contrast for the dark cinematic theme, prefers-reduced-motion respected for any animation.
4. **Styling** — Tailwind v4 conventions, `cn()` usage from `lib/utils`, no unused classes, design tokens consistent with the existing theme.
5. **Type safety** — no `any`, no unchecked assertions, props typed explicitly.
6. **Component structure** — reuse Base UI / shadcn primitives already in the repo before inventing new ones.

Arguments: $ARGUMENTS (optional path or scope to narrow the review)

Produce a punch list grouped by severity: **Blocker / Should-fix / Nit**. Cite file:line for each finding. Do not make changes — just report.
