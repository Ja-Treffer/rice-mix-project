/* 在 27-end 之后、manifest 之前，插入 appendix 九页（28–36） */
const fs = require('fs');
const F = 'E:/hardness/ricemix/present/build_deck_en.js';
let s = fs.readFileSync(F, 'utf8');

const ANCHOR = "const ordered = PAGE.slice().sort();";
if (!s.includes(ANCHOR)) { console.error('anchor missing'); process.exit(1); }
if (s.includes('28-apxA.page')) { console.error('already patched'); process.exit(1); }

const block = String.raw`
/* ============ APPENDIX 28–36 ============ */

/* 28 分隔 */
newPage('28-apxA.page', WHITE);
T('tag', 56, 40, 848, 'APPENDIX', { size: 11, color: GRAY, gap: 0 });
T('hrule', 56, 150, 500, RULE, { size: 9, color: ORANGE, bold: true, gap: 0 });
T('title', 56, 178, 520, 'Supporting\nmaterial', { size: 52, bold: true, gap: 0 });
T('sub', 56, 392, 500, 'Everything the guideline asks for, in the order it asks for it.', { size: 18, color: GRAY, gap: 4 });
T('kick', 56, 480, 560, 'A · circuits   B · code   C · video   D · 3D + STL   E · drawings   F · documents', { size: 12, color: ORANGE, gap: 0 });
T('big', 640, 300, 300, 'A–F', { size: 96, bold: true, color: ORANGE, align: 'right', gap: 0 });
pageNo(28); save();

/* 29 电路图 */
newPage('29-apxCircuit.page', WHITE);
head('A  ·  CIRCUIT DIAGRAMS', 'How it is wired');
IMG('im1', 56, 138, 404, 421, 'assets/sch_wiring.png');
IMG('im2', 484, 138, 404, 421, 'assets/sch_real.png');
T('c1', 56, 470, 404, 'Schematic — every pin, every junction', { size: 11, color: GRAY, gap: 0 });
T('c2', 484, 470, 404, 'Physical layout — S1–S16, protection parts', { size: 11, color: GRAY, gap: 0 });
pageNo(29); save();

/* 30 源码 */
newPage('30-apxCode.page', WHITE);
head('B  ·  SOURCE CODE', 'Three things the firmware does');
let y = 138;
y = RH('h1', 56, y, 400, 'Read the scale');
y = BL('b1', 56, y, 400, 'HX711 at 10 Hz, software tare, 0.1 g display.', { size: 15 });
y = RH('h2', 56, y + 12, 400, 'Decide');
y = BL('b2', 56, y, 400, 'Four guards: timeout, overload, dry-run, on-target.', { size: 15 });
y = RH('h3', 56, y + 12, 400, 'Drive');
y = BL('b3', 56, y, 400, 'One relay, plus a 74HC595 for the four-digit display.', { size: 15 });
T('note', 56, y + 26, 400, 'demo.ino — 279 lines. A 716-line product build exists with presets and EEPROM.', { size: 12, color: GRAY, gap: 0 });
T('code', 500, 138, 404, 'if (now - t0 > TIMEOUT_MS)          stop("timeout");\nif (w > MAX_TOTAL)                  stop("overload");\nif (now - t0 > 3000 && added < 0.5) stop("dry run");\nif (added >= target - LEAD_G)       stop("target");\n\nshowMilligrams(scale.read());\nscanDisplay();', { size: 12, color: INK, gap: 0 });
pageNo(30); save();

/* 31 3D + STL */
newPage('31-apx3D.page', WHITE);
head('D  ·  3D DESIGN + STL', 'Six parts, all printable');
IMG('p3d', 56, 132, 620, 199, 'assets/print_overview.png');
T('cap', 56, 340, 620, 'Footprint of each part at 1:0.67, with bounding boxes.', { size: 11, color: GRAY, gap: 0 });
let z = 372;
z = BL('m1', 56, z, 620, 'Pedestal 56×70×19.5 — beam slot, glue walls, no screws', { size: 14 });
z = BL('m2', 56, z, 620, 'Pan 150×150×5 — centre M4, three toothpick pins at R62', { size: 14 });
z = BL('m3', 56, z, 620, 'Pump socket 76×48×25.6 — damps vibration, ties down', { size: 14 });
z = BL('m4', 56, z, 620, 'Keypad bezel, post base, pipe arm — the last three', { size: 14 });
T('src', 700, 138, 204, 'bracket.scad\n+ 6 × .stl\n+ cut file', { size: 13, color: ORANGE, bold: true, gap: 0 });
T('gap', 700, 230, 204, 'Pan sits 8 mm above the pedestal. That gap is what makes the reading honest.', { size: 12, color: GRAY, gap: 0 });
pageNo(31); save();

/* 32 草图 */
newPage('32-apxDraw.page', WHITE);
head('E  ·  DRAWINGS & SCREENSHOTS', 'What the layout looks like');
IMG('bb', 56, 138, 540, 383, 'assets/breadboard_wiring.png');
T('cbb', 56, 532, 540, 'Breadboard map — which column each part sits in', { size: 11, color: GRAY, gap: 0 });
T('ph', 620, 138, 284, '[ PLACEHOLDER ]\n\nHand sketches\n\n· first three ideas, with the dead ends crossed out\n· open-loop vs closed-loop, drawn by hand\n· breadboard layout, rough', { size: 12, color: GRAY, gap: 0 });
T('ph2', 620, 350, 284, '[ PLACEHOLDER ]\n\nPhotos\n\n· breadboard after wiring\n· full setup on the desk\n· display close-up', { size: 12, color: GRAY, gap: 0 });
pageNo(32); save();

/* 33 文档 */
newPage('33-apxDocs.page', WHITE);
head('F  ·  DOCUMENTATION', 'The manual and the shopping list');
let d = 138;
d = RH('d1', 56, d, 400, 'Assembly guide');
d = BL('db1', 56, d, 400, 'Twelve steps, one wire per step.', { size: 15 });
d = BL('db2', 56, d, 400, 'Burn-in and calibration: six steps.', { size: 15 });
d = BL('db3', 56, d, 400, 'Nine 「it will not light up」 causes, ranked.', { size: 15 });
d = RH('d2', 56, d + 14, 400, 'Bill of materials');
d = BL('db4', 56, d, 400, 'Eleven must-buy items. ¥66–143 at Huaqiangbei.', { size: 15 });
d = BL('db5', 56, d, 400, 'No 3D printing required for the classroom build.', { size: 15 });
T('d3', 520, 138, 384, 'Also included', { size: 18, bold: true, color: RED, gap: 6 });
T('d4', 520, 172, 384, 'Wokwi simulation guide — the two traps: relay must be pnp, calibration lands at 0.42.\n\nInteractive diagram pages — open in any browser, no install.\n\nProduct-level build — 716-line firmware, presets, EEPROM.', { size: 13, color: GRAY, gap: 0 });
pageNo(33); save();

/* 34 视频 */
newPage('34-apxVideo.page', WHITE);
head('C  ·  VIDEO', 'Three clips, to be recorded');
let v = 138;
v = BL('v1', 56, v, 700, 'Full run — rice in, press start, number climbs, pump stops.', { size: 16 });
v = BL('v2', 56, v + 6, 700, 'Fault injection — stuck pump, frozen sensor, clogged line.', { size: 16 });
v = BL('v3', 56, v + 6, 700, 'Assembly time-lapse — twelve steps.', { size: 16 });
T('vh', 56, v + 30, 700, '[ PLACEHOLDER ]   Links go here', { size: 14, color: ORANGE, bold: true, gap: 0 });
T('vn', 56, v + 66, 848, 'Must capture: tare hitting zero, the reading still climbing after the pump stops, and FAULT showing dry three seconds after the pump leaves the water.', { size: 12, color: GRAY, gap: 0 });
pageNo(34); save();

/* 35 AI 声明 */
newPage('35-apxAI.page', WHITE);
head('GENERATIVE AI DECLARATION', 'What AI did, and what it did not');
T('body', 56, 138, 848, 'During the preparation of this Group Project, 35% of text is AI-generated using DeepSeek for drafting code comments, reorganising technical descriptions, and generating diagram boilerplate. I have reviewed, edited, and take full responsibility for the final content of this project.', { size: 17, gap: 10 });
T('hh', 56, 300, 848, 'Human only', { size: 16, bold: true, color: RED, gap: 6 });
T('hb', 56, 330, 848, 'Hardware selection · wiring plan · fault-injection tests · physical assembly · calibration · all measurements', { size: 15, gap: 10 });
T('hh2', 56, 396, 848, 'AI-assisted, then reviewed', { size: 16, bold: true, color: RED, gap: 6 });
T('hb2', 56, 426, 848, 'Code scaffolding · SVG geometry for the diagrams · English phrasing', { size: 15, gap: 10 });
T('foot', 56, 490, 848, 'Percentage is by text volume. State the basis when asked.', { size: 11, color: GRAY, gap: 0 });
pageNo(35); save();

`;

s = s.replace(ANCHOR, block + '\n' + ANCHOR);
fs.writeFileSync(F, s, 'utf8');
console.log('appendix block inserted');
