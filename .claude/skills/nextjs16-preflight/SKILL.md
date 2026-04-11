---
name: nextjs16-preflight
description: Use BEFORE writing or editing any Next.js code in this repo (routing, layouts, server components, server actions, caching, metadata, fonts, middleware, config). This repo pins Next 16.2 + React 19.2, which has breaking changes vs. training data. AGENTS.md mandates reading local docs first.
---

# Next.js 16 Preflight

This repo uses **Next.js 16.2** and **React 19.2**. Do NOT rely on memorized Next.js APIs — conventions, cache semantics, async APIs, and config shapes have changed. AGENTS.md is explicit: *"This is NOT the Next.js you know."*

## Required steps before touching Next.js code

1. **Identify the topic** you're about to touch (e.g. `app-router`, `server-components`, `server-actions`, `caching`, `metadata`, `fonts`, `middleware`, `dynamic`, `revalidate`, `cookies`, `headers`, `params`, `searchParams`, `image`, `link`, `config`).
2. **Read the matching local docs** inside `node_modules/next/dist/docs/`. Use Glob to find the relevant file(s):
   ```
   Glob: node_modules/next/dist/docs/**/*{topic}*
   ```
   Read them with the Read tool. Prefer the local copy over any remembered API.
3. **Scan for deprecation notices** in the pages you read and respect them.
4. **Check `next.config.ts`** for any experimental flags that affect the area you're editing.

## High-risk areas (always re-read before editing)

- Route segment config (`dynamic`, `revalidate`, `fetchCache`, `runtime`) — semantics may differ.
- `cookies()`, `headers()`, `draftMode()`, `params`, `searchParams` — async in Next 15+; await them.
- Cache Components / `use cache` directive / `cacheLife` / `cacheTag` / `updateTag` — the new caching model replaces `unstable_cache` patterns you may remember. The `vercel-plugin:next-cache-components` skill has current guidance.
- `fetch()` caching defaults — default behavior changed; don't assume.
- Metadata API, `generateMetadata`, viewport export split.
- Middleware — full Node.js runtime is supported (not edge-only).
- `next/image`, `next/font` config.

## When the local docs don't answer it

Use the `vercel-plugin:nextjs` skill for current guidance, then verify against `node_modules/next/dist/docs/`. Do NOT fall back to pre-Next-15 memory.

## Output rule

State in one sentence which doc file(s) you read before making the edit, so the user can trust the change is grounded in current Next 16 behavior.
