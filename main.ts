import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

const WIDTH = 1024;
const HEIGHT = 1024;
const PIXELS = Buffer.alloc(WIDTH * HEIGHT * 4);
const PAPER = [246, 241, 229, 255];
const INK = [22, 36, 49, 255];
const MUTED = [88, 99, 102, 255];
const RED = [189, 61, 45, 255];
const GOLD = [222, 174, 86, 255];
const BLUE = [42, 101, 130, 255];
const PALE = [226, 217, 196, 255];

// Compact hand-drawn 5x7 alphabet. Lowercase glyphs are drawn separately.
const FONT = {
  ' ': '00000/00000/00000/00000/00000/00000/00000',
  A: '01110/10001/10001/11111/10001/10001/10001', B: '11110/10001/10001/11110/10001/10001/11110',
  C: '01111/10000/10000/10000/10000/10000/01111', D: '11110/10001/10001/10001/10001/10001/11110',
  E: '11111/10000/10000/11110/10000/10000/11111', F: '11111/10000/10000/11110/10000/10000/10000',
  G: '01111/10000/10000/10111/10001/10001/01111', H: '10001/10001/10001/11111/10001/10001/10001',
  I: '11111/00100/00100/00100/00100/00100/11111', J: '00111/00010/00010/00010/10010/10010/01100',
  K: '10001/10010/10100/11000/10100/10010/10001', L: '10000/10000/10000/10000/10000/10000/11111',
  M: '10001/11011/10101/10101/10001/10001/10001', N: '10001/11001/10101/10011/10001/10001/10001',
  O: '01110/10001/10001/10001/10001/10001/01110', P: '11110/10001/10001/11110/10000/10000/10000',
  Q: '01110/10001/10001/10001/10101/10010/01101', R: '11110/10001/10001/11110/10100/10010/10001',
  S: '01111/10000/10000/01110/00001/00001/11110', T: '11111/00100/00100/00100/00100/00100/00100',
  U: '10001/10001/10001/10001/10001/10001/01110', V: '10001/10001/10001/10001/10001/01010/00100',
  W: '10001/10001/10001/10101/10101/10101/01010', X: '10001/10001/01010/00100/01010/10001/10001',
  Y: '10001/10001/01010/00100/00100/00100/00100', Z: '11111/00001/00010/00100/01000/10000/11111',
  a: '00000/01110/00001/01111/10001/10011/01101', b: '10000/10000/10110/11001/10001/10001/11110',
  c: '00000/01111/10000/10000/10000/10000/01111', d: '00001/00001/01101/10011/10001/10001/01111',
  e: '00000/01110/10001/11111/10000/10000/01111', f: '00110/01001/01000/11100/01000/01000/01000',
  g: '00000/01111/10001/10001/01111/00001/01110', h: '10000/10000/10110/11001/10001/10001/10001',
  i: '00100/00000/01100/00100/00100/00100/01110', j: '00010/00000/00110/00010/00010/10010/01100',
  k: '10000/10000/10010/10100/11000/10100/10010', l: '01100/00100/00100/00100/00100/00100/01110',
  m: '00000/11010/10101/10101/10101/10101/10101', n: '00000/10110/11001/10001/10001/10001/10001',
  o: '00000/01110/10001/10001/10001/10001/01110', p: '00000/11110/10001/10001/11110/10000/10000',
  q: '00000/01111/10001/10001/01111/00001/00001', r: '00000/10110/11001/10000/10000/10000/10000',
  s: '00000/01111/10000/01110/00001/00001/11110', t: '01000/01000/11100/01000/01000/01001/00110',
  u: '00000/10001/10001/10001/10001/10011/01101', v: '00000/10001/10001/10001/01010/01010/00100',
  w: '00000/10001/10001/10101/10101/10101/01010', x: '00000/10001/01010/00100/01010/10001/10001',
  y: '00000/10001/10001/01111/00001/10001/01110', z: '00000/11111/00010/00100/01000/10000/11111',
  '0': '01110/10001/10011/10101/11001/10001/01110', '1': '00100/01100/00100/00100/00100/00100/01110',
  '2': '01110/10001/00001/00010/00100/01000/11111', '3': '11110/00001/00001/01110/00001/00001/11110',
  '4': '00010/00110/01010/10010/11111/00010/00010', '5': '11111/10000/10000/11110/00001/00001/11110',
  '6': '01110/10000/10000/11110/10001/10001/01110', '7': '11111/00001/00010/00100/01000/01000/01000',
  '8': '01110/10001/10001/01110/10001/10001/01110', '9': '01110/10001/10001/01111/00001/00001/01110',
  '.': '00000/00000/00000/00000/00000/00110/00110', ',': '00000/00000/00000/00000/00110/00110/00100',
  ':': '00000/00110/00110/00000/00110/00110/00000', ';': '00000/00110/00110/00000/00110/00110/00100',
  '!': '00100/00100/00100/00100/00100/00000/00100', '?': '01110/10001/00001/00010/00100/00000/00100',
  "'": '00100/00100/00000/00000/00000/00000/00000', '"': '01010/01010/00000/00000/00000/00000/00000',
  '-': '00000/00000/00000/11111/00000/00000/00000', '_': '00000/00000/00000/00000/00000/00000/11111',
  '+': '00000/00100/00100/11111/00100/00100/00000', '=': '00000/11111/00000/11111/00000/00000/00000',
  '/': '00001/00010/00010/00100/01000/01000/10000', '\\': '10000/01000/01000/00100/00010/00010/00001',
  '(': '00010/00100/01000/01000/01000/00100/00010', ')': '01000/00100/00010/00010/00010/00100/01000',
  '[': '01110/01000/01000/01000/01000/01000/01110', ']': '01110/00010/00010/00010/00010/00010/01110',
  '{': '00011/00100/00100/11000/00100/00100/00011', '}': '11000/00100/00100/00011/00100/00100/11000',
  '<': '00010/00100/01000/10000/01000/00100/00010', '>': '01000/00100/00010/00001/00010/00100/01000',
  '*': '00000/10101/01110/11111/01110/10101/00000', '#': '01010/11111/01010/01010/11111/01010/00000',
  '&': '01100/10010/10100/01000/10101/10010/01101', '%': '11001/11010/00010/00100/01000/01011/10011',
  '$': '00100/01111/10100/01110/00101/11110/00100', '@': '01110/10001/10111/10101/10111/10000/01110',
  '|': '00100/00100/00100/00100/00100/00100/00100', '^': '00100/01010/10001/00000/00000/00000/00000',
  '~': '00000/00000/01001/10110/00000/00000/00000'
};

const stories = {
  lead: {
    continent: 'Asia',
    headline: 'Xi and Putin meet in Shenzhen ahead of the first-ever Trump-Xi-Putin trilateral',
    deck: 'Xi Jinping and Vladimir Putin held bilateral talks in Shenzhen on 18 Nov. The first-ever trilateral with US President Donald Trump is set for Thursday 19 Nov at the APEC summit.',
    source: 'AP via WKYU-FM'
  },
  regions: [
    {
      continent: 'Asia',
      headline: 'Iran drones target Kuwait, Bahrain',
      deck: 'Air defences intercepted attacks. No casualties or damage reported.',
      source: 'Reuters'
    },
    {
      continent: 'Europe',
      headline: 'EU agrees faster renewable permits',
      deck: 'EU deal aims to speed permits for renewables, grids and storage.',
      source: 'Reuters'
    },
    {
      continent: 'Africa',
      headline: 'DR Congo Ebola outbreak tops 11,000 cases',
      deck: '5,400 deaths; cases more than doubled in 3 months, the UN said.',
      source: 'UN via One Turn'
    },
    {
      continent: 'North America',
      headline: 'Peltola win gives Democrats Senate edge',
      deck: 'Mary Peltola beat Dan Sullivan; Democrats hold a 56-44 majority.',
      source: 'AP via NPR'
    },
    {
      continent: 'South America',
      headline: 'Hegseth due in Colombia with military equipment',
      deck: 'Due on 18 Nov to deliver a first Hercules C-130.',
      source: 'Reuters via 1049 The Wolf'
    },
    {
      continent: 'Oceania',
      headline: 'Category 5 Cyclone Xavier hits Cook Islands',
      deck: 'Winds neared 220 km/h; wharves damaged; no casualties reported.',
      source: 'RNZ Pacific / Fiji Met Service via Orbis Weather'
    }
  ]
};

// Additional headlines, authored from the supplied research file only.
const moreStories = [
  { continent: 'Europe', headline: 'Ukraine hits Kerch Bridge for second day; road span collapses', source: 'Horizon' },
  { continent: 'Asia', headline: 'COP31 in Antalya deadlocked over finance and fossil fuels', source: 'UN News' },
  { continent: 'Europe', headline: 'UK inflation highest in a year; sterling falls below $1.32', source: 'Seeking Alpha' },
  { continent: 'Europe', headline: 'Microsoft blames software bug for 20-hour global 365 outage', source: 'Valyrian News Network' }
];
const allStories = [stories.lead, ...stories.regions];
const expectedByContinent = { Asia: 2, Europe: 1, Africa: 1, 'North America': 1, 'South America': 1, Oceania: 1 };
const actualByContinent = Object.fromEntries(Object.keys(expectedByContinent).map((name) => [name, allStories.filter((story) => story.continent === name).length]));
for (const [name, count] of Object.entries(expectedByContinent)) {
  if (actualByContinent[name] !== count) throw new Error(`Unexpected ${name} story count`);
}

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const i = (y * WIDTH + x) * 4;
  PIXELS[i] = color[0]; PIXELS[i + 1] = color[1]; PIXELS[i + 2] = color[2]; PIXELS[i + 3] = color[3];
}
function fillRect(x, y, w, h, color) {
  const x0 = Math.max(0, Math.floor(x)), y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(WIDTH, Math.ceil(x + w)), y1 = Math.min(HEIGHT, Math.ceil(y + h));
  for (let py = y0; py < y1; py++) for (let px = x0; px < x1; px++) setPixel(px, py, color);
}
function line(x0, y0, x1, y1, color, thickness = 1) {
  let ax = Math.round(x0), ay = Math.round(y0), bx = Math.round(x1), by = Math.round(y1);
  const dx = Math.abs(bx - ax), sx = ax < bx ? 1 : -1;
  const dy = -Math.abs(by - ay), sy = ay < by ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    fillRect(ax - Math.floor(thickness / 2), ay - Math.floor(thickness / 2), thickness, thickness, color);
    if (ax === bx && ay === by) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; ax += sx; }
    if (e2 <= dx) { err += dx; ay += sy; }
  }
}
function fillCircle(cx, cy, radius, color) {
  for (let y = -radius; y <= radius; y++) for (let x = -radius; x <= radius; x++) if (x * x + y * y <= radius * radius) setPixel(cx + x, cy + y, color);
}
function strokeCircle(cx, cy, radius, color, thickness = 2) {
  const outer = radius * radius;
  const inner = (radius - thickness) * (radius - thickness);
  for (let y = -radius; y <= radius; y++) for (let x = -radius; x <= radius; x++) {
    const d = x * x + y * y;
    if (d <= outer && d >= inner) setPixel(cx + x, cy + y, color);
  }
}
function fillPolygon(points, color, clipCircle = null) {
  const minY = Math.max(0, Math.floor(Math.min(...points.map((p) => p[1]))));
  const maxY = Math.min(HEIGHT - 1, Math.ceil(Math.max(...points.map((p) => p[1]))));
  for (let y = minY; y <= maxY; y++) {
    const intersections = [];
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [xi, yi] = points[i], [xj, yj] = points[j];
      if ((yi > y) !== (yj > y)) intersections.push(xi + ((y - yi) * (xj - xi)) / (yj - yi));
    }
    intersections.sort((a, b) => a - b);
    for (let i = 0; i + 1 < intersections.length; i += 2) {
      const start = Math.max(0, Math.ceil(intersections[i]));
      const end = Math.min(WIDTH - 1, Math.floor(intersections[i + 1]));
      for (let x = start; x <= end; x++) {
        if (!clipCircle || ((x - clipCircle.cx) ** 2 + (y - clipCircle.cy) ** 2 <= clipCircle.r ** 2)) setPixel(x, y, color);
      }
    }
  }
}
function measureText(text, scale) { return text.length === 0 ? 0 : text.length * 6 * scale - scale; }
function normaliseText(text) {
  return text.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...').replace(/é/g, 'e').replace(/É/g, 'E').replace(/á/g, 'a').replace(/Á/g, 'A').replace(/ö/g, 'o').replace(/Ö/g, 'O').replace(/ü/g, 'u').replace(/Ü/g, 'U').replace(/€ /g, 'EUR ');
}
function drawText(text, x, y, scale, color, rightEdge = WIDTH) {
  const value = normaliseText(String(text));
  const width = measureText(value, scale);
  if (x < 0 || x + width > rightEdge || x + width > WIDTH || y < 0 || y + 7 * scale > HEIGHT) {
    throw new Error(`Text outside layout bounds: ${JSON.stringify(value)} at ${x},${y} width ${width}, edge ${rightEdge}`);
  }
  let cursor = x;
  for (const char of value) {
    const pattern = (FONT[char] || FONT['?']).split('/');
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) if (pattern[row][col] === '1') {
        for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) setPixel(cursor + col * scale + sx, y + row * scale + sy, color);
      }
    }
    cursor += 6 * scale;
  }
  return y + 7 * scale;
}
function wrapWords(text, maxWidth, scale, maxLines = Infinity) {
  const words = normaliseText(String(text)).trim().split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    if (measureText(word, scale) > maxWidth) throw new Error(`Word exceeds text column: ${word}`);
    const candidate = current ? `${current} ${word}` : word;
    if (measureText(candidate, scale) <= maxWidth) current = candidate;
    else { lines.push(current); current = word; }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) throw new Error(`Text needs ${lines.length} lines; maximum is ${maxLines}: ${text}`);
  for (const rendered of lines) if (measureText(rendered, scale) > maxWidth) throw new Error(`Wrapped line overflows: ${rendered}`);
  return lines;
}
function drawWrapped(text, x, y, maxWidth, scale, color, maxLines = Infinity, lineGap = 2 * scale) {
  const lines = wrapWords(text, maxWidth, scale, maxLines);
  const rightEdge = x + maxWidth;
  for (const rendered of lines) {
    drawText(rendered, x, y, scale, color, rightEdge);
    y += 7 * scale + lineGap;
  }
  return { y: lines.length ? y - lineGap : y, lines };
}
function drawGlobe() {
  const cx = 825, cy = 322, r = 111;
  fillCircle(cx, cy, r, [28, 72, 94, 255]);
  const clip = { cx, cy, r: r - 4 };
  fillPolygon([[775, 269], [794, 249], [821, 251], [835, 266], [824, 279], [829, 293], [814, 301], [800, 292], [787, 303], [775, 289]], [101, 148, 135, 255], clip);
  fillPolygon([[848, 271], [866, 257], [884, 264], [899, 282], [891, 300], [879, 305], [871, 325], [858, 319], [851, 302], [838, 294]], [101, 148, 135, 255], clip);
  fillPolygon([[806, 322], [821, 315], [832, 327], [828, 346], [818, 365], [806, 354], [801, 337]], [101, 148, 135, 255], clip);
  fillPolygon([[866, 340], [883, 333], [893, 344], [889, 358], [874, 365], [863, 356]], [101, 148, 135, 255], clip);
  // Longitude and latitude arcs sit inside the globe silhouette.
  for (let y = -r + 8; y <= r - 8; y++) {
    for (let x = -r + 8; x <= r - 8; x++) {
      const d = x * x + y * y;
      if (d > (r - 5) * (r - 5)) continue;
      const lat = Math.abs((y * y) / (56 * 56) + (x * x) / (107 * 107) - 1);
      const lon = Math.abs((x * x) / (45 * 45) + (y * y) / (107 * 107) - 1);
      if (lat < 0.018 || lon < 0.018) setPixel(cx + x, cy + y, [73, 125, 145, 255]);
    }
  }
  strokeCircle(cx, cy, r, GOLD, 3);
  line(780, 369, 817, 319, RED, 4);
  line(817, 319, 863, 285, GOLD, 4);
  fillCircle(780, 369, 8, RED);
  fillCircle(817, 319, 8, GOLD);
  fillCircle(863, 285, 8, [240, 232, 211, 255]);
  drawText('SHENZHEN / APEC', 724, 441, 2, [240, 232, 211, 255], 955);
  drawText('18 NOV', 792, 464, 1, GOLD, 955);
}
function drawStoryCard(story, x, y, w, h) {
  fillRect(x, y, w, h, [250, 247, 239, 255]);
  fillRect(x, y, 5, h, story.continent === 'Asia' ? RED : BLUE);
  fillRect(x + 5, y, w - 5, 1, PALE);
  const left = x + 16, right = x + w - 13, inner = right - left;
  drawText(story.continent.toUpperCase(), left, y + 8, 2, story.continent === 'Asia' ? RED : BLUE, right);
  const heading = drawWrapped(story.headline.toUpperCase(), left, y + 27, inner, 2, INK, 2, 2);
  const deckTop = heading.y + 1;
  const deck = drawWrapped(story.deck, left, deckTop, inner, 2, INK, 2, 2);
  const sourceY = deck.y + 1;
  drawText(story.source.toUpperCase(), left, sourceY, 1, MUTED, right);
  if (sourceY + 7 > y + h - 6) throw new Error(`Card content overflow in ${story.continent}`);
}

function render() {
  for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) setPixel(x, y, PAPER);

  // Masthead and dateline.
  fillRect(40, 31, 944, 2, INK);
  drawText('WORLD DISPATCH', 48, 51, 4, INK, 480);
  drawText('Wednesday, 18 November 2026', 609, 67, 2, INK, 980);
  drawText('A GLOBAL FRONT PAGE', 52, 102, 2, MUTED, 410);
  drawText('SIX CONTINENTS / ONE DAY', 706, 107, 1, MUTED, 980);
  fillRect(40, 137, 944, 2, INK);

  // Lead story: the Shenzhen meetings and the scheduled trilateral.
  fillRect(40, 160, 944, 333, INK);
  fillRect(40, 160, 9, 333, RED);
  drawText('WORLD LEAD / DIPLOMACY', 64, 181, 2, GOLD, 650);
  const leadHeadline = drawWrapped('Xi and Putin meet in Shenzhen ahead of first-ever Trump-Xi-Putin trilateral', 64, 215, 574, 3, [250, 247, 239, 255], 3, 4);
  const leadDeck = drawWrapped(stories.lead.deck, 64, leadHeadline.y + 2, 574, 2, [229, 226, 215, 255], 5, 3);
  drawText(stories.lead.source.toUpperCase(), 64, leadDeck.y + 3, 1, GOLD, 638);
  drawGlobe();

  // Six region cards form one balanced, continent-grouped grid.
  fillRect(40, 513, 944, 2, INK);
  drawText('CONTINENT FILES', 48, 524, 2, INK, 300);
  drawText('SELECTED STORIES FROM THE DAY', 692, 529, 1, MUTED, 980);
  const gridX = 40, gridY = 550, cardW = 464, cardH = 104, gapX = 16, gapY = 6;
  stories.regions.forEach((story, index) => {
    const col = index % 2, row = Math.floor(index / 2);
    drawStoryCard(story, gridX + col * (cardW + gapX), gridY + row * (cardH + gapY), cardW, cardH);
  });

  // Reserve explicit, disjoint bounds for the compact four-headline strip.
  const gridBottom = gridY + 3 * cardH + 2 * gapY;
  const stripTop = 880, stripBottom = 962;
  if (gridBottom > stripTop || stripBottom > 963) throw new Error('Strip overlaps grid or footer');
  fillRect(40, stripTop, 944, 1, INK);
  drawText('MORE FROM THE DAY', 48, stripTop + 4, 1, RED, 980);
  moreStories.forEach((story, index) => {
    const y = stripTop + 19 + index * 16;
    if (y + 14 > stripBottom) throw new Error('More headline exceeds strip');
    drawText(story.headline, 48, y, 2, INK, 980);
  });

  // A restrained footer closes the page without introducing extra claims.
  fillRect(40, 963, 944, 2, INK);
  drawText('WORLD DISPATCH  /  WEDNESDAY, 18 NOVEMBER 2026', 48, 976, 1, MUTED, 620);
  drawText('ASIA  EUROPE  AFRICA  AMERICAS  OCEANIA', 660, 976, 1, MUTED, 980);
}

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  CRC_TABLE[n] = c >>> 0;
}
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const name = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4); checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}
function encodePng() {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(WIDTH, 0); header.writeUInt32BE(HEIGHT, 4);
  header[8] = 8; header[9] = 6; header[10] = 0; header[11] = 0; header[12] = 0;
  const rows = Buffer.alloc(HEIGHT * (WIDTH * 4 + 1));
  const rowBytes = WIDTH * 4;
  for (let y = 0; y < HEIGHT; y++) {
    const target = y * (rowBytes + 1);
    rows[target] = 0;
    PIXELS.copy(rows, target + 1, y * rowBytes, (y + 1) * rowBytes);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(rows, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

render();
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, 'entry.png');
const png = encodePng();
if (WIDTH > 1024 || HEIGHT > 1024 || png.length > 1048576) throw new Error('PNG exceeds competition limits');
writeFileSync(outputPath, png);
if (statSync(outputPath).size !== png.length) throw new Error('Output write was incomplete');
