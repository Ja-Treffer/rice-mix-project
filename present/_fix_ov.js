const fs = require('fs');
const F = 'E:/hardness/ricemix/present/_gen_overview.js';
let s = fs.readFileSync(F, 'utf8');
const pairs = [
  ['RC(x, midY - 44, w, 88, light, dark, 2, 5);', 'RC(x, midY - 58, w, 112, light, dark, 2, 5);'],
  ['TX(x + w / 2, midY - 14, nm', 'TX(x + w / 2, midY - 24, nm'],
  ['TX(x + w / 2, midY + 6, sub', 'TX(x + w / 2, midY - 4, sub'],
  ['TX(x + w / 2, midY + 26, `列', 'TX(x + w / 2, midY + 18, `列'],
  ['TX(x + w / 2, midY + 48, hint', 'TX(x + w / 2, midY + 42, hint'],
  ["['5V', R], ['GND', K], ['A0', P], ['A1', P], ['A2', O], ['A3', O], ['A4', O], ['A5', O],",
   "['5V', '#FF9E9E'], ['GND', '#D6D6D6'], ['A0', '#BFA8F0'], ['A1', '#BFA8F0'], ['A2', '#FFB870'], ['A3', '#FFB870'], ['A4', '#FFB870'], ['A5', '#FFB870'],"],
  ["['D2–D5', B], ['D6 D7 D9 D10', B], ['D8', O], ['D11', B], ['D12', B], ['D13', B],",
   "['D2–D5', '#8FC4F0'], ['D6 D7 D9 D10', '#8FC4F0'], ['D8', '#FFB870'], ['D11', '#8FC4F0'], ['D12', '#8FC4F0'], ['D13', '#8FC4F0'],"],
];
let n = 0;
for (const [a, b] of pairs) {
  if (s.includes(a)) { s = s.split(a).join(b); n++; }
  else console.log('MISS:', a.slice(0, 40));
}
fs.writeFileSync(F, s, 'utf8');
console.log('applied', n, '/', pairs.length);
