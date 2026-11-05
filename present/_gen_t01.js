/* 01 认识零件 —— 九宫格，每个格子一个零件的真实长相 */
const fs = require('fs');

const W = 1500, H = 1080;
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
const LN = (x1, y1, x2, y2, c, w = 2, dash) =>
  push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
const RC = (x, y, w, h, f, st, sw = 1.4, rx = 3) =>
  push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}${rx ? ` rx="${rx}"` : ''}/>`);
const CI = (cx, cy, r, f, st) => push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${st ? ` stroke="${st}" stroke-width="1"` : ''}/>`);

TX(48, 50, '认识零件', { sz: 30, w: 700 });
TX(48, 78, '九样东西。认准长相和脚在哪一头，插的时候就不会错。', { sz: 14, c: MUT });
RC(48, 94, 160, 5, O);

const CW = 470, CH = 280, GX = 48, GY = 130, GAP = 12;
const cell = (i) => ({ x: GX + (i % 3) * (CW + GAP), y: GY + Math.floor(i / 3) * (CH + GAP) });

function frame(i, name, note, color) {
  const { x, y } = cell(i);
  RC(x, y, CW, CH, '#FCFBF9', '#E2DDD3', 1.6, 8);
  RC(x, y, 5, CH, color, 'none', 0, 2);
  TX(x + 20, y + 28, name, { sz: 15.5, w: 700, c: color });
  TX(x + 20, y + CH - 14, note, { sz: 11.5, c: MUT });
  return { x, y };
}

/* ① Arduino */
{
  const { x, y } = frame(0, 'Arduino UNO', '蓝色大板 · 一头有 USB 口 · 我们只用 16 个脚', '#1E5FA8');
  RC(x + 40, y + 56, 250, 150, '#2C6FB5', '#1B4E80', 1.6, 5);
  TX(x + 165, y + 116, 'UNO', { a: 'middle', sz: 19, c: '#fff', w: 700 });
  for (let i = 0; i < 10; i++) { CI(x + 60 + i * 20, y + 62, 3, '#0F3459'); CI(x + 60 + i * 20, y + 200, 3, '#0F3459'); }
  RC(x + 320, y + 90, 46, 60, '#8E9AA6', '#5E6A76', 1.2, 3);
  TX(x + 343, y + 168, 'USB', { a: 'middle', sz: 9, c: MUT });
  TX(x + 320, y + 76, '↑ 这头朝自己', { sz: 10, c: O, w: 700 });
}

/* ② HX711 */
{
  const { x, y } = frame(1, 'HX711 模块', '绿色小板 · 两边各一排 4 个针', '#2F7A5C');
  RC(x + 70, y + 80, 190, 110, '#1F5A42', '#123A2B', 1.6, 5);
  for (let i = 0; i < 4; i++) { CI(x + 56, y + 100 + i * 24, 4, '#C9A227'); CI(x + 274, y + 100 + i * 24, 4, '#C9A227'); }
  TX(x + 165, y + 142, 'HX711', { a: 'middle', sz: 15, c: '#fff', w: 700 });
  TX(x + 40, y + 74, '左边接秤', { sz: 10.5, c: P, w: 700 });
  TX(x + 290, y + 74, '右边接主板', { sz: 10.5, c: B, w: 700 });
}

/* ③ 悬臂梁 */
{
  const { x, y } = frame(2, '5kg 悬臂梁', '银色金属条 · 一头四个焊盘 · 另一头两个孔', '#8A8580');
  RC(x + 60, y + 110, 300, 42, '#C8CDD4', '#9AA1A9', 1.6, 4);
  for (let i = 0; i < 4; i++) RC(x + 250 + i * 24, y + 118, 14, 26, '#E8DFA8', '#B8A860', 1, 2);
  CI(x + 110, y + 131, 8, '#fff', '#9AA1A9');
  CI(x + 150, y + 131, 8, '#fff', '#9AA1A9');
  TX(x + 270, y + 100, '四根线焊这里', { sz: 10.5, c: O, w: 700 });
  TX(x + 60, y + 168, '两个孔用螺丝拧在秤台上', { sz: 10.5, c: MUT });
}

/* ④ 继电器 */
{
  const { x, y } = frame(3, '单路继电器', '红色小板 · 蓝色大方块 · 两侧各 3 个螺丝端子', '#C8342A');
  RC(x + 60, y + 86, 250, 130, '#B8322A', '#8E1F18', 1.6, 5);
  RC(x + 120, y + 96, 120, 76, '#2C5FA8', '#1B3F70', 1.4, 3);
  TX(x + 180, y + 142, 'JQC-3FF', { a: 'middle', sz: 12, c: '#fff', w: 700 });
  RC(x + 74, y + 110, 32, 74, '#1E4B8C', '#12305A', 1.2, 2);
  RC(x + 264, y + 110, 32, 74, '#1E4B8C', '#12305A', 1.2, 2);
  TX(x + 90, y + 234, '左边：DC− DC+ IN', { a: 'middle', sz: 10.5, c: B, w: 700 });
  TX(x + 280, y + 234, '右边：NO COM NC', { a: 'middle', sz: 10.5, c: O, w: 700 });
}

/* ⑤ 595 */
{
  const { x, y } = frame(4, '74HC595 芯片', '黑色长条 · 上下各 8 个脚 · 一端有半圆缺口', '#1E5FA8');
  RC(x + 80, y + 92, 260, 100, '#242424', '#000', 1.6, 3);
  push(`<path d="M ${x + 83} ${y + 142 - 16} A 16 16 0 0 0 ${x + 83} ${y + 142 + 16}" fill="#fff" stroke="#000" stroke-width="1.6"/>`);
  CI(x + 100, y + 176, 5, '#fff');
  for (let i = 0; i < 8; i++) { LN(x + 108 + i * 30, y + 92, x + 108 + i * 30, y + 78, '#888', 3); LN(x + 108 + i * 30, y + 192, x + 108 + i * 30, y + 206, '#888', 3); }
  TX(x + 210, y + 148, '74HC595', { a: 'middle', sz: 14, c: '#fff', w: 700 });
  TX(x + 40, y + 228, '缺口朝左放，左下角是 1 号', { sz: 11, c: R, w: 700 });
}

/* ⑥ 数码管 */
{
  const { x, y } = frame(5, '5461AS-1 数码管', '黑色方块 · 正面四个「8」· 上下各 6 个脚', '#7A2F8A');
  RC(x + 110, y + 84, 210, 118, '#1a1a1a', '#000', 1.6, 4);
  for (let i = 0; i < 4; i++) {
    RC(x + 128 + i * 48, y + 104, 36, 78, '#3a1010', '#5a1a1a', 1, 2);
    TX(x + 146 + i * 48, y + 160, '8', { a: 'middle', sz: 34, c: '#ff4d3d' });
  }
  for (let i = 0; i < 6; i++) { LN(x + 130 + i * 36, y + 84, x + 130 + i * 36, y + 70, '#888', 3); LN(x + 130 + i * 36, y + 202, x + 130 + i * 36, y + 216, '#888', 3); }
  TX(x + 40, y + 236, '丝印（写着字的）那面朝你', { sz: 11, c: R, w: 700 });
}

/* ⑦ 电阻 */
{
  const { x, y } = frame(6, '220Ω 电阻', '米色小圆柱 · 四道色环 · 不分方向', '#8A6A15');
  for (let i = 0; i < 3; i++) {
    const ry = y + 96 + i * 34;
    RC(x + 90, ry, 120, 22, '#E8D9B0', '#C8B880', 1.2, 10);
    [['#8B4A2A', 0], ['#000', 1], ['#8B4A2A', 2], ['#C9A227', 3]].forEach(([c, j]) => {
      RC(x + 120 + j * 22, ry - 2, 8, 26, c, 'none', 0, 1);
    });
    LN(x + 60, ry + 11, x + 90, ry + 11, '#999', 2.4);
    LN(x + 210, ry + 11, x + 240, ry + 11, '#999', 2.4);
  }
  TX(x + 260, y + 130, '要 8 个', { sz: 13, c: O, w: 700 });
  TX(x + 260, y + 152, '每段一个', { sz: 11, c: MUT });
}

/* ⑧ 二极管 + 电容 */
{
  const { x, y } = frame(7, '两个保护件', '二极管白环朝泵 + · 电容白条是负极', '#1A1A1A');
  RC(x + 60, y + 92, 110, 30, '#222', '#000', 1.2, 3);
  RC(x + 150, y + 92, 16, 30, '#E8E8E8', '#999', 1.2, 2);
  TX(x + 60, y + 84, '1N4007', { sz: 10.5, c: MUT });
  TX(x + 176, y + 112, '白环 → 泵 +', { sz: 10.5, c: O, w: 700 });
  RC(x + 300, y + 82, 72, 96, '#1E1E1E', '#000', 1.4, 6);
  RC(x + 300, y + 82, 18, 96, '#D8D8D8', '#999', 1.2, 4);
  TX(x + 336, y + 140, '＋', { a: 'middle', sz: 18, c: '#fff', w: 700 });
  TX(x + 380, y + 112, '长脚 +12V', { sz: 10.5, c: R, w: 700 });
  TX(x + 380, y + 132, '白条 GND', { sz: 10.5, c: MUT });
  TX(x + 60, y + 214, '1000μF 电解电容 · 有极性，接反会鼓包', { sz: 11, c: R, w: 700 });
}

/* ⑨ 面包板 + 键盘 */
{
  const { x, y } = frame(8, '面包板 与 键盘', '面包板两块（一大一小）· 键盘不插板，放桌上', '#E85D26');
  RC(x + 40, y + 92, 240, 60, '#F1EBDF', '#D9D0BE', 1.4, 4);
  TX(x + 160, y + 168, '大板 830 孔', { a: 'middle', sz: 10.5, c: MUT });
  RC(x + 300, y + 92, 120, 60, '#F1EBDF', '#D9D0BE', 1.4, 4);
  TX(x + 360, y + 168, '小板 400 孔', { a: 'middle', sz: 10.5, c: MUT });
  RC(x + 40, y + 190, 150, 60, '#1F5A42', '#123A2B', 1.4, 4);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) CI(x + 60 + j * 30, y + 206 + i * 12, 4.5, '#0d2b1f');
  TX(x + 210, y + 226, '4×4 键盘', { sz: 11, c: G, w: 700 });
}

push('</svg>');
fs.writeFileSync('E:/hardness/ricemix/demo/tutor/01_parts.svg', s.join('\n'), 'utf8');
console.log('01 written');
