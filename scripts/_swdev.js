const fs=require('fs');
const F='E:/hardness/ricemix/simulator.html';
let s=fs.readFileSync(F,'utf8');

function span(name){
  const i=s.indexOf('function '+name+'(');
  if(i<0) throw new Error('miss '+name);
  let d=0,j=i;
  for(; j<s.length; j++){ if(s[j]==='{')d++; else if(s[j]==='}'){ d--; if(d===0){ j++; break; } } }
  return [i,j];
}

const RELAY = String.raw`function drawRelay(g,x,y,w,h){
    const grp=N('g',{}); g.appendChild(grp);
    /* 红色 PCB（实物板色） */
    RC(grp,x,y,w,h,{rx:2,fill:'#a8231f',stroke:'#7a1512','stroke-width':1.4});
    /* 左侧蓝色端子 VCC GND IN */
    RC(grp,x+14,y+22,30,58,{rx:2,fill:'#1f5fa8',stroke:'#123f72','stroke-width':1});
    ['VCC','GND','IN'].forEach((l,i)=>{
      const py=y+34+i*18;
      CI(grp,x+29,py,4.6,{fill:'#c9a227'});
      TX(grp,x+48,py+2.6,l,{fill:'#f0d9a0','font-size':6.2});
    });
    /* 蓝色继电器本体 JQC-3FF */
    RC(grp,x+62,y+16,68,62,{rx:2,fill:'#2a5fa8',stroke:'#1a3d70','stroke-width':1.2});
    RC(grp,x+66,y+20,60,54,{rx:1.5,fill:'#356cb8'});
    TX(grp,x+96,y+38,'JQC-3FF',{fill:'#e6f0fb','font-size':8,'text-anchor':'middle','font-weight':700});
    TX(grp,x+96,y+51,'12VDC',{fill:'#a8c8e8','font-size':6.4,'text-anchor':'middle'});
    TX(grp,x+96,y+62,'10A 250VAC',{fill:'#a8c8e8','font-size':5.6,'text-anchor':'middle'});
    /* 光耦 / 跳线帽 / 电源灯 */
    RC(grp,x+48,y+28,13,10,{rx:1,fill:'#16191d'});
    RC(grp,x+50,y+66,9,14,{rx:1,fill:'#16191d'});
    CI(grp,x+40,y+h-16,3.2,{fill:'#e5484d'});
    /* 右侧蓝色端子 NO COM NC */
    RC(grp,x+w-46,y+22,30,58,{rx:2,fill:'#1f5fa8',stroke:'#123f72','stroke-width':1});
    ['NO','COM','NC'].forEach((l,i)=>{
      const py=y+34+i*18;
      CI(grp,x+w-31,py,4.6,{fill:'#c9a227'});
      TX(grp,x+w-50,py+2.6,l,{fill:'#f0d9a0','font-size':6.2,'text-anchor':'end'});
    });
    TX(grp,x+8,y+h-6,'DC- DC+ IN',{fill:'#f0d9a0','font-size':5.6});
    TX(grp,x+w-8,y+h-6,'NO COM NC',{fill:'#f0d9a0','font-size':5.6,'text-anchor':'end'});
    return {
      box:[x,y,w,h],
      VCC:[x+2,y+36], GND:[x+2,y+54], IN:[x+2,y+72],
      NO:[x+w-12,y+36], COM:[x+w-12,y+54], NC:[x+w-12,y+72]
    };
  }`;

const PUMP = String.raw`function drawPump(g,x,y,w,h){
    const grp=N('g',{}); g.appendChild(grp);
    /* 黑色无刷泵体 */
    RC(grp,x+14,y+18,w-28,h-30,{rx:6,fill:'#1d2329',stroke:'#39434d','stroke-width':1.4});
    /* 两侧安装耳 */
    RC(grp,x+2,y+h*0.36,14,26,{rx:2,fill:'#1d2329',stroke:'#39434d','stroke-width':1});
    RC(grp,x+w-16,y+h*0.36,14,26,{rx:2,fill:'#1d2329',stroke:'#39434d','stroke-width':1});
    CI(grp,x+9,y+h*0.36+13,3.2,{fill:'#0d1114'});
    CI(grp,x+w-9,y+h*0.36+13,3.2,{fill:'#0d1114'});
    /* 顶部两个宝塔接头 */
    RC(grp,x+w*0.36-8,y+2,16,20,{rx:3,fill:'#2b3238',stroke:'#4a555f','stroke-width':1});
    RC(grp,x+w*0.64-8,y+2,16,20,{rx:3,fill:'#2b3238',stroke:'#4a555f','stroke-width':1});
    TX(grp,x+w*0.36,y+15,'进',{fill:'#8fa6bb','font-size':6,'text-anchor':'middle'});
    TX(grp,x+w*0.64,y+15,'出',{fill:'#8fa6bb','font-size':6,'text-anchor':'middle'});
    /* 白标签 */
    RC(grp,x+24,y+h*0.36,w-48,36,{rx:1,fill:'#eef2f5',stroke:'#c8d2da','stroke-width':.8});
    TX(grp,x+w/2,y+h*0.36+15,'AD20P-1230C',{fill:'#2a323a','font-size':6.8,'text-anchor':'middle','font-weight':700});
    TX(grp,x+w/2,y+h*0.36+27,'12V 3.6W 240L/H',{fill:'#4a5560','font-size':5.6,'text-anchor':'middle'});
    /* 红黑电源线 */
    PT(grp,'M'+(x+w*0.40)+','+(y+h-16)+' q -10 20 -4 30',{stroke:'#e5484d','stroke-width':2.4,fill:'none'});
    PT(grp,'M'+(x+w*0.58)+','+(y+h-16)+' q -8 22 -2 32',{stroke:'#1d2329','stroke-width':2.4,fill:'none'});
    return {top:[x+w/2,y], bottom:[x+w/2,y+h], pos:[x,y], size:[w,h]};
  }`;

const KEYPAD = String.raw`function drawKeypad(g,x,y,w,h){
    const grp=N('g',{}); g.appendChild(grp);
    /* 绿色 PCB 轻触按键板 */
    RC(grp,x,y,w,h,{rx:2,fill:'#2e7d32',stroke:'#1b5e20','stroke-width':1.5});
    const cw=(w-44)/4, ch=(h-40)/4;
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){
      const bx=x+22+cw*c+cw/2, by=y+20+ch*r+ch/2;
      RC(grp,bx-11,by-8,22,16,{rx:1,fill:'#c9ced3',stroke:'#8b9399','stroke-width':.8});
      RC(grp,bx-8,by-5,16,10,{rx:1,fill:'#1b1f24'});
      CI(grp,bx,by,3.4,{fill:'#2d3339'});
    }
    TX(grp,x+8,y+h-7,'4×4 轻触按键板',{fill:'#cfe8cf','font-size':7.6});
    TX(grp,x+w-8,y+h-7,'R1..C4',{fill:'#a8d8a8','font-size':6,'text-anchor':'end'});
    const pins=[];
    for(let i=0;i<8;i++) pins.push([x+16+i*((w-32)/7), y]);
    return {pins:pins};
  }`;

const jobs=[['drawRelay',RELAY],['drawPump',PUMP],['drawKeypad',KEYPAD]];
/* 从后往前替换，避免索引失效 */
const done=[];
jobs.forEach(([n])=>{ const [a,b]=span(n); done.push([a,b,n]); });
done.sort((p,q)=>q[0]-p[0]);
done.forEach(([a,b,n])=>{
  const rep = jobs.find(j=>j[0]===n)[1];
  s = s.slice(0,a) + rep + s.slice(b);
});
fs.writeFileSync(F,s,'utf8');
console.log('replaced', done.map(d=>d[2]).join(', '), 'len', s.length);
