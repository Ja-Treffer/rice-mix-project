/* 74HC595 → 5461AS-1 接线详图 v2
   修掉 v1 三个致命问题：脚名白字落白底看不见、版面只占三分之一、段线穿芯片 */
const fs = require('fs');

const W = 1240, H = 900;
const O = '#E85D26', R = '#D93A2B', B = '#1E5FA8', K = '#222222';
const P = '#6B3FD4', T = '#0A7A8C', MUT = '#8A8580';
const s = [];
const push = (x) => s.push(x);

push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);

const TX = (x, y, t, o = {}) => {
  const a = o.a || 'start', sz = o.sz || 12, c = o.c || K;
  const w = o.w ? ` font-weight="${o.w}"` : '';
  const f = o.m ? 'Consolas,ui-monospace,monospace' : 'Segoe UI,Arial,sans-serif';
  push(`<text x="${x}" y="${y}" fill="${c}" font-size="${sz}" font-family="${f}" text-anchor="${a}"${w}>${t}</text>`);
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
TX(40, 46, '74HC595 → 5461AS-1', { sz: 28, w: 700 });
TX(40, 72, '芯片横放，缺口朝左。下排 1–8 从左到右，上排 16–9 从左到右。', { sz: 13.5, c: MUT });
RC(40, 84, 260, 4, O);

/* ══════════ 芯片 ══════════ */
const cx = 380, cy = 190, cw = 480, ch = 150;
RC(cx, cy, cw, ch, '#242424', '#000', 2, 5);
push(`<path d="M ${cx + 3} ${cy + ch / 2 - 20} A 20 20 0 0 0 ${cx + 3} ${cy + ch / 2 + 20}" fill="#fff" stroke="#000" stroke-width="2"/>`);
CI(cx + 22, cy + ch - 20, 4.5, '#fff');

TX(cx + cw / 2, cy + ch / 2 - 2, '74HC595', { a: 'middle', sz: 24, c: '#fff', w: 700 });
TX(cx + cw / 2, cy + ch / 2 + 20, 'DIP-16  ·  8 位移位寄存器', { a: 'middle', sz: 11, c: '#9a9a9a' });

const PITCH = 54, x0 = cx + 34, upY = cy - 32, dnY = cy + ch + 32;

const lower = [[1, 'QB'], [2, 'QC'], [3, 'QD'], [4, 'QE'], [5, 'QF'], [6, 'QG'], [7, 'QH'], [8, 'GND']];
const upper = [[16, 'VCC'], [15, 'QA'], [14, 'SER'], [13, 'OE'], [12, 'RCLK'], [11, 'SRCLK'], [10, 'SRCLR'], [9, "QH'"]];

/* 脚号画在芯片内缘，脚名画在芯片外 */
lower.forEach(([n, nm], i) => {
  const px = x0 + i * PITCH;
  LN([[px, cy + ch], [px, dnY]], '#555', 2.5);
  CI(px, dnY, 3.4, '#555');
  TX(px, cy + ch - 10, n, { a: 'middle', sz: 10.5, c: '#b9b9b9', m: 1 });
  TX(px, dnY + 19, nm, { a: 'middle', sz: 12.5, c: K, w: 700 });
});
upper.forEach(([n, nm], i) => {
  const px = x0 + i * PITCH;
  LN([[px, cy], [px, upY]], '#555', 2.5);
  CI(px, upY, 3.4, '#555');
  TX(px, cy + 20, n, { a: 'middle', sz: 10.5, c: '#b9b9b9', m: 1 });
  TX(px, upY - 12, nm, { a: 'middle', sz: 12.5, c: K, w: 700 });
});

/* ══════════ 上排：电源 ══════════ */
/* VCC 与 SRCLR 并到 5V 母线 */
LN([[x0, upY], [x0, 132], [x0 - 26, 132], [x0 - 26, 104]], R, 3.2);
LN([[x0 + 6 * PITCH, upY], [x0 + 6 * PITCH, 132]], R, 3.2);
TX(x0 - 26, 96, '5V', { a: 'middle', sz: 13, c: R, w: 700 });
TX(x0 + 6 * PITCH + 10, 126, 'SRCLR → 5V', { sz: 11.5, c: R, w: 700 });
TX(x0 + 6 * PITCH + 10, 142, '接低就一直清零', { sz: 10, c: MUT });

/* OE 与 GND 并到 GND 母线 */
LN([[x0 + 3 * PITCH, upY], [x0 + 3 * PITCH, 162]], K, 3.2);
LN([[x0 + 7 * PITCH, dnY], [x0 + 7 * PITCH, 640], [x0 + 3 * PITCH, 640], [x0 + 3 * PITCH, 170]], K, 3.2);
TX(x0 + 3 * PITCH - 10, 156, 'GND', { a: 'end', sz: 12.5, c: K, w: 700 });
TX(x0 + 3 * PITCH + 10, 176, 'OE → GND', { sz: 11.5, c: K, w: 700 });
TX(x0 + 3 * PITCH + 10, 192, '悬空就一直不输出', { sz: 10, c: MUT });

/* 三根控制线 → Arduino */
const arX = 150;
RC(40, 250, 110, 130, '#eef2f6', '#9fb3c4', 1.6, 7);
TX(95, 280, 'Arduino', { a: 'middle', sz: 13, w: 700 });
TX(95, 300, 'Uno', { a: 'middle', sz: 12, c: MUT });
TX(95, 330, 'D11', { a: 'middle', sz: 11, c: B, m: 1, w: 700 });
TX(95, 350, 'D12', { a: 'middle', sz: 11, c: B, m: 1, w: 700 });
TX(95, 370, 'D13', { a: 'middle', sz: 11, c: B, m: 1, w: 700 });

const ctrl = [[14, 'SER', 330], [11, 'SRCLK', 350], [12, 'RCLK', 370]];
ctrl.forEach(([num, nm, ty]) => {
  const px = x0 + upper.findIndex((u) => u[0] === num) * PITCH;
  LN([[px, upY], [px, ty], [arX + 4, ty]], B, 2.6);
});

/* ══════════ 下排 8 段 → 电阻 → 数码管 ══════════ */
const segName = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'];
const busY = dnY + 46;          /* 第一根横向走线高度 */
const busGap = 13;
const rX = 906, rW = 40;

lower.slice(0, 7).forEach(([n, nm], i) => {
  const px = x0 + i * PITCH;
  const by = busY + i * busGap;
  LN([[px, dnY], [px, dnY + 30]], P, 2);
  LN([[px, dnY + 30], [px, by], [rX - rW / 2 - 8, by]], P, 2);
  TX(px + 5, dnY + 44, nm, { sz: 11, c: P, m: 1 });
});
/* 7 QH → dp 走最下一层 */
{
  const px = x0 + 6 * PITCH, by = busY + 7 * busGap;
  LN([[px, dnY + 30], [px, by], [rX - rW / 2 - 8, by]], P, 2);
}

/* 电阻排：竖向叠 8 个 */
const rTop = busY, rGap = busGap;
segName.forEach((nm, i) => {
  const ry = rTop + i * rGap;
  RC(rX - rW / 2, ry + 2, rW, 9, '#fff8e8', '#C9A227', 1.2, 2);
  TX(rX + rW / 2 + 6, ry + 10, '220', { sz: 9, c: '#8A6A15', m: 1 });
});

/* ══════════ 数码管 ══════════ */
const dx = 1000, dy = 250, dw = 200, dh = 300;
RC(dx, dy, dw, dh, '#1a1a1a', '#000', 2, 5);
TX(dx + dw / 2, dy + 26, '5461AS-1', { a: 'middle', sz: 15, c: '#fff', w: 700 });
TX(dx + dw / 2, dy + 44, '四位共阴', { a: 'middle', sz: 10, c: '#9a9a9a' });
for (let i = 0; i < 4; i++) {
  RC(dx + 16 + i * 44, dy + 108, 36, 92, '#3a1010', '#4a1a1a', 1, 3);
  TX(dx + 34 + i * 44, dy + 172, '8', { a: 'middle', sz: 44, c: '#ff4d3d' });
}

/* 上排 6 脚 a–f：从电阻右端进来 */
const dPitch = 30;
segName.slice(0, 6).forEach((nm, i) => {
  const px = dx + 26 + i * dPitch;
  const ry = rTop + i * rGap;
  LN([[px, dy], [px, dy - 22]], '#555', 2.2);
  CI(px, dy - 22, 2.8, '#555');
  TX(px, dy - 30, nm, { a: 'middle', sz: 10.5, c: '#555', m: 1, w: 700 });
  LN([[rX + rW / 2, ry + 6], [dx - 26, ry + 6], [dx - 26, dy - 22], [px, dy - 22]], P, 2);
});
/* 下排 g dp：从底部绕上来 */
const dBotY = dy + dh + 22;
['g', 'dp'].forEach((nm, k) => {
  const px = dx + 26 + k * dPitch;
  const ry = rTop + (6 + k) * rGap;
  LN([[px, dy + dh], [px, dBotY]], '#555', 2.2);
  CI(px, dBotY, 2.8, '#555');
  TX(px, dBotY + 17, nm, { a: 'middle', sz: 10.5, c: '#555', m: 1, w: 700 });
  LN([[px, dBotY], [px, ry + 26], [rX + rW / 2, ry + 26]], P, 2);
});
/* 位选 DIG1-4 */
['DIG1', 'DIG2', 'DIG3', 'DIG4'].forEach((nm, k) => {
  const px = dx + 26 + (k + 2) * dPitch;
  LN([[px, dy + dh], [px, dBotY + 44]], O, 2.4);
  CI(px, dBotY + 44, 3, O);
  TX(px, dBotY + 62, nm, { a: 'middle', sz: 9.5, c: O, m: 1 });
  TX(px, dBotY + 78, 'A' + (k + 2), { a: 'middle', sz: 12, c: O, w: 700 });
});
TX(dx + dw / 2, dBotY + 100, '位选不串电阻', { a: 'middle', sz: 10, c: MUT });

/* ══════════ 保护件 ══════════ */
RC(40, 660, 540, 212, '#fbfbfb', '#dcdcdc', 1.6, 10);
TX(62, 690, '保护件接在哪', { sz: 16, w: 700 });
RC(62, 700, 120, 4, O);

/* D1 */
TX(62, 728, 'D1 · 1N4007', { sz: 13, w: 700 });
TX(62, 746, '反并联在泵两端', { sz: 11.5, c: MUT });
RC(64, 762, 52, 40, '#eef2f6', '#9fb3c4', 1.4, 5);
TX(90, 788, '泵', { a: 'middle', sz: 12 });
LN([[104, 774], [150, 774]], R, 3);
TX(112, 768, '+', { sz: 12, c: R, w: 700 });
LN([[104, 792], [150, 792]], K, 3);
TX(112, 808, '−', { sz: 12, c: K, w: 700 });
/* 二极管符号 */
push(`<path d="M 168 764 L 200 764 L 184 786 Z" fill="#fff" stroke="${K}" stroke-width="2.2"/>`);
push(`<line x1="204" y1="762" x2="204" y2="790" stroke="${K}" stroke-width="3.4"/>`);
LN([[204, 762], [204, 792]], K, 0);
LN([[184, 764], [184, 752], [150, 752], [150, 774]], K, 1.8);
LN([[184, 788], [184, 816], [150, 816], [150, 792]], K, 1.8);
TX(186, 748, '白环端 → 泵 +', { a: 'middle', sz: 11, c: O, w: 700 });
TX(186, 838, '另一端 → 泵 −', { a: 'middle', sz: 10.5, c: MUT });

/* C1 */
TX(300, 728, 'C1 · 1000μF / 25V', { sz: 13, w: 700 });
TX(300, 746, '并在 12V 电源两端', { sz: 11.5, c: MUT });
push(`<line x1="304" y1="774" x2="304" y2="816" stroke="${K}" stroke-width="3.4"/>`);
push(`<path d="M 326 774 A 14 21 0 0 1 326 816" fill="none" stroke="${K}" stroke-width="3.4"/>`);
TX(298, 768, '+', { sz: 14, c: O, w: 700 });
LN([[304, 774], [262, 774], [262, 756]], R, 2.4);
TX(262, 750, '+12V', { a: 'middle', sz: 10.5, c: R, w: 700 });
LN([[326, 774], [366, 774], [366, 756]], R, 2.4);
LN([[304, 816], [262, 816], [262, 838]], K, 2.4);
LN([[326, 816], [366, 816], [366, 838]], K, 2.4);
TX(366, 852, 'GND', { a: 'middle', sz: 10.5, c: K, w: 700 });
TX(314, 866, '长脚接 +12V，白条侧接 GND', { a: 'middle', sz: 10.5, c: MUT });

/* ══════════ 速查表 ══════════ */
RC(600, 660, 600, 212, '#fbfbfb', '#dcdcdc', 1.6, 10);
TX(622, 690, '这个芯片怎么动', { sz: 16, w: 700 });
RC(622, 700, 110, 4, O);

const rows = [
  ['SER', 'D11', '数据一位一位进', B],
  ['SRCLK', 'D12', '每来一个上升沿，数据移一位', B],
  ['RCLK', 'D13', '拉一下，8 位同时送到 QA–QH', B],
  ['QA–QH', '8 段', '经 220Ω 到 a b c d e f g dp', P],
  ['OE', 'GND', '接高就关输出，必须接地', K],
  ['SRCLR', '5V', '接低就清零，必须接 5V', R],
  ['QH′', '不用', '级联下一片时才用', MUT],
];
let ty = 726;
rows.forEach(([a, b, c, col]) => {
  TX(622, ty, a, { sz: 11.5, c: col, w: 700, m: 1 });
  TX(700, ty, b, { sz: 11.5, c: col, m: 1 });
  TX(762, ty, c, { sz: 11.5, c: K });
  ty += 22;
});
TX(622, 858, '最常错的两个：10 SRCLR 忘了接 5V、13 OE 忘了接地 —— 表现都是「全黑一位不亮」', { sz: 11, c: R, w: 700 });

/* ── 图例 ── */
let lx = 40;
[[R, '5V'], [K, 'GND'], [B, '控制信号'], [P, '段选'], [O, '位选']].forEach(([c, t]) => {
  LN([[lx, 886], [lx + 24, 886]], c, 3.4);
  TX(lx + 30, 890, t, { sz: 11.5, c: MUT });
  lx += 34 + t.length * 13 + 20;
});

push('</svg>');
fs.writeFileSync('E:/hardness/ricemix/demo/sch_595_detail.svg', s.join('\n'), 'utf8');
console.log('written');
