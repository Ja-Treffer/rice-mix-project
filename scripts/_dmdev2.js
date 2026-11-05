const fs=require('fs');
const H='E:/hardness/ricemix/demo/demo.html';
let s=fs.readFileSync(H,'utf8');

const a=s.indexOf('function drawReal(){');
const b=s.indexOf('/* 视图切换 */');
if(a<0||b<0||b<a){ console.log('ANCHOR MISS', a, b); process.exit(1); }

const body = String.raw`function drawReal(){
  const g=$('#real');
  RC(g,0,0,1100,680,{fill:'#080c12',stroke:'none',rx:0});
  TX(g,40,34,'米水配比 Demo · 实物装配',{fill:'#e4edf6','font-size':15,'font-weight':700});
  TX(g,40,52,'照实物的真实长相画：4×4 轻触按键板（绿）、单路光耦继电器（红板 JQC-3FF）、AD20P-1230C 无刷泵',{fill:'#6f8ba3','font-size':10});

  RC(g,32,70,286,510,{fill:'none',stroke:'#16212c','stroke-width':1,'stroke-dasharray':'6 5'});
  RC(g,330,70,748,510,{fill:'none',stroke:'#16212c','stroke-width':1,'stroke-dasharray':'6 5'});
  TX(g,40,88,'弱电区：按键板 + UNO',{fill:'#4d6b82','font-size':9.5});
  TX(g,340,88,'强电 / 水路区',{fill:'#4d6b82','font-size':9.5});

  /* ===== 4×4 轻触按键板（绿色 PCB） ===== */
  const K={x:60,y:96,w:240,h:124};
  RC(g,K.x,K.y,K.w,K.h,{rx:2,fill:'#2e7d32',stroke:'#1b5e20','stroke-width':1.4});
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    const bx=K.x+34+c*50, by=K.y+30+r*24;
    RC(g,bx-13,by-9,26,18,{rx:1,fill:'#c9ced3',stroke:'#8b9399','stroke-width':.8});
    RC(g,bx-9,by-6,18,12,{rx:1,fill:'#1b1f24'});
    CI(g,bx,by,3.6,{fill:'#2d3339'});
  }
  TX(g,K.x+8,K.y+K.h-7,'4×4 轻触按键板',{fill:'#cfe8cf','font-size':8});
  const kp=[];
  for(let i=0;i<8;i++){
    const px=K.x+50+i*20;
    RC(g,px-2.5,K.y+K.h-16,5,16,{fill:'#c9a227',stroke:'#8a6f14','stroke-width':.5});
    kp.push(px);
  }
  TX(g,K.x+K.w-8,K.y+K.h-20,'R1-R4 / C1-C4',{fill:'#a8d8a8','font-size':6,'text-anchor':'end'});

  /* ===== UNO ===== */
  const U={x:60,y:262,w:240,h:290};
  RC(g,U.x,U.y,U.w,U.h,{rx:5,fill:'#123a63',stroke:'#2b6fa8','stroke-width':1.6});
  CI(g,U.x+24,U.y+36,8,{fill:'#e5484d',stroke:'#7a1a22','stroke-width':1.3});
  RC(g,U.x-6,U.y+84,24,28,{rx:2,fill:'#8fa6bb'});
  RC(g,U.x-4,U.y+190,22,32,{rx:2,fill:'#0d1114'});
  TX(g,U.x+46,U.y+150,'UNO',{fill:'#cfe0ee','font-size':21,'font-weight':700,opacity:.45});
  TX(g,U.x+46,U.y+170,'R3  COMPATIBLE',{fill:'#cfe0ee','font-size':7.5,opacity:.3});
  RC(g,U.x+74,U.y+96,66,32,{rx:3,fill:'#0f2c4a'});
  RC(g,U.x+88,U.y+138,36,24,{rx:2,fill:'#0f2c4a'});

  const topY=U.y-6;
  RC(g,U.x+18,topY,U.w-30,9,{rx:2,fill:'#0a1119'});
  const dup=['SCL','SDA','AREF','GND','13','12','11','10','9','8','7','6','5','4','3','2','TX','RX'];
  const tp={};
  dup.forEach((n,i)=>{
    const x=U.x+26+i*11.6;
    CI(g,x,topY+4.5,2.1,{fill:'#d4b106'});
    tp[n]=x;
    if(['8','13','2','10','GND'].includes(n)) TX(g,x,topY-4,n,{fill:'#8fb6d4','font-size':7,'text-anchor':'middle'});
  });
  TX(g,U.x+U.w/2,topY+22,'DIGITAL（上长边）',{fill:'#4d6b82','font-size':8,'text-anchor':'middle'});

  const botY=U.y+U.h+6;
  RC(g,U.x+18,botY,U.w-30,9,{rx:2,fill:'#0a1119'});
  const bp={};
  ['5V','GND','A0','A1'].forEach((n,i)=>{
    const x=U.x+40+i*16;
    CI(g,x,botY+4.5,2.1,{fill:'#d4b106'});
    bp[n]=x;
    TX(g,x,botY+20,n,{fill:'#8fb6d4','font-size':7.5,'text-anchor':'middle'});
  });
  TX(g,U.x+U.w-56,botY+20,'POWER / ANALOG',{fill:'#4d6b82','font-size':7.5});

  /* ===== HX711 ===== */
  const X={x:380,y:100,w:150,h:96};
  RC(g,X.x,X.y,X.w,X.h,{rx:3,fill:'#134030',stroke:'#2f7a5c','stroke-width':1.4});
  RC(g,X.x+46,X.y+26,58,40,{rx:2,fill:'#0e2a20'});
  TX(g,X.x+75,X.y+50,'HX711',{fill:'#9df3cd','font-size':10,'text-anchor':'middle','font-weight':700});
  const xl=[],xr=[];
  for(let i=0;i<4;i++){ const x=X.x+18+i*13; CI(g,x,X.y+X.h+3,2.2,{fill:'#d4b106'}); xl.push(x); }
  for(let i=0;i<4;i++){ const y=X.y+22+i*20; CI(g,X.x+X.w+3,y,2.2,{fill:'#d4b106'}); xr.push(y); }
  TX(g,X.x+X.w/2,X.y-9,'HX711 称重放大',{fill:'#9df3cd','font-size':10,'text-anchor':'middle'});

  /* ===== 秤 ===== */
  const S={x:620,y:96,w:196,h:132};
  RC(g,S.x,S.y,S.w,S.h,{rx:3,fill:'#141c26',stroke:'#3a5064','stroke-width':1.4});
  RC(g,S.x+8,S.y+52,S.w-16,40,{fill:'#c9b98a'});
  RC(g,S.x+8,S.y+92,S.w-16,32,{fill:'#2b6f8a',opacity:.85});
  PT(g,'M '+(S.x+8)+' '+(S.y+92)+' q 12 -5 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0',
     {stroke:'#5fb6d6','stroke-width':1.3});
  RC(g,S.x-6,S.y+S.h,208,9,{rx:2,fill:'#3a4652',stroke:'#2a343e','stroke-width':1});
  const LC={x:S.x+8,y:S.y+S.h+9,w:S.w-16,h:22};
  RC(g,LC.x,LC.y,LC.w,LC.h,{rx:2,fill:'#8d99a6',stroke:'#5d6b78','stroke-width':1});
  RC(g,LC.x+6,LC.y+5,36,12,{rx:2,fill:'#6d7a86'});
  TX(g,S.x+S.w/2,LC.y+LC.h+15,'5kg 悬臂梁 + 亚克力台',{fill:'#6f8ba3','font-size':8.5,'text-anchor':'middle'});
  const lcp=[];
  for(let i=0;i<4;i++){ const x=LC.x+LC.w-50+i*13; CI(g,x,LC.y+LC.h+3,2.2,{fill:'#d4b106'}); lcp.push(x); }

  /* ===== 单路光耦继电器（红板 JQC-3FF） ===== */
  const R={x:380,y:300,w:170,h:104};
  RC(g,R.x,R.y,R.w,R.h,{rx:2,fill:'#a8231f',stroke:'#7a1512','stroke-width':1.2});
  [[14,12],[R.w-14,12],[14,R.h-12],[R.w-14,R.h-12]].forEach(p=>
    CI(g,R.x+p[0],R.y+p[1],4.5,{fill:'#0d1114',stroke:'#e8c98a','stroke-width':1}));
  RC(g,R.x+14,R.y+26,30,58,{rx:2,fill:'#1f5fa8',stroke:'#123f72','stroke-width':1});
  for(let i=0;i<3;i++) CI(g,R.x+29,R.y+38+i*17,4.5,{fill:'#c9a227'});
  TX(g,R.x+6,R.y+50,'DC- DC+ IN',{fill:'#f0d9a0','font-size':5.4});
  RC(g,R.x+66,R.y+20,86,66,{rx:2,fill:'#2a5fa8',stroke:'#1a3d70','stroke-width':1});
  TX(g,R.x+109,R.y+42,'JQC-3FF',{fill:'#dbe9f7','font-size':8.5,'text-anchor':'middle','font-weight':700});
  TX(g,R.x+109,R.y+55,'12VDC',{fill:'#9fc0e0','font-size':6.4,'text-anchor':'middle'});
  TX(g,R.x+109,R.y+66,'10A 250VAC',{fill:'#9fc0e0','font-size':5.6,'text-anchor':'middle'});
  RC(g,R.x+50,R.y+30,13,10,{rx:1,fill:'#14181c'});
  RC(g,R.x+52,R.y+68,9,15,{rx:1,fill:'#14181c'});
  CI(g,R.x+70,R.y+80,3.2,{fill:'#e5484d'});
  RC(g,R.x+R.w-44,R.y+26,30,58,{rx:2,fill:'#1f5fa8',stroke:'#123f72','stroke-width':1});
  for(let i=0;i<3;i++) CI(g,R.x+R.w-29,R.y+38+i*17,4.5,{fill:'#c9a227'});
  TX(g,R.x+R.w-50,R.y+50,'NO COM NC',{fill:'#f0d9a0','font-size':5.4});
  TX(g,R.x+R.w/2,R.y-9,'单路光耦继电器',{fill:'#cfe0ee','font-size':10,'text-anchor':'middle'});
  const rIn =[R.x+14,R.y+38];
  const rDp =[R.x+14,R.y+55];
  const rIn2=[R.x+14,R.y+72];
  const rNo =[R.x+R.w-44,R.y+38];
  const rCo =[R.x+R.w-44,R.y+55];
  const rNc =[R.x+R.w-44,R.y+72];

  /* ===== 12V 电源 ===== */
  const P={x:614,y:330,w:170,h:100};
  RC(g,P.x,P.y,P.w,P.h,{rx:4,fill:'#20262e',stroke:'#3c4650','stroke-width':1.4});
  RC(g,P.x+10,P.y+10,P.w-20,24,{rx:2,fill:'#12171c'});
  TX(g,P.x+P.w/2,P.y+27,'12V 1A',{fill:'#9fb0c0','font-size':10.5,'text-anchor':'middle','font-family':'monospace'});
  CI(g,P.x+P.w-26,P.y+62,8,{fill:'#0d1114',stroke:'#3c4650','stroke-width':1.2});
  CI(g,P.x+P.w-26,P.y+62,2.6,{fill:'#d4b106'});
  TX(g,P.x+P.w/2,P.y+P.h-8,'电源适配器',{fill:'#7d8fa2','font-size':8.5,'text-anchor':'middle'});
  const pPlus=[P.x+P.w/2,P.y];
  const pMinus=[P.x+P.w-26,P.y+62];

  /* ===== AD20P-1230C 无刷水泵 ===== */
  const M={x:840,y:404,w:150,h:118};
  RC(g,M.x+14,M.y+18,M.w-28,M.h-30,{rx:6,fill:'#1d2329',stroke:'#39434d','stroke-width':1.4});
  RC(g,M.x+40,M.y-2,17,22,{rx:3,fill:'#2b3238',stroke:'#4a555f','stroke-width':1});
  RC(g,M.x+92,M.y-2,17,22,{rx:3,fill:'#2b3238',stroke:'#4a555f','stroke-width':1});
  TX(g,M.x+48,M.y+13,'出',{fill:'#8fa6bb','font-size':6});
  TX(g,M.x+100,M.y+13,'进',{fill:'#8fa6bb','font-size':6});
  RC(g,M.x+28,M.y+34,M.w-56,42,{rx:1,fill:'#eef2f5',stroke:'#c8d2da','stroke-width':.8});
  TX(g,M.x+M.w/2,M.y+50,'AD20P-1230C',{fill:'#2a323a','font-size':7.4,'text-anchor':'middle','font-weight':700});
  TX(g,M.x+M.w/2,M.y+63,'12V 3.6W  240L/H',{fill:'#4a5560','font-size':6,'text-anchor':'middle'});
  RC(g,M.x+2,M.y+50,14,26,{rx:2,fill:'#1d2329',stroke:'#39434d','stroke-width':1});
  RC(g,M.x+M.w-16,M.y+50,14,26,{rx:2,fill:'#1d2329',stroke:'#39434d','stroke-width':1});
  CI(g,M.x+9,M.y+63,3.2,{fill:'#0d1114'});
  CI(g,M.x+M.w-9,M.y+63,3.2,{fill:'#0d1114'});
  TX(g,M.x+M.w/2,M.y+M.h+16,'12V 无刷水泵',{fill:'#8fa6bb','font-size':9,'text-anchor':'middle'});
  const mPlus=[M.x+56,M.y+M.h-14];
  const mMinus=[M.x+72,M.y+M.h-14];

  /* ================= 连线（全部直角，分区走线） ================= */
  const kcol=['#4cc9f0','#3ddc97','#ffd23f','#a78bfa','#4cc9f0','#3ddc97','#ffd23f','#a78bfa'];
  const dname=['2','3','4','5','6','7','9','10'];

  /* 1) 按键板 8 线 → UNO 上长边 D2..D10 */
  kp.forEach((x,i)=>{
    const dx=tp[dname[i]];
    W(g,[[x,K.y+K.h],[x,topY+4.5]],kcol[i],1.7);
  });
  /* 按键线在 x 上未必对齐 D 脚，补一小段斜-直过渡 */
  kp.forEach((x,i)=>{
    const dx=tp[dname[i]];
    if(Math.abs(x-dx)>0.5){
      W(g,[[x,topY+4.5],[dx,topY+4.5]],kcol[i],1.7);
    }
  });

  /* 2) D8 → 继电器 IN（走 y=240 走廊到 x=354 再下） */
  W(g,[[tp['8'],topY+4.5],[tp['8'],240],[354,240],[354,rIn2[1]],[rIn2[0],rIn2[1]]],'#ff9f1c',2.4);

  /* 3) UNO 下长边 5V GND A0 A1 → HX711 下排 */
  const names=['5V','GND','A0','A1'];
  const hcol=['#e5484d','#2b3340','#3ddc97','#ffd23f'];
  const vx=[318,326,334,342];
  names.forEach((n,i)=>{
    W(g,[[bp[n],botY+4.5],[bp[n],566+i*8],[vx[i],566+i*8],[vx[i],X.y+X.h+3],[xl[i],X.y+X.h+3]],hcol[i],2);
  });

  /* 4) HX711 右排 → 秤（y=270 走廊，从右侧进） */
  lcp.forEach((x,i)=>{
    const col=['#f472b6','#2b3340','#c084fc','#c084fc'][i];
    W(g,[[x,LC.y+LC.h+3],[x,270+i*6],[X.x+X.w+24,270+i*6],[X.x+X.w+24,xr[i]],[X.x+X.w+3,xr[i]]],col,2);
  });

  /* 5) 继电器 COM → 电源 +；NO → 泵 +；泵 − → 电源 − */
  W(g,[[rCo[0],rCo[1]],[580,rCo[1]],[580,318],[pPlus[0],318],[pPlus[0],pPlus[1]]],'#4cc9f0',2.6);
  W(g,[[rNo[0],rNo[1]],[600,rNo[1]],[600,566],[880,566],[880,M.y+M.h]],'#4cc9f0',2.6);
  W(g,[[mMinus[0]+16,mMinus[1]],[912,mMinus[1]],[912,592],[798,592],[798,pMinus[1]],[pMinus[0],pMinus[1]]],'#7dd3fc',2.6);

  /* 6) 共地：电源 − → UNO GND（红虚线） */
  W(g,[[pMinus[0],pMinus[1]],[812,pMinus[1]],[812,616],[bp['GND'],616],[bp['GND'],botY+4.5]],
     '#ff4d5e',2,{'stroke-dasharray':'7 5'});

  /* 标注 */
  TX(g,360,600,'★ 共地：12V 电源负极必须接 Arduino GND（红虚线）',{fill:'#ff4d5e','font-size':9.5});
  TX(g,360,618,'强电三条走廊：318 / 566 / 592；信号线全在 300 以上，互不干扰',{fill:'#5d7387','font-size':8.5});
  TX(g,40,660,'黄针=排针    灰端子=继电器 DC- DC+ IN / NO COM NC    米黄=米    蓝=水',{fill:'#4d6b82','font-size':8.5});
}

`;

s = s.slice(0,a) + body + s.slice(b);
fs.writeFileSync(H,s,'utf8');
console.log('drawReal rewritten, len', s.length);
