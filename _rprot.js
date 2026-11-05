/* 实物图：键盘加 S1–S16 标号；保护件画大 + 引出线 + 方向标注 */
const fs = require('fs');
const H = 'E:/hardness/ricemix/demo/demo.html';
let s = fs.readFileSync(H, 'utf8');
const miss = [];
const R = (a, b) => { if (!s.includes(a)) { miss.push(a.slice(0, 50)); return; } s = s.replace(a, () => b); };

/* --- 键盘：保留外观，加 S1–S16 --- */
R(`  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    const bx=K.x+34+c*50, by=K.y+30+r*24;
    RC(g,bx-13,by-9,26,18,{rx:1,fill:'#c9ced3',stroke:'#8b9399','stroke-width':.8});
    RC(g,bx-9,by-6,18,12,{rx:1,fill:'#1b1f24'});
    CI(g,bx,by,3.6,{fill:'#2d3339'});
  }`,
`  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    const bx=K.x+34+c*50, by=K.y+26+r*24;
    RC(g,bx-13,by-9,26,18,{rx:1,fill:'#c9ced3',stroke:'#8b9399','stroke-width':.8});
    RC(g,bx-9,by-6,18,12,{rx:1,fill:'#1b1f24'});
    CI(g,bx,by,3.6,{fill:'#2d3339'});
    TX(g,bx,by+16,'S'+(r*4+c+1),{fill:'#bfe8bf','font-size':5.6,'text-anchor':'middle'});
  }`);

/* --- 保护件：画在泵下方，带引线和方向标注 --- */
R("  /* 标注 */\n  TX(g,360,634,",
`  /* 7) 保护件：1N4007 反并联泵两端，1000μF 并在电源两端 */
  RC(g,918,700,168,150,{fill:'none',stroke:'#c08a20','stroke-width':1.1,'stroke-dasharray':'5 4',rx:3});
  TX(g,1002,690,'保护件（必装，反了会烧）',{fill:'#ffb020','font-size':8,'text-anchor':'middle'});

  /* 1N4007：黑柱 + 白环，白环那端朝泵正极 */
  RC(g,932,726,34,14,{rx:2,fill:'#1a1a1a',stroke:'#4a4a4a','stroke-width':1});
  RC(g,960,726,7,14,{rx:1,fill:'#e0e0e0',stroke:'#9a9a9a','stroke-width':.8});
  TX(g,949,752,'1N4007',{fill:'#c8d4e0','font-size':7,'text-anchor':'middle'});
  TX(g,966,722,'白环→泵+',{fill:'#ffd08a','font-size':6.4});
  /* 两根引线接到泵的 + / − */
  W(g,[[966,733],[900,733],[900,738]],'#ff9f1c',1.6);
  TX(g,941,766,'反并联在泵 ± 两端',{fill:'#7d8fa2','font-size':6.4,'text-anchor':'middle'});

  /* 1000μF：圆柱 + 十字，长脚接正 */
  RC(g,932,790,26,26,{rx:2,fill:'#1f2a38',stroke:'#4a5d72','stroke-width':1.2});
  PT(g,'M 938 803 L 952 803',{stroke:'#5f7f99','stroke-width':1.2});
  PT(g,'M 945 796 L 945 810',{stroke:'#5f7f99','stroke-width':1.2});
  RC(g,926,794,6,18,{rx:1,fill:'#d8b060',stroke:'#9a7a30','stroke-width':.6});
  TX(g,978,802,'1000μF',{fill:'#c8d4e0','font-size':7});
  TX(g,978,812,'长脚接 +（壳上白条是 −）',{fill:'#ffd08a','font-size':6.2});
  W(g,[[926,803],[900,803],[900,745]],'#7dd3fc',1.6);
  TX(g,1000,826,'并在 12V 电源 ±',{fill:'#7d8fa2','font-size':6.4,'text-anchor':'middle'});

  /* 标注 */
  TX(g,360,634,`);

fs.writeFileSync(H, s, 'utf8');
console.log(miss.length ? 'MISS:\n' + miss.join('\n') : 'all applied');
