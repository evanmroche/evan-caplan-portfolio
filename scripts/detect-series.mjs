#!/usr/bin/env node
// Read-only helper: groups images.json entries by filename patterns and
// prints likely series (2+ members). Does not mutate the manifest — review
// the output, then hand-edit `seriesId` into src/app/graphic-design/images.json.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.resolve(
  __dirname,
  "../src/app/graphic-design/images.json",
);

const SUFFIX = /-(?:v\d+|\d+|final|new|alt|a|b|c)$/i;

function baseOf(slug) {
  let s = slug;
  while (SUFFIX.test(s)) s = s.replace(SUFFIX, "");
  return s;
}

const raw = await readFile(MANIFEST, "utf8");
const images = JSON.parse(raw);

const groups = new Map();
for (const img of images) {
  const base = baseOf(img.slug);
  if (base === img.slug) continue;
  if (!groups.has(base)) groups.set(base, []);
  groups.get(base).push(img.slug);
}

const series = [...groups.entries()]
  .filter(([, slugs]) => slugs.length >= 2)
  .sort((a, b) => b[1].length - a[1].length);

if (series.length === 0) {
  console.log("No series candidates found.");
  process.exit(0);
}

console.log(`Found ${series.length} series candidate(s):\n`);
for (const [base, slugs] of series) {
  console.log(`  ${base}  (${slugs.length})`);
  for (const s of slugs) console.log(`    - ${s}`);
  console.log("");
}

console.log(
  "Review the list above, then add `\"seriesId\": \"<base>\"` to the relevant\n" +
    "entries in src/app/graphic-design/images.json. Entries without seriesId\n" +
    "render as individual tiles.",
);
