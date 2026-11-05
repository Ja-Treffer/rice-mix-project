/* 两张图都加 1N4007 + 1000uF 保护件 */
const fs = require('fs');

/* ---------- 1) 原理图 ---------- */
const W = 'E:/hardness/ricemix/_wire_body.txt';
let w = fs.readFileSync(W, 'utf8');
const miss = [];
const R = (a, b) => { if (!w.includes(a)) { miss.push('W:' + a.slice(0, 40)); return; } w = w.replace(a, () => b); };

R("  /* ================= 74HC595（16 脚全画） ================= */",
`  /* ================= 保护件：1N4007 + 1000μF ================= */
  const PB={x:700,y:462,w:230,h:74};
  RC(g,PB.x,PB.y,PB.w,PB.h,{fill:'none',stroke:'#3a4a5c','stroke-width':1,'stroke-dasharray':'5 4',rx:3});
  TX(g,PB.x+PB.w/2,PB.y-6,'保护件（这两样不装，泵一停就烧三极管）',{fill:'#ffb020','font-size':8,'text-anchor':'middle'});

  /* 1N4007 二极管符号：三角 + 阴极横杠，反并联在泵两端 */
  const dx=728, dy=PB.y+34;
  PT(g,'M '+(dx-22)+' '+dy+' L '+(dx+6)+' '+dy,{stroke:'#ff9f1c','stroke-width':1.8});
  PT(g,'M '+(dx+6)+' '+(dy-11)+' L '+(dx+6)+' '+(dy+11),{stroke:'#ff9f1c','stroke-width':2.4});
  PT(g,'M '+(dx+6)+' '+dy+' L '+(dx+34)+' '+dy,{stroke:'#ff9f1c','stroke-width':1.8});
  PT(g,'M '+(dx-14)+' '+(dy-10)+' L '+(dx+2)+' '+dy+' L '+(dx-14)+' '+(dy+10)+' Z',{stroke:'#ff9f1c','stroke-width':1.4,fill:'none'});
  TX(g,dx+6,dy+26,'1N4007',{fill:'#ffb020','font-size':7.6,'text-anchor':'middle'});
  TX(g,dx+6,dy+36,'反并联在泵 ± 两端',{fill:'#7d8fa2','font-size':7,'text-anchor':'middle'});

  /* 1000uF 电解电容符号：一实一空两条平行线 */
  const cx2=880, cy2=PB.y+34;
  PT(g,'M '+(cx2-20)+' '+cy2+' L '+(cx2-5)+' '+cy2,{stroke:'#7dd3fc','stroke-width':1.8});
  PT(g,'M '+(cx2-5)+' '+(cy2-13)+' L '+(cx2-5)+' '+(cy2+13),{stroke:'#7dd3fc','stroke-width':2.6});
  PT(g,'M '+(cx2+5)+' '+(cy2-13)+' A 13 13 0 0 1 '+(cx2+5)+' '+(cy2+13),{stroke:'#7dd3fc','stroke-width':2.6,fill:'none'});
  PT(g,'M '+(cx2+5)+' '+cy2+' L '+(cx2+22)+' '+cy2,{stroke:'#7dd3fc','stroke-width':1.8});
  TX(g,cx2-16,cy2-18,'+',{fill:'#7dd3fc','font-size':9,'font-weight':700});
  TX(g,cx2+4,cy2+26,'1000μF / 25V',{fill:'#7dd3fc','font-size':7.6,'text-anchor':'middle'});
  TX(g,cx2+4,cy2+36,'并在 12V 电源 ±，泵启动瞬间兜住电压塌陷',{fill:'#7d8fa2','font-size':6.8,'text-anchor':'middle'});

  /* ================= 74HC595（16 脚全画） ================= */`);

fs.writeFileSync(W, w, 'utf8');

/* ---------- 2) 实物图 ---------- */
const H = 'E:/hardness/ricemix/demo/demo.html';
let s = fs.readFileSync(H, 'utf8');
const R2 = (a, b) => { if (!s.includes(a)) { miss.push('H:' + a.slice(0, 40)); return; } s = s.replace(a, () => b); };

R2("  /* 标注 */\n  TX(g,360,634,",
`  /* 7) 保护件：1N4007 反并联泵两端，1000μF 并在电源两端 */
  RC(g,700,620,180,74,{fill:'none',stroke:'#3a4a5c','stroke-width':1,'stroke-dasharray':'5 4',rx:3});
  TX(g,790,612,'保护件（必装）',{fill:'#ffb020','font-size':8.5,'text-anchor':'middle'});
  /* 1N4007：黑柱 + 白环 */
  RC(g,714,646,30,12,{rx:2,fill:'#1a1a1a',stroke:'#3a3a3a','stroke-width':1});
  RC(g,738,646,6,12,{rx:1,fill:'#d8d8d8',stroke:'#9a9a9a','stroke-width':.8});
  TX(g,729,672,'1N4007',{fill:'#a8b8c8','font-size':7,'text-anchor':'middle'});
  TX(g,729,682,'反并联泵 ±',{fill:'#5f7183','font-size':6.4,'text-anchor':'middle'});
  /* 1000uF：圆柱 + 顶部十字 */
  RC(g,800,640,26,26,{rx:2,fill:'#1f2a38',stroke:'#4a5d72','stroke-width':1});
  PT(g,'M 806 653 L 820 653',{stroke:'#5f7f99','stroke-width':1.2});
  PT(g,'M 813 646 L 813 660',{stroke:'#5f7f99','stroke-width':1.2});
  TX(g,813,676,'1000μF',{fill:'#a8b8c8','font-size':7,'text-anchor':'middle'});
  TX(g,813,686,'并电源 ±',{fill:'#5f7183','font-size':6.4,'text-anchor':'middle'});

  /* 标注 */
  TX(g,360,634,`);

fs.writeFileSync(H, s, 'utf8');
console.log(miss.length ? 'MISS:\n' + miss.join('\n') : 'all applied');
