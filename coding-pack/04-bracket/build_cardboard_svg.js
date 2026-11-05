/**
 * 纸皮版完整排版图 —— A3 横版 1:1（420 × 297 mm）
 *
 * 打印必须选「实际大小 / 100%」，打出来用钢尺量左下角那个 100mm 校准尺，
 * 正好 100mm 才说明没被缩放。没有 A3 打印机就去打印店，一张两三块。
 *
 * 输出：cardboard_plan.svg
 */
const fs = require('fs');
const path = require('path');

const R  = '#e5484d';  // 切穿
const C  = '#ff9f1c';  // 折线 / 半切
const H  = '#4cc9f0';  // 孔
const M  = '#8fa6ba';  // 辅助标注
const G  = '#3ddc97';  // 标题
const D1 = '#a78bfa';  // 占位虚线

const BOARD_W = 280, BOARD_D = 180;
const OX = 18, OY = 62;          // 底板在图纸上的原点（左下角）
const PW = 420, PH = 297;        // A3 横

const SX = x => OX + x;
const SY = y => OY + (BOARD_D - y);   // 翻转，让图与实物同向

const P = [];
const el = s => P.push(s);
const r = n => Math.round(n * 100) / 100;
const rect = (x, y, w, h, o) => el(`<rect x="${r(SX(x))}" y="${r(SY(y + h))}" width="${r(w)}" height="${r(h)}" ${o}/>`);
const circ = (x, y, rr, o) => el(`<circle cx="${r(SX(x))}" cy="${r(SY(y))}" r="${r(rr)}" ${o}/>`);
const line = (x1, y1, x2, y2, o) => el(`<line x1="${r(SX(x1))}" y1="${r(SY(y1))}" x2="${r(SX(x2))}" y2="${r(SY(y2))}" ${o}/>`);
const txt  = (x, y, s, o) => el(`<text x="${r(SX(x))}" y="${r(SY(y))}" ${o}>${s}</text>`);
const raw  = s => el(s);

/* 孔：十字 + 圆 */
function hole(x, y, rr, label) {
  circ(x, y, rr, `fill="none" stroke="${H}" stroke-width="0.55"`);
  line(x - rr - 2, y, x + rr + 2, y, `stroke="${H}" stroke-width="0.22"`);
  line(x, y - rr - 2, x, y + rr + 2, `stroke="${H}" stroke-width="0.22"`);
  if (label) txt(x + rr + 2.6, y + 1.2, label, `fill="${H}" font-size="3.4" font-family="sans-serif"`);
}

/* ── 图幅 ── */
raw(`<rect x="0" y="0" width="${PW}" height="${PH}" fill="#0b1016"/>`);

/* 标题 */
raw(`<text x="${OX}" y="20" fill="${G}" font-size="7.2" font-weight="700" font-family="sans-serif">纸皮 + 筷子版支架 · 底板排版图 1:1（280 × 180 mm）</text>`);
raw(`<text x="${OX}" y="28" fill="${M}" font-size="4.2" font-family="sans-serif">打印务必选「实际大小 / 100%」；打出来先量左下角的 100mm 校准尺，量准了再用</text>`);

/* 底板外框 */
rect(0, 0, BOARD_W, BOARD_D, `fill="none" stroke="${R}" stroke-width="0.8"`);
raw(`<text x="${r(SX(4))}" y="${r(SY(BOARD_D) - 3)}" fill="${G}" font-size="4.6" font-weight="700" font-family="sans-serif">底板 280 × 180（瓦楞纸 3 层，楞向交错，四周贴胶带封边）</text>`);

/* ── UNO ── */
rect(8, 8, 90, 70, `fill="none" stroke="${D1}" stroke-width="0.35" stroke-dasharray="3 2"`);
txt(11, 66, 'UNO 90×70', `fill="${D1}" font-size="3.8"`);
[[16, 16.8], [82, 16.8], [16, 69.6], [82, 69.6]].forEach(([x, y], i) => hole(x, y, 1.6, i === 0 ? 'φ3.2' : ''));

/* ── 继电器 ── */
rect(8, 88, 70, 50, `fill="none" stroke="${D1}" stroke-width="0.35" stroke-dasharray="3 2"`);
txt(11, 132, '继电器 70×50', `fill="${D1}" font-size="3.8"`);
[[14, 98], [58, 98], [14, 118], [58, 118]].forEach(([x, y], i) => hole(x, y, 1.6, i === 0 ? 'φ3.2' : ''));

/* ── 泵（横放 66×37，耳孔间距 66） ── */
rect(100, 140, 66, 37, `fill="none" stroke="${D1}" stroke-width="0.35" stroke-dasharray="3 2"`);
txt(104, 172, '泵 66×37（横放）', `fill="${D1}" font-size="3.8"`);
hole(101, 158.5, 1.6, 'φ3.2');
hole(165, 158.5, 1.6, '');

/* ── 支座（在秤台投影内） ── */
rect(167.5, 75, 55, 60, `fill="none" stroke="${C}" stroke-width="0.5" stroke-dasharray="4 2"`);
txt(170, 100, '支座 55×60', `fill="${C}" font-size="3.8"`);
txt(170, 96, '（筷子柱×6，扎带绑死）', `fill="${C}" font-size="3.2"`);
/* 支座四角的扎带孔 */
[[171, 79], [219, 79], [171, 131], [219, 131]].forEach(([x, y]) => hole(x, y, 1.4, ''));
/* 梁槽中线 */
line(167.5, 130, 222.5, 130, `stroke="${R}" stroke-width="0.5"`);
txt(172, 124, '梁槽 13 宽（顶板开）', `fill="${R}" font-size="3.2"`);

/* ── 秤台投影 ── */
rect(135, 15, 120, 120, `fill="none" stroke="${D1}" stroke-width="0.3" stroke-dasharray="1.6 1.6"`);
txt(138, 20, '秤台 120×120（2 层，夹 2 根筷子）', `fill="${D1}" font-size="3.8"`);

/* 受力孔 + 三个定位销 */
hole(195, 59.7, 2.2, 'φ5 穿扎带');
[[195, 59.7 + 62], [195 - 62 * Math.sin(2 * Math.PI / 3), 59.7 + 62 * Math.cos(2 * Math.PI / 3)],
 [195 - 62 * Math.sin(4 * Math.PI / 3), 59.7 + 62 * Math.cos(4 * Math.PI / 3)]]
  .forEach(([x, y]) => { if (y > 16 && y < 134 && x > 136 && x < 254) hole(x, y, 1.2, ''); });

txt(138, 40, '＋ 三个牙签定位销 R62 均布（与支座不同高度，不冲突）', `fill="${H}" font-size="3"`);

/* ── 管架筷子孔 ── */
hole(265, 150, 3, 'φ6 插筷');
txt(250, 142, '管架', `fill="${H}" font-size="3.4"`);

/* ── 两个线槽 ── */
hole(30, 160, 4.5, 'φ9');
hole(62, 160, 4.5, '');
txt(24, 150, '线槽 ×2', `fill="${H}" font-size="3.4"`);

/* 方向指示 */
raw(`<line x1="${SX(-10)}" y1="${SY(90)}" x2="${SX(-10)}" y2="${SY(140)}" stroke="${M}" stroke-width="0.5"/>`);
raw(`<text x="${SX(-15)}" y="${SY(150)}" fill="${M}" font-size="3.4" font-family="sans-serif">远</text>`);
raw(`<text x="${SX(-15)}" y="${SY(70)}" fill="${M}" font-size="3.4" font-family="sans-serif">人</text>`);

/* ── 100mm 校准尺 ── */
raw(`<line x1="${OX}" y1="${PH - 22}" x2="${OX + 100}" y2="${PH - 22}" stroke="#ffffff" stroke-width="0.7"/>`);
raw(`<line x1="${OX}" y1="${PH - 24}" x2="${OX}" y2="${PH - 20}" stroke="#ffffff" stroke-width="0.7"/>`);
raw(`<line x1="${OX + 100}" y1="${PH - 24}" x2="${OX + 100}" y2="${PH - 20}" stroke="#ffffff" stroke-width="0.7"/>`);
raw(`<text x="${OX + 103}" y="${PH - 20}" fill="#ffffff" font-size="4" font-family="sans-serif">← 这一段必须正好 100mm，不然打印被缩放了</text>`);

/* ── 右侧说明栏 ── */
const LX = OX + BOARD_W + 16;
raw(`<text x="${LX}" y="52" fill="${G}" font-size="5" font-weight="700" font-family="sans-serif">要另外裁的件（尺寸自己量着划）</text>`);
const rows = [
  ['支座顶板', '55 × 60', '× 2'],
  ['支座筷子柱', '15 长', '× 6'],
  ['梁压条', '20 × 30', '× 1'],
  ['秤台', '120 × 120', '× 2'],
  ['秤台加强筋', '筷子 110', '× 2'],
  ['管架斜撑', '三角 30', '× 3'],
  ['泵垫片', '海绵', '× 1'],
];
rows.forEach((w, i) => {
  const y = 60 + i * 11;
  raw(`<text x="${LX}" y="${y}" fill="#cfe0ee" font-size="3.8" font-family="sans-serif">${w[0]}</text>`);
  raw(`<text x="${LX + 50}" y="${y}" fill="${C}" font-size="3.6" font-family="monospace">${w[1]}</text>`);
  raw(`<text x="${LX + 84}" y="${y}" fill="${M}" font-size="3.4" font-family="sans-serif">${w[2]}</text>`);
});

raw(`<text x="${LX}" y="146" fill="${G}" font-size="5" font-weight="700" font-family="sans-serif">装配顺序</text>`);
[
  '1 底板三层交错叠，点胶压平，四周贴胶带',
  '2 支座：上下纸皮夹 6 段筷子，四角扎带绑死',
  '3 支座粘到底板 (167,75)，压重物 10 分钟',
  '4 顶板开 13 宽梁槽，梁塞进去，压条+扎带绑死',
  '5 秤台夹筷子，中心孔扎带绑到梁受力孔',
  '6 管架筷子插孔灌胶，三面贴三角斜撑',
  '7 泵垫海绵后扎带绑；模块用双面胶',
  '8 空秤去皮，读数应是 0.0 ± 0.5',
].forEach((s, i) => raw(`<text x="${LX}" y="${156 + i * 8}" fill="#cfe0ee" font-size="3.6" font-family="sans-serif">${s}</text>`));

raw(`<text x="${LX}" y="232" fill="${R}" font-size="4" font-weight="700" font-family="sans-serif">三个会失准的坑</text>`);
[
  '① 底板不平 —— 会随压力方向漂零点',
  '② 热熔胶蠕变 —— 梁只靠胶粘，第二天必飘',
  '③ 纸皮受潮 —— 楞向吸湿后强度掉一半',
].forEach((s, i) => raw(`<text x="${LX}" y="${242 + i * 8}" fill="${M}" font-size="3.5" font-family="sans-serif">${s}</text>`));

/* 图例 */
raw(`<text x="${OX}" y="${PH - 12}" fill="${R}" font-size="4" font-family="sans-serif">━ 切穿</text>`);
raw(`<text x="${OX + 24}" y="${PH - 12}" fill="${H}" font-size="4" font-family="sans-serif">○ 孔（十字是孔心）</text>`);
raw(`<text x="${OX + 76}" y="${PH - 12}" fill="${D1}" font-size="4" font-family="sans-serif">┈ 零件占位，不切</text>`);
raw(`<text x="${OX + 136}" y="${PH - 12}" fill="${C}" font-size="4" font-family="sans-serif">┅ 支座范围 / 折线</text>`);

el('</svg>');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}mm" height="${PH}mm" viewBox="0 0 ${PW} ${PH}">\n` + P.join('\n');
fs.writeFileSync(path.join(__dirname, 'cardboard_plan.svg'), svg, 'utf8');
console.log('written: cardboard_plan.svg');
