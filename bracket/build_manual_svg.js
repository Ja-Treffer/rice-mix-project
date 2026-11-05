/**
 * 手工版 1:1 模板图 —— 打印出来贴在砧板上，照着切、照着烫孔。
 * 输出：manual_template.svg（300×200mm 实际尺寸，打印务必选「实际大小 / 100%」）
 */
const fs = require('fs');
const path = require('path');

const R = '#e5484d';   // 切割/外形
const CUT = '#ff9f1c'; // 内部要切掉的
const H = '#4cc9f0';   // 孔位
const MUT = '#8fa6ba'; // 标注

const W = 300, D = 200;
const PAD = 26, TITLE = 14;
const SX = x => PAD + x;
const SY = y => PAD + TITLE + (D - y);   // y 轴翻转让图和实物同向

const P = [];
const el = s => P.push(s);
const r = n => Math.round(n * 100) / 100;
const rect = (x, y, w, h, o) => el(`<rect x="${r(SX(x))}" y="${r(SY(y + h))}" width="${r(w)}" height="${r(h)}" ${o}/>`);
const circ = (x, y, rr, o) => el(`<circle cx="${r(SX(x))}" cy="${r(SY(y))}" r="${r(rr)}" ${o}/>`);
const text = (x, y, s, o) => el(`<text x="${r(SX(x))}" y="${r(SY(y))}" ${o}>${s}</text>`);
const crossed = (x, y, rr) => {   // 孔位十字
  el(`<line x1="${r(SX(x) - rr - 1.6)}" y1="${r(SY(y))}" x2="${r(SX(x) + rr + 1.6)}" y2="${r(SY(y))}" stroke="${H}" stroke-width="0.25"/>`);
  el(`<line x1="${r(SX(x))}" y1="${r(SY(y) - rr - 1.6)}" x2="${r(SX(x))}" y2="${r(SY(y) + rr + 1.6)}" stroke="${H}" stroke-width="0.25"/>`);
};

/* 图幅 */
el(`<rect x="0" y="0" width="${W + PAD * 2}" height="${D + TITLE + PAD + 26}" fill="#0b1016"/>`);
el(`<text x="${PAD}" y="16" fill="#dbe7f0" font-size="7" font-weight="700" font-family="sans-serif">手工版模板 · 300 × 200 mm · 打印必须选「实际大小 / 100%」，用尺子量一下下框是不是正好 300mm</text>`);

/* 底板外框 */
rect(0, 0, W, D, `fill="none" stroke="${R}" stroke-width="0.6"`);

/* UNO */
rect(8, 8, 90, 70, `fill="none" stroke="${MUT}" stroke-width="0.3" stroke-dasharray="2 1.5"`);
text(12, 46, 'UNO 90×70', `fill="${MUT}" font-size="4.2"`);
[[8, 8], [74, 8], [8, 61.4], [74, 61.4]].forEach(([x, y]) => { circ(x + 8, y + 8.8, 1.6, `fill="none" stroke="${H}" stroke-width="0.4"`); crossed(x + 8, y + 8.8, 1.6); });

/* 继电器 */
rect(8, 90, 70, 50, `fill="none" stroke="${MUT}" stroke-width="0.3" stroke-dasharray="2 1.5"`);
text(12, 118, '继电器 70×50', `fill="${MUT}" font-size="4.2"`);
[[14, 100], [58, 100], [14, 120], [58, 120]].forEach(([x, y]) => { circ(x, y, 1.6, `fill="none" stroke="${H}" stroke-width="0.45"`); crossed(x, y, 1.6); });

/* 支座（在秤台投影内，虚线画） */
rect(160, 72.5, 60, 65, `fill="none" stroke="${CUT}" stroke-width="0.35" stroke-dasharray="3 2"`);
text(164, 108, '支座 60×65（叠两层）', `fill="${CUT}" font-size="4.2"`);

/* 秤台投影 */
rect(125, 35, 130, 130, `fill="none" stroke="${MUT}" stroke-width="0.3" stroke-dasharray="1.5 1.5"`);
text(128, 40, '秤台 130×130', `fill="${MUT}" font-size="4.2"`);

/* 秤台中孔 + 三个定位销 */
circ(190, 100, 2.25, `fill="none" stroke="${H}" stroke-width="0.5"`);
crossed(190, 100, 2.25);
[[190, 100 + 62], [190 - 62 * Math.sin(2 * Math.PI / 3), 100 + 62 * Math.cos(2 * Math.PI / 3)],
 [190 - 62 * Math.sin(4 * Math.PI / 3), 100 + 62 * Math.cos(4 * Math.PI / 3)]]
  .forEach(([x, y]) => { circ(x, y, 3, `fill="none" stroke="${H}" stroke-width="0.45"`); crossed(x, y, 3); });

/* 泵（竖放 37×66）+ 耳朵孔 */
rect(258, 5, 37, 66, `fill="none" stroke="${MUT}" stroke-width="0.3" stroke-dasharray="2 1.5"`);
text(261, 40, '泵 37×66', `fill="${MUT}" font-size="4"`);
circ(276.5, 2, 1.6, `fill="none" stroke="${H}" stroke-width="0.45"`); crossed(276.5, 2, 1.6);
circ(276.5, 74, 1.6, `fill="none" stroke="${H}" stroke-width="0.45"`); crossed(276.5, 74, 1.6);

/* 管架立杆孔 */
circ(283, 175, 3.5, `fill="none" stroke="${H}" stroke-width="0.5"`);
crossed(283, 175, 3.5);
text(266, 186, '管架 φ7', `fill="${H}" font-size="3.8"`);

/* 两个线槽 */
[[60, 170], [120, 170]].forEach(([x, y]) => { circ(x, y, 4.5, `fill="none" stroke="${H}" stroke-width="0.5"`); crossed(x, y, 4.5); });
text(48, 158, '线槽 φ9 ×2', `fill="${H}" font-size="3.8"`);

/* 尺寸标注 */
el(`<line x1="${SX(0)}" y1="${SY(0) + 8}" x2="${SX(W)}" y2="${SY(0) + 8}" stroke="${MUT}" stroke-width="0.25"/>`);
el(`<text x="${SX(W / 2) - 12}" y="${SY(0) + 12}" fill="${MUT}" font-size="5" font-family="sans-serif">300 mm</text>`);
el(`<line x1="${SX(W) + 10}" y1="${SY(0)}" x2="${SX(W) + 10}" y2="${SY(D)}" stroke="${MUT}" stroke-width="0.25"/>`);
el(`<text x="${SX(W) + 13}" y="${SY(D / 2)}" fill="${MUT}" font-size="5" font-family="sans-serif">200</text>`);

/* 图例 */
const LY = SY(0) + 18;
el(`<text x="${SX(0)}" y="${LY}" fill="${R}" font-size="4.2">━ 切穿（整块外形）</text>`);
el(`<text x="${SX(70)}" y="${LY}" fill="${H}" font-size="4.2">○ 烫孔，十字是孔心</text>`);
el(`<text x="${SX(160)}" y="${LY}" fill="${MUT}" font-size="4.2">┈ 虚线是零件占位，不切</text>`);
el(`<text x="${SX(0)}" y="${LY + 6}" fill="#5d7387" font-size="3.8">打印后先用尺子量下框，量到 300mm 才算对；贴在砧板上用锥子扎穿孔心定位，再烫孔</text>`);

el('</svg>');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W + PAD * 2}mm" height="${D + TITLE + PAD + 26}mm" viewBox="0 0 ${W + PAD * 2} ${D + TITLE + PAD + 26}">\n` + P.join('\n');
fs.writeFileSync(path.join(__dirname, 'manual_template.svg'), svg, 'utf8');
console.log('written: manual_template.svg');
