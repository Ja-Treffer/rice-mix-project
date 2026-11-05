/* 总图纸 —— 面包板俯视，所有器件按列号就位，一眼看到谁插哪 */
const fs = require('fs');

const W = 1600, H = 1080;
const O = '#E85D26', R = '#C8342A', B = '#1E5FA8', K = '#1A1A1A';
const P = '#5B34B8', MUT = '#6E6A64', LINE = '#CFC9BF';
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
const CI = (cx, cy, r, f, st, sw = 1) =>
  push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}/>`);

/* ── 标题 ── */
TX(48, 52, '总图纸 · 面包板怎么摆', { sz: 30, w: 700 });
TX(48, 80, '面包板横放，从左到右数 1–63 列。每个器件插在第几列已经写在块里，照着插进去就行。', { sz: 14, c: MUT });
RC(48, 96, 260, 5, O);

/* ══════════ 面包板 ══════════ */
const BX = 300, BY = 150, BW = 1020, BH = 300;
const nCol = 63, cw = BW / nCol;

/* 底板 */
RC(BX - 10, BY - 10, BW + 20, BH + 20, '#F1EBDF', '#D9D0BE', 2, 6);

/* 电源轨 */
const railH = 26;
RC(BX, BY + 6, BW, railH, '#FBE3E3', '#E8BFBF', 1.2, 3);
RC(BX, BY + 6 + railH + 8, BW, railH, '#E3EAF5', '#BFCBE8', 1.2, 3);
RC(BX, BY + BH - railH * 2 - 14, BW, railH, '#FBE3E3', '#E8BFBF', 1.2, 3);
RC(BX, BY + BH - railH - 6, BW, railH, '#E3EAF5', '#BFCBE8', 1.2, 3);

/* 中缝 */
const midY = BY + BH / 2;
RC(BX, midY - 16, BW, 32, '#E2D9C8', 'none', 0, 2);

/* 列线 + 列号 */
for (let i = 0; i <= nCol; i++) {
  const x = BX + i * cw;
  LN(x, BY + railH + 40, x, BY + BH - railH - 40, '#E6DFD2', 0.8);
}
[1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 63].forEach((n) => {
  const x = BX + (n - 0.5) * cw;
  TX(x, BY - 20, n, { a: 'middle', sz: 12, c: MUT, m: 1, w: 700 });
});
TX(BX - 18, BY - 20, '列', { a: 'end', sz: 12, c: MUT });

/* 行名 */
['a', 'b', 'c', 'd', 'e'].forEach((r, i) => {
  TX(BX - 12, BY + railH + 60 + i * ((BH / 2 - railH - 52) / 5), r, { a: 'end', sz: 10, c: '#B5AC9C', m: 1 });
});
['f', 'g', 'h', 'i', 'j'].forEach((r, i) => {
  TX(BX - 12, midY + 44 + i * ((BH / 2 - railH - 52) / 5), r, { a: 'end', sz: 10, c: '#B5AC9C', m: 1 });
});

/* 器件块 */
const dev = [
  [4, 11, 'HX711', '称重模块', '#2F7A5C', '#E8F5EF', '脚朝上（贴 a–e 行）'],
  [13, 17, '继电器', '单路光耦', '#C8342A', '#FBE9E7', 'IN 在左，NO/COM/NC 在右'],
  [20, 27, '74HC595', '移位寄存器', '#1E5FA8', '#E6EFF9', '缺口朝左（小圆点那端）'],
  [30, 41, '5461AS-1', '四位数码管', '#7A2F8A', '#F3E8F7', '跨中缝插，丝印面朝你'],
  [44, 51, '8 只 220Ω', '段限流', '#8A6A15', '#FBF3DF', '一只一个段，竖着排'],
];
dev.forEach(([c1, c2, nm, sub, dark, light, hint]) => {
  const x = BX + (c1 - 1) * cw + 3;
  const w = (c2 - c1 + 1) * cw - 6;
  RC(x, midY - 58, w, 112, light, dark, 2, 5);
  TX(x + w / 2, midY - 24, nm, { a: 'middle', sz: 15, c: dark, w: 700 });
  TX(x + w / 2, midY - 4, sub, { a: 'middle', sz: 10.5, c: MUT });
  TX(x + w / 2, midY + 18, `列 ${c1}–${c2}`, { a: 'middle', sz: 11, c: dark, m: 1, w: 700 });
  TX(x + w / 2, midY + 42, hint, { a: 'middle', sz: 9.5, c: MUT });
});

/* ══════════ 左：Arduino ══════════ */
const AX = 48, AY = 150, AW = 210, AH = 300;
RC(AX, AY, AW, AH, '#2C6FB5', '#1B4E80', 2, 8);
TX(AX + AW / 2, AY + 34, 'Arduino', { a: 'middle', sz: 17, c: '#fff', w: 700 });
TX(AX + AW / 2, AY + 54, 'UNO R3', { a: 'middle', sz: 12, c: '#BFD9F2' });

const aPins = [
  ['5V', '#FF9E9E'], ['GND', '#D6D6D6'], ['A0', '#BFA8F0'], ['A1', '#BFA8F0'], ['A2', '#FFB870'], ['A3', '#FFB870'], ['A4', '#FFB870'], ['A5', '#FFB870'],
  ['D2–D5', '#8FC4F0'], ['D6 D7 D9 D10', '#8FC4F0'], ['D8', '#FFB870'], ['D11', '#8FC4F0'], ['D12', '#8FC4F0'], ['D13', '#8FC4F0'],
];
aPins.forEach(([nm, col], i) => {
  const y = AY + 84 + i * 15;
  TX(AX + AW - 14, y, nm, { a: 'end', sz: 10.5, c: col, m: 1, w: 700 });
});

/* ══════════ 右：电源 + 泵 ══════════ */
const PX = 1360, PY = 170;
RC(PX, PY, 190, 92, '#F5F1EA', '#D8D0C2', 1.8, 6);
TX(PX + 95, PY + 30, '12V 1A', { a: 'middle', sz: 15, w: 700 });
TX(PX + 95, PY + 50, '电源适配器', { a: 'middle', sz: 11, c: MUT });
TX(PX + 95, PY + 74, '+12V   ·   GND', { a: 'middle', sz: 11, c: R, m: 1 });

RC(PX, PY + 140, 190, 110, '#F0F0F0', '#D0D0D0', 1.8, 6);
TX(PX + 95, PY + 172, '12V 泵', { a: 'middle', sz: 15, w: 700 });
TX(PX + 95, PY + 192, 'AD20P-1230C', { a: 'middle', sz: 10.5, c: MUT });
LN(PX + 95, PY + 206, PX + 95, PY + 236, '#888', 2.4);
TX(PX + 95, PY + 250, '接继电器 NO', { a: 'middle', sz: 10.5, c: O });

/* ══════════ 键盘（面包板外） ══════════ */
const KX = 300, KY = 560, KW = 240, KH = 200;
RC(KX, KY, KW, KH, '#2F7A45', '#1E5C31', 2, 8);
TX(KX + KW / 2, KY + 26, '4×4 键盘', { a: 'middle', sz: 15, c: '#fff', w: 700 });
TX(KX + KW / 2, KY + 44, '不插面包板', { a: 'middle', sz: 10.5, c: '#BEE6CB' });
for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
  RC(KX + 26 + c * 50, KY + 62 + r * 32, 40, 24, '#1B1B1B', '#000', 1, 3);
  TX(KX + 46 + c * 50, KY + 79 + r * 32, 'S' + (r * 4 + c + 1), { a: 'middle', sz: 9, c: '#bbb', m: 1 });
}
TX(KX + KW / 2, KY + KH - 12, '8 根杜邦线直连 D2–D10', { a: 'middle', sz: 10.5, c: '#BEE6CB' });

/* ══════════ 下方：接线清单 ══════════ */
const LY = 810;
RC(48, LY, 1504, 230, '#FCFBF9', '#E2DDD3', 1.6, 10);
TX(70, LY + 30, '六组线，一组一组接', { sz: 17, w: 700 });
RC(70, LY + 40, 120, 4, O);

const groups = [
  ['① 秤的四根', 'HX711 的 E+ E− A− A+ → 悬臂梁四根（同色对同色）', '#2F7A5C'],
  ['② HX711 到主板', 'VCC→5V　GND→GND　DT→A1　SCK→A0', '#2F7A5C'],
  ['③ 继电器到主板', 'VCC→5V　GND→GND　IN→D8', '#C8342A'],
  ['④ 595 到主板', '16→5V　8→GND　13→GND　10→5V　14→D11　11→D12　12→D13', '#1E5FA8'],
  ['⑤ 595 到数码管', 'QA→a　QB→b　QC→c　QD→d　QE→e　QF→f　QG→g　QH→dp（每根串 220Ω）', '#7A2F8A'],
  ['⑥ 位选与键盘', 'DIG1–4→A2–A5（不串电阻）；键盘 R1–R4→D2–D5，C1–C4→D6 D7 D9 D10', O],
];
let gy = LY + 72;
groups.forEach(([t, d, c]) => {
  TX(70, gy, t, { sz: 13.5, c, w: 700 });
  TX(240, gy, d, { sz: 13, c: K });
  gy += 26;
});

TX(70, LY + 214, '泵不走面包板：继电器 COM ↔ 12V+，NO ↔ 泵+，泵− ↔ 12V−，12V− 还要接 Arduino GND。', { sz: 12.5, c: R, w: 700 });

push('</svg>');
fs.writeFileSync('E:/hardness/ricemix/demo/sch_board_overview.svg', s.join('\n'), 'utf8');
console.log('overview written');
