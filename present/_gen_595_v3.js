/* 74HC595 接线详图 v3 —— 三栏布局，每块留白充足，不再互相压
   左：芯片 16 脚  中：8 段经电阻  右：数码管 + 保护件 */
const fs = require('fs');

const W = 1400, H = 1000;
const O = '#E85D26', R = '#D93A2B', B = '#1E5FA8', K = '#222222';
const P = '#6B3FD4', MUT = '#8A8580';
const s = [];
const push = (x) => s.push(x);

push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);

const TX = (x, y, t, o = {}) => {
  const a = o.a || 'start', sz = o.sz || 12, c = o.c || K;
  const w = o.w ? ` font-weight="${o.w}"` : '';
  const f = o.m ? 'Consolas,ui-monospace,monospace' : 'Segoe UI,Arial,sans-serif';
  push(`<text x="${x}" y="${y}" fill="${c}" font-size="${sz}" font-family="${f}" text-anchor="${a}"${w}>${t}</text>`);
};
const LN = (pts, c, w = 2) => {
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`);
};
const RC = (x, y, w, h, f, st, sw = 1, rx = 0) =>
  push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}${rx ? ` rx="${rx}"` : ''}/>`);
const CI = (cx, cy, r, f, st, sw = 1) =>
  push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}/>`);

TX(40, 48, '74HC595 → 5461AS-1  接线详图', { sz: 27, w: 700 });
TX(40, 74, '芯片横放、缺口朝左。下排数 1–8（从左到右），上排数 16–9（从左到右）。', { sz: 13.5, c: MUT });
RC(40, 86, 300, 4, O);

/* ══════════════ 左栏：芯片 ══════════════ */
RC(40, 110, 420, 620, '#fcfcfc', '#e4e4e4', 1.6, 10);
TX(60, 140, '① 芯片怎么数脚', { sz: 16, w: 700 });
RC(60, 150, 130, 3, O);

const cx = 74, cy = 200, cw = 352, ch = 170;
RC(cx, cy, cw, ch, '#242424', '#000', 2, 5);
push(`<path d="M ${cx + 3} ${cy + ch / 2 - 22} A 22 22 0 0 0 ${cx + 3} ${cy + ch / 2 + 22}" fill="#fff" stroke="#000" stroke-width="2"/>`);
CI(cx + 24, cy + ch - 22, 5, '#fff');
TX(cx + cw / 2, cy + ch / 2 - 4, '74HC595', { a: 'middle', sz: 22, c: '#fff', w: 700 });
TX(cx + cw / 2, cy + ch / 2 + 18, 'DIP-16', { a: 'middle', sz: 11, c: '#9a9a9a' });

const pt = 38, x0 = cx + 26;
const lower = [[1, 'QB'], [2, 'QC'], [3, 'QD'], [4, 'QE'], [5, 'QF'], [6, 'QG'], [7, 'QH'], [8, 'GND']];
const upper = [[16, 'VCC'], [15, 'QA'], [14, 'SER'], [13, 'OE'], [12, 'RCLK'], [11, 'SRCLK'], [10, 'SRCLR'], [9, "QH'"]];

const upTip = cy - 30, dnTip = cy + ch + 30;
lower.forEach(([n, nm], i) => {
  const px = x0 + i * pt;
  LN([[px, cy + ch], [px, dnTip]], '#555', 2.4);
  CI(px, dnTip, 3.4, '#555');
  TX(px, cy + ch - 9, n, { a: 'middle', sz: 10, c: '#b0b0b0', m: 1 });
  TX(px, dnTip + 20, nm, { a: 'middle', sz: 11.5, c: K, w: 700 });
});
upper.forEach(([n, nm], i) => {
  const px = x0 + i * pt;
  LN([[px, cy], [px, upTip]], '#555', 2.4);
  CI(px, upTip, 3.4, '#555');
  TX(px, cy + 17, n, { a: 'middle', sz: 10, c: '#b0b0b0', m: 1 });
  TX(px, upTip - 12, nm, { a: 'middle', sz: 11.5, c: K, w: 700 });
});

/* 脚位说明：上排从左往右第几个 */
TX(60, 452, '上排从左往右：', { sz: 12, c: MUT });
TX(174, 452, "16 VCC · 15 QA · 14 SER · 13 OE · 12 RCLK · 11 SRCLK · 10 SRCLR · 9 QH′", { sz: 12, m: 1 });
TX(60, 478, '下排从左往右：', { sz: 12, c: MUT });
TX(174, 478, '1 QB · 2 QC · 3 QD · 4 QE · 5 QF · 6 QG · 7 QH · 8 GND', { sz: 12, m: 1, c: P });

TX(60, 516, '三个必接的电源脚', { sz: 13, c: R, w: 700 });
TX(60, 540, '16 VCC', { sz: 12, m: 1, w: 700 }); TX(150, 540, '→ 5V', { sz: 12, c: R, w: 700 });
TX(60, 562, '10 SRCLR', { sz: 12, m: 1, w: 700 }); TX(150, 562, '→ 5V（接低就永远清零）', { sz: 12, c: R });
TX(60, 584, '13 OE', { sz: 12, m: 1, w: 700 }); TX(150, 584, '→ GND（悬空就永远不输出）', { sz: 12, c: K });
TX(60, 606, '8 GND', { sz: 12, m: 1, w: 700 }); TX(150, 606, '→ GND（和 Arduino 共地）', { sz: 12, c: K });

TX(60, 646, '三根控制线', { sz: 13, c: B, w: 700 });
TX(60, 670, '14 SER', { sz: 12, m: 1, w: 700 }); TX(150, 670, '→ D11  数据一位一位进来', { sz: 12 });
TX(60, 692, '11 SRCLK', { sz: 12, m: 1, w: 700 }); TX(150, 692, '→ D12  每个上升沿移一位', { sz: 12 });
TX(60, 714, '12 RCLK', { sz: 12, m: 1, w: 700 }); TX(150, 714, '→ D13  拉一下，8 位同时输出', { sz: 12 });

/* ══════════════ 中栏：8 段 ══════════════ */
RC(486, 110, 400, 620, '#fcfcfc', '#e4e4e4', 1.6, 10);
TX(506, 140, '② 8 个输出怎么到数码管', { sz: 16, w: 700 });
RC(506, 150, 200, 3, O);

const segs = [['QA', 'a', 15], ['QB', 'b', 1], ['QC', 'c', 2], ['QD', 'd', 3],
              ['QE', 'e', 4], ['QF', 'f', 5], ['QG', 'g', 6], ['QH', 'dp', 7]];
const rowY0 = 192, rowGap = 62;
segs.forEach(([q, seg, pin], i) => {
  const y = rowY0 + i * rowGap;
  TX(506, y + 5, q, { sz: 12.5, w: 700, m: 1, c: P });
  TX(548, y + 5, '脚' + pin, { sz: 10.5, c: MUT, m: 1 });
  LN([[590, y], [610, y]], P, 2.4);
  RC(614, y - 9, 46, 18, '#fff8e8', '#C9A227', 1.3, 3);
  TX(637, y + 4, '220Ω', { a: 'middle', sz: 9.5, c: '#8A6A15', m: 1 });
  LN([[660, y], [686, y]], P, 2.4);
  TX(694, y + 5, '段 ' + seg, { sz: 12.5, w: 700, m: 1, c: P });
  if (i < 7) {
    LN([[506, y + 22], [506, y + rowGap - 22]], '#e8e8e8', 1);
  }
});
TX(506, 700, '顺序：Q 脚 → 220Ω → 数码管的段脚。', { sz: 12 });
TX(506, 722, '每个段一个电阻，8 个都要，不能共用。', { sz: 12, c: MUT });

/* ══════════════ 右栏：数码管 ══════════════ */
RC(906, 110, 454, 400, '#fcfcfc', '#e4e4e4', 1.6, 10);
TX(926, 140, '③ 数码管这 12 个脚', { sz: 16, w: 700 });
RC(926, 150, 130, 3, O);

const dx = 960, dy = 200, dw = 200, dh = 230;
RC(dx, dy, dw, dh, '#1a1a1a', '#000', 2, 5);
TX(dx + dw / 2, dy + 22, '5461AS-1', { a: 'middle', sz: 14, c: '#fff', w: 700 });
for (let i = 0; i < 4; i++) {
  RC(dx + 16 + i * 44, dy + 84, 36, 78, '#3a1010', '#4a1a1a', 1, 3);
  TX(dx + 34 + i * 44, dy + 140, '8', { a: 'middle', sz: 38, c: '#ff4d3d' });
}

const dp2 = 24;
/* 上排 6 个：a–f */
['a', 'b', 'c', 'd', 'e', 'f'].forEach((n, i) => {
  const px = dx + 18 + i * dp2;
  LN([[px, dy], [px, dy - 22]], '#555', 2.2);
  CI(px, dy - 22, 2.8, '#555');
  TX(px, dy - 30, n, { a: 'middle', sz: 11, c: P, m: 1, w: 700 });
});
/* 下排 6 个：g dp DIG1-4 */
['g', 'dp', 'DIG1', 'DIG2', 'DIG3', 'DIG4'].forEach((n, i) => {
  const px = dx + 18 + i * dp2;
  LN([[px, dy + dh], [px, dy + dh + 22]], '#555', 2.2);
  CI(px, dy + dh + 22, 2.8, '#555');
  TX(px, dy + dh + 38, n, { a: 'middle', sz: 9.5, c: i < 2 ? P : O, m: 1, w: 700 });
});

TX(922, 262, '上排', { sz: 11, c: MUT });
TX(922, 280, 'a b c d e f', { sz: 11, c: P, m: 1, w: 700 });
TX(922, 302, '下排', { sz: 11, c: MUT });
TX(922, 320, 'g · dp', { sz: 11, c: P, m: 1, w: 700 });
TX(922, 342, 'DIG1–4', { sz: 11, c: O, m: 1, w: 700 });
TX(922, 372, 'a–g + dp 接 595 的 Q', { sz: 11 });
TX(922, 392, 'DIG1–4 → A2 A3 A4 A5', { sz: 11, c: O });
TX(922, 412, '位选不串电阻', { sz: 10.5, c: MUT });
TX(1170, 250, '8 段共阴：', { sz: 11, c: MUT });
TX(1170, 272, '位选拉低的那一位亮，', { sz: 11 });
TX(1170, 292, '其余三位熄。四位轮流', { sz: 11 });
TX(1170, 312, '点，每 2 ms 换一位，', { sz: 11 });
TX(1170, 332, '看起来是同时亮的。', { sz: 11 });

/* ══════════════ 右下：保护件 ══════════════ */
RC(906, 530, 454, 200, '#fcfcfc', '#e4e4e4', 1.6, 10);
TX(926, 560, '④ 二极管和电容放哪', { sz: 16, w: 700 });
RC(926, 570, 150, 3, O);

/* D1 */
TX(926, 598, 'D1 · 1N4007 · 反并联在泵两端', { sz: 11.5, w: 700 });
RC(928, 612, 44, 34, '#eef2f6', '#9fb3c4', 1.3, 4);
TX(950, 634, '泵', { a: 'middle', sz: 11 });
LN([[972, 620], [1010, 620]], R, 2.6);
TX(978, 614, '+', { sz: 11, c: R, w: 700 });
LN([[972, 638], [1010, 638]], K, 2.6);
TX(978, 654, '−', { sz: 11, c: K, w: 700 });
push(`<path d="M 1024 610 L 1050 610 L 1037 628 Z" fill="#fff" stroke="${K}" stroke-width="2"/>`);
push(`<line x1="1054" y1="608" x2="1054" y2="630" stroke="${K}" stroke-width="3"/>`);
LN([[1037, 610], [1037, 600], [1010, 600], [1010, 620]], K, 1.5);
LN([[1037, 628], [1037, 656], [1010, 656], [1010, 638]], K, 1.5);
TX(1058, 606, '白环端 → 泵 +', { sz: 10.5, c: O, w: 700 });
TX(1058, 634, '另一端 → 泵 −', { sz: 10.5, c: MUT });

/* C1 */
TX(1180, 598, 'C1 · 1000μF', { sz: 11.5, w: 700 });
push(`<line x1="1184" y1="612" x2="1184" y2="648" stroke="${K}" stroke-width="3"/>`);
push(`<path d="M 1204 612 A 13 18 0 0 1 1204 648" fill="none" stroke="${K}" stroke-width="3"/>`);
TX(1178, 606, '+', { sz: 12, c: O, w: 700 });
LN([[1184, 612], [1150, 612], [1150, 600]], R, 2);
LN([[1204, 612], [1240, 612], [1240, 600]], R, 2);
LN([[1184, 648], [1150, 648], [1150, 664]], K, 2);
LN([[1204, 648], [1240, 648], [1240, 664]], K, 2);
TX(1150, 596, '+12V', { a: 'middle', sz: 10, c: R, w: 700 });
TX(1240, 596, '+12V', { a: 'middle', sz: 10, c: R, w: 700 });
TX(1195, 680, '长脚 +12V，白条侧 GND，并在电源两端', { a: 'middle', sz: 10, c: MUT });

TX(926, 706, '缺 D1 → 泵断电瞬间反冲打黑继电器触点；缺 C1 → 泵启动拉低电压，Arduino 复位', { sz: 10.5, c: R });

/* ── 图例 ── */
let lx = 40;
[[R, '5V'], [K, 'GND'], [B, '控制信号'], [P, '段选'], [O, '位选']].forEach(([c, t]) => {
  LN([[lx, 972], [lx + 24, 972]], c, 3.4);
  TX(lx + 30, 976, t, { sz: 11.5, c: MUT });
  lx += 34 + t.length * 13 + 20;
});

push('</svg>');
fs.writeFileSync('E:/hardness/ricemix/demo/sch_595_detail.svg', s.join('\n'), 'utf8');
console.log('v3 written');
