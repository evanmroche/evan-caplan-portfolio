---
name: cinematic-design-tokens
description: Use when styling any UI in this portfolio — adding components, sections, pages, or adjusting visuals. Enforces the dark-cinematic design system (OKLCH palette, SMPTE color bars, Bebas Neue display, Outfit sans, Geist Mono) so new work stays visually consistent with existing sections.
---

# Cinematic Design Tokens

This portfolio has a deliberate dark-cinematic aesthetic. Before introducing new styles, **read `src/app/globals.css` end-to-end** — it is the single source of truth for tokens. Never hardcode colors, fonts, or radii that duplicate a token.

## Fonts (Tailwind v4 `@theme inline`)

- `font-sans` → **Outfit** — body copy, UI text, default everywhere.
- `font-display` → **Bebas Neue** — headlines, hero titles, section labels. Use `tracking-tight` or `tracking-wide` to match existing sections.
- `font-mono` → **Geist Mono** — metadata, timecodes, captions, credits, technical overlays. Use uppercase + letter-spacing for the "film slate" feel.

Font faces are registered in `src/app/fonts.ts`. Do not import new fonts ad-hoc; add them there.

## Color tokens

Semantic tokens (prefer these, always):
`bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `bg-popover`, `bg-primary`, `text-primary-foreground`, `bg-secondary`, `bg-muted`, `text-muted-foreground`, `bg-accent`, `border-border`, `ring-ring`, `bg-destructive`.

SMPTE color-bar palette (the signature motif — use sparingly, as accents, dividers, or in the `smpte-bars` component):
`smpte-white` `smpte-yellow` `smpte-cyan` `smpte-green` `smpte-magenta` `smpte-red` `smpte-blue` — all at `#c0_000` intensity. Use via `bg-smpte-*` / `text-smpte-*` / `border-smpte-*`.

Palette is dark-forced (OKLCH, low-chroma neutrals, warm primary). Do not introduce a light-mode variant unless explicitly asked — the site is forced dark.

## Radii

Use `rounded-{sm,md,lg,xl,2xl,3xl,4xl}` — they scale from `--radius`. Don't hardcode pixel radii.

## Motion & feel

- Prefer subtle, slow transitions (`duration-500`, `duration-700`) with `ease-out`.
- `tw-animate-css` is available for keyframe animations.
- Use `src/hooks/use-intersection.ts` for scroll-triggered reveals — it's already the pattern in the sections.

## Cinematic motifs that are already established

These exist and should be reused rather than reinvented:
- `components/layout/smpte-bars.tsx` — the color bar strip.
- `components/layout/film-static-header.tsx` — textured header treatment.
- `components/sections/hero.tsx`, `showcase-grid.tsx`, `split-section.tsx` — layout primitives for new pages.

## Before committing new visuals

Read at least one existing section file and mirror its rhythm (spacing scale, display font usage, muted-foreground for secondary text, SMPTE accents only when they earn their place). Generic Tailwind gray/slate utilities are a smell here — use the semantic tokens.
