const fs = require('fs');
const F = 'E:/hardness/ricemix/present/_gen_t02.js';
let s = fs.readFileSync(F, 'utf8');
s = s.split("TX(rx + cw * 3, ry + 18, '红条 = 5V', { a: 'middle', sz: 13, c: '#ffffff', w: 700 });")
     .join("TX(rx + cw * 6 + 18, ry + 18, '◀ 红条 = 5V', { sz: 13, c: R, w: 700 });");
s = s.split("TX(rx + cw * 3, ry + 52, '蓝条 = GND', { a: 'middle', sz: 13, c: '#ffffff', w: 700 });")
     .join("TX(rx + cw * 6 + 18, ry + 52, '◀ 蓝条 = GND', { sz: 13, c: B, w: 700 });");
s = s.split("RC(rx - 20, ry - 20, cw * 6 + 40, 128, '#F1EBDF', '#D9D0BE', 2, 6);")
     .join("RC(rx - 20, ry - 20, cw * 6 + 210, 128, '#F1EBDF', '#D9D0BE', 2, 6);");
fs.writeFileSync(F, s, 'utf8');
console.log('ok');
