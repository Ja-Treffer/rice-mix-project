/* 接线表 —— 不画符号，一行一根线，照着接就行 */
const fs = require('fs');

const W = 1400, H = 940;
const O = '#E85D26', R = '#C8342A', B = '#1E5FA8', K = '#1A1A1A';
const P = '#5B34B8', MUT = '#6E6A64', LINE = '#D8D4CE', HEAD = '#F4F1EC';
const s = [];
const push = (x) => s.push(x);

push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);

const TX = (x, y, t, o = {}) => {
  const a = o.a || 'start', sz = o.sz || 14, c = o.c || K;
  const w = o.w ? ` font-weight="${o.w}"` : '';
  const f = o.m ? 'Consolas, Courier New, monospace' : 'Segoe UI, Arial, sans-serif';
  push(`<text x="${x}" y="${y}" fill="${c}" font-size="${sz}" font-family="${f}" text-anchor="${a}"${w}>${t}</text>`);
};
const LN = (x1, y1, x2, y2, c = LINE, w = 1) =>
  push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/>`);
const RC = (x, y, w, h, f, st, sw = 1) =>
  push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}/>`);

/* ── 标题 ── */
TX(40, 52, '接线表', { sz: 30, w: 700 });
TX(40, 80, '一行就是一根线。从左栏的脚，接到右栏的东西。表格从上往下一行一行接，不会错。', { sz: 14.5, c: MUT });
RC(40, 94, 200, 5, O);

/* ══════════════════ 表 1：74HC595 十六个脚 ══════════════════ */
const T1X = 40, T1Y = 120, T1W = 660;
const c1 = [T1X, T1X + 54, T1X + 150, T1X + 470];

RC(T1X, T1Y, T1W, 44, HEAD, LINE);
TX(T1X + 12, T1Y + 29, '脚', { sz: 15, w: 700 });
TX(T1X + 54 + 12, T1Y + 29, '名称', { sz: 15, w: 700 });
TX(T1X + 150 + 12, T1Y + 29, '接到哪里', { sz: 15, w: 700 });
TX(T1X + 470 + 10, T1Y + 29, '注意', { sz: 15, w: 700, c: R });

const t1 = [
  ['1', 'QB', '数码管 b 段 —— 中间串 220Ω', '', P],
  ['2', 'QC', '数码管 c 段 —— 中间串 220Ω', '', P],
  ['3', 'QD', '数码管 d 段 —— 中间串 220Ω', '', P],
  ['4', 'QE', '数码管 e 段 —— 中间串 220Ω', '', P],
  ['5', 'QF', '数码管 f 段 —— 中间串 220Ω', '', P],
  ['6', 'QG', '数码管 g 段 —— 中间串 220Ω', '', P],
  ['7', 'QH', '数码管 dp 段 —— 中间串 220Ω', '', P],
  ['8', 'GND', '面包板 GND 蓝轨（共地）', '', K],
  ['9', "QH'", '不接（只有串第二片时才用）', '', MUT],
  ['10', 'SRCLR', '面包板 5V 红轨', '不接就一直清零', R],
  ['11', 'SRCLK', 'Arduino D12', '', B],
  ['12', 'RCLK', 'Arduino D13', '', B],
  ['13', 'OE', '面包板 GND 蓝轨', '不接就一位都不亮', R],
  ['14', 'SER', 'Arduino D11', '', B],
  ['15', 'QA', '数码管 a 段 —— 中间串 220Ω', '', P],
  ['16', 'VCC', '面包板 5V 红轨', '', R],
];
let y = T1Y + 44;
t1.forEach(([n, nm, to, warn, col], i) => {
  const h = 34;
  if (i % 2 === 1) RC(T1X, y, T1W, h, '#FBFAF8');
  TX(T1X + 12, y + 23, n, { sz: 14, m: 1, c: MUT });
  TX(T1X + 54 + 12, y + 23, nm, { sz: 14.5, m: 1, w: 700, c: col });
  TX(T1X + 150 + 12, y + 23, to, { sz: 14 });
  if (warn) TX(T1X + 470 + 10, y + 23, warn, { sz: 12.5, c: R, w: 700 });
  LN(T1X, y + h, T1X + T1W, y + h);
  y += h;
});
RC(T1X, T1Y, T1W, y - T1Y, 'none', '#B8B4AE', 1.2);
[54, 150, 470].forEach((dx) => LN(T1X + dx, T1Y, T1X + dx, y));
LN(T1X, T1Y + 44, T1X + T1W, T1Y + 44, '#B8B4AE', 1.2);

TX(T1X, y + 24, '芯片横放、缺口朝左：下排从左到右是 1–8，上排从左到右是 16–9。', { sz: 13, c: MUT });

/* ══════════════════ 右栏：表 2 数码管 ══════════════════ */
const T2X = 740, T2Y = 120, T2W = 620;
const d2 = [T2X, T2X + 90, T2X + 400];
RC(T2X, T2Y, T2W, 44, HEAD, LINE);
TX(T2X + 12, T2Y + 29, '哪一排', { sz: 15, w: 700 });
TX(T2X + 90 + 12, T2Y + 29, '这个脚', { sz: 15, w: 700 });
TX(T2X + 400 + 10, T2Y + 29, '接到哪里', { sz: 15, w: 700 });

const t2 = [
  ['上排', 'a', '595 的 15 脚 QA（串 220Ω）'],
  ['上排', 'b', '595 的 1 脚 QB（串 220Ω）'],
  ['上排', 'c', '595 的 2 脚 QC（串 220Ω）'],
  ['上排', 'd', '595 的 3 脚 QD（串 220Ω）'],
  ['上排', 'e', '595 的 4 脚 QE（串 220Ω）'],
  ['上排', 'f', '595 的 5 脚 QF（串 220Ω）'],
  ['下排', 'g', '595 的 6 脚 QG（串 220Ω）'],
  ['下排', 'dp', '595 的 7 脚 QH（串 220Ω）'],
  ['下排', 'DIG1', 'Arduino A2（不串电阻）'],
  ['下排', 'DIG2', 'Arduino A3（不串电阻）'],
  ['下排', 'DIG3', 'Arduino A4（不串电阻）'],
  ['下排', 'DIG4', 'Arduino A5（不串电阻）'],
];
y = T2Y + 44;
t2.forEach(([row, nm, to], i) => {
  const h = 34;
  if (i % 2 === 1) RC(T2X, y, T2W, h, '#FBFAF8');
  TX(T2X + 12, y + 23, row, { sz: 13, c: MUT });
  TX(T2X + 90 + 12, y + 23, nm, { sz: 15, m: 1, w: 700, c: /DIG/.test(nm) ? O : P });
  TX(T2X + 400 + 10, y + 23, to, { sz: 14 });
  LN(T2X, y + h, T2X + T2W, y + h);
  y += h;
});
RC(T2X, T2Y, T2W, y - T2Y, 'none', '#B8B4AE', 1.2);
[90, 400].forEach((dx) => LN(T2X + dx, T2Y, T2X + dx, y));
LN(T2X, T2Y + 44, T2X + T2W, T2Y + 44, '#B8B4AE', 1.2);

TX(T2X, y + 24, '数码管丝印面朝你：上排 6 个、下排 6 个，从左往右就是这个顺序。', { sz: 13, c: MUT });

/* ══════════════════ 右下：表 3 保护件 ══════════════════ */
const T3X = 740, T3Y = y + 48, T3W = 620;
TX(T3X, T3Y - 12, '二极管和电容（保护件，四根线）', { sz: 17, w: 700 });
RC(T3X, T3Y + 4, 120, 4, O);

const t3 = [
  ['D1 白环那一端', '泵的红线（泵 +）', '反并联'],
  ['D1 另一端', '泵的黑线（泵 −）', '反并联'],
  ['C1 长脚（+）', '12V 电源的 +12V', '并在电源两端'],
  ['C1 短脚（−，壳上白条）', '12V 电源的 GND', '并在电源两端'],
];
y = T3Y + 24;
t3.forEach(([a, b, note], i) => {
  const h = 34;
  if (i % 2 === 1) RC(T3X, y, T3W, h, '#FBFAF8');
  TX(T3X + 12, y + 23, a, { sz: 14, w: 700, c: i < 2 ? K : R });
  TX(T3X + 260, y + 23, b, { sz: 14 });
  TX(T3X + 500, y + 23, note, { sz: 12, c: MUT });
  LN(T3X, y + h, T3X + T3W, y + h);
  y += h;
});
RC(T3X, T3Y + 24, T3W, y - T3Y - 24, 'none', '#B8B4AE', 1.2);
[260, 500].forEach((dx) => LN(T3X + dx, T3Y + 24, T3X + dx, y));
LN(T3X, T3Y + 24, T3X + T3W, T3Y + 24, '#B8B4AE', 1.2);

TX(T3X, y + 26, 'D1 接反 → 等于短路，泵一开就打下继电器；C1 接反 → 会鼓包。', { sz: 13, c: R, w: 700 });
TX(T3X, y + 50, 'C1 长脚那条线上有个白条，白条那一侧是负极。', { sz: 13, c: MUT });

/* ── 底栏：Arduino 那一侧汇总 ── */
const BY = 838;
RC(40, BY, 1320, 76, HEAD, LINE);
TX(60, BY + 30, 'Arduino 这边一共用掉 12 个脚', { sz: 16, w: 700 });
TX(60, BY + 56, 'A0 → HX711 SCK　A1 → HX711 DT　D8 → 继电器 IN　D11 → 595 SER　D12 → 595 SRCLK　D13 → 595 RCLK　A2–A5 → 数码管 DIG1–4　D2–D5 → 键盘行　D6 D7 D9 D10 → 键盘列', { sz: 13, c: MUT });

push('</svg>');
fs.writeFileSync('E:/hardness/ricemix/demo/sch_595_detail.svg', s.join('\n'), 'utf8');
console.log('table version written');
