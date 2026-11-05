/* 总图纸 v2 —— 两块面包板：大板只做显示模块，小板放电控 */
const fs = require('fs');

const W = 1600, H = 1240;
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
const LN = (x1, y1, x2, y2, c, w = 1, dash) =>
  push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
const RC = (x, y, w, h, f, st, sw = 1, rx = 0) =>
  push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}${rx ? ` rx="${rx}"` : ''}/>`);

TX(48, 52, '总图纸 · 两块面包板', { sz: 30, w: 700 });
TX(48, 80, '大板（830 孔）只放显示模块，小板（400 孔）放电控。两块各接各的，中间只走 5V 和 GND。', { sz: 14, c: MUT });
RC(48, 96, 280, 5, O);

/* 画一块面包板的通用函数 */
function board(bx, by, bw, bh, nCol, label, sub) {
  const cw = bw / nCol;
  RC(bx - 10, by - 10, bw + 20, bh + 20, '#F1EBDF', '#D9D0BE', 2, 6);
  const rh = 24;
  RC(bx, by + 6, bw, rh, '#FBE3E3', '#E8BFBF', 1.2, 3);
  RC(bx, by + 6 + rh + 7, bw, rh, '#E3EAF5', '#BFCBE8', 1.2, 3);
  RC(bx, by + bh - rh * 2 - 13, bw, rh, '#FBE3E3', '#E8BFBF', 1.2, 3);
  RC(bx, by + bh - rh - 6, bw, rh, '#E3EAF5', '#BFCBE8', 1.2, 3);
  const mid = by + bh / 2;
  RC(bx, mid - 14, bw, 28, '#E2D9C8', 'none', 0, 2);
  for (let i = 0; i <= nCol; i++) {
    const x = bx + i * cw;
    LN(x, by + rh + 36, x, by + bh - rh - 36, '#E6DFD2', 0.7);
  }
  const marks = [];
  for (let n = 1; n <= nCol; n += 5) marks.push(n);
  if (marks[marks.length - 1] !== nCol) marks.push(nCol);
  marks.forEach((n) => TX(bx + (n - 0.5) * cw, by + 22, n, { a: 'middle', sz: 11, c: '#9C9284', m: 1, w: 700 }));
  TX(bx + bw / 2, by - 52, label, { a: 'middle', sz: 17, w: 700 });
  TX(bx + bw / 2, by - 34, sub, { a: 'middle', sz: 11.5, c: MUT });
  return { cw, mid };
}

/* 器件块 */
function block(bx, cw, mid, c1, c2, nm, sub, hint, dark, light) {
  const x = bx + (c1 - 1) * cw + 3;
  const w = (c2 - c1 + 1) * cw - 6;
  RC(x, mid - 56, w, 108, light, dark, 2, 5);
  TX(x + w / 2, mid - 22, nm, { a: 'middle', sz: 15, c: dark, w: 700 });
  TX(x + w / 2, mid - 3, sub, { a: 'middle', sz: 10.5, c: MUT });
  TX(x + w / 2, mid + 18, `列 ${c1}–${c2}`, { a: 'middle', sz: 11, c: dark, m: 1, w: 700 });
  if (hint) TX(x + w / 2, mid + 40, hint, { a: 'middle', sz: 9.5, c: MUT });
}

/* ══════════ 大板：显示模块 ══════════ */
const GX = 320, GY = 190, GW = 900, GH = 290;
const g1 = board(GX, GY, GW, GH, 63, '大板 · 830 孔', '只放显示模块：595 + 8 个电阻 + 四位数码管');
block(GX, g1.cw, g1.mid, 4, 11, '74HC595', '移位寄存器', '缺口朝左', '#1E5FA8', '#E6EFF9');
block(GX, g1.cw, g1.mid, 14, 21, '8 只 220Ω', '段限流', '一只一个段', '#8A6A15', '#FBF3DF');
block(GX, g1.cw, g1.mid, 24, 40, '5461AS-1', '四位数码管', '跨中缝，丝印面朝你', '#7A2F8A', '#F3E8F7');

/* ══════════ 小板：电控 ══════════ */
const SX = 320, SY = 560, SW = 430, SH = 290;
const g2 = board(SX, SY, SW, SH, 30, '小板 · 400 孔', '电控区：称重 + 继电器');
block(SX, g2.cw, g2.mid, 4, 11, 'HX711', '称重模块', '脚朝上', '#2F7A5C', '#E8F5EF');
block(SX, g2.cw, g2.mid, 14, 25, '继电器', '单路光耦', 'IN 在左', '#C8342A', '#FBE9E7');

/* ══════════ Arduino ══════════ */
const AX = 48, AY = 190, AW = 210, AH = 380;
RC(AX, AY, AW, AH, '#2C6FB5', '#1B4E80', 2, 8);
TX(AX + AW / 2, AY + 32, 'Arduino', { a: 'middle', sz: 17, c: '#fff', w: 700 });
TX(AX + AW / 2, AY + 52, 'UNO R3', { a: 'middle', sz: 12, c: '#BFD9F2' });

const aPins = [
  ['5V', '#FF9E9E'], ['GND', '#D6D6D6'],
  ['A0', '#BFA8F0'], ['A1', '#BFA8F0'],
  ['A2', '#FFB870'], ['A3', '#FFB870'], ['A4', '#FFB870'], ['A5', '#FFB870'],
  ['D8', '#FFB870'],
  ['D11', '#8FC4F0'], ['D12', '#8FC4F0'], ['D13', '#8FC4F0'],
  ['D2–D5', '#8FC4F0'], ['D6 D7 D9 D10', '#8FC4F0'],
];
aPins.forEach(([nm, col], i) => {
  TX(AX + AW - 14, AY + 84 + i * 20, nm, { a: 'end', sz: 11, c: col, m: 1, w: 700 });
});

/* ══════════ 两个器件在板外 ══════════ */
function outside(x, y, w, h, title, sub, note, dark) {
  RC(x, y, w, h, '#F7F7F5', '#D8D4CC', 1.8, 6);
  TX(x + w / 2, y + 26, title, { a: 'middle', sz: 14, w: 700, c: dark });
  TX(x + w / 2, y + 45, sub, { a: 'middle', sz: 10.5, c: MUT });
  TX(x + w / 2, y + h - 12, note, { a: 'middle', sz: 10, c: MUT });
}
outside(1100, 190, 200, 100, '12V 1A 电源', '适配器', '+12V · GND', R);
outside(1100, 320, 200, 110, '12V 泵', 'AD20P-1230C', '接继电器 NO', O);
outside(1100, 560, 200, 200, '4×4 键盘', '不插面包板', 'R1–R4 → D2–D5', '#2F7A45');
outside(1100, 790, 200, 90, 'D1 / C1', '保护件', '泵与电源两端', K);

/* ══════════ 板间跳线 ══════════ */
/* 大板 → Arduino：595 三根 + 5V/GND */
const c2Ard = [[220, 'D11'], [244, 'D12'], [268, 'D13']];
c2Ard.forEach(([ay, nm]) => {
  LN(AX + AW, AY + 84 + aPins.findIndex((p) => p[0] === nm) * 20, GX - 12, 300, '#4A9BD8', 2.6, '7 4');
});
TX(GX - 12, 240, '595 三根 → D11 D12 D13', { a: 'end', sz: 10.5, c: B });

/* 小板 → Arduino：HX711 四根 + 继电器三根 */
LN(AX + AW, AY + 84 + 2 * 20, SX - 12, 620, '#8B6BD8', 2.6, '7 4');
TX(SX - 12, 612, 'HX711 → A0 A1 5V GND', { a: 'end', sz: 10.5, c: P });
LN(AX + AW, AY + 84 + 8 * 20, SX - 12, 720, '#E8A050', 2.6, '7 4');
TX(SX - 12, 712, '继电器 → D8 · DC+ · DC−', { a: 'end', sz: 10.5, c: O });

/* 两板之间：5V 与 GND */
LN(GX + GW + 10, 300, 1250, 300, R, 3);
LN(1250, 300, 1250, 512, R, 3);
LN(1250, 512, SX + SW + 10, 512, R, 3);
TX(1256, 400, '5V', { sz: 13, c: R, w: 700 });
LN(GX + GW + 10, 330, 1280, 330, K, 3);
LN(1280, 330, 1280, 532, K, 3);
LN(1280, 532, SX + SW + 10, 532, K, 3);
TX(1286, 440, 'GND', { sz: 13, c: K, w: 700 });

/* 继电器 → 泵 */
LN(SX + SW + 10, 780, 1060, 780, O, 2.4, '6 4');
LN(1060, 780, 1060, 400, O, 2.4, '6 4');
TX(1066, 600, 'NO → 泵 +', { sz: 10.5, c: O });

/* ══════════ 底部清单 ══════════ */
const LY = 940;
RC(48, LY, 1504, 260, '#FCFBF9', '#E2DDD3', 1.6, 10);
TX(70, LY + 30, '板的分配', { sz: 17, w: 700 });
RC(70, LY + 40, 110, 4, O);

const rows = [
  ['大板（830 孔）', '74HC595 · 8 只 220Ω · 5461AS-1', '#7A2F8A'],
  ['小板（400 孔）', 'HX711 · 单路继电器', '#C8342A'],
  ['不插板', 'Arduino · 4×4 键盘 · 12V 电源 · 泵 · D1 · C1', O],
];
let ry = LY + 72;
rows.forEach(([a, b, c]) => {
  TX(70, ry, a, { sz: 13.5, c, w: 700 });
  TX(240, ry, b, { sz: 13 });
  ry += 26;
});

TX(70, LY + 168, '两板之间只走两根：5V 和 GND。信号线各回各的 Arduino 脚，不串板。', { sz: 13, c: B, w: 700 });
TX(70, LY + 194, '大板独占显示，是因为数码管 12 个脚 + 8 个电阻 + 595 十六个脚，一块小板根本插不下。', { sz: 12.5, c: MUT });
TX(70, LY + 220, '泵走后端子不走面包板：继电器 COM ↔ 12V+，NO ↔ 泵+，泵− ↔ 12V−，12V− 还要接 Arduino GND。', { sz: 12.5, c: R, w: 700 });

push('</svg>');
fs.writeFileSync('E:/hardness/ricemix/demo/sch_board_overview.svg', s.join('\n'), 'utf8');
console.log('two boards written');
