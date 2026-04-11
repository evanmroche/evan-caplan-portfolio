---
name: add-project-case-study
description: Use when the user asks to add a new portfolio entry — a video project, graphic design piece, or case study. Guides placement under src/app/video-projects or src/app/graphic-design, data shape, and section composition so new entries match existing ones.
---

# Add a Project Case Study

Portfolio entries live under two App Router segments:

- `src/app/video-projects/` — motion work
- `src/app/graphic-design/` — static / print / identity work

Each segment currently has a single `page.tsx` that renders a list of works. Before adding anything, **read both `page.tsx` files** to see whether the project stores entries inline, in a local data file, or via a dedicated per-project route. Match whichever pattern is already in place — don't invent a new one.

## Decision tree

1. **Is there already a data file** (e.g. `projects.ts`, `data.ts`) in the segment? → add the new entry to that file; don't touch the page.
2. **Are entries inline in `page.tsx`?** → add the new entry inline in the same shape as siblings. If this is the 4th+ entry, propose extracting to a `projects.ts` data file in the same directory, but ask first.
3. **Does each project have its own route** (e.g. `video-projects/[slug]/page.tsx`)? → create a new slug folder and mirror the existing per-project layout.

## Required fields for a new entry

Look at an existing entry first and mirror its exact shape. Typical fields:
- `title` (string, displayed in `font-display`)
- `slug` / `id`
- `year` (string, shown in mono)
- `role` / `credit` (string, mono uppercase)
- `summary` (1–2 sentences, muted-foreground)
- `cover` (image path under `/public`)
- `href` (external link if the piece lives elsewhere, e.g. Vimeo)

Never invent fields. If something is missing from the data the user provides, **ask** rather than hallucinate a year or role.

## Assets

- Place images/posters under `public/projects/{slug}/`.
- Use `next/image` — read the `nextjs16-preflight` skill first for current API.
- Provide real `width`/`height` or `fill` with a sized container. Never ship an Image with no dimensions.
- Alt text is required and should describe the piece, not just say "project image".

## Composition

Reuse `showcase-grid.tsx` or `split-section.tsx` from `src/components/sections/` instead of building a new layout. Follow `cinematic-design-tokens` for typography and color.

## Before finishing

- Run `pnpm dev` (or `npm run dev`) and visually confirm the new entry renders in its grid.
- Confirm the entry is reachable from the nav (`src/components/layout/nav-links.tsx`) if it's a new segment.
- Run `npm run lint`.
