#!/usr/bin/env node
// Reorders src/app/graphic-design/images.json so the grid alternates
// color chunks and black-and-white chunks as you scroll down the page,
// with a smooth color gradient preserved within the color chunks.
//
// - Each image is classified as color or b&w by mean Lab-chroma over a
//   16x16 downsample. Images below CHROMA_THRESHOLD are b&w.
// - Color pool: greedy nearest-neighbor TSP in Lab (every seed tried,
//   best path kept). Reversed so top of page is the "cool" end.
// - B&W pool: sorted by luminance (L*), dark -> light.
// - Interleaved in chunks of CHUNK_SIZE, starting with color.
// - Series stay grouped (classified and positioned by their cover image).

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(REPO_ROOT, "src/app/graphic-design/images.json");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");

const SAMPLE_EDGE = 16; // 16x16 = 256 pixel samples per image
const CHROMA_THRESHOLD = 8; // mean Lab chroma below this => "mostly b&w"
const CHUNK_SIZE = 4; // desktop column count; sets the alternation granularity

function srgbChannelToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function rgbToLab(r, g, b) {
  const rl = srgbChannelToLinear(r);
  const gl = srgbChannelToLinear(g);
  const bl = srgbChannelToLinear(b);
  const x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047;
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175;
  const z = (rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function toHex(r, g, b) {
  const h = (n) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function labDistance(a, b) {
  const dl = a[0] - b[0];
  const da = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dl * dl + da * da + db * db);
}

async function analyze(srcUrl) {
  const absPath = path.join(PUBLIC_DIR, srcUrl.replace(/^\//, ""));
  const { data } = await sharp(absPath)
    .resize(SAMPLE_EDGE, SAMPLE_EDGE, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let sumR = 0,
    sumG = 0,
    sumB = 0;
  let sumChroma = 0;
  const pixels = data.length / 3;
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    sumR += r;
    sumG += g;
    sumB += b;
    const [, la, lb] = rgbToLab(r, g, b);
    sumChroma += Math.sqrt(la * la + lb * lb);
  }
  const avgR = Math.round(sumR / pixels);
  const avgG = Math.round(sumG / pixels);
  const avgB = Math.round(sumB / pixels);
  const avgLab = rgbToLab(avgR, avgG, avgB);
  const meanChroma = sumChroma / pixels;

  return {
    avgColor: {
      hex: toHex(avgR, avgG, avgB),
      lab: [
        Number(avgLab[0].toFixed(2)),
        Number(avgLab[1].toFixed(2)),
        Number(avgLab[2].toFixed(2)),
      ],
    },
    meanChroma: Number(meanChroma.toFixed(2)),
    isBw: meanChroma < CHROMA_THRESHOLD,
  };
}

function buildNodes(images) {
  const seriesMembers = new Map();
  for (const img of images) {
    if (!img.seriesId) continue;
    const list = seriesMembers.get(img.seriesId);
    if (list) list.push(img);
    else seriesMembers.set(img.seriesId, [img]);
  }

  const placed = new Set();
  const nodes = [];
  for (const img of images) {
    if (placed.has(img.slug)) continue;
    if (img.seriesId) {
      const group = seriesMembers.get(img.seriesId);
      if (group && group.length >= 2) {
        const cover = group[0];
        nodes.push({
          kind: "series",
          key: img.seriesId,
          lab: cover.avgColor.lab,
          isBw: cover.isBw,
          images: group,
        });
        for (const m of group) placed.add(m.slug);
        continue;
      }
    }
    nodes.push({
      kind: "image",
      key: img.slug,
      lab: img.avgColor.lab,
      isBw: img.isBw,
      images: [img],
    });
    placed.add(img.slug);
  }
  return nodes;
}

function greedyPath(nodes, startIdx) {
  const n = nodes.length;
  const visited = new Array(n).fill(false);
  const order = new Array(n);
  order[0] = startIdx;
  visited[startIdx] = true;
  let cost = 0;
  let current = startIdx;
  for (let step = 1; step < n; step++) {
    let bestIdx = -1;
    let bestDist = Infinity;
    const curLab = nodes[current].lab;
    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      const d = labDistance(curLab, nodes[i].lab);
      if (d < bestDist || (d === bestDist && nodes[i].key < nodes[bestIdx].key)) {
        bestDist = d;
        bestIdx = i;
      }
    }
    order[step] = bestIdx;
    visited[bestIdx] = true;
    cost += bestDist;
    current = bestIdx;
  }
  return { order, cost };
}

function bestPath(nodes) {
  if (nodes.length === 0) return { order: [], cost: 0 };
  if (nodes.length === 1) return { order: [0], cost: 0 };
  let best = null;
  for (let seed = 0; seed < nodes.length; seed++) {
    const candidate = greedyPath(nodes, seed);
    if (!best || candidate.cost < best.cost) best = candidate;
  }
  return best;
}

function interleave(colorOrdered, bwOrdered) {
  const result = [];
  let ci = 0;
  let bi = 0;
  let turn = "color";
  while (ci < colorOrdered.length || bi < bwOrdered.length) {
    if (turn === "color" && ci < colorOrdered.length) {
      const take = Math.min(CHUNK_SIZE, colorOrdered.length - ci);
      for (let k = 0; k < take; k++) {
        for (const img of colorOrdered[ci + k].images) result.push(img);
      }
      ci += take;
    } else if (turn === "bw" && bi < bwOrdered.length) {
      const take = Math.min(CHUNK_SIZE, bwOrdered.length - bi);
      for (let k = 0; k < take; k++) {
        for (const img of bwOrdered[bi + k].images) result.push(img);
      }
      bi += take;
    }
    turn = turn === "color" ? "bw" : "color";
  }
  return result;
}

async function main() {
  const raw = await readFile(MANIFEST, "utf8");
  const images = JSON.parse(raw);
  console.log(`Loaded ${images.length} images. Analyzing colors...`);

  for (const img of images) {
    const a = await analyze(img.src);
    img.avgColor = a.avgColor;
    img.meanChroma = a.meanChroma;
    img.isBw = a.isBw;
  }

  const bwImages = images.filter((i) => i.isBw).length;
  console.log(
    `  ${images.length - bwImages} color images, ${bwImages} b&w images (chroma < ${CHROMA_THRESHOLD})`,
  );

  const nodes = buildNodes(images);
  const colorNodes = nodes.filter((n) => !n.isBw);
  const bwNodes = nodes.filter((n) => n.isBw);
  console.log(
    `Built ${nodes.length} nodes: ${colorNodes.length} color (${nodes.filter((n) => n.kind === "series" && !n.isBw).length} series), ${bwNodes.length} b&w (${nodes.filter((n) => n.kind === "series" && n.isBw).length} series).`,
  );

  const { order: colorOrder, cost: colorCost } = bestPath(colorNodes);
  const colorOrderedForward = colorOrder.map((i) => colorNodes[i]);
  // Reverse so the gradient at the top starts "cool" (matches prior taste).
  const colorOrdered = [...colorOrderedForward].reverse();

  // B&W: dark -> light by Lab L.
  const bwOrdered = [...bwNodes].sort((a, b) => a.lab[0] - b.lab[0]);
  const bwCost = bwOrdered
    .slice(1)
    .reduce((acc, node, i) => acc + labDistance(bwOrdered[i].lab, node.lab), 0);

  const sorted = interleave(colorOrdered, bwOrdered);

  if (sorted.length !== images.length) {
    throw new Error(
      `Count mismatch after sort: got ${sorted.length}, expected ${images.length}`,
    );
  }

  await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");

  console.log(
    `\nColor path cost: ${colorCost.toFixed(2)} (avg step ${(colorCost / Math.max(1, colorNodes.length - 1)).toFixed(2)})`,
  );
  console.log(
    `B&W luminance range: L ${bwOrdered[0]?.lab[0].toFixed(1) ?? "-"} -> ${bwOrdered.at(-1)?.lab[0].toFixed(1) ?? "-"} (total ${bwCost.toFixed(2)})`,
  );
  console.log(
    `\nFirst 8: ${sorted
      .slice(0, 8)
      .map((i) => `${i.slug}${i.isBw ? "·bw" : ""}(${i.avgColor.hex})`)
      .join(" -> ")}`,
  );
  console.log(
    `Next 8:  ${sorted
      .slice(8, 16)
      .map((i) => `${i.slug}${i.isBw ? "·bw" : ""}(${i.avgColor.hex})`)
      .join(" -> ")}`,
  );
  console.log(`\nManifest rewritten: ${path.relative(REPO_ROOT, MANIFEST)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
