const fs = require('fs');
const F = 'E:/hardness/ricemix/present/_gen_t05b.js';
let s = fs.readFileSync(F, 'utf8');
const P = [];
const R = (a, b) => P.push([a, b]);

/* 1) 删掉 595 上方的说明框（信息已在引脚标签上，腾出空间） */
const boxStart = s.indexOf("RC(890, 160, 470, 150, '#F8FBFF'");
const boxEnd = s.indexOf("/* ══════════ 数码管 ══════════ */");
if (boxStart > 0 && boxEnd > boxStart) {
  s = s.slice(0, boxStart) + s.slice(boxEnd);
  console.log('说明框已删');
}

/* 2) 595 上排只留「上1..上8」，脚名缩小到 7pt 并上移，避免挤 */
R("  TX(x, NY - 8, nm, { a: 'middle', sz: 8, c: MUT, m: 1 });\n  TX(x, NY - 22, pos, { a: 'middle', sz: 9.5, c: K, w: 700 });",
  "  TX(x, NY - 6, nm, { a: 'middle', sz: 7, c: MUT, m: 1 });\n  TX(x, NY - 20, pos, { a: 'middle', sz: 10, c: K, w: 700 });");

/* 3) Arduino 高度收到 420，键盘下移，避开重叠 */
R("const AX = 60, AY = 200, AW = 250, AH = 480;", "const AX = 60, AY = 190, AW = 250, AH = 420;");
R("const KX2 = 60, KY2 = 620, KW2 = 240, KH2 = 110;", "const KX2 = 60, KY2 = 654, KW2 = 240, KH2 = 110;");

/* 4) Arduino 引脚整体上移 30，配合缩短的高度 */
R("const ap = [\n  ['5V', 300, R, '5V 母线'],\n  ['GND', 328, B, 'GND 母线'],\n  ['A0', 372, P, 'HX711 · SCK'],\n  ['A1', 400, P, 'HX711 · DT'],\n  ['A2', 436, O, '数码管 · 下3 (DIG1)'],\n  ['A3', 464, O, '数码管 · 下4 (DIG2)'],\n  ['A4', 492, O, '数码管 · 下5 (DIG3)'],\n  ['A5', 520, O, '数码管 · 下6 (DIG4)'],\n  ['D8', 556, O, '继电器 · IN'],\n  ['D11', 592, B, '595 · 上3 (SER)'],\n  ['D12', 620, B, '595 · 上6 (SRCLK)'],\n  ['D13', 648, B, '595 · 上5 (RCLK)'],\n];",
  "const ap = [\n  ['5V', 286, R, '5V 母线'],\n  ['GND', 312, B, 'GND 母线'],\n  ['A0', 350, P, 'HX711 · SCK'],\n  ['A1', 376, P, 'HX711 · DT'],\n  ['A2', 408, O, '数码管 · 下3 (DIG1)'],\n  ['A3', 434, O, '数码管 · 下4 (DIG2)'],\n  ['A4', 460, O, '数码管 · 下5 (DIG3)'],\n  ['A5', 486, O, '数码管 · 下6 (DIG4)'],\n  ['D8', 518, O, '继电器 · IN'],\n  ['D11', 550, B, '595 · 上3 (SER)'],\n  ['D12', 576, B, '595 · 上6 (SRCLK)'],\n  ['D13', 602, B, '595 · 上5 (RCLK)'],\n];");

/* 5) 595 / 数码管整体上移，给下方留白 */
R("const NX = 900, NY = 330, NW = 210, NH = 250;", "const NX = 900, NY = 300, NW = 210, NH = 250;");
R("const DX = 1180, DY = 330, DW = 330, DH = 230;", "const DX = 1180, DY = 300, DW = 330, DH = 230;");

/* 6) 数码管下方的说明卡下移到 600 以下 */
R("RC(1170, 600, 400, 118, '#FCF8FD', '#E4D3EC', 1.6, 6);", "RC(1170, 570, 400, 118, '#FCF8FD', '#E4D3EC', 1.6, 6);");
R("TX(1186, 624, '数码管十二个脚', { sz: 13, w: 700 });", "TX(1186, 594, '数码管十二个脚', { sz: 13, w: 700 });");
R("TX(1186, 646, '上1–上6 → 595 上2 / 下1 / 下2 / 下3 / 下4 / 下5', { sz: 11.5, c: P });", "TX(1186, 616, '上1–上6 → 595 上2 / 下1 / 下2 / 下3 / 下4 / 下5', { sz: 11.5, c: P });");
R("TX(1186, 668, '下1 下2 → 595 下6 / 下7', { sz: 11.5, c: P });", "TX(1186, 638, '下1 下2 → 595 下6 / 下7', { sz: 11.5, c: P });");
R("TX(1186, 690, '下3–下6 → Arduino A2 A3 A4 A5（不串电阻）', { sz: 11.5, c: O });", "TX(1186, 660, '下3–下6 → Arduino A2 A3 A4 A5（不串电阻）', { sz: 11.5, c: O });");
R("TX(1186, 710, '全部段线各串一个 220Ω', { sz: 11, c: MUT });", "TX(1186, 680, '全部段线各串一个 220Ω', { sz: 11, c: MUT });");

/* 7) 保护件卡移到 595 下方 */
R("const TXp = 900, TYp = 620, TWp = 220, THp = 130;", "const TXp = 900, TYp = 640, TWp = 300, THp = 130;");

/* 8) HX711 高度加大，让右侧四个标签不挤 */
R("const HX = 560, HY = 330, HW = 230, HH = 160;", "const HX = 560, HY = 330, HW = 240, HH = 170;");
R("const RX = 560, RY = 560, RW = 230, RH = 140;", "const RX = 560, RY = 560, RW = 240, RH = 150;");

let n = 0;
for (const [a, b] of P) { if (s.includes(a)) { s = s.split(a).join(b); n++; } else console.log('MISS:', a.slice(0, 44)); }
fs.writeFileSync(F, s, 'utf8');
console.log('applied', n, '/', P.length);
