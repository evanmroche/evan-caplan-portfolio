#!/usr/bin/env node
// One-time / idempotent optimizer for the graphic-design source folder.
// Reads ../../graphic-design/*.{jpg,pdf}, emits ~2000px WebP into
// public/graphic-design/, and writes src/app/graphic-design/images.json.

import { readdir, stat, mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { pdf } from "pdf-to-img";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.resolve(REPO_ROOT, "../../graphic-design");
const OUT_DIR = path.join(REPO_ROOT, "public/graphic-design");
const MANIFEST = path.join(REPO_ROOT, "src/app/graphic-design/images.json");

const MAX_EDGE = 2000;
const WEBP_QUALITY = 82;
const BLUR_EDGE = 12;
const BLUR_QUALITY = 40;

async function makeBlurDataUrl(input) {
  const buf = await sharp(input, { failOn: "none" })
    .rotate()
    .resize(BLUR_EDGE, BLUR_EDGE, { fit: "inside" })
    .webp({ quality: BLUR_QUALITY })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

function slugify(name) {
  return name
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function prettyAlt(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function resizeToWebp(inputBuffer, outPath) {
  const pipeline = sharp(inputBuffer, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
  const resizeOpts =
    longest > MAX_EDGE
      ? meta.width >= meta.height
        ? { width: MAX_EDGE }
        : { height: MAX_EDGE }
      : null;
  const out = resizeOpts
    ? pipeline.resize(resizeOpts).webp({ quality: WEBP_QUALITY })
    : pipeline.webp({ quality: WEBP_QUALITY });
  const { data, info } = await out.toBuffer({ resolveWithObject: true });
  await writeFile(outPath, data);
  return { width: info.width, height: info.height };
}

async function processJpg(file, srcPath, outPath) {
  const buf = await readFile(srcPath);
  return resizeToWebp(buf, outPath);
}

async function processPdf(file, srcPath, outPath) {
  const doc = await pdf(srcPath, { scale: 2 });
  // pdf-to-img yields Buffers page by page; we only want page 1.
  for await (const page of doc) {
    return resizeToWebp(page, outPath);
  }
  throw new Error(`No pages in ${file}`);
}

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(`Source folder missing: ${SOURCE_DIR}`);
    process.exit(1);
  }
  await mkdir(OUT_DIR, { recursive: true });

  const entries = await readdir(SOURCE_DIR);
  const sources = [];
  for (const name of entries) {
    const ext = path.extname(name).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".pdf"].includes(ext)) continue;
    const srcPath = path.join(SOURCE_DIR, name);
    const st = await stat(srcPath);
    if (!st.isFile()) continue;
    sources.push({ name, ext, srcPath, mtimeMs: st.mtimeMs });
  }
  sources.sort((a, b) => b.mtimeMs - a.mtimeMs);

  const manifest = [];
  const seenSlugs = new Set();
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const s of sources) {
    const slug = slugify(s.name.replace(/\.[^.]+$/, ""));
    if (seenSlugs.has(slug)) {
      console.log(`  · ${s.name}: skipping — slug collides with earlier entry`);
      continue;
    }
    seenSlugs.add(slug);
    const outName = `${slug}.webp`;
    const outPath = path.join(OUT_DIR, outName);

    try {
      let width;
      let height;
      if (existsSync(outPath)) {
        const outStat = await stat(outPath);
        if (outStat.mtimeMs >= s.mtimeMs) {
          const meta = await sharp(outPath).metadata();
          width = meta.width;
          height = meta.height;
          skipped += 1;
        }
      }
      if (width === undefined) {
        const dims =
          s.ext === ".pdf"
            ? await processPdf(s.name, s.srcPath, outPath)
            : await processJpg(s.name, s.srcPath, outPath);
        width = dims.width;
        height = dims.height;
        processed += 1;
        console.log(`  ✓ ${s.name} → ${outName} (${width}×${height})`);
      }
      const blurDataURL = await makeBlurDataUrl(outPath);
      manifest.push({
        slug,
        src: `/graphic-design/${outName}`,
        width,
        height,
        alt: prettyAlt(s.name),
        blurDataURL,
      });
    } catch (err) {
      failed += 1;
      console.warn(`  ✗ ${s.name}: ${err.message}`);
    }
  }

  await mkdir(path.dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    `\nDone. processed=${processed} skipped=${skipped} failed=${failed} total=${manifest.length}`,
  );
  console.log(`Manifest → ${path.relative(REPO_ROOT, MANIFEST)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
