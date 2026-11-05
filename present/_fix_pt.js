const fs = require('fs');
const F = 'E:/hardness/ricemix/present/_gen_parts_table.js';
let s = fs.readFileSync(F, 'utf8');
const pairs = [
  ['y = 890;\nTX(40, y, \'⑤ 保护件（四根线）\'', 'y = 946;\nTX(40, y, \'⑤ 保护件（四根线）\''],
  ['y = 1150;\nTX(40, y, \'⑥ Arduino UNO 一共用掉 16 个脚\'', 'y = 1170;\nTX(40, y, \'⑥ Arduino UNO 一共用掉 16 个脚\''],
  ['TX(40, 1500, \'接完对着这张表一行一行核', 'TX(40, 1530, \'接完对着这张表一行一行核'],
  ['const W = 1400, H = 1560;', 'const W = 1400, H = 1580;'],
];
let n = 0;
for (const [a, b] of pairs) {
  if (s.includes(a)) { s = s.split(a).join(b); n++; } else console.log('MISS:', a.slice(0, 40));
}
fs.writeFileSync(F, s, 'utf8');
console.log('applied', n, '/', pairs.length);
