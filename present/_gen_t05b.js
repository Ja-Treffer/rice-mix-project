/* 05 原理图 v2 —— 网络标签制：不画长线，每根线两端各写一个标签，零交叉 */
const fs = require('fs');

const W = 1600, H = 1200;
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
const RC = (x, y, w, h, f, st, sw = 1.8, rx = 6) =>
  push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}${rx ? ` rx="${rx}"` : ''}/>`);
const CI = (cx, cy, r, f, st) => push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${st ? ` stroke="${st}" stroke-width="1.5"` : ''}/>`);

TX(48, 52, '电路原理图 · 网络标签版', { sz: 30, w: 700 });
TX(48, 80, '不画长线。每个引脚旁边挂一个标签，标签相同的两个脚就是接在一起的 —— 所以整张图零交叉。', { sz: 14, c: MUT });
RC(48, 96, 250, 5, O);

/* 引脚 + 标签：dir=1 向右出，-1 向左出 */
function pin(x, y, dir, net, color, opts = {}) {
  const len = opts.len || 26;
  const x2 = x + dir * len;
  LN(x, y, x2, y, color, 2.4);
  CI(x2, y, 3.6, color);
  TX(x2 + dir * 8, y + 5, net, { a: dir > 0 ? 'start' : 'end', sz: opts.sz || 11, c: color, m: 1, w: 700 });
}

/* ══════════ Arduino ══════════ */
const AX = 60, AY = 190, AW = 250, AH = 420;
RC(AX, AY, AW, AH, '#2C6FB5', '#1B4E80', 2, 8);
TX(AX + AW / 2, AY + 36, 'Arduino', { a: 'middle', sz: 19, c: '#fff', w: 700 });
TX(AX + AW / 2, AY + 58, 'UNO R3', { a: 'middle', sz: 12.5, c: '#BFD9F2' });

const ap = [
  ['5V', 286, R, '5V 母线'],
  ['GND', 312, B, 'GND 母线'],
  ['A0', 350, P, 'HX711 · SCK'],
  ['A1', 376, P, 'HX711 · DT'],
  ['A2', 408, O, '数码管 · 下3 (DIG1)'],
  ['A3', 434, O, '数码管 · 下4 (DIG2)'],
  ['A4', 460, O, '数码管 · 下5 (DIG3)'],
  ['A5', 486, O, '数码管 · 下6 (DIG4)'],
  ['D8', 518, O, '继电器 · IN'],
  ['D11', 550, B, '595 · 上3 (SER)'],
  ['D12', 576, B, '595 · 上6 (SRCLK)'],
  ['D13', 602, B, '595 · 上5 (RCLK)'],
];
ap.forEach(([nm, y, col, net]) => {
  TX(AX + AW - 40, y + 5, nm, { a: 'end', sz: 12.5, c: '#DCEBF8', m: 1, w: 700 });
  pin(AX + AW, y, 1, net, col, { len: 22 });
});


/* ══════════ 5kg 悬臂梁 ══════════ */
const SX = 560, SY = 170, SW = 230, SH = 120;
RC(SX, SY, SW, SH, '#F4F4F2', '#C9C4BB', 1.8, 6);
TX(SX + SW / 2, SY + 32, '5kg 悬臂梁', { a: 'middle', sz: 15, w: 700 });
TX(SX + SW / 2, SY + 52, '应变片全桥', { a: 'middle', sz: 11, c: MUT });
[['E+', 78, '#C46A8A'], ['E−', 96, '#A84E6E'], ['A+', 114, '#8B4FA8'], ['A−', 132, '#6B4FBF']].forEach(([n, dy, c]) => {
  TX(SX + 14, SY + dy, n, { sz: 11, c, m: 1, w: 700 });
  pin(SX + SW, SY + dy - 4, 1, n, c, { len: 18, sz: 10.5 });
});
TX(SX + SW + 56, SY + 30, '同名对同名', { sz: 11, c: MUT });
TX(SX + SW + 56, SY + 48, '接到 HX711 左边', { sz: 11, c: MUT });

/* ══════════ HX711 ══════════ */
const HX = 560, HY = 330, HW = 240, HH = 170;
RC(HX, HY, HW, HH, '#E8F5EF', '#2F7A5C', 2, 6);
TX(HX + HW / 2, HY + 28, 'HX711', { a: 'middle', sz: 15, c: '#1F5A42', w: 700 });
TX(HX + HW / 2, HY + 46, '24 位称重 ADC', { a: 'middle', sz: 10.5, c: MUT });
[['E+', 76, '#C46A8A'], ['E−', 94, '#A84E6E'], ['A+', 112, '#8B4FA8'], ['A−', 130, '#6B4FBF']].forEach(([n, dy, c]) => {
  TX(HX + 14, HY + dy, n, { sz: 11, c, m: 1, w: 700 });
  CI(HX, HY + dy - 4, 3.6, c);
});
[['VCC', 64, R, '5V 母线'], ['DT', 82, P, 'Arduino · A1'], ['SCK', 100, P, 'Arduino · A0'], ['GND', 118, B, 'GND 母线']].forEach(([n, dy, c, net]) => {
  TX(HX + HW - 14, HY + dy, n, { a: 'end', sz: 11, c, m: 1, w: 700 });
  pin(HX + HW, HY + dy - 4, 1, net, c, { len: 20, sz: 10.5 });
});

/* ══════════ 继电器 ══════════ */
const RX = 560, RY = 560, RW = 240, RH = 168;
RC(RX, RY, RW, RH, '#FBE9E7', '#C8342A', 2, 6);
TX(RX + RW / 2, RY + 30, '单路继电器', { a: 'middle', sz: 15, c: '#8B1A12', w: 700 });
[['DC−', 56, B, 'GND 母线'], ['DC+', 88, R, '5V 母线'], ['IN', 120, O, 'Arduino · D8']].forEach(([n, dy, c, net]) => {
  TX(RX + 14, RY + dy, n, { sz: 11, c, m: 1, w: 700 });
  pin(RX + RW, RY + dy - 4, 1, net, c, { len: 20, sz: 10.5 });
});
[['NO', 56, O, '泵 · 红线'], ['COM', 88, R, '12V · +12V'], ['NC', 120, MUT, '不接']].forEach(([n, dy, c, net]) => {
  TX(RX + RW - 14, RY + dy, n, { a: 'end', sz: 11, c, m: 1, w: 700 });
  if (c !== MUT) pin(RX + RW, RY + dy - 4, 1, net, c, { len: 20, sz: 10.5 });
  else TX(RX + RW + 34, RY + dy, '—', { sz: 12, c: MUT, a: 'middle' });
});

/* ══════════ 74HC595 ══════════ */
const NX = 900, NY = 300, NW = 210, NH = 250;
RC(NX, NY, NW, NH, '#E6EFF9', '#1E5FA8', 2, 6);
push(`<path d="M ${NX + 2} ${NY + NH / 2 - 18} A 18 18 0 0 0 ${NX + 2} ${NY + NH / 2 + 18}" fill="#fff" stroke="#1E5FA8" stroke-width="2"/>`);
TX(NX + NW / 2, NY + NH / 2 - 6, '74HC595', { a: 'middle', sz: 16, c: '#12406F', w: 700 });
TX(NX + NW / 2, NY + NH / 2 + 14, 'DIP-16', { a: 'middle', sz: 10.5, c: MUT });
TX(NX + NW / 2, NY + 24, '上排 ↑', { a: 'middle', sz: 10, c: MUT });
TX(NX + NW / 2, NY + NH - 10, '下排 ↓', { a: 'middle', sz: 10, c: MUT });

/* 上排 8 个：脚在顶上，标签向上 */
const upN = [['上1', 'VCC', R, '5V 母线'], ['上2', 'QA', P, '数码管 · 上1'], ['上3', 'SER', B, 'Arduino · D11'],
             ['上4', 'OE', B, 'GND 母线'], ['上5', 'RCLK', B, 'Arduino · D13'], ['上6', 'SRCLK', B, 'Arduino · D12'],
             ['上7', 'SRCLR', R, '5V 母线'], ['上8', "QH'", MUT, '']];
upN.forEach(([pos, nm, c, net], i) => {
  const x = NX + 22 + i * 24;
  TX(x, NY - 6, nm, { a: 'middle', sz: 6.4, c: MUT, m: 1 });
  TX(x, NY - 21, pos, { a: 'middle', sz: 10, c: K, w: 700 });
  if (net) {
    LN(x, NY, x, NY - 34, c, 2);
    CI(x, NY - 34, 3, c);
  } else {
    LN(x, NY, x, NY - 34, MUT, 1.6);
    TX(x, NY - 40, '不接', { a: 'middle', sz: 8.5, c: MUT });
  }
});
/* 上排标签竖排显示不了，改成引到左上方的一列 */
upN.forEach(([pos, nm, c, net], i) => {
  if (!net) return;
  const x = NX + 22 + i * 24;
  TX(x, NY - 48, '', { sz: 1 });
});

/* 下排 8 个 */
const dnN = [['下1', 'QB', P, '数码管 · 上2'], ['下2', 'QC', P, '数码管 · 上3'], ['下3', 'QD', P, '数码管 · 上4'],
             ['下4', 'QE', P, '数码管 · 上5'], ['下5', 'QF', P, '数码管 · 上6'], ['下6', 'QG', P, '数码管 · 下1'],
             ['下7', 'QH', P, '数码管 · 下2'], ['下8', 'GND', B, 'GND 母线']];
dnN.forEach(([pos, nm, c, net], i) => {
  const x = NX + 22 + i * 24;
  TX(x, NY + NH + 16, nm, { a: 'middle', sz: 8, c: MUT, m: 1 });
  TX(x, NY + NH + 30, pos, { a: 'middle', sz: 9.5, c: K, w: 700 });
  LN(x, NY + NH, x, NY + NH + 40, c, 2);
  CI(x, NY + NH + 40, 3, c);
});

/* 上排去向：单独列在芯片上方 */
/* ══════════ 数码管 ══════════ */
const DX = 1180, DY = 300, DW = 330, DH = 230;
RC(DX, DY, DW, DH, '#F3E8F7', '#7A2F8A', 2, 6);
TX(DX + DW / 2, DY + 26, '5461AS-1', { a: 'middle', sz: 16, c: '#5A1F66', w: 700 });
TX(DX + DW / 2, DY + 44, '四位共阴 · 12 脚', { a: 'middle', sz: 10.5, c: MUT });
for (let i = 0; i < 4; i++) {
  RC(DX + 26 + i * 70, DY + 62, 58, 110, '#3a1010', '#5a1a1a', 1, 4);
  TX(DX + 55 + i * 70, DY + 138, '8', { a: 'middle', sz: 50, c: '#ff4d3d' });
}
TX(DX + DW / 2, DY + DH - 12, '丝印面朝你', { a: 'middle', sz: 10, c: MUT });

/* 上排 6 个标签 */
[['上1', 'a', P], ['上2', 'b', P], ['上3', 'c', P], ['上4', 'd', P], ['上5', 'e', P], ['上6', 'f', P]].forEach(([pos, nm, c], i) => {
  const x = DX + 26 + i * 50;
  LN(x, DY, x, DY - 18, c, 2);
  CI(x, DY - 18, 3.4, c);
  TX(x, DY - 26, pos, { a: 'middle', sz: 10, c: K, w: 700 });
});
/* 下排 6 个标签 */
[['下1', 'g', P], ['下2', 'dp', P], ['下3', 'DIG1', O], ['下4', 'DIG2', O], ['下5', 'DIG3', O], ['下6', 'DIG4', O]].forEach(([pos, nm, c], i) => {
  const x = DX + 26 + i * 50;
  LN(x, DY + DH, x, DY + DH + 18, c, 2);
  CI(x, DY + DH + 18, 3.4, c);
  TX(x, DY + DH + 32, pos, { a: 'middle', sz: 10, c: K, w: 700 });
});

/* 数码管去向表 */
RC(1170, 620, 400, 122, '#FCF8FD', '#E4D3EC', 1.6, 6);
TX(1186, 644, '数码管十二个脚', { sz: 13, w: 700 });
TX(1186, 666, '上1–上6 → 595 上2 / 下1 / 下2 / 下3 / 下4 / 下5', { sz: 11.5, c: P });
TX(1186, 688, '下1 下2 → 595 下6 / 下7', { sz: 11.5, c: P });
TX(1186, 710, '下3–下6 → Arduino A2 A3 A4 A5（不串电阻）', { sz: 11.5, c: O });
TX(1186, 730, '全部段线各串一个 220Ω', { sz: 11, c: MUT });

/* ══════════ 电源 / 泵 / 保护件 ══════════ */
const PX = 60, PY = 840, PW = 240, PH = 100;
RC(PX, PY, PW, PH, '#F4F4F2', '#C9C4BB', 1.8, 6);
TX(PX + PW / 2, PY + 32, '12V 电源', { a: 'middle', sz: 14, w: 700 });
TX(PX + PW / 2, PY + 52, '1A 适配器', { a: 'middle', sz: 10.5, c: MUT });
pin(PX + PW, PY + 40, 1, '+12V → 继电器 COM', R, { len: 20, sz: 10.5 });
pin(PX + PW, PY + 68, 1, 'GND → 泵黑线 + Arduino GND', B, { len: 20, sz: 10.5 });

const MXp = 60, MYp = 970, MWp = 240, MHp = 100;
RC(MXp, MYp, MWp, MHp, '#FBF3DF', '#8A6A15', 1.8, 6);
TX(MXp + MWp / 2, MYp + 32, '12V 水泵', { a: 'middle', sz: 14, w: 700 });
TX(MXp + MWp / 2, MYp + 52, 'AD20P-1230C · 0.3A', { a: 'middle', sz: 10.5, c: MUT });
pin(MXp + MWp, MYp + 44, 1, '红线 → 继电器 NO', O, { len: 20, sz: 10.5 });
pin(MXp + MWp, MYp + 72, 1, '黑线 → 12V GND', K, { len: 20, sz: 10.5 });

const TXp = 900, TYp = 760, TWp = 300, THp = 130;
RC(TXp, TYp, TWp, THp, '#FCFBF9', '#D8D4CC', 1.8, 6);
TX(TXp + TWp / 2, TYp + 28, '保护件', { a: 'middle', sz: 14, w: 700 });
TX(TXp + 14, TYp + 52, 'D1 1N4007 反并联泵两端', { sz: 10.5, c: MUT });
TX(TXp + 14, TYp + 72, '　白环端 → 泵红线', { sz: 10.5 });
TX(TXp + 14, TYp + 92, '　另一端 → 泵黑线', { sz: 10.5 });
TX(TXp + 14, TYp + 114, 'C1 1000μF 并在 12V 两端', { sz: 10.5, c: MUT });

/* 键盘 */
const KX2 = 60, KY2 = 700, KW2 = 240, KH2 = 112;
RC(KX2, KY2, KW2, KH2, '#E8F5EF', '#2F7A45', 1.8, 6);
TX(KX2 + KW2 / 2, KY2 + 28, '4×4 键盘', { a: 'middle', sz: 14, c: '#1F5A42', w: 700 });
for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) CI(KX2 + 58 + j * 42, KY2 + 58 + i * 13, 5, '#2F7A45');
TX(KX2 + KW2 / 2, KY2 + KH2 - 6, '8 根 → D2–D5 / D6 D7 D9 D10', { a: 'middle', sz: 9.5, c: MUT });

/* 图例 */
const LY = 1140;
let lx = 60;
[[R, '5V'], [B, 'GND / 控制信号'], [P, '称重与段线'], [O, '继电器与位选'], [K, '12V 强电']].forEach(([c, t]) => {
  LN(lx, LY, lx + 28, LY, c, 3.4);
  TX(lx + 34, LY + 5, t, { sz: 12, c: MUT });
  lx += 44 + t.length * 15 + 26;
});

push('</svg>');
fs.writeFileSync('E:/hardness/ricemix/demo/tutor/05_schematic.svg', s.join('\n'), 'utf8');
console.log('05 v2 written');
