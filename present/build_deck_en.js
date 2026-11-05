/* 米水配比 · STEM 汇报 deck 生成器（英文版，对齐 Sample.pdf 的版式语言）
   白底 / 大黑标题 / 橙色手绘线 / 红色小标题 / 橙圆点项目符号 / 右侧配图 / 右下页码 */
const fs = require('fs');
const path = require('path');

const DIR = 'E:/hardness/ricemix/present/deck';
const PDIR = path.join(DIR, 'pages');
const PAGE = [];

const ORANGE = '#E45B24';
const RED    = '#C8342A';
const INK    = '#121212';
const GRAY   = '#5F5B55';
const WHITE  = '#FFFFFF';

const estW = (s) => [...s].reduce((a, ch) => a + (/[\u4e00-\u9fff]/.test(ch) ? 1 : 0.56), 0);
const estLines = (s, sz, w) => {
  const per = Math.max(1, (w - 10) / sz);
  return s.split('\n').reduce((n, ln) => n + Math.max(1, Math.ceil(estW(ln) / per)), 0);
};
const hOf = (sz, s, w) => Math.ceil(estLines(s, sz, w) * sz * 1.78 + sz * 0.56);
const r = (n) => Math.round(n * 10) / 10;

let cur = null;
function newPage(file, bg) {
  cur = { file, lines: [`background: "${bg}"`, 'elements:'] };
  PAGE.push(file);
}
function el(id, type, x, y, w, h) {
  cur.lines.push(`  - elementId: ${id}`);
  cur.lines.push(`    elementType: ${type}`);
  cur.lines.push(`    bounds: [${r(x)}, ${r(y)}, ${r(w)}, ${r(h)}]`);
}
function T(id, x, y, w, s, o = {}) {
  const sz = o.size || 18;
  const h = hOf(sz, s, w);
  el(id, 'text', x, y, w, h);
  cur.lines.push('    content:');
  cur.lines.push('      text: |');
  for (const ln of s.split('\n')) cur.lines.push('        ' + ln);
  cur.lines.push('      style:');
  cur.lines.push(`        fontSize: ${sz}`);
  cur.lines.push('        fontFace: Microsoft YaHei');
  cur.lines.push(`        color: "${o.color || INK}"`);
  if (o.bold) cur.lines.push('        bold: true');
  cur.lines.push(`        align: ${o.align || 'left'}`);
  return y + h + (o.gap === undefined ? 10 : o.gap);
}
function IMG(id, x, y, w, h, src) {
  el(id, 'image', x, y, w, h);
  cur.lines.push(`    src: "${src}"`);
}
function save() {
  fs.writeFileSync(path.join(PDIR, cur.file), cur.lines.join('\n') + '\n', 'utf8');
}

const RULE = '▬'.repeat(30);

function head(sectionTag, title) {
  T('sec', 56, 26, 848, sectionTag, { size: 10, color: GRAY, gap: 6 });
  T('hrule', 56, 44, 848, RULE, { size: 9, color: ORANGE, bold: true, gap: 6 });
  T('title', 56, 64, 848, title, { size: 32, bold: true, gap: 16 });
}
function RH(id, x, y, w, s) {
  return T(id, x, y, w, s, { size: 18, bold: true, color: RED, gap: 6 });
}
function BL(id, x, y, w, s, o = {}) {
  const sz = o.size || 16;
  T(id + 'd', x, y + 1, 14, '●', { size: sz * 0.72, color: ORANGE, gap: 0 });
  return T(id, x + 17, y, w - 17, s, { size: sz, gap: o.gap === undefined ? 8 : o.gap });
}
function pageNo(n) {
  T('pno', 880, 500, 40, String(n), { size: 10, color: GRAY, align: 'right', gap: 0 });
}

/* 01 COVER */
newPage('01-cover.page', WHITE);
T('tag', 56, 40, 848, 'STEM EDUCATION  ·  DESIGN & TECHNOLOGY  ·  2026', { size: 11, color: GRAY, gap: 0 });
T('hrule', 56, 150, 500, RULE, { size: 9, color: ORANGE, bold: true, gap: 0 });
T('title', 56, 178, 520, 'One Scoop of Rice,\nOne Cup of Water', { size: 52, bold: true, gap: 0 });
T('sub', 56, 392, 500, 'Replacing feel with a scale: a closed-loop rice-water ratio prototype built on Arduino', { size: 18, color: GRAY, gap: 4 });
T('kick', 56, 480, 500, 'Built because I was hungry, and the rice kept coming out wrong.', { size: 13, color: ORANGE, gap: 0 });
IMG('whale1', 612, 150, 262, 294, 'assets/whale_rice.jpg');
pageNo(1); save();

/* 02 TOC */
newPage('02-toc.page', WHITE);
head('CONTENTS', 'What this report covers');
const toc = [
  ['01', 'Introduction and background', 'why cooking rice is a gamble'],
  ['02', 'Research and analysis', 'three existing answers, three compromises'],
  ['03', 'Concept generation', 'turn pouring into weighing'],
  ['04', 'Product assembly with steps', 'twelve steps, one wire at a time'],
  ['05', 'Code', 'three rules that make a machine reliable'],
  ['06', 'Using AI to facilitate design', 'what it caught that I did not'],
  ['07', 'Demonstration and outlook', 'STEM value, transfers, next steps'],
];
let tyL = 128, tyR = 128;
toc.forEach(([n, t, s], i) => {
  const lx = i < 4 ? 56 : 504;
  let ty = i < 4 ? tyL : tyR;
  T('n' + i, lx, ty, 34, n, { size: 13, bold: true, color: ORANGE, gap: 0 });
  ty = T('t' + i, lx + 38, ty - 2, 372, t, { size: 15, bold: true, gap: 1 });
  ty = T('s' + i, lx + 38, ty, 372, s, { size: 10, color: GRAY, gap: 0 });
  if (i < 4) tyL = ty + 16; else tyR = ty + 16;
});
pageNo(2); save();

/* 03 SEC 01 */
newPage('03-sec1.page', WHITE);
T('num', 56, 150, 300, '01', { size: 110, bold: true, color: ORANGE, gap: 0 });
T('hrule', 56, 300, 360, RULE, { size: 9, color: ORANGE, bold: true, gap: 0 });
T('stitle', 56, 322, 460, 'Introduction\nand background', { size: 32, bold: true, gap: 0 });
T('sdesc', 56, 430, 440, 'Every time I cook rice, I am betting on my own hand.', { size: 16, color: GRAY, gap: 0 });
pageNo(3); save();

/* 04 PROBLEM */
newPage('04-problem.page', WHITE);
head('01 / THE PROBLEM', 'What is the problem?');
let py = 146;
py = RH('h1', 56, py, 470, 'Rice comes out hard, or mushy');
py = BL('b1', 56, py, 470, 'Too little water and the rice is crunchy. Too much and it turns to paste. There is no middle ground you can aim at twice.', { gap: 6, size: 14 });
py = RH('h2', 56, py, 470, 'Water is added by feel');
py = BL('b2', 56, py, 470, 'Same bag, same pot, same person — yesterday fine, today not. Feel is not a quantity you can hold steady.', { gap: 6, size: 14 });
py = RH('h3', 56, py, 470, 'Nothing tells you what happened');
py = BL('b3', 56, py, 470, 'A cup shows volume, not mass. A pot line shows a level, not a number.', { gap: 0, size: 14 });
T('read', 56, 462, 520, 'The problem is not carelessness. It is that feel cannot be reproduced.', { size: 15, bold: true, color: ORANGE, gap: 0 });
IMG('pic', 600, 150, 300, 240, 'assets/sim.png');
pageNo(4); save();

/* 05 WHY */
newPage('05-why.page', WHITE);
head('01 / WHY IT MATTERS', 'Why are the problems essential?');
RH('h1', 56, 150, 500, 'Because failure costs more than a meal');
let wy = 188;
['Wasted food — a whole pot, not a spoonful.',
 'Lost confidence — three bad pots and they stop.',
 'A skill you cannot teach — "a bit more" is not a lesson.'].forEach((s, i) => {
  wy = BL('w' + i, 56, wy, 480, s, { size: 16, gap: 14 });
});
T('read', 56, 392, 480, "Cooking's first lesson is not heat. It is ratio.", { size: 22, bold: true, color: ORANGE, gap: 0 });
T('read2', 56, 448, 480, 'Make ratio a number, and a beginner can follow it, check it, repeat it.', { size: 14, color: GRAY, gap: 0 });
IMG('whale2', 600, 146, 274, 308, 'assets/whale_angry.jpg');
pageNo(5); save();

/* 06 SEC 02 */
newPage('06-sec2.page', WHITE);
T('num', 56, 150, 300, '02', { size: 110, bold: true, color: ORANGE, gap: 0 });
T('hrule', 56, 300, 360, RULE, { size: 9, color: ORANGE, bold: true, gap: 0 });
T('stitle', 56, 322, 460, 'Research\nand analysis', { size: 32, bold: true, gap: 0 });
T('sdesc', 56, 430, 440, 'Three answers already exist. Each one gives something up.', { size: 16, color: GRAY, gap: 0 });
pageNo(6); save();

/* 07 EXISTING */
newPage('07-existing.page', WHITE);
head('02 / EXISTING SOLUTIONS', 'Three answers, three compromises');
const cols = [
  ['Measuring cup', 'Cheap, everywhere. But the scale sits inside the pot where steam fogs it, and rice grains trap air — volume and mass do not agree.'],
  ['Lines inside the pot', 'The maker decides the ratio for you. Works only with its own cup, breaks with a different rice, cannot make porridge.'],
  ['Automatic dispenser', 'Press one button and it works. But it starts at four figures, takes counter space, and you cannot repair it yourself.'],
];
cols.forEach((c, i) => {
  const x = 56 + i * 288;
  T('c' + i, x, 156, 260, c[0], { size: 18, bold: true, gap: 6 });
  T('cd' + i, x, 202, 260, c[1], { size: 14, color: GRAY, gap: 0 });
});
T('read', 56, 420, 848, 'The gap: nothing cheap, nothing readable, nothing you can retune yourself.', { size: 17, bold: true, color: ORANGE, gap: 0 });
pageNo(7); save();

/* 08 TRADE-OFF */
newPage('08-tradeoff.page', WHITE);
head('02 / TRADE-OFF', 'What each option gives up');
const rows = [
  ['', 'Price', 'Adjustable', 'Household rice'],
  ['Measuring cup', '¥10', 'No', 'Both'],
  ['Pot graduations', 'Included', 'Fixed', 'No'],
  ['Auto dispenser', '¥1000+', 'Limited', 'Black box'],
  ['This project', '¥66–143', '16 presets', '12 steps'],
];
const rx = [56, 380, 520, 690];
rows.forEach((row, i) => {
  const ry = 160 + i * 48;
  const last = i === 4;
  const isHead = i === 0;
  row.forEach((cell, j) => {
    if (!cell) return;
    T(`r${i}_${j}`, rx[j], ry, j === 0 ? 300 : 160, cell, {
      size: isHead ? 13 : (j === 0 ? 17 : 16),
      bold: isHead || j === 0 || last,
      color: isHead ? GRAY : (last ? ORANGE : INK),
      gap: 0,
    });
  });
  if (!isHead) T(`ln${i}`, 56, ry + 36, 848, '─'.repeat(96), { size: 6, color: '#D8D2C8', gap: 0 });
});
T('read', 56, 420, 848, 'Under one hundred and fifty yuan turns ratio from a habit into a parameter you can edit.', { size: 17, bold: true, color: ORANGE, gap: 4 });
T('cur', 56, 452, 848, 'All prices in CNY. Sourced walk-in at Huaqiangbei, Shenzhen — online retail runs 20-40% higher for the same parts.', { size: 11, color: GRAY, gap: 0 });
pageNo(8); save();

/* 09 SEC 03 */
newPage('09-sec3.page', WHITE);
T('num', 56, 150, 300, '03', { size: 110, bold: true, color: ORANGE, gap: 0 });
T('hrule', 56, 300, 360, RULE, { size: 9, color: ORANGE, bold: true, gap: 0 });
T('stitle', 56, 322, 460, 'Concept\ngeneration', { size: 32, bold: true, gap: 0 });
T('sdesc', 56, 430, 440, 'Stop counting seconds. Start reading a scale.', { size: 16, color: GRAY, gap: 0 });
pageNo(9); save();

/* 10 CONCEPT */
newPage('10-concept.page', WHITE);
head('03 / THE CORE IDEA', 'From open loop to closed loop');
RH('h1', 56, 150, 400, 'Open loop: pour by time');
BL('o1', 56, 184, 400, 'Assume the pump delivers 12 g/s, pour ten seconds, hope for 120 g.', { size: 14, gap: 4 });
BL('o2', 56, 246, 400, 'Pump ages, tube clogs, level drops — the assumption quietly stops being true.', { size: 14, gap: 0 });
RH('h2', 500, 150, 400, 'Closed loop: pour by weight');
BL('n1', 500, 184, 400, 'Weigh the whole pot every 200 ms. Stop the moment the number reaches the target.', { size: 14, gap: 4 });
BL('n2', 500, 246, 400, 'Flow can change all it wants. The decision is made on the scale, not on a clock.', { size: 14, gap: 0 });
T('read', 56, 344, 848, 'One more step: stop 5 g early.', { size: 22, bold: true, color: ORANGE, gap: 4 });
T('read2', 56, 386, 848, 'When the pump cuts out, water already in the tube keeps falling. The 5 g is not a fudge factor — it is the measured overshoot.', { size: 14, color: GRAY, gap: 0 });
pageNo(10); save();

/* 11 HARDWARE */
newPage('11-hardware.page', WHITE);
head('03 / HARDWARE', 'Fourteen parts, one shopping list');
const parts = [
  ['Arduino Uno R3', '¥18–32'], ['HX711 + 5 kg load cell', '¥8–16'],
  ['5V relay module', '¥3–6'], ['12V micro pump', '¥10–22'],
  ['12V 1A adapter', '¥10–18'], ['4x4 membrane keypad', '¥5–10'],
  ['Breadboard 830', '¥4–8'], ['Dupont wires x2', '¥4–8'],
  ['74HC595', '¥0.5–1'], ['5461AS-1 display', '¥1.5–3'],
  ['220 ohm resistors x8', '¥0.5–1'], ['1N4007 diode', '¥0.5–1.5'],
  ['1000 uF capacitor', '¥0.5–1.5'], ['Container + platform', '¥0–15'],
];
parts.forEach((p, i) => {
  const col = i < 7 ? 0 : 1;
  const x = 56 + col * 300;
  const y = 156 + (i % 7) * 34;
  T('p' + i, x, y, 190, p[0], { size: 14, gap: 0 });
  T('q' + i, x + 195, y, 90, p[1], { size: 14, color: GRAY, align: 'right', gap: 0 });
});
T('cost', 660, 156, 240, '¥66-143', { size: 30, bold: true, color: ORANGE, gap: 6 });
T('note', 660, 206, 250, 'whole build, no 3D printing. CNY, walk-in at Huaqiangbei (Shenzhen); retail online runs 20-40% higher.', { size: 11, color: GRAY, gap: 0 });
T('note2', 56, 430, 848, 'The 1N4007 and the 1000 uF are protection parts: without them the relay contacts pit, and the board resets every time the pump starts.', { size: 13, color: GRAY, gap: 0 });
pageNo(11); save();

/* 12 ARCH */
newPage('12-arch.page', WHITE);
head('03 / HOW IT WORKS', 'Five stages, one closed loop');
const stages = [
  ['Sense', 'Load cell + HX711, 200 ms per sample'],
  ['Decide', 'Target = rice x ratio; remaining = target - poured'],
  ['Act', 'Relay closes, pump runs, relay opens'],
  ['Show', '74HC595 drives a four-digit display'],
  ['Guard', 'Timeout, overflow, and no-flow detection'],
];
stages.forEach((s, i) => {
  const y = 158 + i * 58;
  T('s' + i, 56, y, 120, s[0], { size: 18, bold: true, color: ORANGE, gap: 0 });
  T('sd' + i, 190, y + 2, 400, s[1], { size: 14, gap: 0 });
});
T('read', 56, 462, 560, 'Sense, decide, act, show, guard - the loop closes inside one 200 ms tick.', { size: 14, bold: true, color: GRAY, gap: 0 });
IMG('pic', 620, 250, 300, 220, 'assets/sch_wiring.png');
pageNo(12); save();

/* 13 SEC 04 */
newPage('13-sec4.page', WHITE);
T('num', 56, 150, 300, '04', { size: 110, bold: true, color: ORANGE, gap: 0 });
T('hrule', 56, 300, 360, RULE, { size: 9, color: ORANGE, bold: true, gap: 0 });
T('stitle', 56, 322, 480, 'Product assembly\nwith steps', { size: 32, bold: true, gap: 0 });
T('sdesc', 56, 430, 440, 'Twelve steps. Each step is one wire, or two.', { size: 16, color: GRAY, gap: 0 });
pageNo(13); save();

/* 14 ASSEMBLY */
newPage('14-assembly.page', WHITE);
head('04 / ASSEMBLY', 'Twelve steps, one wire at a time');
const steps = [
  'Two rails first - do not forget the bridge between left and right ground',
  'HX711: VCC, GND, DT -> A1, SCK -> A0',
  'Relay: VCC, GND, IN -> D8',
  'Load cell: four wires into the HX711 pads',
  'Keypad rows D2-D5, columns D6 / D7 / D9 / D10',
  '74HC595: DS -> D11, SHCP -> D12, STCP -> D13',
  '595 pin 10 -> 5V, pin 13 -> GND (the most-missed two)',
  'Eight 220 ohm resistors into the segment pins',
  'Display: segments a-dp, digit selects A2-A5',
  'Pump: NO contact and 12V-, through a screw terminal',
  '1N4007 across the pump, 1000 uF across the 12V supply',
  'Power up, calibrate with 500 g, first run with 100 g',
];
steps.forEach((s, i) => {
  const col = i < 6 ? 0 : 1;
  const x = 56 + col * 300;
  const y = 152 + (i % 6) * 50;
  T('sn' + i, x, y, 26, String(i + 1).padStart(2, '0'), { size: 14, bold: true, color: ORANGE, gap: 0 });
  T('st' + i, x + 30, y, 250, s, { size: 13, gap: 0 });
});
T('ph', 620, 152, 300, '[ photos of each step go here ]', { size: 13, color: GRAY, gap: 0 });
IMG('pic', 628, 186, 296, 258, 'assets/sch_real.png');
pageNo(14); save();

/* 15 SEC 05 */
newPage('15-sec5.page', WHITE);
T('num', 56, 150, 300, '05', { size: 110, bold: true, color: ORANGE, gap: 0 });
T('hrule', 56, 300, 360, RULE, { size: 9, color: ORANGE, bold: true, gap: 0 });
T('stitle', 56, 322, 460, 'Code', { size: 32, bold: true, gap: 0 });
T('sdesc', 56, 430, 440, '279 lines. Three of them do the real work.', { size: 16, color: GRAY, gap: 0 });
pageNo(15); save();

/* 16 MODULES */
newPage('16-modules.page', WHITE);
head('05 / CODE', 'What the code actually does');
const mods = [
  ['Read the scale', 'HX711 at 10 Hz, three samples averaged, software tare so the empty pot reads zero.'],
  ['Decide the target', 'Target = rice mass x ratio. The ratio comes from a keypad preset, editable at runtime.'],
  ['Drive the pump', 'One relay pin, one boolean. The pump is either on or off - no PWM, no partial flow.'],
  ['Show the number', 'Dynamic scan at 2 ms per digit; four digits refresh every 8 ms and read as steady.'],
];
mods.forEach((m, i) => {
  const y = 156 + i * 76;
  T('m' + i, 56, y, 210, m[0], { size: 17, bold: true, gap: 2 });
  T('md' + i, 290, y, 590, m[1], { size: 14, color: GRAY, gap: 0 });
});
T('read', 56, 468, 848, 'Nothing clever: one sensor, one actuator, one comparison. The reliability comes from what surrounds them.', { size: 14, color: GRAY, gap: 0 });
pageNo(16); save();

/* 17 LOOP */
newPage('17-loop.page', WHITE);
head('05 / THE DECISION CHAIN', 'Four questions asked every 200 ms');
T('big', 56, 148, 300, '5 g', { size: 86, bold: true, color: ORANGE, gap: 0 });
T('bigd', 56, 254, 300, 'the head start we give the pump before the number reaches target', { size: 14, color: GRAY, gap: 0 });
const chain = [
  ['Are we there yet?', 'poured >= target - 5 g -> open the relay'],
  ['Did it take too long?', 'over 30 s -> stop and flag'],
  ['Is it too heavy?', 'over 3000 g -> stop and flag'],
  ['Is anything moving?', 'no rise in 3 s -> the pump or the tube is blocked'],
];
chain.forEach((c, i) => {
  const y = 150 + i * 74;
  T('c' + i, 396, y, 250, c[0], { size: 16, bold: true, gap: 2 });
  T('cd' + i, 396, y + 26, 500, c[1], { size: 13, color: GRAY, gap: 0 });
});
pageNo(17); save();

/* 18 SEC 06 */
newPage('18-sec6.page', WHITE);
T('num', 56, 150, 300, '06', { size: 110, bold: true, color: ORANGE, gap: 0 });
T('hrule', 56, 300, 360, RULE, { size: 9, color: ORANGE, bold: true, gap: 0 });
T('stitle', 56, 322, 520, 'Using AI to\nfacilitate design', { size: 32, bold: true, gap: 0 });
T('sdesc', 56, 430, 440, 'Not a code generator. A second pair of eyes.', { size: 16, color: GRAY, gap: 0 });
pageNo(18); save();

/* 19 AI 5 STEPS */
newPage('19-ai5.page', WHITE);
head('06 / DESIGN THINKING x AI', 'Five steps, each one forced a decision');
const five = [
  ['Empathize', 'Asked the model to play a first-time cook, then to say what felt unfair.'],
  ['Define', 'Turned "inaccurate" into something measurable: plus or minus 1 g, done in 30 seconds.'],
  ['Ideate', 'Compared pump, pinch valve and syringe pump on flow, response and cost.'],
  ['Prototype', 'Ran the whole logic in Wokwi before buying a single part.'],
  ['Test', 'Broke it on purpose: jammed pump, frozen sensor, clogged tube.'],
];
five.forEach((f, i) => {
  const y = 156 + i * 62;
  T('f' + i, 56, y, 160, f[0], { size: 17, bold: true, color: ORANGE, gap: 2 });
  T('fd' + i, 240, y, 640, f[1], { size: 14, color: GRAY, gap: 0 });
});
T('read', 56, 482, 848, 'The steps are not decoration - each one ended in a number that went into the code.', { size: 13, color: GRAY, gap: 0 });
pageNo(19); save();

/* 20 STUCK */
newPage('20-ai-real.page', WHITE);
head('06 / WHAT ACTUALLY HAPPENED', 'Where I got stuck, and how it got unstuck');
T('cl', 56, 152, 400, 'Where I got stuck', { size: 12, bold: true, color: ORANGE, gap: 8 });
T('cr', 500, 152, 400, 'What the AI caught', { size: 12, bold: true, color: ORANGE, gap: 8 });
const left = [
  ['Parts arrived, no soldering', 'Headers were loose and I had never used an iron. The build ended with zero solder joints: breadboard modules, jumper wires, screw terminals for the pump.'],
  ['Missing common ground', 'The 12V ground was not tied to Arduino GND. The indicator lit but the pump did not run - or ran forever. It took an hour to find.'],
];
const right = [
  ['"Your timeout will cut the porridge off"', 'Timeout was fixed at 20 s. Congee needs 75 s, thin porridge 100 s. The safety net would have made porridge impossible.'],
  ['"Nobody can read this diagram"', 'The first wiring sheet was too dense. It became a zone map plus a twelve-step sequence.'],
];
let ly = 178, ry2 = 178;
left.forEach((x, i) => {
  ly = T('l' + i, 56, ly, 400, x[0], { size: 15, bold: true, gap: 2 });
  ly = T('ld' + i, 56, ly, 400, x[1], { size: 13, color: GRAY, gap: 16 });
});
right.forEach((x, i) => {
  ry2 = T('r' + i, 500, ry2, 400, x[0], { size: 15, bold: true, gap: 2 });
  ry2 = T('rd' + i, 500, ry2, 400, x[1], { size: 13, color: GRAY, gap: 16 });
});
T('read', 56, 470, 848, 'The most useful thing it did was ask "have you measured it?" - right when I was sure.', { size: 14, bold: true, color: ORANGE, gap: 0 });
pageNo(20); save();

/* 21 SEC 07 */
newPage('21-sec7.page', WHITE);
T('num', 56, 150, 300, '07', { size: 110, bold: true, color: ORANGE, gap: 0 });
T('hrule', 56, 300, 360, RULE, { size: 9, color: ORANGE, bold: true, gap: 0 });
T('stitle', 56, 322, 500, 'Demonstration\nand outlook', { size: 32, bold: true, gap: 0 });
T('sdesc', 56, 430, 440, 'What it does on the table, and where it could go next.', { size: 16, color: GRAY, gap: 0 });
pageNo(21); save();

/* 22 DEMO */
newPage('22-demo.page', WHITE);
head('07 / DEMONSTRATION', 'On the table, live');
T('ph', 56, 152, 380, '[ demo photos / video QR / live shot goes here ]', { size: 13, color: GRAY, gap: 6 });
['Place 100 g of rice on the platform',
 'Press S1 - Northeast rice, 1:1.2',
 'Press S9 to start',
 'The display counts up to 120.4',
 'The pump stops on its own; the number holds'].forEach((s, i) => {
  BL('d' + i, 56, 186 + i * 42, 380, s, { size: 15, gap: 4 });
});
IMG('pic', 480, 150, 430, 320, 'assets/sim.png');
pageNo(22); save();

/* 23 STEM */
newPage('23-stem.page', WHITE);
head('08 / STEM EDUCATION VALUE', 'Not just a machine - a lesson');
const stem = [
  ['S - Science', 'Density, ratio, what a calibration curve means, where error comes from.'],
  ['T - Technology', 'Sensor reading, serial shifting, state machines, debouncing.'],
  ['E - Engineering', 'Part selection, protection circuits, fault injection testing.'],
  ['M - Mathematics', 'Linear functions, unit conversion, significant figures on four digits.'],
];
stem.forEach((s, i) => {
  const y = 156 + i * 72;
  T('s' + i, 56, y, 190, s[0], { size: 17, bold: true, color: ORANGE, gap: 2 });
  T('sd' + i, 260, y, 630, s[1], { size: 14, color: GRAY, gap: 0 });
});
T('read', 56, 468, 848, 'One lesson can carry three subjects, and what students build is on the table the same day.', { size: 15, bold: true, gap: 0 });
pageNo(23); save();

/* 24 TRANSFER */
newPage('24-transfer.page', WHITE);
head('09 / TRANSFERABLE DESIGN', 'The same loop, three other problems');
const tr = [
  ['Noodle dough', 'Flour-water ratio decides texture. Same scale, same pump, different preset.'],
  ['Nutrient solution', 'Hydroponics and aquariums need precise dilution. Swap the vessel, keep the logic.'],
  ['Pet food portions', 'Portion by body weight. The recipe table becomes a feeding chart.'],
];
tr.forEach((t, i) => {
  const x = 56 + i * 288;
  T('t' + i, x, 156, 260, t[0], { size: 18, bold: true, gap: 6 });
  T('td' + i, x, 202, 260, t[1], { size: 14, color: GRAY, gap: 0 });
});
T('read', 56, 372, 848, 'Nothing in the control loop is specific to rice. Only the ratio table is.', { size: 17, bold: true, color: ORANGE, gap: 0 });
IMG('pic', 56, 428, 320, 104, 'assets/print_overview.png');
pageNo(24); save();

/* 25 IMPACT */
newPage('25-impact.page', WHITE);
head('10 / WIDER IMPACT', 'What a hundred-yuan machine can change');
const im = [
  ['Less waste', 'A pot that comes out right the first time is a pot that does not go in the bin.'],
  ['More accessible', 'The barrier to cooking is not knife skills. It is knowing how much water.'],
  ['More open', 'Every drawing, part and line of code here can be rebuilt by the next student.'],
];
im.forEach((x, i) => {
  const y = 156 + i * 80;
  T('i' + i, 56, y, 210, x[0], { size: 18, bold: true, gap: 2 });
  T('id' + i, 290, y, 610, x[1], { size: 14, color: GRAY, gap: 0 });
});
T('read', 56, 436, 848, 'When the technical barrier drops, the people who benefit are never only the technical ones.', { size: 16, bold: true, color: ORANGE, gap: 0 });
pageNo(25); save();

/* 26 NEXT */
newPage('26-future.page', WHITE);
head('11 / WHAT IS NEXT', 'Four things worth doing next');
const nx = [
  ['Swap the scale', 'A 1 kg load cell resolves five times finer than 5 kg, and costs less.'],
  ['Temperature compensation', 'Water density changes with heat. A thermistor makes the ratio honest.'],
  ['Move presets to a phone', 'Bluetooth config instead of a keypad, so a recipe can be shared.'],
  ['Hand it to next year', 'The whole pack - drawings, parts, code - is written to be rebuilt.'],
];
nx.forEach((x, i) => {
  const col = i < 2 ? 0 : 1;
  const row = i % 2;
  const px = 56 + col * 440;
  const py2 = 156 + row * 130;
  T('n' + i, px, py2, 400, x[0], { size: 18, bold: true, gap: 4 });
  T('nd' + i, px, py2 + 32, 400, x[1], { size: 14, color: GRAY, gap: 0 });
});
pageNo(26); save();

/* 27 END */
newPage('27-end.page', WHITE);
T('tag', 56, 40, 848, 'THANK YOU  /  Q & A', { size: 11, color: GRAY, gap: 0 });
T('hrule', 56, 200, 460, RULE, { size: 9, color: ORANGE, bold: true, gap: 0 });
T('title', 56, 196, 470, 'Make uncertainty measurable', { size: 44, bold: true, gap: 0 });
T('sub', 56, 418, 470, 'Not teaching people to feel the water. Making the feel unnecessary.', { size: 19, color: GRAY, gap: 4 });
T('kick', 56, 486, 500, 'One scoop, one cup, and a number you can read back.', { size: 14, color: ORANGE, gap: 0 });

pageNo(27); save();


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
IMG('im1', 56, 138, 380, 352, 'assets/sch_wiring.png');
IMG('im2', 484, 138, 380, 352, 'assets/sch_real.png');
T('c1', 56, 500, 400, 'Schematic — every pin, every junction', { size: 10, color: GRAY, gap: 0 });
T('c2', 484, 500, 400, 'Physical layout — S1–S16, protection parts', { size: 10, color: GRAY, gap: 0 });
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
T('note', 56, 486, 404, 'demo.ino — 279 lines; the 716-line build adds presets and EEPROM.', { size: 10, color: GRAY, gap: 0 });
T('code', 500, 138, 404, 'if (now - t0 > TIMEOUT_MS)          stop("timeout");\nif (w > MAX_TOTAL)                  stop("overload");\nif (now - t0 > 3000 && added < 0.5) stop("dry run");\nif (added >= target - LEAD_G)       stop("target");\n\nshowMilligrams(scale.read());\nscanDisplay();', { size: 12, color: INK, gap: 0 });
pageNo(30); save();

/* 31 3D + STL */
newPage('31-apx3D.page', WHITE);
head('D  ·  3D DESIGN + STL', 'Six parts, all printable');
IMG('p3d', 56, 150, 600, 168, 'assets/print_overview.png');
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
IMG('bb', 56, 150, 470, 316, 'assets/breadboard_wiring.png');
T('cbb', 56, 496, 500, 'Breadboard map — which column each part sits in', { size: 10, color: GRAY, gap: 0 });
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


const ordered = PAGE.slice().sort();
const manifest = [
  'version: v2',
  'size: [960, 540]',
  'title: Rice Water Ratio · STEM Project Report',
  'pages:',
  ...ordered.map((f) => '  - pages/' + f),
].join('\n') + '\n';
fs.writeFileSync(path.join(DIR, 'deck.pptd'), manifest, 'utf8');

console.log('pages:', ordered.length);
