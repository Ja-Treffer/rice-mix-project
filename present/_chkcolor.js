const fs = require('fs');
const s = fs.readFileSync('E:/hardness/ricemix/present/build_deck.js', 'utf8');
const m = s.match(/const\s+(INKC|INK|WHITE|MUT_D|MUT_L|ORANGE|CREAM|BLACK)\s*=\s*'[^']*'/g);
console.log(m ? m.join('\n') : 'none');
console.log('---');
['08-tradeoff', '17-loop', '25-impact', '06-sec2'].forEach(f => {
  const p = 'E:/hardness/ricemix/present/deck/pages/' + f + '.page';
  const t = fs.readFileSync(p, 'utf8');
  const bgm = t.match(/background: "([^"]+)"/);
  const bg = bgm ? bgm[1] : '?';
  const idx = t.indexOf('elementId: title') >= 0 ? t.indexOf('elementId: title') : t.indexOf('elementId: stitle');
  const seg = t.slice(idx, idx + 400);
  const cm = seg.match(/color: "([^"]+)"/);
  console.log(f, '| bg', bg, '| title', cm ? cm[1] : '?');
});
