// 按主人回答改三页：04 起点、20 卡住的地方、27 落点
const fs = require('fs');
const F = 'E:/hardness/ricemix/present/build_deck.js';
let s = fs.readFileSync(F, 'utf8');
const miss = [];
const R = (a, b) => { if (!s.includes(a)) { miss.push(a.slice(0, 52)); return; } s = s.replace(a, () => b); };

/* ── 04 页：换成他自己的原话 ── */
R("  ['q1', '凭手感倒米', 420, { size: 22, bold: true, color: ORANGE, gap: 2 }],\n  ['q1d', '半杯还是一杯？手指量水位，深浅全看当天心情。', 420, { size: 15, color: MUT_L, gap: 20 }],",
  "  ['q1', '给少了硬，给多了稀', 420, { size: 22, bold: true, color: ORANGE, gap: 2 }],\n  ['q1d', '加水这一下全凭手感：同一袋米，今天刚好，明天就失准。手感本身不是个稳定的量。', 420, { size: 15, color: MUT_L, gap: 20 }],");
R("T('read', 48, 456, 864, '共同点：没有一个可读的数字，全靠经验校准。', { size: 18, bold: true, gap: 0 });",
  "T('read', 48, 456, 864, '共同点：靠手感的东西没法复现，也没法教给别人。', { size: 18, bold: true, gap: 0 });");

/* ── 20 页：我卡的 + AI 看出来的 ── */
const old20 = s.slice(s.indexOf("/* ══════ 20 AI 真实记录 ══════ */"), s.indexOf("/* ══════ 22 演示占位 ══════ */"));
const new20 = `/* ══════ 20 卡住的地方 ══════ */
newPage('20-ai-real.page', CREAM);
head('06 / WHAT ACTUALLY HAPPENED', MUT_L);
y = 76;
y = T('title', 48, y, 864, '卡住的地方，和怎么过的', { size: 34, bold: true, gap: 22 });
T('cl', 48, y, 420, '我自己卡的', { size: 12, bold: true, color: ORANGE, gap: 18 });
col(48, y + 22, 420, [
  ['a', '买了元件，但不会焊', 420, { size: 18, bold: true, gap: 4 }],
  ['ad', '排针是散的，电烙铁没用过。最后整机没有一个焊点：面包板插模块、杜邦线走信号、螺丝端子压泵线。', 420, { size: 14, color: MUT_L, gap: 20 }],
  ['c', '共地漏了，继电器乱跳', 420, { size: 18, bold: true, gap: 4 }],
  ['cd', '12V 负极没接到 Arduino 的 GND。指示灯亮、泵不转，或者反过来一直转。量了半天才明白：两个电源必须共地。', 420, { size: 14, color: MUT_L }]
]);
T('cr', 500, y, 420, 'AI 看出来的', { size: 12, bold: true, color: ORANGE, gap: 18 });
col(500, y + 22, 420, [
  ['b', '「你的超时会掐断粥」', 420, { size: 18, bold: true, gap: 4 }],
  ['bd', '超时原本固定 20 秒。稠粥要 75 秒、稀饭要 100 秒 —— 20 秒的保险会把粥永远做不成。', 420, { size: 14, color: MUT_L, gap: 20 }],
  ['d', '「你画的图没人看得懂」', 420, { size: 18, bold: true, gap: 4 }],
  ['dd', '第一版接线图信息密度太高。改成分区图 + 十二步顺序表之后才照着插得下去。', 420, { size: 14, color: MUT_L }]
]);
T('read', 48, 448, 864, 'AI 最大的价值不是写代码，是在你自信满满的时候问一句「你测过吗」。', { size: 17, bold: true, gap: 0 });
pageNo(20, MUT_L);

`;
if (old20.length > 100) { s = s.replace(old20, () => new20); } else { miss.push('20 page block'); }

/* ── 27 页：落点收到「闭环取代手感」 ── */
R("T('sub', 48, 400, 720, '一勺米、一杯水，和一个可以被读出来的数字。', { size: 20, color: INKC, gap: 0 });",
  "T('sub', 48, 400, 760, '不是让人学会手感，是让手感变得不必要。', { size: 20, color: INKC, gap: 0 });");

fs.writeFileSync(F, s, 'utf8');
console.log(miss.length ? 'MISS:\n' + miss.join('\n') : 'all applied');
