/* 1) 视图切换绑定加 DOM 守卫 2) 原理图补回 4×4 键盘 S1–S16 */
const fs = require('fs');
const H = 'E:/hardness/ricemix/demo/demo.html';
let s = fs.readFileSync(H, 'utf8');
const miss = [];
const R = (a, b) => { if (!s.includes(a)) { miss.push('HTML:' + a.slice(0, 40)); return; } s = s.replace(a, () => b); };

/* 绑定包进函数 + DOMContentLoaded 守卫 */
R("/* 视图切换 */\ndocument.querySelectorAll('.vsw').forEach(btn=>{",
  "/* 视图切换 */\nfunction bindViewSwitch(){\ndocument.querySelectorAll('.vsw').forEach(btn=>{");
R("    if(r && !window.__realDrawn){ window.__realDrawn=1; drawReal(); }\n  };\n});\n</script>",
  "    if(r && !window.__realDrawn){ window.__realDrawn=1; try{ drawReal(); }catch(e){ console.error('drawReal', e); } }\n  };\n});\n}\nif(document.readyState==='loading') document.addEventListener('DOMContentLoaded', bindViewSwitch);\nelse bindViewSwitch();\n</script>");

/* 原理图补键盘 */
const W = 'E:/hardness/ricemix/_wire_body.txt';
let w = fs.readFileSync(W, 'utf8');
const R2 = (a, b) => { if (!w.includes(a)) { miss.push('BODY:' + a.slice(0, 40)); return; } w = w.replace(a, () => b); };

R2("  /* ================= 两条母线 ================= */",
`  /* ================= 4×4 键盘（S1–S16） ================= */
  const KB={x:70,y:512,w:200,h:150};
  RC(g,KB.x,KB.y,KB.w,KB.h,{fill:'#0f3d24',stroke:'#2f7a4c','stroke-width':1.5,rx:3});
  TX(g,KB.x+KB.w/2,KB.y-10,'4×4 键盘 · S1–S16',{fill:'#7fe0b0','font-size':9.5,'font-weight':700,'text-anchor':'middle'});
  const kbPins=['R1','R2','R3','R4','C1','C2','C3','C4'];
  const kbX=[];
  kbPins.forEach((n,k)=>{
    const x=KB.x+16+k*24; kbX.push(x);
    PT(g,'M '+x+' '+(KB.y-11)+' L '+x+' '+KB.y,{stroke:'#b9bfc7','stroke-width':1.4});
    CI(g,x,KB.y-11,2.5,{fill:'#d4b106',stroke:'#0a1119','stroke-width':.6});
    TX(g,x,KB.y+13,n,{fill:'#9df3cd','font-size':6.6,'text-anchor':'middle'});
  });
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    const kx=KB.x+22+c*44, ky=KB.y+28+r*30, idx=r*4+c+1;
    RC(g,kx,ky,34,22,{rx:2,fill:'#1b1f24',stroke:'#4a525c','stroke-width':1});
    CI(g,kx+17,ky+11,6,{fill:'#2c333b',stroke:'#565f6a','stroke-width':.8});
    TX(g,kx+17,ky+32,'S'+idx,{fill:'#7fe0b0','font-size':6.8,'text-anchor':'middle'});
  }
  /* 8 根竖线：D2–D10 → R1–C4 */
  const dpins=['D2','D3','D4','D5','D6','D7','D9','D10'];
  dpins.forEach((n,k)=>{
    const x=U.x+28+k*20;
    W(g,[[x,U.y+U.h+11],[x,KB.y-11]],'#4cc9f0',1.5);
  });
  TX(g,KB.x+KB.w+12,KB.y+40,'S1=S1..S4 第一行，S5..S8 第二行',{fill:'#4d6b82','font-size':7});
  TX(g,KB.x+KB.w+12,KB.y+54,'S1–S4 = 东北米/泰国米/软饭/烂饭',{fill:'#4d6b82','font-size':7});
  TX(g,KB.x+KB.w+12,KB.y+68,'S5–S8 = 稠粥/稀饭/自定义A/B',{fill:'#4d6b82','font-size':7});
  TX(g,KB.x+KB.w+12,KB.y+82,'S9–S12 = 启动/停止/去皮/状态',{fill:'#4d6b82','font-size':7});
  TX(g,KB.x+KB.w+12,KB.y+96,'S13–S16 = 校准/加水/存参/复位',{fill:'#4d6b82','font-size':7});

  /* ================= 两条母线 ================= */`);

fs.writeFileSync(H, s, 'utf8');
fs.writeFileSync(W, w, 'utf8');
console.log(miss.length ? 'MISS:\n' + miss.join('\n') : 'all applied');
