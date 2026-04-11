---
name: add-ui-primitive
description: Use when adding a new reusable UI primitive under src/components/ui (button, card, dialog, tabs, etc.) or wiring a shadcn/Base UI component into this project. Enforces the Base UI + shadcn hybrid conventions and the project's cva variant style.
---

# Add a UI Primitive

This project uses an unusual stack: **shadcn/ui CLI + `@base-ui/react` primitives + Tailwind v4 + `cva`**. It is NOT the standard shadcn+Radix combination. Do not blindly run `shadcn add <component>` — Base UI is not Radix and the generated output will need adaptation.

## Prerequisites

1. Read both existing primitives first:
   - `src/components/ui/button.tsx`
   - `src/components/ui/card.tsx`

   Match their structure exactly: `cva` for variants, `cn` from `src/lib/utils.ts` for merging, `React.forwardRef` where appropriate, typed `Props` extending the underlying element / Base UI component.

2. Read `components.json` to see how shadcn is configured (aliases, base color, Tailwind version).

3. For interactive primitives (dialog, popover, menu, tabs, tooltip, select, switch, slider, checkbox, radio, accordion) — **use `@base-ui/react`**, not Radix. Import shape:
   ```ts
   import { Dialog } from '@base-ui/react/dialog';
   ```
   Base UI exposes `Root`, `Trigger`, `Portal`, `Backdrop`, `Popup`, etc. Field names differ from Radix — check the installed package types before writing.

## Steps

1. **Confirm Base UI exposes the primitive** you need. If it doesn't, stop and ask the user — do not silently fall back to Radix or `@radix-ui/*`, which isn't installed.
2. **Scaffold the file** at `src/components/ui/<name>.tsx`. Mirror the export shape of `button.tsx` / `card.tsx`.
3. **Variants** go through `cva` with semantic color tokens (`bg-primary`, `text-primary-foreground`, etc.) — see the `cinematic-design-tokens` skill. No hardcoded colors.
4. **`cn` helper** — always use `cn(...)` from `@/lib/utils` when composing class names.
5. **Accessibility** — Base UI is accessible by default; don't override ARIA attributes it sets. Add `aria-label` only where the component actually lacks a label.
6. **Client boundary** — if the primitive uses hooks/state/refs, mark `"use client"` at the top. Card/Button currently don't need it; Dialog/Popover/Menu do.

## What NOT to do

- Don't install `@radix-ui/*` packages — use Base UI.
- Don't introduce a new styling lib (emotion, styled-components, stitches). Tailwind v4 + cva is the system.
- Don't duplicate a token inline; extend `globals.css` if you genuinely need a new design token.
- Don't add light-mode variants — the site is forced dark.

## Verification

- `npm run lint` must pass.
- Import and render the new primitive in at least one real place (a section, page, or the existing `button`/`card` consumer) to prove it composes cleanly.
- Tab through it in the browser to confirm focus-visible rings use `ring-ring`.
