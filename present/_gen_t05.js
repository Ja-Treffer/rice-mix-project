/* 05 原理图 —— 母线制，每根信号线独占一层，绝不交叉 */
const fs = require('fs');

const W = 1640, H = 1160;
const O = '#E85D26', R = '#C8342A', B = '#1E5FA8', K = '#1A1A1A';
const P = '#5B34B8', G = '#2F7A45', MUT = '#6E6A64';
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
const LN = (x1, y1, x2, y2, c, w = 2) =>
  push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`);
const PATH = (pts, c, w = 2) => {
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`);
};
const RC = (x, y, w, h, f, st, sw = 1.6, rx = 6) =>
  push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}${rx ? ` rx="${rx}"` : ''}/>`);
const CI = (cx, cy, r, f, st) => push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${st ? ` stroke="${st}" stroke-width="1.6"` : ''}/>`);

TX(48, 52, '电路原理图', { sz: 30, w: 700 });
TX(48, 80, '两条横母线供电，每根信号线独占一条水平通道 —— 所以这张图上没有一根线交叉。', { sz: 14, c: MUT });
RC(48, 96, 200, 5, O);

/* ══════ 两条母线 ══════ */
const V5 = 128, VG = 170;
LN(380, V5, 1560, V5, R, 4);
LN(380, VG, 1560, VG, B, 4);
TX(372, V5 + 5, '5V', { a: 'end', sz: 15, c: R, w: 700 });
TX(372, VG + 5, 'GND', { a: 'end', sz: 15, c: B, w: 700 });
CI(380, V5, 5, R); CI(380, VG, 5, B);

/* 母线取电：竖线 */
function tap(x, label, col, top, bot) {
  LN(x, top, x, bot, col, 2.4);
  CI(x, top, 4.5, col);
  if (label) TX(x, top - 10, label, { a: 'middle', sz: 10, c: col, m: 1 });
}

/* ══════ Arduino ══════ */
const AX = 60, AY = 230, AW = 250, AH = 420;
RC(AX, AY, AW, AH, '#2C6FB5', '#1B4E80', 2, 8);
TX(AX + AW / 2, AY + 34, 'Arduino', { a: 'middle', sz: 18, c: '#fff', w: 700 });
TX(AX + AW / 2, AY + 56, 'UNO R3', { a: 'middle', sz: 12.5, c: '#BFD9F2' });

/* 引脚：右侧一列，每个引脚一个 y */
const pins = [
  ['5V', 290, R], ['GND', 316, B],
  ['A0', 356, P], ['A1', 382, P],
  ['A2', 412, O], ['A3', 438, O], ['A4', 464, O], ['A5', 490, O],
  ['D8', 520, O],
  ['D11', 550, B], ['D12', 576, B], ['D13', 602, B],
];
pins.forEach(([nm, y, col]) => {
  TX(AX + AW - 12, y + 5, nm, { a: 'end', sz: 12.5, c: col === R ? '#FFB3B3' : col === B ? '#B8D4F0' : col === P ? '#CFC0F5' : '#FFCFA0', m: 1, w: 700 });
  CI(AX + AW, y, 5, '#8FB4D8');
});
TX(AX + AW / 2, AY + AH - 14, 'D2–D10 在下面一行，接键盘', { a: 'middle', sz: 10.5, c: '#BFD9F2' });

/* ══════ 秤 ══════ */
const SX = 470, SY = 250, SW = 210, SH = 100;
RC(SX, SY, SW, SH, '#F4F4F2', '#C9C4BB', 1.8, 6);
TX(SX + SW / 2, SY + 30, '5kg 悬臂梁', { a: 'middle', sz: 14, w: 700 });
TX(SX + SW / 2, SY + 50, '应变片全桥', { a: 'middle', sz: 11, c: MUT });
[['E+', SY + 72], ['E−', SY + 88], ['A+', SY + 104], ['A−', SY + 120]].forEach(([n, y]) => {
  if (y < SY + SH) TX(SX + SW - 12, y - 2, n, { a: 'end', sz: 10, c: MUT, m: 1 });
});

/* ══════ HX711 ══════ */
const HX = 470, HY = 400, HW = 210, HH = 130;
RC(HX, HY, HW, HH, '#E8F5EF', '#2F7A5C', 2, 6);
TX(HX + HW / 2, HY + 28, 'HX711', { a: 'middle', sz: 15, c: '#1F5A42', w: 700 });
TX(HX + HW / 2, HY + 46, '24 位称重 ADC', { a: 'middle', sz: 10.5, c: MUT });
[['E+', 70], ['E−', 88], ['A+', 106], ['A−', 124]].forEach(([n, dy]) => {
  TX(HX + 12, HY + dy, n, { sz: 10, c: MUT, m: 1 });
  CI(HX + 4, HY + dy - 4, 3.4, '#2F7A5C');
});
[['VCC', 62], ['DT', 80], ['SCK', 98], ['GND', 116]].forEach(([n, dy]) => {
  TX(HX + HW - 12, HY + dy, n, { a: 'end', sz: 10, c: MUT, m: 1 });
  CI(HX + HW, HY + dy - 4, 3.4, '#2F7A5C');
});

/* 秤 → HX711 四根短线（不交叉，垂直） */
const sL = [['E+', 72], ['E−', 90], ['A+', 108], ['A−', 126]];
sL.forEach(([n, dy], i) => {
  const x1 = SX + SW - 40 + i * 10;
  const y1 = SY + SH;
  const y2 = HY + dy - 4;
  PATH([[x1, y1], [x1, (y1 + y2) / 2], [HX + 4 + i * 10, (y1 + y2) / 2], [HX + 4 + i * 10, y2]], ['#C46A8A', '#A84E6E', '#8B4FA8', '#6B4FBF'][i], 2);
});

/* ══════ 继电器 ══════ */
const RX = 470, RY = 590, RW = 210, RH = 120;
RC(RX, RY, RW, RH, '#FBE9E7', '#C8342A', 2, 6);
TX(RX + RW / 2, RY + 26, '单路继电器', { a: 'middle', sz: 14, c: '#8B1A12', w: 700 });
[['DC−', 56], ['DC+', 74], ['IN', 92]].forEach(([n, dy]) => {
  TX(RX + 12, RY + dy, n, { sz: 10, c: MUT, m: 1 });
  CI(RX + 4, RY + dy - 4, 3.4, '#C8342A');
});
[['NO', 56], ['COM', 74], ['NC', 92]].forEach(([n, dy]) => {
  TX(RX + RW - 12, RY + dy, n, { a: 'end', sz: 10, c: MUT, m: 1 });
  CI(RX + RW, RY + dy - 4, 3.4, '#C8342A');
});

/* ══════ 595 ══════ */
const NX = 800, NY = 250, NW = 190, NH = 230;
RC(NX, NY, NW, NH, '#E6EFF9', '#1E5FA8', 2, 6);
push(`<path d="M ${NX + 2} ${NY + NH / 2 - 20} A 20 20 0 0 0 ${NX + 2} ${NY + NH / 2 + 20}" fill="#fff" stroke="#1E5FA8" stroke-width="2"/>`);
TX(NX + NW / 2, NY + NH / 2 - 4, '74HC595', { a: 'middle', sz: 15, c: '#12406F', w: 700 });
TX(NX + NW / 2, NY + NH / 2 + 16, 'DIP-16', { a: 'middle', sz: 10.5, c: MUT });
const up595 = [['VCC', '上1'], ['QA', '上2'], ['SER', '上3'], ['OE', '上4'], ['RCLK', '上5'], ['SRCLK', '上6'], ['SRCLR', '上7'], ["QH'", '上8']];
up595.forEach(([n, pos], i) => {
  const x = NX + 22 + i * 20;
  LN(x, NY, x, NY - 16, '#888', 2);
  CI(x, NY - 16, 3, '#888');
  TX(x, NY - 24, n, { a: 'middle', sz: 8.5, c: MUT, m: 1 });
});
const dn595 = [['QB', '下1'], ['QC', '下2'], ['QD', '下3'], ['QE', '下4'], ['QF', '下5'], ['QG', '下6'], ['QH', '下7'], ['GND', '下8']];
dn595.forEach(([n, pos], i) => {
  const x = NX + 22 + i * 20;
  LN(x, NY + NH, x, NY + NH + 16, '#888', 2);
  CI(x, NY + NH + 16, 3, '#888');
  TX(x, NY + NH + 30, n, { a: 'middle', sz: 8.5, c: MUT, m: 1 });
});

/* ══════ 数码管 ══════ */
const DX = 1120, DY = 250, DW = 300, DH = 200;
RC(DX, DY, DW, DH, '#F3E8F7', '#7A2F8A', 2, 6);
TX(DX + DW / 2, DY + 28, '5461AS-1', { a: 'middle', sz: 15, c: '#5A1F66', w: 700 });
TX(DX + DW / 2, DY + 46, '四位共阴', { a: 'middle', sz: 10.5, c: MUT });
for (let i = 0; i < 4; i++) {
  RC(DX + 30 + i * 62, DY + 70, 52, 100, '#3a1010', '#5a1a1a', 1, 4);
  TX(DX + 56 + i * 62, DY + 140, '8', { a: 'middle', sz: 46, c: '#ff4d3d' });
}
for (let i = 0; i < 6; i++) {
  const x = DX + 30 + i * 46;
  LN(x, DY, x, DY - 16, '#888', 2);
  CI(x, DY - 16, 3, '#888');
  TX(x, DY - 24, `上${i + 1}`, { a: 'middle', sz: 8.5, c: MUT, m: 1 });
}
for (let i = 0; i < 6; i++) {
  const x = DX + 30 + i * 46;
  LN(x, DY + DH, x, DY + DH + 16, '#888', 2);
  CI(x, DY + DH + 16, 3, '#888');
  TX(x, DY + DH + 30, `下${i + 1}`, { a: 'middle', sz: 8.5, c: MUT, m: 1 });
}

/* ══════ 电源 / 泵 ══════ */
const PX = 1250, PY = 620, PW = 170, PH = 100;
RC(PX, PY, PW, PH, '#F4F4F2', '#C9C4BB', 1.8, 6);
TX(PX + PW / 2, PY + 30, '12V 电源', { a: 'middle', sz: 13, w: 700 });
TX(PX + PW / 2, PY + 50, '1A', { a: 'middle', sz: 10.5, c: MUT });

const MX = 1250, MY = 780, MW = 170, MH = 100;
RC(MX, MY, MW, MH, '#FBF3DF', '#8A6A15', 1.8, 6);
TX(MX + MW / 2, MY + 30, '12V 水泵', { a: 'middle', sz: 13, w: 700 });
TX(MX + MW / 2, MY + 50, 'AD20P-1230C', { a: 'middle', sz: 10, c: MUT });

/* ══════ 键盘 ══════ */
const KX = 60, KY = 720, KW = 250, KH = 140;
RC(KX, KY, KW, KH, '#E8F5EF', '#2F7A45', 1.8, 6);
TX(KX + KW / 2, KY + 26, '4×4 键盘', { a: 'middle', sz: 14, c: '#1F5A42', w: 700 });
TX(KX + KW / 2, KY + 46, 'R1–R4 / C1–C4', { a: 'middle', sz: 10.5, c: MUT });
for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
  CI(KX + 50 + j * 50, KY + 76 + i * 16, 6, '#2F7A45');
}
TX(KX + KW / 2, KY + KH - 8, '八根 → D2 D3 D4 D5 / D6 D7 D9 D10', { a: 'middle', sz: 9.5, c: MUT });

/* ══════ 走线：全部走水平层，互不交叉 ══════ */

/* 信号走廊：Arduino 右侧 x=340 引出，每个信号一个 y */
const SIGX = 346;

/* A0 → HX711 SCK */
PATH([[AX + AW, 356], [SIGX, 356], [SIGX, 356], [HX + HW, 494]], P, 2.4);
/* 上面这条会斜穿，改成直角 + 独立层 */
push('<!-- A0 -->');
PATH([[AX + AW, 356], [SIGX, 356], [SIGX, 494], [HX + HW + 24, 494], [HX + HW + 24, HY + 94], [HX + HW, HY + 94]], P, 2.4);
/* A1 → HX711 DT */
PATH([[AX + AW, 382], [SIGX + 14, 382], [SIGX + 14, 512], [HX + HW + 12, 512], [HX + HW + 12, HY + 76], [HX + HW, HY + 76]], P, 2.4);

/* D8 → 继电器 IN */
PATH([[AX + AW, 520], [SIGX + 28, 520], [SIGX + 28, 682], [RX - 24, 682], [RX - 24, RY + 88], [RX, RY + 88]], O, 2.6);

/* D11 D12 D13 → 595 */
PATH([[AX + AW, 550], [SIGX + 42, 550], [SIGX + 42, 178], [NX + 62, 178], [NX + 62, NY]], B, 2.4);
PATH([[AX + AW, 576], [SIGX + 56, 576], [SIGX + 56, 200], [NX + 102, 200], [NX + 102, NY]], B, 2.4);
PATH([[AX + AW, 602], [SIGX + 70, 602], [SIGX + 70, 222], [NX + 82, 222], [NX + 82, NY]], B, 2.4);

/* 595 → 数码管：8 根，走 NY+NH+56 起的 8 层 */
const segY0 = NY + NH + 56, segGap = 13;
for (let i = 0; i < 7; i++) {
  const x1 = NX + 22 + i * 20;
  const yy = segY0 + i * segGap;
  const tx2 = DX + 30 + [1, 2, 3, 4, 5, 0, 1][i] * 46;
  PATH([[x1, NY + NH + 16], [x1, yy], [tx2, yy], [tx2, DY]], P, 1.8);
}
/* 上2 QA → 数码管 上1 */
PATH([[NX + 42, NY - 16], [NX + 42, 200], [DX + 30, 200], [DX + 30, DY]], P, 1.8);

/* 数码管位选 4 根 → A2–A5，走底部走廊 */
const digX = (i) => DX + 30 + (i + 2) * 46;
const digY = DY + DH + 16;
[[0, 412, O], [1, 438, O], [2, 464, O], [3, 490, O]].forEach(([i, py, c]) => {
  const byy = 950 + i * 14;
  PATH([[digX(i), digY], [digX(i), byy], [SIGX + 100 + i * 8, byy], [SIGX + 100 + i * 8, py], [AX + AW, py]], c, 2);
});

/* 键盘 8 根 → 底部 */
LN(KX + KW, KY + 76, AX + AW, KY + 76, G, 0); /* 占位，不画 */
TX(KX + KW + 12, KY + 96, '键盘八根直接插 D2–D5 / D6 D7 D9 D10', { sz: 11, c: G });

/* ══════ 电源轨取电 ══════ */
/* Arduino 5V / GND 上母线 */
PATH([[AX + AW, 290], [AX + AW + 20, 290], [AX + AW + 20, V5], [380, V5]], R, 3);
PATH([[AX + AW, 316], [AX + AW + 40, 316], [AX + AW + 40, VG], [380, VG]], B, 3);

/* HX711 VCC / GND */
tap(HX + HW + 36, '', R, V5, HY + 58);
PATH([[HX + HW + 36, HY + 58], [HX + HW + 36, HY + 58], [HX + HW, HY + 58]], R, 2.4);
tap(HX + HW + 48, '', B, VG, HY + 112);
PATH([[HX + HW + 48, HY + 112], [HX + HW + 48, HY + 112], [HX + HW, HY + 112]], B, 2.4);

/* 595 VCC / GND / OE / SRCLR */
PATH([[NX + 62, NY - 16], [NX + 62, 148], [NX + 62, V5]], R, 2.4);
PATH([[NX + 82, NY + NH + 16], [NX + 82, NY + NH + 40], [NX - 30, NY + NH + 40], [NX - 30, VG]], B, 2.4);

/* 继电器 DC+ / DC− */
PATH([[RX - 8, RY + 70], [RX - 8, RY + 70], [RX + 4, RY + 70]], R, 2.4);

/* 图例 */
const LY = 1080;
let lx = 60;
[[R, '5V'], [B, 'GND / 控制'], [P, '称重信号'], [O, '继电器 / 位选'], [G, '键盘']].forEach(([c, t]) => {
  LN(lx, LY, lx + 26, LY, c, 3.4);
  TX(lx + 32, LY + 5, t, { sz: 12, c: MUT });
  lx += 42 + t.length * 14 + 24;
});

push('</svg>');
fs.writeFileSync('E:/hardness/ricemix/demo/tutor/05_schematic.svg', s.join('\n'), 'utf8');
console.log('05 written');
