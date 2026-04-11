---
description: Scaffold a new React component following this project's conventions
---

Create a new component for this portfolio.

Arguments: $ARGUMENTS — the component name (PascalCase) and optionally a short description. Example: `/component ProjectCard card for featured work`.

Before writing anything:

1. **Read the existing components** in `components/` (and `components/ui/` if present) to match the prevailing style: naming, prop types, `cn()` usage, file layout, how `"use client"` is applied.
2. **Prefer composition** over creating new primitives. If Base UI (`@base-ui/react`) or an existing shadcn primitive covers the need, use it.
3. **Default to a Server Component.** Only add `"use client"` if the component needs state, effects, event handlers, or browser APIs.

Then:

- Create the file at `components/<kebab-name>.tsx` (match the existing convention — verify before writing).
- Export a typed component with an explicit `Props` interface.
- Use Tailwind v4 classes and `cn()` from `lib/utils` for class merging.
- Respect the dark cinematic theme already established.
- No comments unless something is genuinely non-obvious.

After creating it, show the user where the file is and a one-line import example. Do **not** wire it into a page unless asked.
