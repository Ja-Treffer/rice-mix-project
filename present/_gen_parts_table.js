/* 各部件接线表 —— 一张纸看完所有器件的每个脚 */
const fs = require('fs');

const W = 1400, H = 1580;
const O = '#E85D26', R = '#C8342A', B = '#1E5FA8', K = '#1A1A1A';
const P = '#5B34B8', MUT = '#6E6A64', LINE = '#D8D4CE', HEAD = '#F4F1EC';
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
const LN = (x1, y1, x2, y2, c = LINE, w = 1) =>
  push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/>`);
const RC = (x, y, w, h, f, st, sw = 1) =>
  push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}/>`);

TX(40, 52, '各部件接线表', { sz: 30, w: 700 });
TX(40, 80, '一张纸看完。每个器件的每个脚，接去哪个脚、中间要不要串东西，全在这。', { sz: 14, c: MUT });
RC(40, 94, 240, 5, O);

/* 通用表格绘制：cols = [标题, x偏移, 宽度]; rows = [[值...], ...] */
function table(x, y, w, cols, rows, colors) {
  let cy = y;
  RC(x, cy, w, 38, HEAD, LINE);
  cols.forEach(([t, dx, cw]) => TX(x + dx + 12, cy + 25, t, { sz: 14, w: 700 }));
  LN(x, cy + 38, x + w, cy + 38, '#B8B4AE', 1.2);
  cy += 38;
  rows.forEach((row, i) => {
    const h = 32;
    if (i % 2 === 1) RC(x, cy, w, h, '#FBFAF8');
    row.forEach((v, j) => {
      const [t, dx, cw] = cols[j];
      const col = colors && colors[i] && colors[i][j] ? colors[i][j] : K;
      const mono = j === 0 || j === 1;
      TX(x + dx + 12, cy + 22, v, { sz: j === 0 ? 13 : 13.5, c: col, m: mono, w: j < 2 ? 700 : 0 });
    });
    LN(x, cy + h, x + w, cy + h);
    cy += h;
  });
  RC(x, y, w, cy - y, 'none', '#B8B4AE', 1.2);
  cols.forEach(([, dx], j) => { if (j) LN(x + dx, y, x + dx, cy); });
  return cy;
}

/* ══════ 1 HX711 ══════ */
let y = 128;
TX(40, y, '① HX711 称重模块（10 根线：4 根接秤，4 根接主板）', { sz: 17, w: 700 });
RC(40, y + 8, 130, 4, '#2F7A5C');
y = table(40, y + 26, 660,
  [['脚', 0], ['名称', 60], ['接到哪', 160], ['注意', 500]],
  [
    ['1', 'VCC', 'Arduino 5V', ''],
    ['2', 'DT', 'Arduino A1', '和 SCK 接反会静默失灵'],
    ['3', 'SCK', 'Arduino A0', ''],
    ['4', 'GND', 'Arduino GND', ''],
    ['5', 'E+', '悬臂梁红线', '激励电压正'],
    ['6', 'E−', '悬臂梁黑线', ''],
    ['7', 'A+', '悬臂梁白线', '信号正'],
    ['8', 'A−', '悬臂梁绿线', ''],
  ],
  null, null);

/* ══════ 2 继电器 ══════ */
TX(740, 128, '② 单路继电器（6 个端子）', { sz: 17, w: 700 });
RC(740, 136, 130, 4, R);
table(740, 154, 620,
  [['端子', 0], ['名称', 70], ['接到哪', 190], ['注意', 480]],
  [
    ['左1', 'DC−', 'Arduino GND', ''],
    ['左2', 'DC+', 'Arduino 5V', ''],
    ['左3', 'IN', 'Arduino D8', ''],
    ['右1', 'NO', '泵的红线（泵 +）', '断电就断，泵用这个'],
    ['右2', 'COM', '12V 电源 +12V', '电源从这里进'],
    ['右3', 'NC', '不接', '断电反而通，别用'],
  ],
  null, null);

/* ══════ 3 数码管 ══════ */
y = 470;
TX(40, y, '③ 5461AS-1 数码管（12 个脚，上排 6 下排 6）', { sz: 17, w: 700 });
RC(40, y + 8, 150, 4, '#7A2F8A');
y = table(40, y + 26, 660,
  [['哪排', 0], ['脚名', 70], ['接到哪', 170], ['注意', 500]],
  [
    ['上排', 'a', '595 的 15 脚 QA', '中间串 220Ω'],
    ['上排', 'b', '595 的 1 脚 QB', '串 220Ω'],
    ['上排', 'c', '595 的 2 脚 QC', '串 220Ω'],
    ['上排', 'd', '595 的 3 脚 QD', '串 220Ω'],
    ['上排', 'e', '595 的 4 脚 QE', '串 220Ω'],
    ['上排', 'f', '595 的 5 脚 QF', '串 220Ω'],
    ['下排', 'g', '595 的 6 脚 QG', '串 220Ω'],
    ['下排', 'dp', '595 的 7 脚 QH', '串 220Ω'],
    ['下排', 'DIG1', 'Arduino A2', '不串电阻'],
    ['下排', 'DIG2', 'Arduino A3', '不串电阻'],
    ['下排', 'DIG3', 'Arduino A4', '不串电阻'],
    ['下排', 'DIG4', 'Arduino A5', '不串电阻'],
  ],
  null, null);

/* ══════ 4 键盘 ══════ */
TX(740, 470, '④ 4×4 键盘（8 根线，不插面包板）', { sz: 17, w: 700 });
RC(740, 478, 150, 4, '#2F7A45');
table(740, 496, 620,
  [['针脚', 0], ['名称', 70], ['接到哪', 190], ['说明', 420]],
  [
    ['1', 'R1', 'Arduino D2', '第一行 S1 S2 S3 S4'],
    ['2', 'R2', 'Arduino D3', '第二行 S5 S6 S7 S8'],
    ['3', 'R3', 'Arduino D4', '第三行 S9 S10 S11 S12'],
    ['4', 'R4', 'Arduino D5', '第四行 S13 S14 S15 S16'],
    ['5', 'C1', 'Arduino D6', '第一列 S1 S5 S9 S13'],
    ['6', 'C2', 'Arduino D7', '第二列'],
    ['7', 'C3', 'Arduino D9', '第三列'],
    ['8', 'C4', 'Arduino D10', '第四列'],
  ],
  null, null);

/* ══════ 5 保护件 ══════ */
y = 946;
TX(40, y, '⑤ 保护件（四根线）', { sz: 17, w: 700 });
RC(40, y + 8, 120, 4, O);
table(40, y + 26, 1320,
  [['器件', 0], ['这一端', 150], ['接到哪', 400], ['为什么', 820]],
  [
    ['D1 1N4007', '白环那一端（阴极）', '泵的红线（泵 +）', '反并联在泵两端，吸收断电瞬间的反冲'],
    ['D1 1N4007', '另一端（阳极）', '泵的黑线（泵 −）', '接反等于短路，泵一开就打下继电器'],
    ['C1 1000μF', '长脚（+）', '12V 电源 +12V', '并在电源两端，扛住泵启动的电流冲击'],
    ['C1 1000μF', '短脚（−，壳上白条）', '12V 电源 GND', '接反会鼓包，白条那一侧是负极'],
  ],
  null, null);

/* ══════ 6 Arduino 汇总 ══════ */
y = 1170;
TX(40, y, '⑥ Arduino UNO 一共用掉 16 个脚', { sz: 17, w: 700 });
RC(40, y + 8, 200, 4, B);
table(40, y + 26, 1320,
  [['引脚', 0], ['接什么', 120], ['引脚', 480], ['接什么', 600]],
  [
    ['A0', 'HX711 SCK', 'D8', '继电器 IN'],
    ['A1', 'HX711 DT', 'D11', '74HC595 SER（数据）'],
    ['A2', '数码管 DIG1', 'D12', '74HC595 SRCLK（移位时钟）'],
    ['A3', '数码管 DIG2', 'D13', '74HC595 RCLK（锁存）'],
    ['A4', '数码管 DIG3', 'D2–D5', '键盘 R1–R4（行）'],
    ['A5', '数码管 DIG4', 'D6 D7 D9 D10', '键盘 C1–C4（列）'],
    ['5V', 'HX711 VCC · 继电器 DC+ · 595 的 16 和 10', 'GND', 'HX711 GND · 继电器 DC− · 595 的 8 和 13'],
  ],
  [[K, K, K, K], [K, K, K, K], [K, K, K, K], [K, K, K, K], [K, K, K, K], [K, K, K, K], [R, K, K, K]]);

TX(40, 1530, '接完对着这张表一行一行核：每一行左边的东西，右边都得有。', { sz: 13, c: MUT });

push('</svg>');
fs.writeFileSync('E:/hardness/ricemix/demo/sch_parts_table.svg', s.join('\n'), 'utf8');
console.log('parts table written');
