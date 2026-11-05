/* 03 十六步接线图 —— 4×4 网格，每格一步，只画这一步新加的东西 */
const fs = require('fs');

const W = 1640, H = 1350;
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
const LN = (x1, y1, x2, y2, c, w = 2.4, dash) =>
  push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
const PATH = (pts, c, w = 2.4) => {
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`);
};
const RC = (x, y, w, h, f, st, sw = 1.2, rx = 3) =>
  push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}${rx ? ` rx="${rx}"` : ''}/>`);
const CI = (cx, cy, r, f, st) => push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${st ? ` stroke="${st}" stroke-width="1"` : ''}/>`);

TX(48, 50, '接线 · 十六步', { sz: 30, w: 700 });
TX(48, 78, '一格一步。灰的是已经接好的，彩色的是这一步新加的。按编号顺序做，做完打勾。', { sz: 14, c: MUT });
RC(48, 94, 200, 5, O);

const CW = 388, CH = 286, GX2 = 48, GY2 = 128, GP = 12;
const cellAt = (i) => ({ x: GX2 + (i % 4) * (CW + GP), y: GY2 + Math.floor(i / 4) * (CH + GP) });

function step(i, title, hint, draw, accent) {
  const { x, y } = cellAt(i);
  RC(x, y, CW, CH, '#FCFBF9', '#E2DDD3', 1.4, 8);
  RC(x, y, CW, 30, accent, 'none', 0, 6);
  RC(x, y + 24, CW, 6, accent, 'none', 0, 0);
  TX(x + 14, y + 21, `${i + 1}`, { sz: 15, c: '#ffffff', w: 700, m: 1 });
  TX(x + 40, y + 21, title, { sz: 13.5, c: '#ffffff', w: 700 });
  draw(x, y + 30);
  TX(x + 14, y + CH - 12, hint, { sz: 10.5, c: MUT });
}

/* 简易板轮廓 */
function boardMini(x, y, w, h, cols) {
  RC(x, y, w, h, '#F1EBDF', '#D9D0BE', 1.2, 3);
  RC(x + 4, y + 3, w - 8, 8, '#FBE3E3', '#E8BFBF', 0.8, 2);
  RC(x + 4, y + h - 11, w - 8, 8, '#E3EAF5', '#BFCBE8', 0.8, 2);
  RC(x + 4, y + h / 2 - 5, w - 8, 10, '#E2D9C8', 'none', 0, 2);
  for (let i = 1; i < cols; i++) LN(x + (w / cols) * i, y + 14, x + (w / cols) * i, y + h - 14, '#E6DFD2', 0.5);
}
function arduinoMini(x, y, w, h) {
  RC(x, y, w, h, '#2C6FB5', '#1B4E80', 1.2, 3);
  TX(x + w / 2, y + h / 2 + 4, 'UNO', { a: 'middle', sz: 9.5, c: '#fff', w: 700 });
}

/* ① 摆位置 */
step(0, '摆位置', '大板在上、小板在下，中间留两指宽', (x, y) => {
  arduinoMini(x + 14, y + 24, 62, 150);
  boardMini(x + 96, y + 22, 250, 66, 26);
  TX(x + 221, y + 14, '大板 830', { a: 'middle', sz: 9, c: MUT });
  boardMini(x + 96, y + 116, 130, 66, 13);
  TX(x + 161, y + 108, '小板 400', { a: 'middle', sz: 9, c: MUT });
  RC(x + 250, y + 116, 100, 66, '#F7F7F5', '#D8D4CC', 1.2, 3);
  TX(x + 300, y + 152, '电源/泵', { a: 'middle', sz: 9, c: MUT });
  TX(x + 14, y + 196, '← Arduino', { sz: 8.5, c: '#2C6FB5' });
}, '#5A6570');

/* ② 两条地 */
step(1, '接两条地（最容易漏）', '两块板的地必须是同一个地', (x, y) => {
  arduinoMini(x + 14, y + 24, 62, 150);
  boardMini(x + 96, y + 22, 250, 66, 26);
  boardMini(x + 96, y + 116, 130, 66, 13);
  PATH([[x + 76, y + 150], [x + 86, y + 150], [x + 86, y + 149], [x + 96, y + 149]], K, 2.6);
  PATH([[x + 96, y + 149], [x + 88, y + 149], [x + 88, y + 31], [x + 96, y + 31]], K, 2.6);
  TX(x + 130, y + 200, 'GND → 小板蓝轨 → 大板蓝轨', { sz: 9.5, c: K, w: 700 });
}, '#1A1A1A');

/* ③ 5V */
step(2, '接 5V', '红轨和蓝轨之间千万不能通', (x, y) => {
  arduinoMini(x + 14, y + 24, 62, 150);
  boardMini(x + 96, y + 22, 250, 66, 26);
  boardMini(x + 96, y + 116, 130, 66, 13);
  PATH([[x + 76, y + 60], [x + 86, y + 60], [x + 86, y + 27], [x + 96, y + 27]], R, 2.6);
  PATH([[x + 96, y + 27], [x + 88, y + 27], [x + 88, y + 121], [x + 96, y + 121]], R, 2.6);
  TX(x + 130, y + 200, 'Arduino 5V → 两板红轨', { sz: 9.5, c: R, w: 700 });
}, '#C8342A');

/* ④ 插 HX711 */
step(3, '插 HX711', '小板 4–11 列，脚朝上', (x, y) => {
  boardMini(x + 96, y + 60, 200, 90, 20);
  RC(x + 116, y + 74, 90, 62, '#1F5A42', '#123A2B', 1.4, 3);
  TX(x + 161, y + 110, 'HX711', { a: 'middle', sz: 11, c: '#fff', w: 700 });
  for (let i = 0; i < 4; i++) { CI(x + 104, y + 88 + i * 14, 2.6, '#C9A227'); CI(x + 218, y + 88 + i * 14, 2.6, '#C9A227'); }
  TX(x + 116, y + 62, '列 4–11', { sz: 9, c: MUT });
}, '#2F7A5C');

/* ⑤ HX711 四线 */
step(4, 'HX711 四根到 Arduino', 'DT 和 SCK 接反不烧，但永远是 0', (x, y) => {
  arduinoMini(x + 14, y + 30, 62, 150);
  RC(x + 150, y + 60, 90, 62, '#1F5A42', '#123A2B', 1.4, 3);
  TX(x + 195, y + 96, 'HX711', { a: 'middle', sz: 10, c: '#fff', w: 700 });
  [[R, 'VCC→5V', 0], [P, 'DT→A1', 1], [G, 'SCK→A0', 2], [K, 'GND→GND', 3]].forEach(([c, n, i]) => {
    PATH([[x + 150, y + 74 + i * 14], [x + 120, y + 74 + i * 14], [x + 120, y + 60 + i * 18], [x + 76, y + 60 + i * 18]], c, 1.8);
    TX(x + 240, y + 74 + i * 14, n, { sz: 8.5, c });
  });
}, '#5B34B8');

/* ⑥ 继电器 + 三线 */
step(5, '插继电器，三根线', 'DC− 接 GND 不是 5V', (x, y) => {
  arduinoMini(x + 14, y + 30, 62, 150);
  RC(x + 150, y + 60, 110, 76, '#B8322A', '#8E1F18', 1.4, 3);
  RC(x + 166, y + 74, 50, 34, '#2C5FA8', '#1B3F70', 1, 2);
  RC(x + 156, y + 68, 12, 34, '#1E4B8C', 'none', 0, 1);
  RC(x + 244, y + 68, 12, 34, '#1E4B8C', 'none', 0, 1);
  [[K, 'DC−→GND', 0], [R, 'DC+→5V', 1], [O, 'IN→D8', 2]].forEach(([c, n, i]) => {
    PATH([[x + 150, y + 76 + i * 18], [x + 120, y + 76 + i * 18], [x + 120, y + 66 + i * 22], [x + 76, y + 66 + i * 22]], c, 1.8);
    TX(x + 262, y + 76 + i * 18, n, { sz: 8.5, c });
  });
}, '#C8342A');

/* ⑦ 秤四线 */
step(6, '秤的四根到 HX711', '同名对同名，接错秤会乱跳', (x, y) => {
  RC(x + 24, y + 60, 110, 34, '#C8CDD4', '#9AA1A9', 1.4, 3);
  for (let i = 0; i < 4; i++) RC(x + 100 + i * 8, y + 64, 5, 26, '#E8DFA8', '#B8A860', 0.8, 1);
  RC(x + 200, y + 60, 80, 70, '#1F5A42', '#123A2B', 1.4, 3);
  TX(x + 240, y + 100, 'HX711', { a: 'middle', sz: 9.5, c: '#fff', w: 700 });
  ['#C46A8A', '#A84E6E', '#8B4FA8', '#6B4FBF'].forEach((c, i) => {
    PATH([[x + 104 + i * 8, y + 90], [x + 104 + i * 8, y + 112 + i * 4], [x + 200, y + 112 + i * 4], [x + 200, y + 70 + i * 14]], c, 1.8);
  });
  TX(x + 24, y + 190, 'E+ E− A+ A− 一一对应', { sz: 9.5, c: P, w: 700 });
}, '#A84E6E');

/* ⑧ 插 595 */
step(7, '大板插 74HC595', '缺口朝左，左下角是 1 号', (x, y) => {
  boardMini(x + 40, y + 60, 300, 100, 30);
  RC(x + 110, y + 84, 160, 52, '#242424', '#000', 1.4, 3);
  push(`<path d="M ${x + 112} ${y + 110 - 10} A 10 10 0 0 0 ${x + 112} ${y + 110 + 10}" fill="#fff" stroke="#000" stroke-width="1.4"/>`);
  for (let i = 0; i < 8; i++) { LN(x + 126 + i * 18, y + 84, x + 126 + i * 18, y + 76, '#888', 2); LN(x + 126 + i * 18, y + 136, x + 126 + i * 18, y + 144, '#888', 2); }
  TX(x + 190, y + 114, '74HC595', { a: 'middle', sz: 11, c: '#fff', w: 700 });
  TX(x + 110, y + 68, '列 4–11', { sz: 9, c: MUT });
}, '#1E5FA8');

/* ⑨ 595 五线 */
step(8, '595 的七根线到 Arduino', '上4 和上7 漏了都不亮', (x, y) => {
  arduinoMini(x + 14, y + 30, 62, 150);
  RC(x + 150, y + 50, 150, 100, '#E6EFF9', '#1E5FA8', 1.4, 3);
  TX(x + 225, y + 104, '595', { a: 'middle', sz: 11, c: '#12406F', w: 700 });
  [[R, '上1→5V', 0], [B, '上3→D11', 1], [K, '上4→GND', 2], [B, '上5→D13', 3], [B, '上6→D12', 4], [R, '上7→5V', 5], [K, '下8→GND', 6]].forEach(([c, n, i]) => {
    const yy = y + 62 + i * 13;
    PATH([[x + 170, yy], [x + 120 + i * 3, yy], [x + 120 + i * 3, y + 58 + i * 17], [x + 76, y + 58 + i * 17]], c, 1.6);
    TX(x + 306, yy + 3, n, { sz: 8, c });
  });
}, '#1E5FA8');

/* ⑩ 插电阻 */
step(9, '插 8 个 220Ω', '大板 14–21 列，竖着插', (x, y) => {
  boardMini(x + 60, y + 60, 260, 100, 26);
  for (let i = 0; i < 8; i++) {
    const rx2 = x + 96 + i * 26;
    RC(rx2, y + 78, 16, 16, '#E8D9B0', '#C8B880', 1.1, 4);
    RC(rx2 + 3, y + 78, 4, 16, '#000', 'none', 0, 1);
    LN(rx2 + 8, y + 74, rx2 + 8, y + 66, '#999', 1.8);
    LN(rx2 + 8, y + 98, rx2 + 8, y + 106, '#999', 1.8);
  }
  TX(x + 190, y + 178, '列 14–21，八个都在', { sz: 9.5, c: '#8A6A15', w: 700 });
}, '#8A6A15');

/* ⑪ 下排到电阻 */
step(10, '595 下排到电阻', '下1–下7 → 七个电阻上端', (x, y) => {
  RC(x + 30, y + 60, 100, 100, '#E6EFF9', '#1E5FA8', 1.4, 3);
  TX(x + 80, y + 114, '595', { a: 'middle', sz: 10, c: '#12406F', w: 700 });
  for (let i = 0; i < 7; i++) {
    const rx2 = x + 180 + i * 26;
    RC(rx2, y + 96, 16, 16, '#E8D9B0', '#C8B880', 1.1, 4);
    LN(rx2 + 8, y + 92, rx2 + 8, y + 76, '#999', 1.8);
    PATH([[x + 100 + i * 4, y + 78], [x + 100 + i * 4, y + 64 + i * 4], [rx2 + 8, y + 64 + i * 4], [rx2 + 8, y + 76]], P, 1.8);
  }
  TX(x + 200, y + 178, '七根，一一对应', { sz: 9.5, c: P, w: 700 });
}, '#5B34B8');

/* ⑫ 电阻到数码管 */
step(11, '电阻到数码管', '八个段各串一个 220Ω', (x, y) => {
  for (let i = 0; i < 8; i++) {
    const rx2 = x + 50 + i * 26;
    RC(rx2, y + 62, 16, 16, '#E8D9B0', '#C8B880', 1.1, 4);
    LN(rx2 + 8, y + 78, rx2 + 8, y + 92, P, 1.8);
  }
  RC(x + 40, y + 96, 260, 90, '#1a1a1a', '#000', 1.4, 3);
  for (let i = 0; i < 4; i++) {
    RC(x + 60 + i * 62, y + 110, 46, 62, '#3a1010', '#5a1a1a', 1, 2);
    TX(x + 83 + i * 62, y + 156, '8', { a: 'middle', sz: 30, c: '#ff4d3d' });
  }
  TX(x + 170, y + 206, '丝印面朝你', { sz: 9.5, c: R, w: 700 });
}, '#7A2F8A');

/* ⑬ 位选四线 */
step(12, '数码管位选四根', '下3–下6 → A2 A3 A4 A5，不串电阻', (x, y) => {
  arduinoMini(x + 14, y + 60, 62, 130);
  RC(x + 150, y + 60, 180, 80, '#1a1a1a', '#000', 1.4, 3);
  for (let i = 0; i < 4; i++) RC(x + 170 + i * 42, y + 70, 32, 46, '#3a1010', '#5a1a1a', 1, 2);
  ['A2', 'A3', 'A4', 'A5'].forEach((n, i) => {
    PATH([[x + 172 + i * 42, y + 140], [x + 172 + i * 42, y + 162 + i * 6], [x + 76, y + 162 + i * 6]], O, 1.8);
    TX(x + 190 + i * 42, y + 126, n, { a: 'middle', sz: 8, c: O, w: 700 });
  });
  TX(x + 14, y + 200, '四根都接，缺一根就少一位', { sz: 9.5, c: O, w: 700 });
}, '#E85D26');

/* ⑭ 键盘八线 */
step(13, '键盘八根', 'D8 留给继电器，别占', (x, y) => {
  arduinoMini(x + 14, y + 50, 62, 140);
  RC(x + 150, y + 60, 120, 100, '#1F5A42', '#123A2B', 1.4, 3);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) CI(x + 172 + j * 22, y + 84 + i * 18, 6, '#0d2b1f');
  TX(x + 210, y + 176, '4×4 键盘', { a: 'middle', sz: 9, c: G, w: 700 });
  for (let i = 0; i < 8; i++) {
    PATH([[x + 150, y + 70 + i * 11], [x + 120 + i * 2, y + 70 + i * 11], [x + 120 + i * 2, y + 64 + i * 15], [x + 76, y + 64 + i * 15]], G, 1.5);
  }
  TX(x + 276, y + 96, 'D2–D5', { sz: 8.5, c: G });
  TX(x + 276, y + 116, 'D6 D7', { sz: 8.5, c: G });
  TX(x + 276, y + 132, 'D9 D10', { sz: 8.5, c: G });
}, '#2F7A45');

/* ⑮ 泵与电源 */
step(14, '泵与电源（走端子）', '12V 不进面包板；地要接回 Arduino', (x, y) => {
  RC(x + 30, y + 54, 90, 52, '#B8322A', '#8E1F18', 1.4, 3);
  TX(x + 75, y + 84, '继电器', { a: 'middle', sz: 9.5, c: '#fff', w: 700 });
  RC(x + 180, y + 40, 90, 40, '#F4F4F2', '#C9C4BB', 1.4, 3);
  TX(x + 225, y + 66, '12V 电源', { a: 'middle', sz: 9 });
  RC(x + 180, y + 130, 90, 40, '#FBF3DF', '#8A6A15', 1.4, 3);
  TX(x + 225, y + 156, '水泵', { a: 'middle', sz: 9 });
  PATH([[x + 120, y + 66], [x + 150, y + 66], [x + 150, y + 52], [x + 180, y + 52]], R, 2.2);
  PATH([[x + 120, y + 88], [x + 150, y + 88], [x + 150, y + 152], [x + 180, y + 152]], O, 2.2);
  PATH([[x + 270, y + 68], [x + 300, y + 68], [x + 300, y + 148], [x + 270, y + 148]], K, 2.2);
  PATH([[x + 300, y + 108], [x + 330, y + 108], [x + 330, y + 196], [x + 60, y + 196], [x + 60, y + 120]], K, 2, '5 4');
  TX(x + 36, y + 190, '12V 的地还要接 Arduino GND', { sz: 8.5, c: R, w: 700 });
}, '#C8342A');

/* ⑯ 保护件 */
step(15, '两个保护件', '二极管白环朝泵 +；电容有极性', (x, y) => {
  RC(x + 30, y + 56, 90, 40, '#222', '#000', 1.2, 3);
  RC(x + 100, y + 56, 14, 40, '#E8E8E8', '#999', 1.2, 2);
  TX(x + 30, y + 48, 'D1 1N4007', { sz: 9, c: MUT });
  PATH([[x + 116, y + 76], [x + 150, y + 76], [x + 150, y + 56], [x + 180, y + 56]], O, 2);
  PATH([[x + 30, y + 76], [x + 12, y + 76], [x + 12, y + 110], [x + 180, y + 110]], K, 2);
  TX(x + 186, y + 60, '白环 → 泵 +', { sz: 8.5, c: O, w: 700 });
  TX(x + 186, y + 114, '另一端 → 泵 −', { sz: 8.5, c: MUT });

  RC(x + 40, y + 150, 56, 70, '#1E1E1E', '#000', 1.2, 5);
  RC(x + 40, y + 150, 14, 70, '#D8D8D8', '#999', 1.2, 3);
  TX(x + 68, y + 192, '＋', { a: 'middle', sz: 14, c: '#fff', w: 700 });
  TX(x + 40, y + 142, 'C1 1000μF', { sz: 9, c: MUT });
  TX(x + 120, y + 176, '长脚 → +12V', { sz: 9, c: R, w: 700 });
  TX(x + 120, y + 196, '白条 → GND', { sz: 9, c: MUT });
  TX(x + 120, y + 216, '接反会鼓包', { sz: 9, c: R, w: 700 });
}, '#1A1A1A');

push('</svg>');
fs.writeFileSync('E:/hardness/ricemix/demo/tutor/03_steps.svg', s.join('\n'), 'utf8');
console.log('03 written');
