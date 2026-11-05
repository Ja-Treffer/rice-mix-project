const fs = require('fs');
const F = 'E:/hardness/ricemix/present/_gen_overview2.js';
let s = fs.readFileSync(F, 'utf8');
const P = [];
const R = (a, b) => P.push([a, b]);

/* 1) 标题与副标题上移，列号下移到板内 */
R("  TX(bx + bw / 2, by - 44, label, { a: 'middle', sz: 17, w: 700 });\n  TX(bx + bw / 2, by - 26, sub, { a: 'middle', sz: 11.5, c: MUT });",
  "  TX(bx + bw / 2, by - 52, label, { a: 'middle', sz: 17, w: 700 });\n  TX(bx + bw / 2, by - 34, sub, { a: 'middle', sz: 11.5, c: MUT });");
R("  marks.forEach((n) => TX(bx + (n - 0.5) * cw, by - 20, n, { a: 'middle', sz: 11, c: MUT, m: 1, w: 700 }));",
  "  marks.forEach((n) => TX(bx + (n - 0.5) * cw, by + 22, n, { a: 'middle', sz: 11, c: '#9C9284', m: 1, w: 700 }));");

/* 2) 两板之间的 5V/GND 改走中间横向走廊，不再绕右侧电源 */
R(`LN(GX + GW + 10, 230, 1090, 230, R, 3);
LN(1090, 230, 1090, 600, R, 3);
LN(1090, 600, SX + SW + 10, 600, R, 3);
TX(1096, 420, '5V', { sz: 12, c: R, w: 700 });
LN(GX + GW + 10, 262, 1060, 262, K, 3);
LN(1060, 262, 1060, 640, K, 3);
LN(1060, 640, SX + SW + 10, 640, K, 3);
TX(1066, 460, 'GND', { sz: 12, c: K, w: 700 });`,
`LN(GX + GW + 10, 300, 1250, 300, R, 3);
LN(1250, 300, 1250, 512, R, 3);
LN(1250, 512, SX + SW + 10, 512, R, 3);
TX(1256, 400, '5V', { sz: 13, c: R, w: 700 });
LN(GX + GW + 10, 330, 1280, 330, K, 3);
LN(1280, 330, 1280, 532, K, 3);
LN(1280, 532, SX + SW + 10, 532, K, 3);
TX(1286, 440, 'GND', { sz: 13, c: K, w: 700 });`);

/* 3) 继电器 → 泵：走板下方，避开键盘框 */
R("LN(SX + SW + 10, 700, 1100, 700, O, 2.4, '6 4');\nLN(1100, 700, 1100, 430, O, 2.4, '6 4');\nTX(1106, 520, 'NO → 泵 +', { sz: 10.5, c: O });",
  "LN(SX + SW + 10, 780, 1060, 780, O, 2.4, '6 4');\nLN(1060, 780, 1060, 400, O, 2.4, '6 4');\nTX(1066, 600, 'NO → 泵 +', { sz: 10.5, c: O });");

/* 4) Arduino 引线加粗 */
R("LN(AX + AW, AY + 84 + aPins.findIndex((p) => p[0] === nm) * 20, GX - 10, 250, '#8FC4F0', 2, '6 4');",
  "LN(AX + AW, AY + 84 + aPins.findIndex((p) => p[0] === nm) * 20, GX - 12, 300, '#4A9BD8', 2.6, '7 4');");
R("LN(AX + AW, AY + 84 + 2 * 20, SX - 10, 620, '#BFA8F0', 2, '6 4');",
  "LN(AX + AW, AY + 84 + 2 * 20, SX - 12, 620, '#8B6BD8', 2.6, '7 4');");
R("LN(AX + AW, AY + 84 + 8 * 20, SX - 10, 720, '#FFB870', 2, '6 4');",
  "LN(AX + AW, AY + 84 + 8 * 20, SX - 12, 720, '#E8A050', 2.6, '7 4');");

let n = 0;
for (const [a, b] of P) { if (s.includes(a)) { s = s.split(a).join(b); n++; } else console.log('MISS:', a.slice(0, 50)); }
fs.writeFileSync(F, s, 'utf8');
console.log('applied', n, '/', P.length);
