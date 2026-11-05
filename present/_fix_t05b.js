const fs = require('fs');
const F = 'E:/hardness/ricemix/present/_gen_t05b.js';
let s = fs.readFileSync(F, 'utf8');
const P = [];
const R = (a, b) => P.push([a, b]);

/* 1) 删掉 Arduino 内部的键盘说明（键盘框里有） */
R("TX(AX + AW / 2, AY + AH - 16, 'D2 D3 D4 D5 → 键盘 R1–R4', { a: 'middle', sz: 10.5, c: '#BFD9F2' });\nTX(AX + AW / 2, AY + AH - 2, 'D6 D7 D9 D10 → 键盘 C1–C4', { a: 'middle', sz: 10.5, c: '#BFD9F2' });", "");

/* 2) 键盘下移 */
R("const KX2 = 60, KY2 = 654, KW2 = 240, KH2 = 110;", "const KX2 = 60, KY2 = 700, KW2 = 240, KH2 = 112;");

/* 3) 继电器右侧三个标签拉开 */
R("[['NO', 62, O, '泵 · 红线'], ['COM', 80, R, '12V · +12V'], ['NC', 98, MUT, '不接']].forEach(([n, dy, c, net]) => {",
  "[['NO', 56, O, '泵 · 红线'], ['COM', 88, R, '12V · +12V'], ['NC', 120, MUT, '不接']].forEach(([n, dy, c, net]) => {");
R("[['DC−', 62, B, 'GND 母线'], ['DC+', 80, R, '5V 母线'], ['IN', 98, O, 'Arduino · D8']].forEach(([n, dy, c, net]) => {",
  "[['DC−', 56, B, 'GND 母线'], ['DC+', 88, R, '5V 母线'], ['IN', 120, O, 'Arduino · D8']].forEach(([n, dy, c, net]) => {");
R("const RX = 560, RY = 560, RW = 240, RH = 150;", "const RX = 560, RY = 560, RW = 240, RH = 168;");

/* 4) 595 上排去掉脚名，只留位置号，标签高度加大 */
R("  TX(x, NY - 6, nm, { a: 'middle', sz: 7, c: MUT, m: 1 });\n  TX(x, NY - 20, pos, { a: 'middle', sz: 10, c: K, w: 700 });",
  "  TX(x, NY - 6, nm, { a: 'middle', sz: 6.4, c: MUT, m: 1 });\n  TX(x, NY - 21, pos, { a: 'middle', sz: 10, c: K, w: 700 });");

/* 5) 数码管说明卡下移，避开 595 下排 */
R("RC(1170, 570, 400, 118, '#FCF8FD', '#E4D3EC', 1.6, 6);", "RC(1170, 620, 400, 122, '#FCF8FD', '#E4D3EC', 1.6, 6);");
R("TX(1186, 594, '数码管十二个脚', { sz: 13, w: 700 });", "TX(1186, 644, '数码管十二个脚', { sz: 13, w: 700 });");
R("TX(1186, 616, '上1–上6 → 595 上2 / 下1 / 下2 / 下3 / 下4 / 下5', { sz: 11.5, c: P });", "TX(1186, 666, '上1–上6 → 595 上2 / 下1 / 下2 / 下3 / 下4 / 下5', { sz: 11.5, c: P });");
R("TX(1186, 638, '下1 下2 → 595 下6 / 下7', { sz: 11.5, c: P });", "TX(1186, 688, '下1 下2 → 595 下6 / 下7', { sz: 11.5, c: P });");
R("TX(1186, 660, '下3–下6 → Arduino A2 A3 A4 A5（不串电阻）', { sz: 11.5, c: O });", "TX(1186, 710, '下3–下6 → Arduino A2 A3 A4 A5（不串电阻）', { sz: 11.5, c: O });");
R("TX(1186, 680, '全部段线各串一个 220Ω', { sz: 11, c: MUT });", "TX(1186, 730, '全部段线各串一个 220Ω', { sz: 11, c: MUT });");

/* 6) 保护件卡下移到 740，避开继电器 */
R("const TXp = 900, TYp = 640, TWp = 300, THp = 130;", "const TXp = 900, TYp = 760, TWp = 300, THp = 130;");

/* 7) 悬臂梁右侧的两行说明上移，避开 595 上排标签 */
R("TX(SX + SW + 60, SY + 74, '同名对同名', { sz: 11, c: MUT });\nTX(SX + SW + 60, SY + 92, '接到 HX711 左边', { sz: 11, c: MUT });",
  "TX(SX + SW + 56, SY + 30, '同名对同名', { sz: 11, c: MUT });\nTX(SX + SW + 56, SY + 48, '接到 HX711 左边', { sz: 11, c: MUT });");

let n = 0;
for (const [a, b] of P) { if (s.includes(a)) { s = s.split(a).join(b); n++; } else console.log('MISS:', a.slice(0, 44)); }
fs.writeFileSync(F, s, 'utf8');
console.log('applied', n, '/', P.length);
