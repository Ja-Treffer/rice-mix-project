/* 74HC595 俯视脚位图 —— 上排在物理上方，下排在物理下方，缺口在左 */
const fs = require('fs');

const W = 1240, H = 640;
const O = '#E85D26', R = '#C8342A', B = '#1E5FA8', K = '#1A1A1A';
const P = '#5B34B8', MUT = '#6E6A64';
const s = [];
const push = (x) => s.push(x);

push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);

const TX = (x, y, t, o = {}) => {
  const a = o.a || 'start', sz = o.sz || 13, c = o.c || K;
  const w = o.w ? ` font-weight="${o.w}"` : '';
  const f = o.m ? 'Consolas, Courier New, monospace' : 'Segoe UI, Arial, sans-serif';
  push(`<text x="${x}" y="${y}" fill="${c}" font-size="${sz}" font-family="${f}" text-anchor="${a}"${w}>${t}</text>`);
};
const LN = (pts, c, w = 2) => {
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`);
};
const RC = (x, y, w, h, f, st, sw = 1, rx = 0) =>
  push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}${rx ? ` rx="${rx}"` : ''}/>`);
const CI = (cx, cy, r, f, st, sw = 1) =>
  push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}/>`);

/* 标题 */
TX(40, 44, '74HC595 怎么数脚', { sz: 26, w: 700 });
TX(40, 70, '照片那样俯视看：缺口在左，上排 8 个、下排 8 个。每个脚下面写的是它接去 Arduino 的哪里。', { sz: 13, c: MUT });
RC(40, 84, 240, 4, O);

/* 芯片本体 */
const LX = 150, RX = 1090, TY = 210, BY = 420;
RC(LX, TY, RX - LX, BY - TY, '#2b2b2b', '#111', 2, 4);
/* 缺口：左边向内凹的半圆 */
push(`<path d="M ${LX + 2} ${TY + (BY - TY) / 2 - 26} A 26 26 0 0 0 ${LX + 2} ${TY + (BY - TY) / 2 + 26}" fill="#ffffff" stroke="#111" stroke-width="2"/>`);
CI(LX + 34, BY - 26, 6, '#ffffff');
TX((LX + RX) / 2, (TY + BY) / 2 - 4, '74HC595', { a: 'middle', sz: 26, c: '#ffffff', w: 700 });
TX((LX + RX) / 2, (TY + BY) / 2 + 20, 'DIP-16', { a: 'middle', sz: 12, c: '#9a9a9a' });
TX(LX + 26, (TY + BY) / 2 + 44, '1 脚在这头', { sz: 11, c: '#8a8a8a' });

/* 8 个脚的 x */
const n = 8, span = RX - LX, step = span / n;
const px = (i) => LX + step / 2 + i * step;

const upper = [
  [16, 'VCC', 'Arduino 5V', R],
  [15, 'QA', '数码管 a', P],
  [14, 'SER', 'Arduino D11', B],
  [13, 'OE', 'Arduino GND', K],
  [12, 'RCLK', 'Arduino D13', B],
  [11, 'SRCLK', 'Arduino D12', B],
  [10, 'SRCLR', 'Arduino 5V', R],
  [9, "QH'", '不接', MUT],
];
const lower = [
  [1, 'QB', '数码管 b', P],
  [2, 'QC', '数码管 c', P],
  [3, 'QD', '数码管 d', P],
  [4, 'QE', '数码管 e', P],
  [5, 'QF', '数码管 f', P],
  [6, 'QG', '数码管 g', P],
  [7, 'QH', '数码管 dp', P],
  [8, 'GND', 'Arduino GND', K],
];

/* 上排：脚向上伸 */
upper.forEach(([num, nm, to, col], i) => {
  const x = px(i);
  LN([[x, TY], [x, TY - 46]], '#777', 3);
  CI(x, TY - 46, 4, '#777');
  TX(x, TY + 20, num, { a: 'middle', sz: 11, c: '#b0b0b0', m: 1 });
  TX(x, TY - 62, nm, { a: 'middle', sz: 15, c: '#1A1A1A', w: 700 });
  push(`<rect x="${x - 52}" y="${TY - 118}" width="104" height="26" rx="4" fill="${col}1a" stroke="${col}" stroke-width="1.2"/>`);
  TX(x, TY - 100, to, { a: 'middle', sz: 11, c: col, w: 700 });
  LN([[x, TY - 92], [x, TY - 66]], col, 1.6);
});

/* 下排：脚向下伸 */
lower.forEach(([num, nm, to, col], i) => {
  const x = px(i);
  LN([[x, BY], [x, BY + 46]], '#777', 3);
  CI(x, BY + 46, 4, '#777');
  TX(x, BY - 10, num, { a: 'middle', sz: 11, c: '#b0b0b0', m: 1 });
  TX(x, BY + 70, nm, { a: 'middle', sz: 15, c: '#1A1A1A', w: 700 });
  push(`<rect x="${x - 52}" y="${BY + 84}" width="104" height="26" rx="4" fill="${col}1a" stroke="${col}" stroke-width="1.2"/>`);
  TX(x, BY + 102, to, { a: 'middle', sz: 11, c: col, w: 700 });
  LN([[x, BY + 66], [x, BY + 84]], col, 1.6);
});

/* 左侧说明 */
TX(40, TY - 100, '上排', { sz: 13, c: MUT, w: 700 });
TX(40, TY - 80, '从右往左', { sz: 11, c: MUT });
TX(40, TY - 64, '16 到 9', { sz: 11, c: MUT, m: 1 });

TX(40, BY + 60, '下排', { sz: 13, c: MUT, w: 700 });
TX(40, BY + 80, '从左往右', { sz: 11, c: MUT });
TX(40, BY + 96, '1 到 8', { sz: 11, c: MUT, m: 1 });

/* 底部三条要点 */
const FY = 560;
RC(40, FY, 1160, 0, 'none', '#e0e0e0', 1);
LN([[40, FY], [1200, FY]], '#e0e0e0', 1);
TX(40, FY + 26, '三个必接的：', { sz: 13, c: R, w: 700 });
TX(140, FY + 26, '16 VCC → 5V', { sz: 12, m: 1 });
TX(300, FY + 26, '10 SRCLR → 5V（接低就永远清零）', { sz: 12, m: 1 });
TX(630, FY + 26, '13 OE → GND（悬空就永远不输出）', { sz: 12, m: 1 });
TX(40, FY + 54, '一根线一根线接，接完一根在表格上划掉一行。', { sz: 12, c: MUT });

push('</svg>');
fs.writeFileSync('E:/hardness/ricemix/demo/sch_595_pinout.svg', s.join('\n'), 'utf8');
console.log('pinout written');
