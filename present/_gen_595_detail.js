/* 74HC595 + 5461AS-1 + 保护件 接线详图（A3 横，白底，可打印）
   目的：主图看整体，这张看局部——595 横放缺口朝左，16 个脚每根都标清楚连到哪 */
const fs = require('fs');

const W = 1240, H = 880;
const O = '#E85D26', R = '#D93A2B', B = '#1E5FA8', G = '#2E7D32', K = '#333333';
const P = '#7B4BD6', T = '#0A7A8C';
const s = [];
const push = (x) => s.push(x);

push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);

const TX = (x, y, t, o = {}) => {
  const a = o.a || 'start', sz = o.sz || 12, c = o.c || K;
  const w = o.w ? ` font-weight="${o.w}"` : '';
  push(`<text x="${x}" y="${y}" fill="${c}" font-size="${sz}" font-family="${o.m ? 'Consolas,monospace' : 'Segoe UI,Arial,sans-serif'}" text-anchor="${a}"${w}>${t}</text>`);
};
const LN = (pts, c, w = 2, dash) => {
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
};
const RC = (x, y, w, h, f, st, sw = 1, rx = 0) =>
  push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}${rx ? ` rx="${rx}"` : ''}/>`);
const CI = (cx, cy, r, f, st, sw = 1) =>
  push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}/>`);

/* ── 标题 ── */
TX(40, 44, '74HC595 → 5461AS-1', { sz: 26, w: 700 });
TX(40, 70, '移位寄存器驱动四位共阴数码管 · 芯片横放，缺口朝左，下排 1–8、上排 16–9', { sz: 13, c: '#666' });
RC(40, 82, 300, 3, O);

/* ══════════ 595 芯片 ══════════ */
const cx = 400, cy = 180, cw = 440, ch = 110;   /* 芯片体 */
RC(cx, cy, cw, ch, '#2b2b2b', '#111', 2, 4);
/* 缺口：左端半圆 */
push(`<path d="M ${cx+2} ${cy+ch/2-16} A 16 16 0 0 0 ${cx+2} ${cy+ch/2+16}" fill="#fff" stroke="#111" stroke-width="2"/>`);
CI(cx + 18, cy + ch - 16, 3.5, '#fff');   /* 1 脚圆点 */

TX(cx + cw / 2, cy + ch / 2 + 7, '74HC595', { a: 'middle', sz: 20, c: '#fff', w: 700 });
TX(cx + cw / 2, cy + ch / 2 + 26, 'DIP-16', { a: 'middle', sz: 11, c: '#999' });

/* 16 个脚：下排 1-8 左→右，上排 16-9 左→右 */
const PITCH = 52;
const x0 = cx + 30;
const lower = [
  [1, 'QB', 'b', P], [2, 'QC', 'c', P], [3, 'QD', 'd', P], [4, 'QE', 'e', P],
  [5, 'QF', 'f', P], [6, 'QG', 'g', P], [7, 'QH', 'dp', P], [8, 'GND', 'GND', K],
];
const upper = [
  [16, 'VCC', '5V', R], [15, 'QA', 'a', P], [14, 'SER', 'D11', B], [13, 'OE', 'GND', K],
  [12, 'RCLK', 'D13', B], [11, 'SRCLK', 'D12', B], [10, 'SRCLR', '5V', R], [9, "QH'", '不用', '#999'],
];

/* 下排脚（向下引出） */
lower.forEach((p, i) => {
  const px = x0 + i * PITCH;
  LN([[px, cy + ch], [px, cy + ch + 26]], '#666', 2);
  CI(px, cy + ch + 26, 3, '#666');
  TX(px, cy + ch - 8, p[0], { a: 'middle', sz: 10, c: '#bbb', m: 1 });
  TX(px, cy + ch + 44, p[1], { a: 'middle', sz: 11, c: '#fff', w: 700 });
});
/* 上排脚（向上引出） */
upper.forEach((p, i) => {
  const px = x0 + i * PITCH;
  LN([[px, cy], [px, cy - 26]], '#666', 2);
  CI(px, cy - 26, 3, '#666');
  TX(px, cy + 14, p[0], { a: 'middle', sz: 10, c: '#bbb', m: 1 });
  TX(px, cy - 34, p[1], { a: 'middle', sz: 11, c: '#fff', w: 700 });
});

/* ══════════ 上排连线：电源与控制 ══════════ */
const upY = cy - 26;
/* 16 VCC → 5V 母线 */
LN([[x0 + 0 * PITCH, upY], [x0 - 8, upY], [x0 - 8, 96]], R, 3);
TX(x0 - 8, 88, '5V', { a: 'middle', sz: 12, c: R, w: 700 });
/* 10 SRCLR → 同一条 5V 母线 */
LN([[x0 + 6 * PITCH, upY], [x0 + 6 * PITCH, 112], [x0 - 8, 112]], R, 3);
TX(x0 + 6 * PITCH + 8, 104, 'SRCLR 必须接 5V', { sz: 11, c: R, w: 700 });
/* 13 OE → GND 母线 */
LN([[x0 + 3 * PITCH, upY], [x0 + 3 * PITCH, 138]], K, 3);
TX(x0 + 3 * PITCH + 8, 132, 'OE 必须接 GND', { sz: 11, c: K, w: 700 });
/* 8 GND → 同一条 GND 母线 */
LN([[x0 + 7 * PITCH, cy + ch + 26], [x0 + 7 * PITCH, 700], [x0 + 3 * PITCH, 700], [x0 + 3 * PITCH, 146]], K, 3);
TX(x0 + 3 * PITCH - 8, 160, 'GND', { a: 'end', sz: 12, c: K, w: 700 });

/* 三根控制线向左引出到 Arduino */
const ctrl = [[14, 'SER', 'D11', 0], [11, 'SRCLK', 'D12', 1], [12, 'RCLK', 'D13', 2]];
ctrl.forEach(([num, nm, pin, k]) => {
  const px = x0 + upper.findIndex((u) => u[0] === num) * PITCH;
  const ty = 300 + k * 26;
  LN([[px, upY], [px, ty], [168, ty]], B, 2.5);
  TX(160, ty + 4, pin, { a: 'end', sz: 12, c: B, w: 700 });
  TX(200, ty - 6, nm, { sz: 10, c: '#888', m: 1 });
});

/* Arduino 方块 */
RC(40, 272, 120, 96, '#eef2f6', '#9fb3c4', 1.5, 6);
TX(100, 300, 'Arduino', { a: 'middle', sz: 13, w: 700 });
TX(100, 320, 'Uno', { a: 'middle', sz: 12, c: '#666' });
TX(100, 342, 'D11 · D12 · D13', { a: 'middle', sz: 9, c: '#888', m: 1 });

/* ══════════ 下排：8 段经 220Ω 到数码管 ══════════ */
const rX = 940, rTop = 200, rGap = 34;
lower.slice(0, 7).forEach((p, i) => {
  const px = x0 + i * PITCH;
  const ry = rTop + i * rGap;
  LN([[px, cy + ch + 26], [px, ry + 10], [rX - 14, ry + 10]], P, 2);
  RC(rX - 14, ry + 2, 34, 16, '#fff7e6', '#c9a227', 1.2, 2);
  TX(rX + 3, ry + 14, '220', { a: 'middle', sz: 8, c: '#8a6f14', m: 1 });
});
/* 7 QH → dp */
{
  const px = x0 + 6 * PITCH, ry = rTop + 6 * rGap;
  LN([[px, cy + ch + 26], [px, ry + 10], [rX - 14, ry + 10]], P, 2);
}

/* ══════════ 数码管 5461AS-1 ══════════ */
const dx = 990, dy = 150, dw = 200, dh = 300;
RC(dx, dy, dw, dh, '#1a1a1a', '#111', 2, 4);
TX(dx + dw / 2, dy + 24, '5461AS-1', { a: 'middle', sz: 14, c: '#fff', w: 700 });
/* 4 个数字窗口 */
for (let i = 0; i < 4; i++) {
  RC(dx + 18 + i * 44, dy + 100, 36, 90, '#2e0f0f', '#3a1a1a', 1, 3);
  TX(dx + 36 + i * 44, dy + 160, '8', { a: 'middle', sz: 42, c: '#ff4d3d' });
}
TX(dx + dw / 2, dy + 62, '四位共阴', { a: 'middle', sz: 10, c: '#999' });

/* 上排 6 脚 a–f */
const dPitch = 30;
const dTop = ['a', 'b', 'c', 'd', 'e', 'f'];
dTop.forEach((n, i) => {
  const px = dx + 26 + i * dPitch;
  LN([[px, dy], [px, dy - 24]], '#666', 2);
  CI(px, dy - 24, 2.6, '#666');
  TX(px, dy - 32, n, { a: 'middle', sz: 10, c: '#ccc', m: 1 });
  /* 从电阻接到段脚 */
  if (i < 6) {
    const ry = rTop + i * rGap;
    LN([[rX + 20, ry + 10], [dx - 24, ry + 10], [dx - 24, dy - 24], [px, dy - 24]], P, 1.8);
  }
});
/* 下排 6 脚 g dp DIG1-4 */
const dBot = ['g', 'dp', 'DIG1', 'DIG2', 'DIG3', 'DIG4'];
dBot.forEach((n, i) => {
  const px = dx + 26 + i * dPitch;
  LN([[px, dy + dh], [px, dy + dh + 24]], '#666', 2);
  CI(px, dy + dh + 24, 2.6, '#666');
  TX(px, dy + dh + 38, n, { a: 'middle', sz: 9, c: '#ccc', m: 1 });
});
/* g 与 dp 从下排绕上去接电阻 */
{
  const ryG = rTop + 6 * rGap;
  const gx = dx + 26, dpx = dx + 26 + dPitch;
  LN([[gx, dy + dh + 24], [gx, ryG + 26], [rX + 20, ryG + 26]], P, 1.8);
  TX(gx + 4, ryG + 20, 'g', { sz: 9, c: P, m: 1 });
  LN([[dpx, dy + dh + 24], [dpx, ryG + 42], [rX + 20, ryG + 42]], P, 1.8);
  TX(dpx + 4, ryG + 36, 'dp', { sz: 9, c: P, m: 1 });
}
/* 位选 → A2-A5 */
const selC = [O, O, O, O];
dBot.slice(2).forEach((n, i) => {
  const px = dx + 26 + (i + 2) * dPitch;
  LN([[px, dy + dh + 24], [px, 560 + i * 0]], selC[i], 2);
  TX(px, 580, 'A' + (2 + i), { a: 'middle', sz: 11, c: O, w: 700 });
});
TX(dx + dw / 2, 604, '位选 DIG1–DIG4 → A2 A3 A4 A5（不串电阻）', { a: 'middle', sz: 10, c: O });

/* ══════════ 下方：保护件接法 ══════════ */
RC(40, 620, 560, 220, '#fafafa', '#ddd', 1.5, 8);
TX(60, 648, '保护件接在哪', { sz: 15, w: 700 });
RC(60, 658, 120, 3, O);

/* D1 反并联泵 */
TX(60, 684, 'D1 · 1N4007 反并联在泵两端', { sz: 12, w: 700 });
/* 画泵的两个端子 */
RC(70, 700, 60, 44, '#eef2f6', '#9fb3c4', 1.2, 4);
TX(100, 728, '泵', { a: 'middle', sz: 11 });
LN([[130, 710], [200, 710]], R, 2.5);
TX(140, 704, '+', { sz: 12, c: R, w: 700 });
LN([[130, 736], [200, 736]], K, 2.5);
TX(140, 750, '−', { sz: 12, c: K, w: 700 });
/* 二极管符号：三角+横杠，白环端在 + 侧 */
push(`<path d="M 214 702 L 246 702 L 230 724 Z" fill="#fff" stroke="${K}" stroke-width="2"/>`);
push(`<line x1="250" y1="700" x2="250" y2="728" stroke="${K}" stroke-width="3"/>`);
TX(232, 660, '白环端 → 泵 +', { a: 'middle', sz: 10, c: O, w: 700 });
LN([[246, 702], [232, 702]], K, 0);
/* 上下引线连回泵的两端 */
LN([[232, 702], [232, 690], [200, 690], [200, 710]], K, 1.6);
LN([[232, 726], [232, 756], [200, 756], [200, 736]], K, 1.6);
TX(232, 776, '另一端 → 泵 −', { a: 'middle', sz: 10, c: '#888' });

/* C1 并在电源两端 */
TX(330, 684, 'C1 · 1000μF / 25V 并在 12V 电源两端', { sz: 12, w: 700 });
push(`<line x1="336" y1="706" x2="336" y2="748" stroke="${K}" stroke-width="3"/>`);
push(`<path d="M 352 706 A 12 21 0 0 1 352 748" fill="none" stroke="${K}" stroke-width="3"/>`);
TX(344, 700, '+', { sz: 13, c: O, w: 700 });
LN([[336, 706], [300, 706], [300, 684]], R, 2);
LN([[352, 706], [376, 706], [376, 684]], R, 2);
TX(300, 678, '+12V', { a: 'middle', sz: 10, c: R, w: 700 });
LN([[336, 748], [300, 748], [300, 770]], K, 2);
LN([[352, 748], [376, 748], [376, 770]], K, 2);
TX(376, 782, 'GND', { a: 'middle', sz: 10, c: K, w: 700 });
TX(344, 796, '长脚接 +12V，白条那侧接 GND', { a: 'middle', sz: 10, c: '#888' });

/* ══════════ 右下：脚位速查表 ══════════ */
RC(620, 620, 580, 220, '#fafafa', '#ddd', 1.5, 8);
TX(640, 648, '横放时 16 个脚的位置（缺口朝左）', { sz: 15, w: 700 });
RC(640, 658, 140, 3, O);

const rows = [
  ['下排 1→8', 'QB  QC  QD  QE  QF  QG  QH  GND', P],
  ['上排 16→9', 'VCC  QA  SER  OE  RCLK  SRCLK  SRCLR  QH′', B],
];
let ty = 686;
rows.forEach(([k, v, c]) => {
  TX(640, ty, k, { sz: 11, c: '#888', m: 1 });
  TX(760, ty, v, { sz: 12, c, w: 700, m: 1 });
  ty += 26;
});
ty += 6;
TX(640, ty, '信号流', { sz: 11, c: '#888', m: 1 });
TX(760, ty, 'SER → 移位 → QA…QH 同时输出', { sz: 12, m: 1 });
ty += 22;
TX(640, ty, '时钟', { sz: 11, c: '#888', m: 1 });
TX(760, ty, 'SRCLK 每来一次，数据移一位', { sz: 12, m: 1 });
ty += 22;
TX(640, ty, '锁存', { sz: 11, c: '#888', m: 1 });
TX(760, ty, 'RCLK 拉一下，8 位同时送到输出脚', { sz: 12, m: 1 });
ty += 30;
TX(640, ty, '两个最容易漏的脚：10 SRCLR 接 5V（接低就一直清零）、13 OE 接 GND（悬空就一直不输出）', { sz: 11, c: R, w: 700 });

/* ── 图例 ── */
const leg = [[R, '5V'], [K, 'GND'], [B, '控制信号'], [P, '段选 Q→段'], [O, '位选 DIG→A2-A5']];
let lx = 40;
leg.forEach(([c, t]) => {
  LN([[lx, 856], [lx + 22, 856]], c, 3);
  TX(lx + 28, 860, t, { sz: 11, c: '#666' });
  lx += 28 + t.length * 12 + 18;
});

push('</svg>');

fs.writeFileSync('E:/hardness/ricemix/demo/sch_595_detail.svg', s.join('\n'), 'utf8');
console.log('written sch_595_detail.svg');
