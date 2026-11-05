const fs=require('fs');
const H='E:/hardness/ricemix/demo/demo.html';
let s=fs.readFileSync(H,'utf8');

const a=s.indexOf('  /* ===== 键盘 ===== */');
const b=s.indexOf('  /* ================= 连线 ================= */');
if(a<0||b<0||b<a){ console.log('ANCHOR MISS', a, b); process.exit(1); }

const body = String.raw`  /* ===== 4×4 轻触按键板（绿色 PCB，右上 8 针） ===== */
  const K={x:60,y:96,w:240,h:124};
  RC(g,K.x,K.y,K.w,K.h,{rx:2,fill:'#2e7d32',stroke:'#1b5e20','stroke-width':1.4});
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    const bx=K.x+40+c*52, by=K.y+38+r*24;
    RC(g,bx-14,by-10,28,20,{rx:1,fill:'#c9ced3',stroke:'#8b9399','stroke-width':.8});
    RC(g,bx-10,by-7,20,14,{rx:1,fill:'#1b1f24'});
    CI(g,bx,by,4,{fill:'#2d3339'});
  }
  /* 右上角 8 针排针 + 丝印 */
  for(let i=0;i<8;i++){
    const px=K.x+K.w-64+i*8.5;
    RC(g,px-2,K.y+8,4.5,15,{fill:'#c9a227',stroke:'#8a6f14','stroke-width':.5});
    CI(g,px,K.y+9,1.4,{fill:'#f0d98a'});
  }
  TX(g,K.x+K.w-30,K.y+34,'R4 R3 R2 R1 C4 C3 C2 C1',{fill:'#cfe8cf','font-size':5.2,'text-anchor':'end'});
  TX(g,K.x+8,K.y+K.h-6,'4×4 轻触按键板',{fill:'#cfe8cf','font-size':8});
  /* 引脚：8 个，落在排针中心，方便接线 */
  const kp=[];
  for(let i=0;i<8;i++) kp.push(K.x+K.w-64+i*8.5);

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
  const Hx={x:380,y:100,w:150,h:96};
  RC(g,Hx.x,Hx.y,Hx.w,Hx.h,{rx:3,fill:'#134030',stroke:'#2f7a5c','stroke-width':1.4});
  RC(g,Hx.x+46,Hx.y+26,58,40,{rx:2,fill:'#0e2a20'});
  TX(g,Hx.x+75,Hx.y+50,'HX711',{fill:'#9df3cd','font-size':10,'text-anchor':'middle','font-weight':700});
  const hxL=[],hxR=[];
  for(let i=0;i<4;i++){ const x=Hx.x+18+i*13; CI(g,x,Hx.y+Hx.h+3,2.2,{fill:'#d4b106'}); hxL.push(x); }
  for(let i=0;i<4;i++){ const y=Hx.y+22+i*20; CI(g,Hx.x+Hx.w+3,y,2.2,{fill:'#d4b106'}); hxR.push(y); }
  TX(g,Hx.x+Hx.w/2,Hx.y-9,'HX711 称重放大',{fill:'#9df3cd','font-size':10,'text-anchor':'middle'});

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
  const Rl={x:380,y:300,w:170,h:104};
  RC(g,Rl.x,Rl.y,Rl.w,Rl.h,{rx:2,fill:'#a8231f',stroke:'#7a1512','stroke-width':1.2});
  [[14,12],[Rl.w-14,12],[14,Rl.h-12],[Rl.w-14,Rl.h-12]].forEach(p=>
    CI(g,Rl.x+p[0],Rl.y+p[1],4.5,{fill:'#0d1114',stroke:'#e8c98a','stroke-width':1}));
  /* 左侧蓝色端子 DC- DC+ IN */
  RC(g,Rl.x+14,Rl.y+26,30,56,{rx:2,fill:'#1f5fa8',stroke:'#123f72','stroke-width':1});
  for(let i=0;i<3;i++) CI(g,Rl.x+29,Rl.y+37+i*18,4.5,{fill:'#c9a227'});
  TX(g,Rl.x+8,Rl.y+Rl.h-5,'DC- DC+ IN',{fill:'#f0d9a0','font-size':5.6});
  /* 蓝色继电器本体 */
  RC(g,Rl.x+66,Rl.y+20,86,66,{rx:2,fill:'#2a5fa8',stroke:'#1a3d70','stroke-width':1});
  TX(g,Rl.x+109,Rl.y+42,'JQC-3FF',{fill:'#dbe9f7','font-size':8.5,'text-anchor':'middle','font-weight':700});
  TX(g,Rl.x+109,Rl.y+54,'12VDC',{fill:'#9fc0e0','font-size':6.4,'text-anchor':'middle'});
  TX(g,Rl.x+109,Rl.y+64,'10A 250VAC',{fill:'#9fc0e0','font-size':5.6,'text-anchor':'middle'});
  /* 光耦 + 跳线帽 + 指示灯 */
  RC(g,Rl.x+50,Rl.y+30,13,10,{rx:1,fill:'#14181c'});
  RC(g,Rl.x+52,Rl.y+66,9,15,{rx:1,fill:'#14181c'});
  CI(g,Rl.x+68,Rl.y+78,3.2,{fill:'#e5484d'});
  /* 右侧蓝色端子 NO COM NC */
  RC(g,Rl.x+Rl.w-44,Rl.y+26,30,56,{rx:2,fill:'#1f5fa8',stroke:'#123f72','stroke-width':1});
  for(let i=0;i<3;i++) CI(g,Rl.x+Rl.w-29,Rl.y+37+i*18,4.5,{fill:'#c9a227'});
  TX(g,Rl.x+Rl.w-46,Rl.y+Rl.h-5,'NO COM NC',{fill:'#f0d9a0','font-size':5.6});
  const rlL=[Rl.x+14,Rl.x+14,Rl.x+14];
  const rlR=[Rl.x+Rl.w-44,Rl.x+Rl.w-44,Rl.x+Rl.w-44];
  const rlLY=[Rl.y+37,Rl.y+55,Rl.y+73];
  const rlRY=[Rl.y+37,Rl.y+55,Rl.y+73];
  rlL.forEach((v,i)=>{ rlL[i]=Rl.x+14; });
  TX(g,Rl.x+Rl.w/2,Rl.y-9,'单路光耦继电器',{fill:'#cfe0ee','font-size':10,'text-anchor':'middle'});

  /* ===== 12V 电源 ===== */
  const P={x:614,y:330,w:170,h:100};
  RC(g,P.x,P.y,P.w,P.h,{rx:4,fill:'#20262e',stroke:'#3c4650','stroke-width':1.4});
  RC(g,P.x+10,P.y+10,P.w-20,24,{rx:2,fill:'#12171c'});
  TX(g,P.x+P.w/2,P.y+27,'12V 1A',{fill:'#9fb0c0','font-size':10.5,'text-anchor':'middle','font-family':'monospace'});
  CI(g,P.x+P.w-26,P.y+60,8,{fill:'#0d1114',stroke:'#3c4650','stroke-width':1.2});
  CI(g,P.x+P.w-26,P.y+60,2.6,{fill:'#d4b106'});
  TX(g,P.x+P.w/2,P.y+P.h-8,'电源适配器',{fill:'#7d8fa2','font-size':8.5,'text-anchor':'middle'});

  /* ===== AD20P-1230C 无刷水泵 ===== */
  const M={x:840,y:404,w:150,h:118};
  RC(g,M.x+14,M.y+18,M.w-28,M.h-30,{rx:6,fill:'#1d2329',stroke:'#39434d','stroke-width':1.4});
  /* 顶部两个宝塔接头 */
  RC(g,M.x+40,M.y-2,17,22,{rx:3,fill:'#2b3238',stroke:'#4a555f','stroke-width':1});
  RC(g,M.x+92,M.y-2,17,22,{rx:3,fill:'#2b3238',stroke:'#4a555f','stroke-width':1});
  TX(g,M.x+48,M.y+12,'出',{fill:'#8fa6bb','font-size':6});
  TX(g,M.x+100,M.y+12,'进',{fill:'#8fa6bb','font-size':6});
  /* 白标签 */
  RC(g,M.x+28,M.y+34,M.w-56,42,{rx:1,fill:'#eef2f5',stroke:'#c8d2da','stroke-width':.8});
  TX(g,M.x+M.w/2,M.y+50,'AD20P-1230C',{fill:'#2a323a','font-size':7.4,'text-anchor':'middle','font-weight':700});
  TX(g,M.x+M.w/2,M.y+62,'12V 3.6W 240L/H',{fill:'#4a5560','font-size':6,'text-anchor':'middle'});
  /* 两侧安装耳 */
  RC(g,M.x+2,M.y+50,14,26,{rx:2,fill:'#1d2329',stroke:'#39434d','stroke-width':1});
  RC(g,M.x+M.w-16,M.y+50,14,26,{rx:2,fill:'#1d2329',stroke:'#39434d','stroke-width':1});
  CI(g,M.x+9,M.y+63,3.2,{fill:'#0d1114'});
  CI(g,M.x+M.w-9,M.y+63,3.2,{fill:'#0d1114'});
  TX(g,M.x+M.w/2,M.y+M.h+13,'12V 无刷水泵',{fill:'#8fa6bb','font-size':9,'text-anchor':'middle'});
  /* 红黑电源线从底部引出 */
  PT(g,'M'+(M.x+56)+','+(M.y+M.h-14)+' q -14 22 -8 34',{stroke:'#e5484d','stroke-width':2.4,fill:'none'});
  PT(g,'M'+(M.x+72)+','+(M.y+M.h-14)+' q -8 24 -2 36',{stroke:'#1a1e22','stroke-width':2.4,fill:'none'});
  const mp=[M.x+56,M.x+72];

`;

s = s.slice(0,a) + body + s.slice(b);
fs.writeFileSync(H,s,'utf8');
console.log('devices rewritten, len', s.length);
