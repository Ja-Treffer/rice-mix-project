/* 5461AS-1 改为真实 12 脚：上排 6（a–f）+ 下排 6（g dp DIG1–DIG4） */
const fs = require('fs');
const W = 'E:/hardness/ricemix/_wire_body.txt';
let s = fs.readFileSync(W, 'utf8');

const start = s.indexOf("  /* ================= 5461AS-1");
const end = s.indexOf("  TX(g,380,846,");
if (start < 0 || end < 0) { console.log('BOUND FAIL', start, end); process.exit(1); }

const NEW = `  /* ================= 5461AS-1 —— 12 脚（上 6 / 下 6） ================= */
  const D={x:800,y:580,w:300,h:210};
  RC(g,D.x,D.y,D.w,D.h,{rx:4,fill:'#0d0a08',stroke:'#3a3228','stroke-width':1.6});
  TX(g,D.x+D.w/2,D.y+16,'5461AS-1',{fill:'#8a7a66','font-size':9.5,'font-weight':700,'text-anchor':'middle'});
  TX(g,D.x+D.w/2,D.y+28,'4 位共阴 · 12 脚（上 6 下 6）· 丝印面朝你',{fill:'#5f5445','font-size':7,'text-anchor':'middle'});

  /* 四位显示窗口 */
  ['1','2','0','4'].forEach((ch,k)=>{
    const wx=D.x+22+k*50;
    RC(g,wx,D.y+42,44,86,{rx:2,fill:'#180604',stroke:'#2c1210','stroke-width':1});
    TX(g,wx+22+(k===1?-5:0),D.y+108,ch,{fill:'#ff3d1a','font-size':52,'font-weight':700,'text-anchor':'middle',opacity:.95});
    if(k===1) CI(g,wx+34,D.y+112,3.4,{fill:'#ff3d1a'});
  });

  /* ── 上排 6 脚：a b c d e f ── */
  const upSeg=['a','b','c','d','e','f'];
  const upX=[];
  upSeg.forEach((n,k)=>{
    const x=D.x+32+k*44; upX.push(x);
    PT(g,'M '+x+' '+(D.y-12)+' L '+x+' '+D.y,{stroke:'#b9bfc7','stroke-width':1.4});
    CI(g,x,D.y-12,2.6,{fill:'#d4b106',stroke:'#0a1119','stroke-width':.6});
    TX(g,x,D.y+38,n,{fill:'#7d6f5c','font-size':7.6,'text-anchor':'middle'});
    W(g,[[rx+36,ry0+k*((T.h-54)/7)+5],[rx+50,ry0+k*((T.h-54)/7)+5],[rx+50,D.y-26-k*2],[x,D.y-26-k*2],[x,D.y-12]],'#4cc9f0',1.5);
  });

  /* ── 下排 6 脚：g  dp  DIG1  DIG2  DIG3  DIG4 ── */
  const dnAll=[['g',6],['dp',7],['DIG1','A2'],['DIG2','A3'],['DIG3','A4'],['DIG4','A5']];
  dnAll.forEach((it,k)=>{
    const x=D.x+32+k*44;
    PT(g,'M '+x+' '+(D.y+D.h)+' L '+x+' '+(D.y+D.h+12),{stroke:'#b9bfc7','stroke-width':1.4});
    CI(g,x,D.y+D.h+12,2.6,{fill:'#d4b106',stroke:'#0a1119','stroke-width':.6});
    TX(g,x,D.y+D.h-8,it[0],{fill:'#7d6f5c','font-size':7.2,'text-anchor':'middle'});
    if(typeof it[1]==='number'){
      /* g / dp 从下排绕到右侧再上到电阻 */
      const sidx=it[1];
      W(g,[[x,D.y+D.h+12],[x,D.y+D.h+40],[rx+50,D.y+D.h+40],[rx+50,ry0+sidx*((T.h-54)/7)+5],[rx+36,ry0+sidx*((T.h-54)/7)+5]],'#4cc9f0',1.5);
    }else{
      W(g,[[x,D.y+D.h+12],[x,852],[B5+18,852],[B5+18,rpin[it[1]]],[U.x+U.w+10,rpin[it[1]]]],'#a78bfa',1.7);
    }
  });
  TX(g,D.x+D.w/2,890,'上排 a–f + 下排 g/dp 走 595 段选（各串 220Ω）；下排 DIG1–DIG4 → A2 A3 A4 A5（不串电阻）',{fill:'#c4b5fd','font-size':7.8,'text-anchor':'middle'});
  TX(g,D.x+D.w/2,903,'接反不烧：段乱或数字左右颠倒而已，用万用表二极管档点一遍就能定脚位',{fill:'#5f7183','font-size':7.4,'text-anchor':'middle'});

`;
s = s.slice(0, start) + NEW + s.slice(end);
fs.writeFileSync(W, s, 'utf8');
console.log('ok');
