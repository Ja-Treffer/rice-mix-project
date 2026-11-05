const fs = require('fs');
const F = 'E:/hardness/ricemix/present/_gen_wiring_table.js';
let s = fs.readFileSync(F, 'utf8');
const bad = ">${o.op || ''}</text>";
const good = ">${t}</text>";
const had = s.includes(bad);
s = s.split(bad).join(good);
fs.writeFileSync(F, s, 'utf8');
console.log('found placeholder:', had, '| now ok:', s.includes(good));
