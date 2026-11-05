// 由 bracket.scad 的同一套常量生成两张 SVG：
//   1) bracket_laser.svg     1:1 激光切割排版图
//   2) bracket_assembly.svg  装配示意图（俯视 + 高度栈）
const fs = require('fs');
const OUT = 'E:/hardness/ricemix/bracket';

/* ===== 与 bracket.scad 完全一致的常量 ===== */
const BOARD_W=340, BOARD_D=210, BOARD_T=5, FIL=2;
const BEAM_L=80, BEAM_WD=12.7, BEAM_TK=2, BEAM_END_FIX=15.2, BEAM_END_LOAD=12.7, BEAM_PITCH=15, M4_D=4.4;
const LIFT=15, PAN_RISE=6, PAN=150, PAN_T=5, PAN_HOLE=4.6;
const UNO_DX=66.04, UNO_DY=53.34, M3_D=3.3, UNO_X=12, UNO_Y=20;
const RL_DX=44, RL_DY=20, RL_X=12, RL_Y=100;
const PMP_PITCH=66, PMP_X=250, PMP_Y=150;
const PED_W=56, PED_D=64, PED_X=170, PED_Y=178;
const KP_W=76, KP_D=76, KP_CUT=70, KP_X=250, KP_Y=20;
const POST_D=8, POST_H=220, POST_X=295, POST_Y=185, ARM_L=135, PIPE_OD=10, PIPE_SLOT=7;

/* 梁与秤台的推导量 */
const pedBy = PED_Y - PED_D/2;                  // 146
const ly    = pedBy + PED_D - 8;                // 202  梁固定端
const loadY = ly - BEAM_L + BEAM_END_LOAD;      // 134.7 受力孔
const panCX = PED_X, panCY = loadY;
const TOTAL_H = BOARD_T + LIFT + BEAM_TK + PAN_RISE + PAN_T;   // 33

const R='#e5484d', C='#4cc9f0', G='#3ddc97', MUT='#6f8ba3';
const F='font-family="ui-monospace,Consolas,monospace"';

function r(n){ return Math.round(n*100)/100; }
const P = [];
const el = s => P.push(s);
const line=(x1,y1,x2,y2,o='')=>el('<line x1="'+r(x1)+'" y1="'+r(y1)+'" x2="'+r(x2)+'" y2="'+r(y2)+'" '+o+'/>');
const rect=(x,y,w,h,o='')=>el('<rect x="'+r(x)+'" y="'+r(y)+'" width="'+r(w)+'" height="'+r(h)+'" '+o+'/>');
const circ=(cx,cy,rr,o='')=>el('<circle cx="'+r(cx)+'" cy="'+r(cy)+'" r="'+r(rr)+'" '+o+'/>');
let CUT_ONLY = false;   // true 时只输出几何，一个字符都不留
const text=(x,y,s,o='')=>{ if(CUT_ONLY) return; el('<text x="'+r(x)+'" y="'+r(y)+'" '+F+' '+o+'>'+s+'</text>'); };

/* ==========================================================
   图 1：激光切割排版（1:1）
   ========================================================== */
function figLaser(){
P.length=0;
const OX=22, OY=42;
const sx = x => OX + x;
const sy = y => OY + (BOARD_D - y);

el('<svg xmlns="http://www.w3.org/2000/svg" width="710mm" height="430mm" viewBox="0 0 710 430">');
rect(0,0,710,430,'fill="#0b1016"');
text(16,16,'米水配比系统 · 激光切割件（1:1，单位 mm，打印务必选「实际大小 / 100%」）','fill="#e4edf6" font-size="9" font-weight="700"');
text(16,27,'红 = 切割线    青 = 标注（不切）    材料：亚克力 5mm','fill="'+MUT+'" font-size="6.5"');

/* ① 底板 */
rect(sx(0),sy(BOARD_D),BOARD_W,BOARD_D,'fill="none" stroke="'+R+'" stroke-width="0.35"');
const hole=(x,y,d,label,col)=>{
  circ(sx(x),sy(y),d/2,'fill="none" stroke="'+R+'" stroke-width="0.35"');
  if(label) text(sx(x)+d/2+2, sy(y)+2, label, 'fill="'+(col||C)+'" font-size="5"');
};
const sq=(dx,dy,d,x,y,tag)=>{
  hole(x,y,d); hole(x+dx,y,d); hole(x,y+dy,d); hole(x+dx,y+dy,d);
  if(tag) text(sx(x)+3, sy(y+dy)-3, tag, 'fill="'+C+'" font-size="5"');
};
sq(UNO_DX,UNO_DY,M3_D,UNO_X,UNO_Y,'UNO 4×M3');
sq(RL_DX,RL_DY,M3_D,RL_X,RL_Y,'继电器 44×20');
hole(PMP_X,PMP_Y,M3_D); hole(PMP_X+PMP_PITCH,PMP_Y,M3_D);
text(sx(PMP_X)+3, sy(PMP_Y)+10,'泵耳 间距'+PMP_PITCH,'fill="'+C+'" font-size="5"');
sq(PED_W-16,PED_D-16,2.9,PED_X-PED_W/2+8,PED_Y-PED_D/2+8,'支座 4×M3 自攻');
sq(KP_W-16,KP_D-16,3.0,KP_X+8,KP_Y+8,'键盘框 4×M3');
hole(100,60,9,'线槽 φ9'); hole(232,60,9,'线槽 φ9');
hole(POST_X,POST_Y,4.4,'管架 M4');

/* 秤台投影虚区（仅标注版，切割版不输出——虚线会被当成划线） */
if (!CUT_ONLY) {
  rect(sx(panCX-PAN/2), sy(panCY+PAN/2), PAN, PAN,
    'fill="none" stroke="#a78bfa" stroke-width="0.3" stroke-dasharray="3 2"');
  text(sx(panCX-PAN/2)+4, sy(panCY+PAN/2)+PAN-6,'秤台投影 150×150（悬空 23mm）','fill="#a78bfa" font-size="5"');
}

text(sx(0)+4, sy(BOARD_D)+15, '① 底板 '+BOARD_W+' × '+BOARD_D+' × '+BOARD_T, 'fill="'+G+'" font-size="6.5" font-weight="700"');
text(sx(BOARD_W/2), sy(0)+12, String(BOARD_W), 'fill="'+MUT+'" font-size="5" text-anchor="middle"');

/* ② 秤台 */
const P2X=390, P2Y=30;
rect(P2X,P2Y,PAN,PAN,'fill="none" stroke="'+R+'" stroke-width="0.35"');
circ(P2X+PAN/2,P2Y+PAN/2,PAN_HOLE/2,'fill="none" stroke="'+R+'" stroke-width="0.35"');
text(P2X+PAN/2+5,P2Y+PAN/2+2,'M4 中心','fill="'+C+'" font-size="5"');
for(let i=0;i<3;i++){
  const a=(120*i-90)*Math.PI/180;
  circ(P2X+PAN/2+Math.cos(a)*62, P2Y+PAN/2+Math.sin(a)*62, 3.1, 'fill="none" stroke="'+R+'" stroke-width="0.35"');
}
text(P2X+3,P2Y-4,'② 秤台 '+PAN+' × '+PAN+' × '+PAN_T, 'fill="'+G+'" font-size="6.5" font-weight="700"');
text(P2X+3,P2Y+PAN+8,'中心 M4 + 3×φ6 定位销（120°，R62）', 'fill="'+MUT+'" font-size="5"');

/* ③ 容器围挡 4 片 */
const W3X=390, W3Y=215, SEG_L=140, SEG_H=40, SLOT_W=5.2, SLOT_D=20;
text(W3X,W3Y-6,'③ 容器围挡 '+SEG_L+' × '+SEG_H+' × 5（4 片：2 上槽 2 下槽）', 'fill="'+G+'" font-size="6.5" font-weight="700"');
for(let i=0;i<4;i++){
  const gx=W3X+(i%2)*(SEG_L+14), gy=W3Y+Math.floor(i/2)*(SEG_H+22);
  rect(gx,gy,SEG_L,SEG_H,'fill="none" stroke="'+R+'" stroke-width="0.35"');
  const up = i<2;
  const slotY = up ? gy : gy+SEG_H-SLOT_D;
  rect(gx,slotY,SLOT_W,SLOT_D,'fill="none" stroke="'+R+'" stroke-width="0.35"');
  rect(gx+SEG_L-SLOT_W,slotY,SLOT_W,SLOT_D,'fill="none" stroke="'+R+'" stroke-width="0.35"');
  text(gx+3, gy+SEG_H/2+2, up?'上槽':'下槽', 'fill="'+MUT+'" font-size="5"');
}

/* ④ 键盘面板 */
const K4X=22, K4Y=272;
rect(K4X,K4Y,KP_W,KP_W,'fill="none" stroke="'+R+'" stroke-width="0.35"');
rect(K4X+(KP_W-KP_CUT)/2,K4Y+(KP_W-KP_CUT)/2,KP_CUT,KP_CUT,'fill="none" stroke="'+R+'" stroke-width="0.35"');
text(K4X+KP_W/2,K4Y+KP_W/2+2,String(KP_CUT),'fill="'+C+'" font-size="5" text-anchor="middle"');
[[8,8],[KP_W-8,8],[8,KP_W-8],[KP_W-8,KP_W-8]].forEach(p=>circ(K4X+p[0],K4Y+p[1],1.5,'fill="none" stroke="'+R+'" stroke-width="0.35"'));
text(K4X,K4Y-6,'④ 键盘面板 '+KP_W+' × '+KP_W+' × 3（开 '+KP_CUT+'）', 'fill="'+G+'" font-size="6.5" font-weight="700"');

/* ⑥ 管架底座（26×26，可用 3mm 亚克力叠两层代替打印） */
const P6X=200, P6Y=290, PB=26;
text(P6X,P6Y-8,'⑥ 管架底座 '+PB+' × '+PB+' × 6', 'fill="'+G+'" font-size="6.5" font-weight="700"');
text(P6X,P6Y-1,'（切两片 3mm 叠起来，或直接打印）', 'fill="'+MUT+'" font-size="4.6"');
rect(P6X,P6Y,PB,PB,'fill="none" stroke="'+R+'" stroke-width="0.35"');
circ(P6X+PB/2,P6Y+PB/2,(POST_D+0.4)/2,'fill="none" stroke="'+R+'" stroke-width="0.35"');
text(P6X+PB/2+4,P6Y+PB/2-1,'φ8.4 立杆', 'fill="'+C+'" font-size="4.5"');
circ(P6X+PB/2+9,P6Y+PB/2,2.2,'fill="none" stroke="'+R+'" stroke-width="0.35"');
circ(P6X+PB/2-9,P6Y+PB/2,1.5,'fill="none" stroke="'+R+'" stroke-width="0.35"');
text(P6X+PB/2-14,P6Y+PB+6,'M4 固定 / M3 顶丝', 'fill="'+MUT+'" font-size="4.5"');

text(16,414,'装配：底板钻孔 → 支座 4×M3 自攻 → 梁固定端 2×M4(加垫片) → M4 铜柱 6mm → 秤台 1×M4 → 定位销 → 管架底座+M4 → Ø8 立杆插进底座 → 横臂套上锁 M3 → 容器围挡插接', 'fill="'+MUT+'" font-size="5.5"');
el('</svg>');
}   // figLaser 结束

/* 有标注版：自己看、给店做参考 */
CUT_ONLY = false;
figLaser();
fs.writeFileSync(OUT + '/bracket_laser.svg', P.join('\n'), 'utf8');

/* 纯几何版：一个字符都没有，直接发切割店 */
CUT_ONLY = true;
figLaser();
fs.writeFileSync(OUT + '/bracket_laser_cut.svg', P.join('\n'), 'utf8');
CUT_ONLY = false;



/* ==========================================================
   图 2：装配示意（俯视 1:1.2 + 高度栈）
   ========================================================== */
P.length=0;
const CW=1120, CH=820;
el('<svg xmlns="http://www.w3.org/2000/svg" width="'+CW+'" height="'+CH+'" viewBox="0 0 '+CW+' '+CH+'">');
rect(0,0,CW,CH,'fill="#080c12"');
text(30,38,'支架装配示意','fill="#e4edf6" font-size="20" font-weight="700"');
text(30,60,'尺寸全部来自 bracket.scad 参数区；改 SCAD 后重跑 _laser2.js，这两张图跟着变','fill="'+MUT+'" font-size="11.5"');

/* --- 左：俯视 1:1.2 --- */
const S=1.0, AX=34, AY=100;
const px = x => AX + x/S;
const py = y => AY + (BOARD_D - y)/S;
rect(px(0),py(BOARD_D),BOARD_W/S,BOARD_D/S,'fill="#0d151d" stroke="#2b6fa8" stroke-width="1.6" rx="4"');
rect(px(panCX-PAN/2),py(panCY+PAN/2),PAN/S,PAN/S,'fill="#ffb02012" stroke="#ffb020" stroke-width="1.2" stroke-dasharray="8 5" opacity=".85"');


const box=(x,y,w,h,col,label,sub)=>{
  rect(px(x),py(y+h),w/S,h/S,'fill="'+col+'20" stroke="'+col+'" stroke-width="1.2" rx="2.5"');
  text(px(x)+w/S/2, py(y+h)+h/S/2+4, label, 'fill="'+col+'" font-size="10.5" font-weight="700" text-anchor="middle"');
};
box(UNO_X,UNO_Y,68.6,53.4,'#2b6fa8','UNO');
box(RL_X,RL_Y,50,26,'#e5484d','REL');
box(KP_X,KP_Y,KP_W,KP_D,'#3ddc97','KP');
box(PED_X-PED_W/2,PED_Y-PED_D/2,PED_W,PED_D,'#a78bfa','支座');

circ(px(PMP_X),py(PMP_Y),4,'fill="none" stroke="#7d8fa2" stroke-width="1.3"');
circ(px(PMP_X+PMP_PITCH),py(PMP_Y),4,'fill="none" stroke="#7d8fa2" stroke-width="1.3"');


/* 悬臂梁 */
rect(px(PED_X-BEAM_WD/2),py(ly),BEAM_WD/S,(BEAM_L)/S,'fill="#8d99a6" opacity=".6" stroke="#c8d2da" stroke-width="1.1"');

circ(px(PED_X),py(loadY),3.2,'fill="#ffb020"');



/* 底板尺寸线 */
line(px(0),py(0)+18,px(BOARD_W),py(0)+18,'stroke="'+MUT+'" stroke-width=".9"');
line(px(0),py(0)+12,px(0),py(0)+24,'stroke="'+MUT+'" stroke-width=".9"');
line(px(BOARD_W),py(0)+12,px(BOARD_W),py(0)+24,'stroke="'+MUT+'" stroke-width=".9"');
text(px(BOARD_W/2)-16,py(0)+32,String(BOARD_W),'fill="'+MUT+'" font-size="10"');
text(AX,AY-10,'俯视 1:1 · 底板 '+BOARD_W+' × '+BOARD_D,'fill="'+G+'" font-size="13" font-weight="700"');


/* 俯视图例 */
const LG=AY+BOARD_D/S+64;
line(AX,LG-4,AX+16,LG-4,'stroke="#ffb020" stroke-width="1.4" stroke-dasharray="6 4"');
text(AX+22,LG,'秤台 150×150 投影（底面 28mm 高，悬空压在梁自由端）','fill="#ffb020" font-size="10"');
line(AX,LG+14,AX+16,LG+14,'stroke="#c8d2da" stroke-width="2"');
text(AX+22,LG+18,'悬臂梁 80mm：固定端 y=202 拧在支座上，自由端 y=122 朝 -Y 悬空','fill="#c8d2da" font-size="10"');
circ(AX+8,LG+32,3,'fill="#ffb020"');
text(AX+22,LG+36,'受力孔 y='+loadY.toFixed(1)+'（距自由端 '+BEAM_END_LOAD+'），秤台中心正对它','fill="#ffb020" font-size="10"');
circ(AX+8,LG+52,4,'fill="none" stroke="#7d8fa2" stroke-width="1.3"');
text(AX+22,LG+56,'泵耳安装孔，间距 '+PMP_PITCH+'（量你手上的泵，不一样就改 PMP_PITCH）','fill="#7d8fa2" font-size="10"');
line(AX,LG+70,AX+16,LG+70,'stroke="#3ddc97" stroke-width="2.2" stroke-dasharray="5 3"');
text(AX+22,LG+74,'管架横臂 '+ARM_L+'mm：从立杆斜伸到容器正上方，把管口钉死','fill="#3ddc97" font-size="10"');
circ(AX+8,LG+90,PIPE_OD/2+1.5,'fill="#4cc9f033" stroke="#4cc9f0" stroke-width="1.6"');
text(AX+22,LG+94,'C 形管夹：内径 φ'+PIPE_OD+'，开口 '+PIPE_SLOT+'，管子按进去不会掉','fill="#4cc9f0" font-size="10"');

/* 管架：立杆 + 横臂 + 管口 */
circ(px(POST_X),py(POST_Y),POST_D/S/2+1,'fill="#3ddc9733" stroke="#3ddc97" stroke-width="1.4"');
text(px(POST_X)+10, py(POST_Y)+4, '立杆 Ø'+POST_D,'fill="#3ddc97" font-size="9"');
line(px(POST_X),py(POST_Y),px(panCX),py(panCY),'stroke="#3ddc97" stroke-width="2.2" stroke-dasharray="6 3"');
circ(px(panCX),py(panCY),PIPE_OD/S/2+1.5,'fill="#4cc9f033" stroke="#4cc9f0" stroke-width="1.6"');
text(px(panCX)+10, py(panCY)+14, '管口（夹住，悬在水面上 30）','fill="#4cc9f0" font-size="9"');

/* --- 右：高度栈，纵向 8 px/mm --- */
const HX=470, HSC=8, HZERO=726;
const stack=[
 {h:BOARD_T, col:'#2b6fa8', t:'底板 5'},
 {h:LIFT,    col:'#a78bfa', t:'支座 15'},
 {h:BEAM_TK, col:'#c8d2da', t:'梁 2'},
 {h:PAN_RISE,col:'#e5484d', t:'M4 铜柱 6'},
 {h:PAN_T,   col:'#ffb020', t:'秤台 5'}
];
text(HX,96,'侧视 · 高度栈（等比，8 px/mm）','fill="'+G+'" font-size="13" font-weight="700"');
let acc=0;
stack.forEach((s,i)=>{
  const y=HZERO-(acc+s.h)*HSC, hh=s.h*HSC;
  const w=(i===0)?300:(i===1?150:(i===2?220:(i===3?60:190)));
  const x=HX+(300-w)/2;
  rect(x,y,w,hh,'fill="'+s.col+'33" stroke="'+s.col+'" stroke-width="1.3" rx="2"');
  text(HX+312,y+hh/2+4,s.t+'  (顶面 '+Math.round(acc+s.h)+')','fill="'+s.col+'" font-size="10.5"');
  line(HX-8,y,HX-8,y+hh,'stroke="'+MUT+'" stroke-width=".7"');
  acc+=s.h;
});
line(HX-44,HZERO,HX-44,HZERO-acc*HSC,'stroke="'+MUT+'" stroke-width=".9" stroke-dasharray="4 3"');
line(HX-50,HZERO,HX-38,HZERO,'stroke="'+MUT+'" stroke-width=".9"');
line(HX-50,HZERO-acc*HSC,HX-38,HZERO-acc*HSC,'stroke="'+MUT+'" stroke-width=".9"');
text(HX-52,HZERO-acc*HSC-10,'总高 '+acc+'mm','fill="'+MUT+'" font-size="11"');

/* 管架侧视 */
const pxp=HX+300, pbase=HZERO-0;
rect(pxp-13,pbase-6*HSC,26,6*HSC,'fill="#3ddc9733" stroke="#3ddc97" stroke-width="1.2"');
rect(pxp-4,pbase-POST_H*0.62,8,POST_H*0.62,'fill="#3ddc9744" stroke="#3ddc97" stroke-width="1.1"');
text(pxp+12,pbase-POST_H*0.62+6,'Ø8 立杆 220（此处压缩显示）','fill="#3ddc97" font-size="9"');
line(pxp,pbase-POST_H*0.62,pxp-120,pbase-POST_H*0.62,'stroke="#3ddc97" stroke-width="3" stroke-dasharray="6 4"');
rect(pxp-126,pbase-POST_H*0.62-10,14,20,'fill="#4cc9f033" stroke="#4cc9f0" stroke-width="1.4"');
text(pxp-132,pbase-POST_H*0.62-16,'管夹','fill="#4cc9f0" font-size="9.5"');

/* 容器示意 */
const cTop=HZERO-(acc+42)*HSC, cH=42*HSC;
rect(HX+62,cTop,120,cH,'fill="#2b6f8a18" stroke="#4cc9f0" stroke-width="1.2" stroke-dasharray="5 4" rx="2"');
rect(HX+62,cTop+cH*0.55,120,cH*0.45,'fill="#2b6f8a44"');
text(HX+72,cTop+18,'容器 42mm 高','fill="#4cc9f0" font-size="10"');

text(HX,742,'关键间隙：支座顶 20 → 秤台底 28，间隙 8mm；秤台压在梁的自由端上方，不与支座相碰','fill="'+MUT+'" font-size="10.5"');
text(HX,760,'梁固定端 y=202，自由端 y=122，受力孔 y='+loadY.toFixed(1)+'（距自由端 '+BEAM_END_LOAD+'）','fill="'+MUT+'" font-size="10.5"');

text(30,796,'装配顺序：底板钻孔 → 支座 4×M3 自攻 → 梁固定端 2×M4 → M4 铜柱 6mm → 秤台 1×M4 → 3 个定位销 → 管架底座 M4 → Ø8 立杆插入 → 横臂套上锁 M3 → 容器围挡插接','fill="'+G+'" font-size="10.5"');
el('</svg>');
fs.writeFileSync(OUT+'/bracket_assembly.svg', P.join('\n'), 'utf8');

console.log('written: bracket_laser.svg, bracket_assembly.svg');
console.log('pan center =', panCX, panCY, '| load hole y =', loadY.toFixed(1), '| ly =', ly, '| total h =', TOTAL_H);
