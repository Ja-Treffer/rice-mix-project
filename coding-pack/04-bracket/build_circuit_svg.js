/**
 * 面包板实际接线图（第二版：图上板块 + 图下三张表）
 *
 * 第一版把 630 个孔、8 块器件、20 多条线全画在一张上，挤成一团看不清。
 * 这版换思路：面包板只画分区和列号，器件标「插第几列」，其余全部落成表。
 * 照着插的时候：先看表定位，再看图确认方向。
 *
 * 输出：breadboard_wiring.svg（A3 横 420×297）
 */
const fs = require('fs');
const path = require('path');

const BB_W = 165.1, BB_D = 54.6;
const PITCH = 2.54, COLS = 63, X0 = 6.35;
const S = 1.42;                        // 放大倍数（A3 装得下）
const OX = 20, OY = 44;

const PW = 420, PH = 297;
const P = [];
const el = s => P.push(s);
const n = v => +v.toFixed(2);

const px = x => n(OX + x * S);
const py = y => n(OY + y * S);
const rect = (x, y, w, h, o) => el(`<rect x="${px(x)}" y="${py(y)}" width="${n(w * S)}" height="${n(h * S)}" ${o}/>`);
const txt = (x, y, s, o) => el(`<text x="${px(x)}" y="${py(y)}" ${o}>${s}</text>`);
const atxt = (x, y, s, o) => el(`<text x="${n(x)}" y="${n(y)}" ${o}>${s}</text>`);
const aline = (x1, y1, x2, y2, o) => el(`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" ${o}/>`);

const C5 = '#ff5b5b', CG = '#43b581', C12 = '#a855f7', SIG = '#ffb020', BUS = '#4cc9f0';
const MUT = '#7d93a8', TXT = '#cfe0ee';

/* 器件的列号范围（1 起算） */
const slot = (c1, c2) => [X0 + (c1 - 1) * PITCH, X0 + (c2 - 1) * PITCH + 0];

el(`<rect x="0" y="0" width="${PW}" height="${PH}" fill="#0b1016"/>`);
atxt(OX, 20, '米水配比 · 面包板接线总图', 'fill="#3ddc97" font-size="9" font-weight="700" font-family="sans-serif"');
atxt(OX, 28, '面包板同一列的 5 个孔内部本来就通，电源轨整条也通 —— 所以下面这张图只标「器件插第几列」，真正要插的跳线在图下面三张表里。',
     `fill="${MUT}" font-size="3.7" font-family="sans-serif"`);
atxt(OX, 34, '列号 1–63 从左到右，行号 a–e（上半）/ f–j（下半），中间槽两侧不通。A3 打印按 1.42:1，看列号对位置就行。',
     `fill="#5d7387" font-size="3.4" font-family="sans-serif"`);

/* ── 面包板底板 ── */
rect(0, 0, BB_W, BB_D, 'fill="#1b1a17" stroke="#3a3833" stroke-width="1" rx="1.6"');
rect(1.2, 2.4, BB_W - 2.4, BB_D - 4.8, 'fill="#12110e" stroke="none" rx="1"');

/* 63 列竖参考线（每 2 列一条细线，每 10 列一条亮线） */
for (let c = 1; c <= COLS; c++) {
  const x = X0 + (c - 1) * PITCH;
  const strong = (c - 1) % 10 === 0;
  el(`<line x1="${px(x)}" y1="${py(3.2)}" x2="${px(x)}" y2="${py(BB_D - 3.2)}" stroke="${strong ? '#3c4a57' : '#242c34'}" stroke-width="${strong ? 0.8 : 0.4}"/>`);
}
/* 列号 */
for (let c = 1; c <= COLS; c += 5) {
  const x = X0 + (c - 1) * PITCH;
  txt(x, 1.9, String(c), `fill="#6b7f92" font-size="2.4" text-anchor="middle"`);
  txt(x, BB_D - 0.5, String(c), `fill="#6b7f92" font-size="2.4" text-anchor="middle"`);
}
/* 行号 */
const ROW_TOP = [3.8, 6.6, 9.4, 12.2, 15.0];
const ROW_BOT = [39.6, 42.4, 45.2, 48.0, 50.8];
['a', 'b', 'c', 'd', 'e'].forEach((L, i) => {
  txt(2.2, ROW_TOP[i] + 0.9, L, `fill="#6b7f92" font-size="2.4"`);
  txt(BB_W - 2.2, ROW_TOP[i] + 0.9, L, `fill="#6b7f92" font-size="2.4" text-anchor="end"`);
});
['f', 'g', 'h', 'i', 'j'].forEach((L, i) => {
  txt(2.2, ROW_BOT[i] + 0.9, L, `fill="#6b7f92" font-size="2.4"`);
  txt(BB_W - 2.2, ROW_BOT[i] + 0.9, L, `fill="#6b7f92" font-size="2.4" text-anchor="end"`);
});
/* 中缝 */
rect(2.5, 17.6, BB_W - 5, 3.0, 'fill="#080706" stroke="#2a2823" stroke-width="0.5"');

/* ── 四条电源轨（画在板最外侧，实线表示整条相通） ── */
const rails = [
  { x: 3.4, c: C5, t: '5V', side: 'L' },
  { x: 5.6, c: CG, t: 'GND', side: 'L' },
  { x: BB_W - 5.6, c: C12, t: '12V', side: 'R' },
  { x: BB_W - 3.4, c: CG, t: '12V−', side: 'R' },
];
rails.forEach(rl => {
  el(`<rect x="${px(rl.x) - 1.6}" y="${py(3.4)}" width="3.2" height="${py(BB_D - 3.4) - py(3.4)}" fill="${rl.c}" opacity="0.85" rx="1.6"/>`);
});

/* ── 器件占位（只标列范围，不画画不下的引脚） ── */
function dev(c1, c2, rowT, rowB, title, sub, color) {
  const [xa, xb] = slot(c1, c2);
  const y1 = rowT === 'top' ? 3.4 : 18.2;
  const y2 = rowB === 'bot' ? BB_D - 3.4 : 36.2;
  rect(xa - 1.4, y1, (xb - xa) + 2.8, y2 - y1, `fill="${color}1f" stroke="${color}" stroke-width="1.3" rx="1.2"`);
  txt(xa, y1 + 5.2, title, `fill="${color}" font-size="3.6" font-weight="700"`);
  txt(xa, y1 + 9.6, sub, `fill="${color}" font-size="2.5" opacity="0.9"`);
  txt(xa, y1 + 13.4, `列 ${c1}–${c2}`, `fill="${color}" font-size="2.6" font-weight="700" opacity="0.85"`);
}

dev(4, 11, 'top', 'mid', 'HX711', '称重模块', '#3ddc97');
dev(16, 27, 'top', 'mid', '继电器', '1路 光耦 5V', '#ff5b5b');
dev(31, 36, 'top', 'mid', '74HC595', '段驱动', '#4cc9f0');
dev(40, 52, 'top', 'mid', '5461AS-1', '4 位共阴数码管', '#ffb020');

/* 8 个限流电阻：列 55–62 横插，上下各一排 */
for (let i = 0; i < 8; i++) {
  const c = 55 + i;
  const x = X0 + (c - 1) * PITCH;
  rect(x - 0.8, 5.6, PITCH * 0.6, 1.4, 'fill="#d8c9a5" stroke="#8a7a55" stroke-width="0.5"');
  rect(x - 0.8, 20.0, PITCH * 0.6, 1.4, 'fill="#d8c9a5" stroke="#8a7a55" stroke-width="0.5"');
}
rect(X0 + 54 * PITCH - 1.4, 18.2, 9 * PITCH, 18.0, 'fill="#d8c9a522" stroke="#d8c9a5" stroke-width="1" rx="1.2"');
txt(X0 + 54 * PITCH, 23.4, '220Ω ×8', 'fill="#d8c9a5" font-size="3.2" font-weight="700"');
txt(X0 + 54 * PITCH, 27.2, '段限流', 'fill="#d8c9a5" font-size="2.5"');
txt(X0 + 54 * PITCH, 30.8, '列 55–62', 'fill="#d8c9a5" font-size="2.6"');

/* 键盘不上面包板：单独画在板下方，注明用杜邦线 */
rect(0, BB_D + 4, 46, 12, 'fill="#3ddc9722" stroke="#3ddc97" stroke-width="1.1" rx="1.2"');
txt(1.2, BB_D + 8.6, '4×4 键盘', 'fill="#3ddc97" font-size="3.2" font-weight="700"');
txt(1.2, BB_D + 13.0, '不插面包板，8 根杜邦直连 D2–D10', 'fill="#8fa6ba" font-size="2.5"');

/* 12V 器件：电源 / 泵，画在板右侧外面 */
const RX = BB_W + 12;
rect(RX, 6, 44, 14, 'fill="#a855f722" stroke="#a855f7" stroke-width="1.1" rx="1.2"');
txt(RX + 1.2, 10.6, '12V 电源', 'fill="#a855f7" font-size="3.2" font-weight="700"');
txt(RX + 1.2, 15.0, '经 DC 母座转接线出红黑两根', 'fill="#8fa6ba" font-size="2.5"');

rect(RX, 26, 44, 14, 'fill="#a855f722" stroke="#a855f7" stroke-width="1.1" rx="1.2"');
txt(RX + 1.2, 30.6, '12V 水泵', 'fill="#a855f7" font-size="3.2" font-weight="700"');
txt(RX + 1.2, 35.0, '裸铜头 → KF301 端子 → 面包板', 'fill="#8fa6ba" font-size="2.5"');

/* Arduino：画在板下方右侧 */
rect(BB_W - 76, BB_D + 4, 76, 14, 'fill="#1d4ed822" stroke="#4c8cf0" stroke-width="1.1" rx="1.2"');
txt(BB_W - 74.8, BB_D + 8.6, 'Arduino UNO', 'fill="#7fb2ff" font-size="3.2" font-weight="700"');
txt(BB_W - 74.8, BB_D + 13.0, '所有出板线都回到这里：A0 A1 D2–D13 A2–A5', 'fill="#8fa6ba" font-size="2.5"');

/* ══════════════ 三张表 ══════════════ */
function table(x, y, w, title, color, cols, rows) {
  atxt(x, y, title, `fill="${color}" font-size="4.4" font-weight="700" font-family="sans-serif"`);
  const hy = y + 6.2, rh = 5.35;
  aline(x, hy, x + w, hy, `stroke="${color}" stroke-width="0.9"`);
  let cx = x;
  cols.forEach((c, i) => {
    atxt(cx + 1.2, hy - 1.8, c.t, `fill="${color}" font-size="3.1" font-weight="700" font-family="sans-serif"`);
    cx += c.w;
  });
  rows.forEach((row, ri) => {
    let px2 = x;
    row.forEach((cell, ci) => {
      atxt(px2 + 1.2, hy + 4.4 + ri * rh, cell, `fill="${ci === 0 ? TXT : MUT}" font-size="3.0" font-family="sans-serif"`);
      px2 += cols[ci].w;
    });
    aline(x, hy + 6.0 + ri * rh, x + w, hy + 6.0 + ri * rh, 'stroke="#1e2a35" stroke-width="0.4"');
  });
  return hy + 6.0 + rows.length * rh;
}

const TY = 178;

/* 表一：板上跳线（面包板表面能看见的短跳线） */
table(OX, TY, 200, '① 板上跳线（插在面包板上，正面看得见）', '#3ddc97',
  [{ t: '从', w: 46 }, { t: '到', w: 66 }, { t: '说明', w: 88 }],
  [
    ['左红轨', 'HX711 VCC · 继电器 VCC · 595 VCC', '5V 三根分下去'],
    ['左灰轨', 'HX711 GND · 继电器 GND · 595 GND', 'GND 三根分下去'],
    ['右紫轨', '继电器 COM', '12V 正进继电器触点'],
    ['右灰轨', '泵的负极（经端子）', '12V 负回来'],
    ['★ 左灰轨 ↔ 右灰轨', '一根跳线，位置随便', '共地。不接这根继电器指示灯会乱闪'],
    ['595 Q0–Q7', '8 个 220Ω 左端', '八个段各一根'],
    ['8 个 220Ω 右端', '5461AS 的 a b c d e f g dp', '顺序照 595 的 Q0→a 往下排'],
    ['5461AS 位选 4 脚', 'Arduino A2 A3 A4 A5', '每根直连，中间不串电阻'],
  ]);

/* 表二：出板线（连到 Arduino） */
table(OX + 212, TY, 188, '② 出板杜邦线（面包板 → Arduino）', '#ffb020',
  [{ t: '面包板上的引脚', w: 64 }, { t: 'Arduino', w: 40 }, { t: '作用', w: 84 }],
  [
    ['HX711 VCC / GND', '5V / GND', '也可以直接进电源轨'],
    ['HX711 DT', 'A1', '称重数据'],
    ['HX711 SCK', 'A0', '称重时钟'],
    ['继电器 IN', 'D8', '泵开关'],
    ['595 DS', 'D11', '段数据'],
    ['595 SHCP', 'D12', '段时钟'],
    ['595 STCP', 'D13', '段锁存'],
    ['键盘 R1–R4', 'D2 D3 D4 D5', '行扫描'],
    ['键盘 C1–C4', 'D6 D7 D9 D10', '列读入'],
    ['5461AS 位选', 'A2 A3 A4 A5', '四位轮流点亮'],
  ]);

/* 表三：12V 那一路（这是最容易接错的地方） */
table(OX, TY + 62, 400, '③ 12V 那一路怎么接（跟 5V 完全分开，只有地是通的）', '#a855f7',
  [{ t: '器件', w: 66 }, { t: '接到哪', w: 98 }, { t: '为什么', w: 236 }],
  [
    ['12V 电源圆头', 'DC 母座转接线 → 红插右紫轨、黑插右灰轨', '电源只有一个接线柱，塞不下第二根杜邦针；转接线一次解决'],
    ['继电器 COM', '右紫轨（12V+）', 'COM 是触点的公共端，电源从这里进'],
    ['继电器 NO', 'KF301 端子 → 泵红线', 'NO 常开，泵接 NO 就是「断电即停」'],
    ['泵黑线', 'KF301 端子 → 右灰轨（12V−）', '泵是裸铜头，必须先过端子再上面包板'],
    ['右灰轨', '★ 一根跳线连到左灰轨', '12V 的地和 Arduino 的地必须是同一个，否则继电器不受控'],
  ]);

/* 图例 */
const LY = PH - 12;
atxt(OX, LY, '颜色', `fill="#3ddc97" font-size="3.4" font-weight="700" font-family="sans-serif"`);
[[C5, '5V'], [C12, '12V'], [CG, 'GND（两个地要短接）'], [SIG, '信号'], [BUS, '段总线']].forEach((l, i) => {
  aline(OX + 16 + i * 52, LY - 1.2, OX + 27 + i * 52, LY - 1.2, `stroke="${l[0]}" stroke-width="2.4"`);
  atxt(OX + 29 + i * 52, LY, l[1], `fill="${MUT}" font-size="3.2" font-family="sans-serif"`);
});

/* 三个提醒 */


atxt(OX + 292, LY, '插之前：万用表量两轨通断 · 12V 轨贴胶带', `fill="#ff5b5b" font-size="3.2" font-weight="700" font-family="sans-serif"`);

el('</svg>');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}mm" height="${PH}mm" viewBox="0 0 ${PW} ${PH}">\n` + P.join('\n');
fs.writeFileSync(path.join(__dirname, 'breadboard_wiring.svg'), svg, 'utf8');
console.log('written: breadboard_wiring.svg');
