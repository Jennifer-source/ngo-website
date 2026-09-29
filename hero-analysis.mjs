import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const buf = readFileSync("public/assets/Untitled_design.png");

/* --- minimal PNG decode (8-bit, RGB/RGBA/palette/gray) --- */
let off = 8;
let width = 0, height = 0, bitDepth = 0, colorType = 0;
let palette = null;
const idat = [];
while (off + 8 <= buf.length) {
  const len = buf.readUInt32BE(off);
  const type = buf.toString("ascii", off + 4, off + 8);
  const data = buf.subarray(off + 8, off + 8 + len);
  if (type === "IHDR") {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    bitDepth = data[8];
    colorType = data[9];
    console.log(`IHDR ${width}x${height} bitDepth=${bitDepth} colorType=${colorType}`);
  } else if (type === "PLTE") {
    palette = data;
  } else if (type === "IDAT") {
    idat.push(data);
  }
  off += 12 + len;
}
if (bitDepth !== 8) { console.log(`UNSUPPORTED bitDepth ${bitDepth} — aborting map`); process.exit(0); }

const raw = inflateSync(Buffer.concat(idat));
const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
if (!channels) { console.log(`UNSUPPORTED colorType ${colorType}`); process.exit(0); }
const bpp = channels;
const stride = width * bpp;

/* unfilter */
const out = Buffer.alloc(height * stride);
for (let y = 0; y < height; y++) {
  const f = raw[y * (stride + 1)];
  const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
  const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
  const cur = out.subarray(y * stride, (y + 1) * stride);
  for (let x = 0; x < stride; x++) {
    const a = x >= bpp ? cur[x - bpp] : 0;
    const b = prev ? prev[x] : 0;
    const c = x >= bpp && prev ? prev[x - bpp] : 0;
    let v = row[x];
    if (f === 1) v = (v + a) & 255;
    else if (f === 2) v = (v + b) & 255;
    else if (f === 3) v = (v + ((a + b) >> 1)) & 255;
    else if (f === 4) {
      const p = (a + b - c) | 0;
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
    }
    cur[x] = v;
  }
}

/* sample function → [r,g,b] */
function px(x, y) {
  const i = y * stride + x * bpp;
  if (colorType === 3) {
    const idx = out[i] * 3;
    return [palette[idx], palette[idx + 1], palette[idx + 2]];
  }
  if (colorType === 0) return [out[i], out[i], out[i]];
  if (colorType === 4) return [out[i], out[i], out[i]];
  return [out[i], out[i + 1], out[i + 2]];
}
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/* --- luminance + contrast maps, 64x36 --- */
const GW = 64, GH = 36;
const ramp = " .:-=+*#%@";
const cw = width / GW, ch = height / GH;
console.log("\nLUMINANCE MAP (dark→bright = ' '→'@')  x ticks: every 8 cells = 12.5%");
console.log("         " + "0       12      25      37      50      62      75      87     100");
const lumGrid = [], conGrid = [];
for (let gy = 0; gy < GH; gy++) {
  let lrow = "", crow = "";
  for (let gx = 0; gx < GW; gx++) {
    const lums = [];
    for (let sy = 0; sy < 5; sy++) for (let sx = 0; sx < 5; sx++) {
      const x = Math.min(width - 1, Math.floor((gx + (sx + 0.5) / 5) * cw));
      const y = Math.min(height - 1, Math.floor((gy + (sy + 0.5) / 5) * ch));
      const [r, g, b] = px(x, y);
      lums.push(lum(r, g, b));
    }
    const mean = lums.reduce((a, b) => a + b, 0) / lums.length;
    const sd = Math.sqrt(lums.reduce((a, b) => a + (b - mean) ** 2, 0) / lums.length);
    lumGrid.push(mean); conGrid.push(sd);
    lrow += ramp[Math.min(9, Math.floor(mean / 25.6))];
    crow += ramp[Math.min(9, Math.floor(sd / 12.8))];
  }
  console.log(`y${String(Math.round(((gy + 0.5) / GH) * 100)).padStart(3)}%   ${lrow}   |  ${crow}`);
}

/* --- report bright-text candidate bands: high mean + high sd clusters --- */
console.log("\nCELL STATS: brightest + highest-contrast cells (potential typography)");
const cells = [];
for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
  const i = gy * GW + gx;
  cells.push({ gx, gy, x0: (gx / GW) * 100, x1: ((gx + 1) / GW) * 100, y0: (gy / GH) * 100, y1: ((gy + 1) / GH) * 100, lum: lumGrid[i], sd: conGrid[i] });
}
const bright = cells.filter(c => c.lum > 170 && c.sd > 25);
const clusters = [];
for (const c of bright) {
  const hit = clusters.find(k => Math.abs(k.gy - c.gy) <= 2 && c.gx >= k.gx0 - 3 && c.gx <= k.gx1 + 3);
  if (hit) { hit.gx0 = Math.min(hit.gx0, c.gx); hit.gx1 = Math.max(hit.gx1, c.gx); hit.gy = (hit.gy + c.gy) / 2; hit.n++; }
  else clusters.push({ gx0: c.gx, gx1: c.gx, gy: c.gy, n: 1 });
}
clusters.sort((a, b) => b.n - a.n).slice(0, 10).forEach(k =>
  console.log(`  cluster: x ${(k.gx0 / GW * 100).toFixed(0)}%–${((k.gx1 + 1) / GW * 100).toFixed(0)}%, y-center ${(k.gy / GH * 100).toFixed(0)}%  (${k.n} cells)`));

/* --- bottom-left zone average luminance (where HTML text will sit) --- */
function zoneAvg(x0p, x1p, y0p, y1p) {
  let s = 0, n = 0;
  for (let y = Math.floor(y0p / 100 * height); y < Math.floor(y1p / 100 * height); y += 4)
    for (let x = Math.floor(x0p / 100 * width); x < Math.floor(x1p / 100 * width); x += 4) {
      const [r, g, b] = px(x, y); s += lum(r, g, b); n++;
    }
  return (s / n).toFixed(0);
}
console.log(`\nZone avgs — bottom band y70-100%: x0-33%: ${zoneAvg(0, 33, 70, 100)}, x33-66%: ${zoneAvg(33, 66, 70, 100)}, x66-100%: ${zoneAvg(66, 100, 70, 100)}`);
console.log(`Top band y0-30%: x0-33%: ${zoneAvg(0, 33, 0, 30)}, x33-66%: ${zoneAvg(33, 66, 0, 30)}, x66-100%: ${zoneAvg(66, 100, 0, 30)}`);

/* --- visible-window simulator: object-cover at phone sizes --- */
console.log("\nVISIBLE WINDOW (source-x % range) at object-position X%:");
const sizes = [[320, 480], [375, 667], [390, 844], [430, 932]];
for (const [vw, vh] of sizes) {
  const scale = Math.max(vw / width, vh / height);
  const visFrac = vw / (width * scale);
  const line = sizes === null ? "" : `  ${vw}×${vh}: width visible = ${(visFrac * 100).toFixed(1)}% of image`;
  process.stdout.write(line + "\n");
  for (const pos of [20, 32, 40, 50, 60, 70]) {
    const start = (pos / 100) * (1 - visFrac) * 100;
    process.stdout.write(`    X=${pos}% → source x ${start.toFixed(1)}%–${(start + visFrac * 100).toFixed(1)}%\n`);
  }
}
