// 给每页在 sec 标签下插入一条橙色粗线（PPTD 不支持 rect，用 ━ 字符模拟）
const fs = require('fs');
const path = require('path');
const DIR = 'E:/hardness/ricemix/present/deck/pages';
const PX = 900;          // 线的横向量（pt）
const ORANGE = '#E85D26';

let touched = 0;
for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.page'))) {
  const p = path.join(DIR, f);
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('elementId: hrule')) continue;

  // 找到 sec 元素块结尾，插在其后
  const i = s.indexOf('- elementId: sec');
  if (i < 0) continue;
  // sec 块的 elementId 之后到下一个 "- elementId:" 之间
  const next = s.indexOf('- elementId:', i + 5);
  if (next < 0) continue;
  const tail = s.slice(next);

  // 从 sec 块里读背景推断文字色（白底用橙、深底用橙都行，直接用橙）
  const rule =
    `  - elementId: hrule\n` +
    `    elementType: text\n` +
    `    bounds: [48, 54, 864, 14]\n` +
    `    content:\n` +
    `      text: |\n` +
    `        ${'━'.repeat(96)}\n` +
    `      style:\n` +
    `        fontSize: 8\n` +
    `        fontFace: Microsoft YaHei\n` +
    `        color: "${ORANGE}"\n` +
    `        bold: true\n` +
    `        align: left\n`;

  s = s.slice(0, next) + rule + tail;
  fs.writeFileSync(p, s, 'utf8');
  touched++;
}
console.log('hrule inserted into', touched, 'pages');
