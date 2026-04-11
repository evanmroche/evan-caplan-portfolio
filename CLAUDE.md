@AGENTS.md

# Evan Caplan Portfolio

A dark, cinematic single-page portfolio for Evan Caplan (video editor + graphic designer), built with Next.js 16 App Router, React 19, Tailwind CSS v4, and shadcn/ui (base-nova style) on top of Base UI primitives.

## Commands

| Command         | What it does                                           |
| --------------- | ------------------------------------------------------ |
| `npm run dev`   | Start the Next.js dev server (default port 3000)      |
| `npm run build` | Production build                                       |
| `npm run start` | Serve the production build                             |
| `npm run lint`  | Run ESLint (`eslint-config-next`)                     |

There is no test runner configured in this repo. Do not invent a `test` script or assume Jest/Vitest — if you need to verify a change, run `build` and `lint`, and for UI work start `dev` and exercise the feature in a browser.

## Runtime & tooling versions

- **Next.js 16.2** — App Router only, no Pages Router. See `AGENTS.md`: APIs and conventions have breaking changes from earlier majors, so prefer reading `node_modules/next/dist/docs/` over guessing from training data.
- **React 19.2** with Server Components by default.
- **TypeScript 5**, strict mode, `@/*` path alias → `src/*`.
- **Tailwind CSS v4** via `@tailwindcss/postcss`. Config lives inside `src/app/globals.css` using `@theme inline`, not a `tailwind.config.*` file.
- **shadcn/ui** configured with style `base-nova`, RSC enabled, Base UI primitives (`@base-ui/react`), Lucide icons. Aliases in `components.json`.
- **next-themes** wraps the app, but the root `<html>` has a hard `dark` class — the site is effectively dark-mode only.

## Directory layout

```
src/
├── app/
│   ├── layout.tsx            # Root layout: fonts, ThemeProvider, FilmStaticHeader, SmpteBars
│   ├── page.tsx              # Home: Hero + ShowcaseGrid + SplitSection
│   ├── fonts.ts              # next/font/google: Bebas Neue (display) + Outfit (sans)
│   ├── globals.css           # Tailwind v4 @theme, cinematic palette, SMPTE colors
│   ├── about/page.tsx
│   ├── graphic-design/page.tsx
│   └── video-projects/page.tsx
├── components/
│   ├── layout/               # Chrome: film-static-header, nav-links, smpte-bars
│   ├── sections/             # Page sections: hero, showcase-grid, split-section
│   ├── ui/                   # shadcn primitives (button, card)
│   └── theme-provider.tsx    # next-themes wrapper
├── hooks/
│   └── use-intersection.ts
└── lib/
    └── utils.ts              # `cn()` via clsx + tailwind-merge
```

Routes are file-based under `src/app/`. To add a page, create `src/app/<route>/page.tsx` as a Server Component and add `'use client'` only where interactivity (state, effects, browser APIs) is actually needed.

## Design system notes

- **Fonts**: `Bebas Neue` (display, CSS var `--font-bebas-neue`, Tailwind `font-display`) and `Outfit` (sans, `--font-outfit`, `font-sans`). Both are loaded via `next/font/google` in `src/app/fonts.ts` and attached as className variables on `<html>` in `layout.tsx`.
- **Palette**: dark cinematic, defined in `globals.css` as OKLCH CSS variables (`--background`, `--foreground`, `--primary`, …). Also exposes the SMPTE color-bar palette (`--color-smpte-white/yellow/cyan/green/magenta/red/blue`) used by `SmpteBars` and the cinematic chrome.
- **Theming**: consume colors via Tailwind tokens (`bg-background`, `text-foreground`, `border-border`, etc.) or CSS vars — don't hard-code hex values.
- **Utilities**: compose class strings with `cn(...)` from `@/lib/utils`, not raw template literals. Import UI primitives from `@/components/ui` and icons from `lucide-react`.

## Conventions

- **Server Components by default.** Only add `'use client'` when a component uses state, effects, event handlers, or browser-only APIs. `use-intersection.ts` and anything interactive in `components/sections` or `components/layout` will be client components.
- **Imports** use the `@/*` alias — prefer `@/components/sections/hero` over deep relative paths.
- **File names** are kebab-case (`film-static-header.tsx`, `showcase-grid.tsx`); component exports are PascalCase.
- **No barrel files.** Import directly from the file that defines the component.
- **Comments**: keep them sparse and only where intent isn't obvious from the code. Follow the existing style in `globals.css` (short section headers with `── ──`).
- **Metadata**: page-level SEO goes in the route's `page.tsx` via `export const metadata`. The root title/description lives in `src/app/layout.tsx`.

## Adding shadcn components

This project uses shadcn with `style: base-nova` and `rsc: true` (see `components.json`). To add a new primitive:

```
npx shadcn@latest add <component>
```

New components land in `src/components/ui/`. Reference them via `@/components/ui/<name>`. The base color is `neutral` and CSS variables are enabled — do not switch it to class-based theming.

## Things that will trip you up

- **Next.js 16 breaking changes.** Do not assume `middleware.ts`, route handler signatures, caching defaults, or params shape match older versions. When in doubt, check `node_modules/next/dist/docs/`.
- **Tailwind v4, not v3.** There is no `tailwind.config.js`. Theme tokens live in `globals.css` under `@theme inline`. Custom variants use `@custom-variant`.
- **Forced dark mode.** `<html>` always has `dark` applied, so `next-themes` is mostly structural — don't spend time building a light palette unless the requirement changes.
- **No test infrastructure.** Don't add test files without confirming the user wants a test setup; there's nothing to run them.
- **shadcn style is `base-nova`**, not the default `new-york`. Components added with the wrong style will look off — always use the configured style.

## When making UI changes

Start `npm run dev` and verify the change in a browser against both the golden path and nearby sections — the cinematic chrome (`FilmStaticHeader`, `SmpteBars`) and the three home sections (`Hero`, `ShowcaseGrid`, `SplitSection`) all share the same layout and typography tokens, so regressions propagate easily. Type checking and linting will not catch visual regressions; if you can't open a browser, say so rather than claiming the change works.
