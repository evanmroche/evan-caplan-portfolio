#!/usr/bin/env node
// Idempotent optimizer for the slide decks on the Graphic Design page.
// Reads decks-source/<folder>/*.pdf (the Google Drive export), renders every
// page to ~2000px WebP in public/decks/<slug>/, and writes
// src/app/graphic-design/decks.json. Section order, deck order, titles, and
// video slide swaps live in SECTIONS below.

import { readdir, stat, mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { pdf } from "pdf-to-img";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.resolve(process.argv[2] ?? path.join(REPO_ROOT, "decks-source"));
const OUT_DIR = path.join(REPO_ROOT, "public/decks");
const MANIFEST = path.join(REPO_ROOT, "src/app/graphic-design/decks.json");

const MAX_EDGE = 2000;
const WEBP_QUALITY = 82;
const BLUR_EDGE = 12;
const BLUR_QUALITY = 40;
const VIDEO_MAX_EDGE = 1440;

const SECTIONS = [
  {
    id: "campaigns",
    title: "Campaigns",
    folder: "Campaign Slideshows",
    decks: [
      { file: "SAPPORO_GOD_BLESS_JAPAN.pdf", title: "Sapporo — God Bless Japan" },
      { file: "REWIND.pdf", title: "Rewind" },
      { file: "Converse_ No Label Needed.pdf", title: "Converse — No Label Needed" },
      { file: "GOLFLEFLEUR_FRENCHWALTZ.pdf", title: "Golf le Fleur — French Waltz" },
      { file: "THE_NAKED_BRONCO.pdf", title: "The Naked Bronco" },
      { file: "NSAC_PREZ_FINAL.pdf", title: "NSAC × NFL — Team 519" },
    ],
  },
  {
    id: "illustration",
    title: "Illustration",
    folder: "Design Art",
    decks: [
      {
        file: "F_ck Fast Fashion Typography Poster.pdf",
        title: "Bethany Williams — Typography Poster",
        // The PDF's last page embeds this animation, which a PDF render can't play.
        replaceLastWith: "Evan Caplan Final BW Poster Animation.mp4",
      },
      { file: "Stamp Design Series.pdf", title: "Hand Drawn Stamp Design Series" },
      { file: "THE VINEYARD_BOOKCOVER_FINAL.pdf", title: "The Vineyard — Book Cover" },
    ],
  },
  {
    id: "label-design",
    title: "Label Design",
    folder: "Label Design",
    decks: [{ file: "PeakPeps_LABEL DESIGN.pdf", title: "PeakPeps" }],
  },
];

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

async function makeBlurDataUrl(input) {
  const buf = await sharp(input, { failOn: "none" })
    .resize(BLUR_EDGE, BLUR_EDGE, { fit: "inside" })
    .webp({ quality: BLUR_QUALITY })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

async function toWebp(input, outPath) {
  const pipeline = sharp(input, { failOn: "none" });
  const meta = await pipeline.metadata();
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
  const resized =
    longest > MAX_EDGE
      ? pipeline.resize(
          meta.width >= meta.height ? { width: MAX_EDGE } : { height: MAX_EDGE },
        )
      : pipeline;
  const { data, info } = await resized
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });
  await writeFile(outPath, data);
  return { width: info.width, height: info.height };
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}: ${stderr.slice(-400)}`)),
    );
  });
}

async function isFresh(outPath, srcMtimeMs) {
  if (!existsSync(outPath)) return false;
  return (await stat(outPath)).mtimeMs >= srcMtimeMs;
}

async function renderPdf(srcPath, deckDir, srcMtimeMs, skipLast) {
  // A scale-1 render is the page size in points; use it to pick a scale that
  // lands the long edge near MAX_EDGE regardless of the PDF's page size.
  const probe = await pdf(srcPath, { scale: 1 });
  const firstMeta = await sharp(await probe.getPage(1)).metadata();
  const scale = MAX_EDGE / Math.max(firstMeta.width, firstMeta.height);
  const pageCount = skipLast ? probe.length - 1 : probe.length;

  const outPaths = Array.from({ length: pageCount }, (_, i) =>
    path.join(deckDir, `${String(i + 1).padStart(2, "0")}.webp`),
  );
  const fresh = await Promise.all(outPaths.map((p) => isFresh(p, srcMtimeMs)));

  const doc = fresh.every(Boolean) ? null : await pdf(srcPath, { scale });
  const pages = [];
  for (let i = 0; i < pageCount; i++) {
    if (fresh[i]) {
      const meta = await sharp(outPaths[i]).metadata();
      pages.push({ path: outPaths[i], width: meta.width, height: meta.height });
    } else {
      const dims = await toWebp(await doc.getPage(i + 1), outPaths[i]);
      pages.push({ path: outPaths[i], ...dims });
    }
  }
  return { pages, total: probe.length, rendered: fresh.filter((f) => !f).length };
}

async function encodeVideo(srcPath, outPath, posterPath) {
  const srcMtimeMs = (await stat(srcPath)).mtimeMs;
  if (!(await isFresh(outPath, srcMtimeMs)) || !(await isFresh(posterPath, srcMtimeMs))) {
    const scale = `scale='if(gt(iw,ih),min(${VIDEO_MAX_EDGE},iw),-2)':'if(gt(iw,ih),-2,min(${VIDEO_MAX_EDGE},ih))'`;
    await run("ffmpeg", [
      "-y", "-i", srcPath,
      "-vf", scale,
      "-c:v", "libx264", "-preset", "slow", "-crf", "23",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
      outPath,
    ]);
    const posterPng = `${posterPath}.png`;
    await run("ffmpeg", ["-y", "-i", outPath, "-frames:v", "1", posterPng]);
    await toWebp(posterPng, posterPath);
    await rm(posterPng);
  }
  const meta = await sharp(posterPath).metadata();
  return { width: meta.width, height: meta.height };
}

function publicUrl(absPath) {
  return "/" + path.relative(path.join(REPO_ROOT, "public"), absPath).split(path.sep).join("/");
}

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(`Source folder missing: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const manifest = [];
  for (const section of SECTIONS) {
    const folder = path.join(SOURCE_DIR, section.folder);
    const listed = new Set(section.decks.flatMap((d) => [d.file, d.replaceLastWith]));
    for (const name of existsSync(folder) ? await readdir(folder) : []) {
      if (!listed.has(name) && !name.startsWith(".")) {
        console.warn(`  ! ${section.folder}/${name} is not in SECTIONS, so it is skipped`);
      }
    }

    const decks = [];
    for (const deck of section.decks) {
      const srcPath = path.join(folder, deck.file);
      const slug = slugify(deck.file.replace(/\.pdf$/i, ""));
      const deckDir = path.join(OUT_DIR, slug);
      await mkdir(deckDir, { recursive: true });

      const { mtimeMs } = await stat(srcPath);
      const { pages, total, rendered } = await renderPdf(
        srcPath,
        deckDir,
        mtimeMs,
        Boolean(deck.replaceLastWith),
      );
      const slides = pages.map((p) => ({
        type: "image",
        src: publicUrl(p.path),
        width: p.width,
        height: p.height,
      }));

      if (deck.replaceLastWith) {
        const n = String(total).padStart(2, "0");
        const videoPath = path.join(deckDir, `${n}.mp4`);
        const posterPath = path.join(deckDir, `${n}-poster.webp`);
        const dims = await encodeVideo(path.join(folder, deck.replaceLastWith), videoPath, posterPath);
        slides.push({
          type: "video",
          src: publicUrl(videoPath),
          poster: publicUrl(posterPath),
          ...dims,
        });
      }

      const cover = pages[0];
      decks.push({
        slug,
        title: deck.title,
        cover: {
          src: publicUrl(cover.path),
          width: cover.width,
          height: cover.height,
          blurDataURL: await makeBlurDataUrl(cover.path),
        },
        slides,
      });
      console.log(`  ✓ ${deck.file} → ${slides.length} slides (${rendered} rendered)`);
    }
    manifest.push({ id: section.id, title: section.title, decks });
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nManifest → ${path.relative(REPO_ROOT, MANIFEST)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
