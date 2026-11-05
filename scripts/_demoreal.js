const fs=require('fs');
const H='E:/hardness/ricemix/demo/demo.html';
let s=fs.readFileSync(H,'utf8');
const miss=[];
const R=(a,b)=>{ if(!s.includes(a)){ miss.push(a.slice(0,45)); return; } s=s.replace(a, ()=>b); };

/* ---------- 1. CSS：视图切换按钮 ---------- */
R(`.chip.on{border-color:#2a5f78;color:#8fe6ff;background:#0d3346}`,
`.chip.on{border-color:#2a5f78;color:#8fe6ff;background:#0d3346}
.vsw{font-size:11.5px;padding:3px 12px;border-radius:99px;border:1px solid #1d2c3a;
  background:#0b1319;color:#8fa6bb;cursor:pointer;font-family:inherit;transition:.15s}
.vsw:hover{border-color:#2f5266;color:#a9c4d6}
.vsw.on{border-color:#2a5f78;color:#8fe6ff;background:#0d3346;font-weight:600}`);

/* ---------- 2. section 01 改成双视图 ---------- */
R(`    <div class="sh"><span class="n">01</span><h2>接线图</h2><span class="tag">照着连就行</span></div>
    <div class="card">
      <svg id="wire" viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid meet"></svg>
    </div>`,
`    <div class="sh"><span class="n">01</span><h2>接线图</h2>
      <button class="vsw on" data-v="w">原理图</button>
      <button class="vsw" data-v="r">实物图</button>
    </div>
    <div class="card" id="stageW">
      <svg id="wire" viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid meet"></svg>
    </div>
    <div class="card" id="stageR" style="display:none">
      <svg id="real" viewBox="0 0 1100 660" preserveAspectRatio="xMidYMid meet"></svg>
    </div>`);

/* ---------- 3. 后续小节编号顺延 ---------- */
R('<span class="n">02</span><h2>四个按键</h2>', '<span class="n">02</span><h2>四个按键</h2>');

/* ---------- 4. 追加实物图绘制 + 切换逻辑 ---------- */
const realCode = `
/* ---------------- 实物装配图 ---------------- */
function drawReal(){
  const g=$('#real');
  RC(g,0,0,1100,660,{fill:'#080c12',stroke:'none',rx:0});
  TX(g,40,38,'米水配比 Demo · 实物装配',{fill:'#e4edf6','font-size':15,'font-weight':700});
  TX(g,40,56,'按真实器件的长相和引脚方位画，1mm ≈ 5px',{fill:'#6f8ba3','font-size':10});

  /* 分区框 */
  RC(g,30,76,300,540,{fill:'none',stroke:'#16212c','stroke-width':1,'stroke-dasharray':'6 5'});
  RC(g,348,76,730,540,{fill:'none',stroke:'#16212c','stroke-width':1,'stroke-dasharray':'6 5'});
  TX(g,40,94,'弱电区：UNO + 键盘',{fill:'#4d6b82','font-size':9.5});
  TX(g,358,94,'强电 / 水路区：秤、继电器、泵、电源',{fill:'#4d6b82','font-size':9.5});

  /* ========== UNO 蓝色兼容板 ========== */
  const U={x:60,y:110,w:240,h:300};
  RC(g,U.x,U.y,U.w,U.h,{rx:5,fill:'#123a63',stroke:'#2b6fa8','stroke-width':1.6});
  /* 左短边：复位按钮 / USB / DC 座 */
  CI(g,U.x+26,U.y+40,9,{fill:'#e5484d',stroke:'#7a1a22','stroke-width':1.4});
  RC(g,U.x-6,U.y+92,26,30,{rx:2,fill:'#8fa6bb'});
  RC(g,U.x-4,U.y+200,24,34,{rx:2,fill:'#0d1114'});
  TX(g,U.x+42,U.y+140,'UNO',{fill:'#cfe0ee','font-size':22,'font-weight':700,opacity:.5});
  TX(g,U.x+42,U.y+164,'R3 COMPATIBLE',{fill:'#cfe0ee','font-size':8,opacity:.35});
  RC(g,U.x+70,U.y+90,70,34,{rx:3,fill:'#0f2c4a'});   /* 主控芯片 */
  RC(g,U.x+86,U.y+134,38,26,{rx:2,fill:'#0f2c4a'});  /* 晶振 */

  /* 上长边：DIGITAL 排 */
  const topY=U.y-4;
  RC(g,U.x+18,topY,U.w-30,10,{rx:2,fill:'#0a1119'});
  const dup=['SCL','SDA','AREF','GND','13','12','11','10','9','8','7','6','5','4','3','2','TX','RX'];
  const tp=[];
  dup.forEach((n,i)=>{
    const x=U.x+26+i*11.6;
    CI(g,x,topY+5,2.2,{fill:'#d4b106'});
    tp.push({n,x});
    if(['5','4','3','2','8','13','GND'].includes(n)) TX(g,x,topY-6,n,{fill:'#8fb6d4','font-size':7.5,'text-anchor':'middle'});
  });
  TX(g,U.x+U.w/2,topY+26,'DIGITAL 排（上长边）',{fill:'#4d6b82','font-size':8.5,'text-anchor':'middle'});

  /* 下长边：POWER + ANALOG */
  const botY=U.y+U.h+4;
  RC(g,U.x+18,botY,U.w-30,10,{rx:2,fill:'#0a1119'});
  const dp=['5V','GND','A0','A1'];
  const bp=[];
  dp.forEach((n,i)=>{
    const x=U.x+40+i*15;
    CI(g,x,botY+5,2.2,{fill:'#d4b106'});
    bp.push({n,x});
    TX(g,x,botY+22,n,{fill:'#8fb6d4','font-size':7.5,'text-anchor':'middle'});
  });
  TX(g,U.x+U.w-52,botY+22,'POWER/ANALOG',{fill:'#4d6b82','font-size':7.5});

  /* ========== 键盘 ========== */
  const K={x:60,y:460,w:240,h:140};
  RC(g,K.x,K.y,K.w,K.h,{rx:4,fill:'#171b21',stroke:'#0a0d10','stroke-width':1.5});
  RC(g,K.x+6,K.y+6,K.w-12,K.h-30,{rx:3,fill:'#242a31'});
  for(let r=0;r<4;r++)for(let c=0;c<4;c++)
    CI(g,K.x+34+c*58,K.y+34+r*26,9,{fill:'#3c444e',stroke:'#23282f','stroke-width':.8});
  TX(g,K.x+K.w/2,K.y+K.h-10,'4×4 薄膜键盘',{fill:'#7d8fa2','font-size':8.5,'text-anchor':'middle'});
  /* 键盘 8 针排 */
  const kp=[];
  for(let i=0;i<8;i++){
    const x=K.x+20+i*28;
    CI(g,x,K.y-4,2.2,{fill:'#d4b106'});
    kp.push(x);
  }

  /* ========== HX711 ========== */
  const H={x:372,y:150,w:150,h:100};
  RC(g,H.x,H.y,H.w,H.h,{rx:3,fill:'#134030',stroke:'#2f7a5c','stroke-width':1.4});
  RC(g,H.x+44,H.y+26,60,44,{rx:2,fill:'#0e2a20'});
  TX(g,H.x+74,H.y+52,'HX711',{fill:'#9df3cd','font-size':10,'text-anchor':'middle','font-weight':700});
  for(let i=0;i<4;i++){ CI(g,H.x+22+i*10,H.y+H.h-6,2.2,{fill:'#d4b106'}); }   /* 下排焊盘 */
  for(let i=0;i<4;i++){ CI(g,H.x+H.w-30+i*8,H.y+6,2.2,{fill:'#d4b106'}); }   /* 上排（接秤） */
  TX(g,H.x+H.w/2,H.y-8,'HX711 称重放大',{fill:'#9df3cd','font-size':10,'text-anchor':'middle'});

  /* ========== 秤：悬臂梁 + 容器 ========== */
  const S={x:600,y:110,w:200,h:150};
  /* 容器 */
  RC(g,S.x,S.y,S.w,S.h,{rx:3,fill:'#1a2230',stroke:'#3a5064','stroke-width':1.4,opacity:.95});
  RC(g,S.x+10,S.y+60,S.w-20,44,{fill:'#c9b98a'});                 /* 米层 */
  RC(g,S.x+10,S.y+104,S.w-20,36,{fill:'#2b6f8a',opacity:.8});     /* 水层 */
  PT(g,'M '+(S.x+10)+' '+(S.y+104)+' q 12 -6 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0',
     {stroke:'#5fb6d6','stroke-width':1.4});
  /* 悬臂梁 */
  const LC={x:S.x+10,y:S.y+S.h+8,w:S.w-20,h:26};
  RC(g,LC.x,LC.y,LC.w,LC.h,{rx:2,fill:'#8d99a6',stroke:'#5d6b78','stroke-width':1});
  RC(g,LC.x+8,LC.y+6,40,14,{rx:2,fill:'#6d7a86'});
  /* 秤台 */
  RC(g,S.x-6,S.y+S.h,212,10,{rx:2,fill:'#3a4652',stroke:'#2a343e','stroke-width':1});
  TX(g,S.x+S.w/2,LC.y+40,'5kg 悬臂梁 + 亚克力台',{fill:'#6f8ba3','font-size':9,'text-anchor':'middle'});
  const lcpin=[];
  for(let i=0;i<4;i++){ const x=LC.x+LC.w-56+i*12; CI(g,x,LC.y+LC.h+4,2.2,{fill:'#d4b106'}); lcpin.push(x); }

  /* ========== 继电器 ========== */
  const Rl={x:372,y:330,w:150,h:104};
  RC(g,Rl.x,Rl.y,Rl.w,Rl.h,{rx:3,fill:'#1b2f52',stroke:'#37639a','stroke-width':1.4});
  RC(g,Rl.x+34,Rl.y+24,66,42,{rx:2,fill:'#0f2440'});
  TX(g,Rl.x+67,Rl.y+50,'RELAY',{fill:'#8fb6d4','font-size':9,'text-anchor':'middle'});
  for(let i=0;i<3;i++){ CI(g,Rl.x+20+i*12,Rl.y+Rl.h-6,2.2,{fill:'#d4b106'}); }   /* VCC GND IN */
  for(let i=0;i<3;i++){ CI(g,Rl.x+Rl.w-44+i*14,Rl.y+Rl.h-6,2.2,{fill:'#4cc9f0'}); } /* COM NO NC */
  TX(g,Rl.x+Rl.w/2,Rl.y-8,'单路继电器',{fill:'#cfe0ee','font-size':10,'text-anchor':'middle'});

  /* ========== 泵 ========== */
  const M={x:850,y:110,w:150,h:130};
  RC(g,M.x,M.y,M.w,M.h,{rx:6,fill:'#23303d',stroke:'#48627a','stroke-width':1.6});
  CI(g,M.x+70,M.y+58,30,{fill:'none',stroke:'#5f7f99','stroke-width':1.6});
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;
    PT(g,'M '+(M.x+70)+' '+(M.y+58)+' L '+(M.x+70+26*Math.cos(a))+' '+(M.y+58+26*Math.sin(a)),
       {stroke:'#5f7f99','stroke-width':1.4});
  }
  /* 宝塔接头 */
  RC(g,M.x-8,M.y+44,14,16,{rx:2,fill:'#7f8c99'});
  TX(g,M.x+M.w/2,M.y+M.h-8,'12V 潜水泵',{fill:'#8fa6bb','font-size':9,'text-anchor':'middle'});
  const mpin=[M.x+46,M.x+104];
  mpin.forEach(x=>{ CI(g,x,M.y+M.h+6,2.2,{fill:'#d4b106'}); });

  /* ========== 电源 ========== */
  const P={x:600,y:360,w:170,h:110};
  RC(g,P.x,P.y,P.w,P.h,{rx:4,fill:'#20262e',stroke:'#3c4650','stroke-width':1.4});
  RC(g,P.x+10,P.y+10,P.w-20,26,{rx:2,fill:'#12171c'});
  TX(g,P.x+P.w/2,P.y+28,'12V 1A',{fill:'#9fb0c0','font-size':11,'text-anchor':'middle','font-family':'monospace'});
  CI(g,P.x+P.w-30,P.y+66,9,{fill:'#0d1114',stroke:'#3c4650','stroke-width':1.2});  /* DC 座 */
  CI(g,P.x+P.w-30,P.y+66,3,{fill:'#d4b106'});
  TX(g,P.x+P.w/2,P.y+P.h-8,'电源适配器',{fill:'#7d8fa2','font-size':8.5,'text-anchor':'middle'});

  /* ================= 连线 ================= */
  /* 1) 秤 → HX711：四条横线（秤在下，HX711 在上，走 L 形） */
  const hxTop=[H.x+H.w-30,H.x+H.w-22,H.x+H.w-14,H.x+H.w-6];
  lcpin.forEach((x,i)=>{
    const col=['#f472b6','#2b3340','#c084fc','#c084fc'][i];
    W(g,[[x,LC.y+LC.h+4],[x,LC.y+LC.h+16],[hxTop[i],LC.y+LC.h+16],[hxTop[i],H.y+6]],col,2);
  });
  TX(g,S.x-6,LC.y+60,'秤的四根线接 HX711 上排',{fill:'#6f8ba3','font-size':8});

  /* 2) HX711 → UNO：四条走下走廊 */
  const hxBot=[H.x+22,H.x+32,H.x+42,H.x+52];
  const uTop=[bp[0].x,bp[1].x,bp[2].x,bp[3].x];   /* 5V GND A0 A1 */
  const lay=[300,306,312,318];
  const hcol=['#e5484d','#2b3340','#3ddc97','#ffd23f'];
  hxBot.forEach((x,i)=>{
    W(g,[[x,H.y+H.h-6],[x,lay[i]],[uTop[i],lay[i]],[uTop[i],botY+5]],hcol[i],2);
  });

  /* 3) UNO → 继电器：5V / GND / D8 */
  const rlLeft=[Rl.x+20,Rl.x+32,Rl.x+44];      /* VCC GND IN */
  W(g,[[bp[0].x,botY+5],[bp[0].x,352],[rlLeft[0],352],[rlLeft[0],Rl.y+Rl.h-6]],'#e5484d',2);
  W(g,[[bp[1].x,botY+5],[bp[1].x,364],[rlLeft[1],364],[rlLeft[1],Rl.y+Rl.h-6]],'#2b3340',2);
  /* D8 在上长边，绕右侧下来 */
  const d8=tp.find(p=>p.n==='8');
  W(g,[[d8.x,topY+5],[d8.x,92],[338,92],[338,394],[rlLeft[2],394],[rlLeft[2],Rl.y+Rl.h-6]],'#ff9f1c',2.4);

  /* 4) 键盘 8 线 → UNO 上长边（D2..D10 那一侧） */
  const kcol=['#4cc9f0','#3ddc97','#ffd23f','#a78bfa','#4cc9f0','#3ddc97','#ffd23f','#a78bfa'];
  const dmap=['2','3','4','5','6','7','9','10'];
  kp.forEach((x,i)=>{
    const t=tp.find(p=>p.n===dmap[i]);
    W(g,[[x,K.y-4],[x,K.y-20],[t.x,K.y-20],[t.x,topY+5]],kcol[i],1.7);
  });
  TX(g,K.x+8,K.y-26,'8 根排线：行 D2–D5，列 D6 D7 D9 D10',{fill:'#5d7387','font-size':8});

  /* 5) 强电：电源 + → COM，NO → 泵 +，泵 − → 电源 − */
  const rlRight=[Rl.x+Rl.w-44,Rl.x+Rl.w-30,Rl.x+Rl.w-16];  /* COM NO NC */
  W(g,[[P.x,P.y-6],[P.x-14,P.y-6],[P.x-14,470],[rlRight[0],470],[rlRight[0],Rl.y+Rl.h-6]],'#4cc9f0',2.6);
  W(g,[[rlRight[1],Rl.y+Rl.h-6],[rlRight[1],510],[mpin[0],510],[mpin[0],M.y+M.h+6]],'#4cc9f0',2.6);
  W(g,[[mpin[1],M.y+M.h+6],[mpin[1],470],[P.x+P.w-30,470],[P.x+P.w-30,P.y+66]],'#7dd3fc',2.6);

  /* 6) 共地虚线：电源 − → UNO GND */
  W(g,[[P.x+P.w-30,P.y+66],[P.x+P.w-30,540],[bp[1].x,540],[bp[1].x,botY+16]],'#ff4d5e',2,{'stroke-dasharray':'7 5'});

  /* 标注 */
  TX(g,352,548,'★ 共地（红色虚线）：12V 电源负极必须接 Arduino GND',{fill:'#ff4d5e','font-size':9.5});
  TX(g,352,566,'强电三层：470 泵+ / 510 泵− / 540 共地，与信号线隔开 150px 以上',{fill:'#5d7387','font-size':8.5});
  TX(g,40,640,'黄针=排针   青针=继电器触点   银色=悬臂梁   米黄=米   蓝=水',{fill:'#4d6b82','font-size':8.5});
}

/* 视图切换 */
document.querySelectorAll('.vsw').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.vsw').forEach(x=>x.classList.toggle('on',x===btn));
    const r=btn.dataset.v==='r';
    $('#stageW').style.display=r?'none':'block';
    $('#stageR').style.display=r?'block':'none';
    if(r && !window.__realDrawn){ window.__realDrawn=1; drawReal(); }
  };
});
`;

R(`</script>
</body>`, realCode + `
</script>
</body>`);

fs.writeFileSync(H,s,'utf8');
console.log(miss.length? 'MISS:\n'+miss.join('\n') : 'ok, html '+s.length);
