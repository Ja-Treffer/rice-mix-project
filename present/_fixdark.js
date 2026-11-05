// 修深底页（#121212）上被写成黑字的标题 —— 黑底黑字等于看不见
const fs = require('fs');
const F = 'E:/hardness/ricemix/present/build_deck.js';
const lines = fs.readFileSync(F, 'utf8').split('\n');

// 行号（1-based）→ 替换颜色
const FIX = {
  125: 'WHITE',   // 分隔页 stitle
  200: 'WHITE',   // 08 tradeoff title
  218: 'ORANGE',  // 08 结论行
  322: 'WHITE',   // 17 loop title
  326: 'WHITE',   // 17 节点标题
  331: 'WHITE',   // 17 侧栏标题
  441: 'WHITE',   // 25 impact title
  454: 'ORANGE',  // 25 结论行
};

let n = 0;
for (const [ln, col] of Object.entries(FIX)) {
  const i = Number(ln) - 1;
  const before = lines[i];
  if (!before || !before.includes('color: INKC')) {
    console.log('skip', ln, before ? before.trim().slice(0, 60) : '(empty)');
    continue;
  }
  lines[i] = before.replace('color: INKC', 'color: ' + col);
  n++;
}
fs.writeFileSync(F, lines.join('\n'), 'utf8');
console.log('patched', n, 'lines');
