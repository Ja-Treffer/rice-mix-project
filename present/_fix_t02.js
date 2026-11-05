const fs = require('fs');
const F = 'E:/hardness/ricemix/present/_gen_t02.js';
let s = fs.readFileSync(F, 'utf8');
const P = [];
const R = (a, b) => P.push([a, b]);

R("const W = 1400, H = 1000;", "const W = 1400, H = 930;");
R("RC(1400, 1000, 0, 0, '#fff');", "");
R("TX(hx + 22, by + 2.4 * rh + 10, '插进 a，从 e 能通到', { sz: 13.5, c: O, w: 700 });\nTX(hx + 22, by + 2.4 * rh + 30, '这就是「一列通 5 个孔」', { sz: 12, c: MUT });",
  "TX(bx + cw * 6 + 30, by + 60, '← 这一列的 5 个孔', { sz: 14, c: O, w: 700 });\nTX(bx + cw * 6 + 30, by + 84, '   内部是连在一起的', { sz: 12.5, c: MUT });\nTX(bx + cw * 6 + 30, by + 112, '   插进 a，从 e 也通', { sz: 12.5, c: MUT });");
R("TX(rx + cw * 3, ry - 30, '红条 = 5V', { a: 'middle', sz: 13, c: R, w: 700 });",
  "TX(rx + cw * 3, ry + 18, '红条 = 5V', { a: 'middle', sz: 13, c: '#ffffff', w: 700 });");
R("TX(rx + cw * 3, ry + 78, '蓝条 = GND', { a: 'middle', sz: 13, c: B, w: 700 });",
  "TX(rx + cw * 3, ry + 52, '蓝条 = GND', { a: 'middle', sz: 13, c: '#ffffff', w: 700 });");
R("TX(48, 664, '板子上下各有两条带颜色的长条（红 / 蓝），同一颜色整条连在一起。', { sz: 13, c: MUT });",
  "TX(48, 664, '板子上下各有两条带颜色的长条（红 / 蓝），同一颜色整条连在一起。', { sz: 13, c: MUT });\nTX(48, 686, '', { sz: 12 });");
R("const rx = 90, ry = 700;", "const rx = 90, ry = 712;");
R("RC(rx - 20, ry - 20, cw * 6 + 40, 150, '#F1EBDF', '#D9D0BE', 2, 6);",
  "RC(rx - 20, ry - 20, cw * 6 + 40, 128, '#F1EBDF', '#D9D0BE', 2, 6);");
R("RC(760, 680, 590, 210, '#FCFBF9', '#E2DDD3', 1.6, 8);", "RC(760, 690, 590, 190, '#FCFBF9', '#E2DDD3', 1.6, 8);");
R("TX(786, 714, '为什么要有它', { sz: 15, w: 700 });", "TX(786, 722, '为什么要有它', { sz: 15, w: 700 });");
R("TX(786, 742, '省线。5V 和 GND 各只需从 Arduino 引一根过来，', { sz: 13 });", "TX(786, 750, '省线。5V 和 GND 各只需从 Arduino 引一根过来，', { sz: 13 });");
R("TX(786, 764, '其他要用电的器件就近插到条上就行。', { sz: 13 });", "TX(786, 772, '其他要用电的器件就近插到条上就行。', { sz: 13 });");
R("TX(786, 794, '⚠ 830 孔的大板，红条中间会断一次（左右不通）。', { sz: 13, c: R, w: 700 });", "TX(786, 802, '⚠ 830 孔的大板，红条中间会断一次（左右不通）。', { sz: 13, c: R, w: 700 });");
R("TX(786, 816, '   接之前用万用表量一下，或者干脆左右各接一根。', { sz: 12.5, c: MUT });", "TX(786, 824, '   接之前用万用表量一下，或者干脆左右各接一根。', { sz: 12.5, c: MUT });");
R("TX(786, 850, '⚠ 红条和蓝条之间千万不能通，通了就是短路。', { sz: 13, c: R, w: 700 });", "TX(786, 856, '⚠ 红条和蓝条之间千万不能通，通了就是短路。', { sz: 13, c: R, w: 700 });");

let n = 0;
for (const [a, b] of P) { if (s.includes(a)) { s = s.split(a).join(b); n++; } else console.log('MISS:', a.slice(0, 40)); }
fs.writeFileSync(F, s, 'utf8');
console.log('applied', n, '/', P.length);
