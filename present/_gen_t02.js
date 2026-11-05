/* 02 面包板怎么通 —— 三张局部图讲清三条规则 */
const fs = require('fs');

const W = 1400, H = 930;
const O = '#E85D26', R = '#C8342A', B = '#1E5FA8', K = '#1A1A1A';
const GR = '#2F7A45', MUT = '#6E6A64', LINE = '#D8D4CE';
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
const LN = (x1, y1, x2, y2, c, w = 1, dash) =>
  push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
const RC = (x, y, w, h, f, st, sw = 1, rx = 0) =>
  push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}${rx ? ` rx="${rx}"` : ''}/>`);
const CI = (cx, cy, r, f, st) => push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${st ? ` stroke="${st}" stroke-width="1.5"` : ''}/>`);

TX(48, 52, '面包板怎么通', { sz: 30, w: 700 });
TX(48, 80, '孔与孔之间只有三种关系。记住这三条，后面怎么插都不会错。', { sz: 14, c: MUT });
RC(48, 96, 200, 5, O);

/* ════════ 规则一：竖着 5 个孔通 ════════ */
TX(48, 148, '规则一 · 同一列的 5 个孔是通的', { sz: 19, w: 700 });
TX(48, 172, '上半部分标 a b c d e，这 5 个孔内部连在一起。下半部分 f g h i j 同理。', { sz: 13, c: MUT });

const bx = 90, by = 200, cw = 44, rh = 34;
RC(bx - 20, by - 20, cw * 6 + 40, rh * 10 + 60, '#F1EBDF', '#D9D0BE', 2, 6);
['a', 'b', 'c', 'd', 'e'].forEach((r, i) => {
  TX(bx - 34, by + i * rh + 22, r, { a: 'end', sz: 12, c: MUT, m: 1 });
});
['f', 'g', 'h', 'i', 'j'].forEach((r, i) => {
  TX(bx - 34, by + (i + 5) * rh + 30, r, { a: 'end', sz: 12, c: MUT, m: 1 });
});
/* 凹槽 */
RC(bx - 10, by + rh * 5 - 2, cw * 6 + 20, 16, '#E2D9C8', 'none', 0, 3);

for (let c = 0; c < 6; c++) {
  for (let r = 0; r < 10; r++) {
    const x = bx + c * cw + cw / 2;
    const y = by + r * rh + 10 + (r >= 5 ? 16 : 0);
    const hi = (c === 1 && r < 5);
    CI(x, y, 7, hi ? '#FFD9C2' : '#EFE8DA', hi ? O : '#CFC6B6');
  }
}
/* 高亮第二列上半：一圈线连起来 */
const hx = bx + 1 * cw + cw / 2;
for (let r = 0; r < 4; r++) {
  const y1 = by + r * rh + 10, y2 = by + (r + 1) * rh + 10;
  LN(hx, y1, hx, y2, O, 3);
}
TX(bx + cw * 6 + 30, by + 60, '← 这一列的 5 个孔', { sz: 14, c: O, w: 700 });
TX(bx + cw * 6 + 30, by + 84, '   内部是连在一起的', { sz: 12.5, c: MUT });
TX(bx + cw * 6 + 30, by + 112, '   插进 a，从 e 也通', { sz: 12.5, c: MUT });

/* 右侧说明卡 */
RC(760, 190, 590, 200, '#FCFBF9', '#E2DDD3', 1.6, 8);
TX(786, 224, '怎么用这条', { sz: 15, w: 700 });
TX(786, 252, '· 一个器件插在 a–e 上，它的另外几个脚是通的。', { sz: 13 });
TX(786, 276, '· 一根线从 Arduino 过来，插这一列任意一孔都行。', { sz: 13 });
TX(786, 300, '· 5 个脚以上的器件（比如 595）要跨到下半部分，', { sz: 13 });
TX(786, 322, '  因为两排不连通。', { sz: 13, c: R });

/* ════════ 规则二：电源轨 ════════ */
TX(48, 640, '规则二 · 电源轨整条是通的', { sz: 19, w: 700 });
TX(48, 664, '板子上下各有两条带颜色的长条（红 / 蓝），同一颜色整条连在一起。', { sz: 13, c: MUT });
TX(48, 686, '', { sz: 12 });

const rx = 90, ry = 712;
RC(rx - 20, ry - 20, cw * 6 + 210, 128, '#F1EBDF', '#D9D0BE', 2, 6);
RC(rx, ry, cw * 6, 26, '#FBE3E3', '#E8BFBF', 1.2, 3);
RC(rx, ry + 34, cw * 6, 26, '#E3EAF5', '#BFCBE8', 1.2, 3);
for (let c = 0; c < 6; c++) {
  CI(rx + c * cw + cw / 2, ry + 13, 6, '#EFE0E0', '#D8AFAF');
  CI(rx + c * cw + cw / 2, ry + 47, 6, '#DDE4F1', '#A6B6D8');
}
LN(rx + 10, ry + 13, rx + cw * 6 - 10, ry + 13, R, 3);
LN(rx + 10, ry + 47, rx + cw * 6 - 10, ry + 47, B, 3);
TX(rx + cw * 6 + 18, ry + 18, '◀ 红条 = 5V', { sz: 13, c: R, w: 700 });
TX(rx + cw * 6 + 18, ry + 52, '◀ 蓝条 = GND', { sz: 13, c: B, w: 700 });

RC(760, 690, 590, 190, '#FCFBF9', '#E2DDD3', 1.6, 8);
TX(786, 722, '为什么要有它', { sz: 15, w: 700 });
TX(786, 750, '省线。5V 和 GND 各只需从 Arduino 引一根过来，', { sz: 13 });
TX(786, 772, '其他要用电的器件就近插到条上就行。', { sz: 13 });
TX(786, 802, '⚠ 830 孔的大板，红条中间会断一次（左右不通）。', { sz: 13, c: R, w: 700 });
TX(786, 824, '   接之前用万用表量一下，或者干脆左右各接一根。', { sz: 12.5, c: MUT });
TX(786, 856, '⚠ 红条和蓝条之间千万不能通，通了就是短路。', { sz: 13, c: R, w: 700 });

push('</svg>');
fs.writeFileSync('E:/hardness/ricemix/demo/tutor/02_breadboard.svg', s.join('\n'), 'utf8');
console.log('02 written');
