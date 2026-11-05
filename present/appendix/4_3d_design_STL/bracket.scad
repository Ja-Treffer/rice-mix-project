// ============================================================
//  米水配比系统 · 支架（OpenSCAD 参数化模型）
//  E:\hardness\ricemix\bracket\bracket.scad
//
//  OpenSCAD 打开 → F5 预览 → F6 渲染 → F7 导出 STL
//  单独导出某个件：把 parts 改成 "base" / "pedestal" / "pan" / "clamp" / "bezel"
//
//  坐标原点在底板左下角，X 向右，Y 向里，Z 向上，单位 mm
//  悬臂梁朝 -Y（朝人）伸出，秤台压在它的自由端上
// ============================================================

/* ---------------- 参数区（对不上就改这里） ---------------- */
$fn = 64;

BOARD_W = 340;      // 底板宽
BOARD_D = 210;      // 底板深
BOARD_T = 5;        // 厚（3mm 太软，建议 5mm）

// 悬臂梁（5kg / TAL220 类）
BEAM_L   = 80;
BEAM_WD  = 12.7;
BEAM_TK  = 2;
BEAM_END_FIX  = 15.2;  // 固定端首孔到梁端
BEAM_END_LOAD = 12.7;  // 受力端首孔到梁端
BEAM_PITCH    = 15;
M4_D = 4.4;

LIFT     = 15;      // 梁底面到底板面（支座高度）
PAN_RISE = 6;       // 秤台底面到梁顶面（M4 铜柱高度）
PAN      = 150;
PAN_T    = 5;
PAN_HOLE = 4.6;
DRAIN_HOLE = 0;

UNO_DX = 66.04;  UNO_DY = 53.34;  M3_D = 3.3;
UNO_X  = 12;     UNO_Y  = 20;

RL_DX = 44;  RL_DY = 20;  RL_X = 12;  RL_Y = 100;

PMP_PITCH = 66;   // 两耳孔间距（量你手上的）
PMP_X = 250;      PMP_Y = 150;

PED_W = 56;  PED_D = 64;
PED_X = 170; PED_Y = 178;   // 支座中心（靠后缘）

KP_W = 76;  KP_D = 76;  KP_CUT = 70;
KP_X = 250; KP_Y = 20;

// ── 管架（把硅胶管口固定在容器正上方）────────────────
POST_D   = 8;      // 立杆外径，Ø8 亚克力圆棒 / 铝管
POST_H   = 220;    // 立杆高度（出底板面）
POST_X   = 295;    // 立杆位置：秤台投影外、泵的右后方
POST_Y   = 185;
ARM_L    = 135;    // 横臂长度：立杆中心 → 管夹中心
ARM_T    = 8;      // 横臂厚
PIPE_OD  = 10;     // 硅胶管外径（夹孔内径），Ø8 管用 10，Ø10 管用 12
PIPE_SLOT= 7;      // 夹子开口宽度（比管径小 3mm，卡进去不掉）

FIL = 2;
parts = "all";

/* ---- 无螺丝模式 ----------------------------------------------------
   NO_SCREW = true  时全部改成胶接 / 扎带 / 过盈压配，一颗螺丝都不用买：
     · 底板不开任何螺丝孔（器件用双面胶或热熔胶）
     · 支座底面平贴，用 AB 胶粘在底板上（胶接面积 3584mm²，抗剪远超 5kg）
     · 梁插进加深的槽里，两侧加挡墙，从槽口灌 AB 胶
     · 秤台用两根尼龙扎带穿过梁的受力孔绑住
     · 立杆涂胶插进底座，横臂靠过盈 + 一点热熔胶定位
     · 泵改成一个凹槽座，泵放进去四周点胶
   只需要买：AB 胶一支（10 元）、尼龙扎带一包（5 元）、热熔胶棒（可选）。
   ---------------------------------------------------------------- */
NO_SCREW = true;

/* ---------------- 工具 ---------------- */
module hcyl(d, h) { cylinder(d = d, h = h + 0.2); }
module screw4(dx, dy, d, x, y) {
  for (sx = [0, dx]) for (sy = [0, dy])
    translate([x + sx, y + sy, -1]) hcyl(d, BOARD_T + 2);
}

/* ---------------- ① 底板 ---------------- */
module base() {
  difference() {
    hull() {
      for (a = [[FIL, FIL], [BOARD_W - FIL, FIL],
                [FIL, BOARD_D - FIL], [BOARD_W - FIL, BOARD_D - FIL]])
        translate(a) cylinder(r = FIL, h = BOARD_T);
    }
    if (!NO_SCREW) {
      screw4(UNO_DX, UNO_DY, M3_D, UNO_X, UNO_Y);
      screw4(RL_DX,  RL_DY,  M3_D, RL_X,  RL_Y);
      translate([PMP_X, PMP_Y, -1]) hcyl(M3_D, BOARD_T + 2);
      translate([PMP_X + PMP_PITCH, PMP_Y, -1]) hcyl(M3_D, BOARD_T + 2);
      screw4(PED_W - 16, PED_D - 16, 2.9,
             PED_X - PED_W / 2 + 8, PED_Y - PED_D / 2 + 8);
      screw4(KP_W - 16, KP_D - 16, 3.0, KP_X + 8, KP_Y + 8);
      translate([POST_X, POST_Y, -1]) hcyl(M4_D, BOARD_T + 2);      // 管架底座
    } else {
      // 无螺丝版：只在支座和管架位置刻 0.6mm 浅坑，涂胶时好定位
      for (p = [[PED_X, PED_Y, PED_W, PED_D], [POST_X, POST_Y, 26, 26]])
        translate([p[0] - p[2] / 2, p[1] - p[3] / 2, BOARD_T - 0.6])
          cube([p[2], p[3], 0.8]);
    }
    translate([100, 60, -1]) hcyl(9, BOARD_T + 2);   // 线槽
    translate([232, 60, -1]) hcyl(9, BOARD_T + 2);
  }
}

/* ---------------- ② 悬臂梁支座 ---------------- */
// 梁的固定端坐在顶面槽里，两根 M4 从梁上方穿下拧进支座；自由端朝 -Y 悬空。
module pedestal() {
  bx = PED_X - PED_W / 2;
  by = PED_Y - PED_D / 2;
  ly = by + PED_D - 8;                 // 梁固定端（靠后）
  difference() {
    union() {
      hull() {
        for (a = [[bx + FIL, by + FIL], [bx + PED_W - FIL, by + FIL],
                  [bx + FIL, by + PED_D - FIL], [bx + PED_W - FIL, by + PED_D - FIL]])
          translate([a[0], a[1], 0]) cylinder(r = FIL, h = LIFT);
      }
      translate([PED_X, ly - BEAM_END_FIX, LIFT - 1.4]) cylinder(r = 8.5, h = 1.6);
      translate([PED_X, ly - BEAM_END_FIX - BEAM_PITCH, LIFT - 1.4]) cylinder(r = 8.5, h = 1.6);
      // 无螺丝版：梁槽两侧各加一道 4mm 高挡墙，灌胶时兜住胶不外流
      if (NO_SCREW) {
        translate([PED_X - BEAM_WD / 2 - 3.2, ly - BEAM_L + 18, LIFT])
          cube([3.2, BEAM_L - 16, 4.5]);
        translate([PED_X + BEAM_WD / 2, ly - BEAM_L + 18, LIFT])
          cube([3.2, BEAM_L - 16, 4.5]);
      }
    }
    // 梁槽（朝 -Y）
    translate([PED_X - BEAM_WD / 2 - 0.15, ly - BEAM_L + 18,
               LIFT - (NO_SCREW ? 1.45 : 1.25)])
      cube([BEAM_WD + 0.3, BEAM_L - 18, NO_SCREW ? 1.55 : 1.35]);
    if (!NO_SCREW) {
      // 两个 M4
      translate([PED_X, ly - BEAM_END_FIX, LIFT - 13]) hcyl(M4_D, 13.2);
      translate([PED_X, ly - BEAM_END_FIX - BEAM_PITCH, LIFT - 13]) hcyl(M4_D, 13.2);
      // 底部 4×M3 沉孔
      for (sx = [0, PED_W - 16]) for (sy = [0, PED_D - 16]) {
        translate([bx + 8 + sx, by + 8 + sy, -0.1]) cylinder(d = 6.2, h = 2.2);
        translate([bx + 8 + sx, by + 8 + sy, -0.1]) hcyl(2.9, LIFT);
      }
    }
  }
}

/* ---------------- ③ 秤台 ---------------- */
module pan() {
  difference() {
    hull() {
      for (a = [[FIL, FIL], [PAN - FIL, FIL], [FIL, PAN - FIL], [PAN - FIL, PAN - FIL]])
        translate(a) cylinder(r = FIL, h = PAN_T);
    }
    translate([PAN / 2, PAN / 2, -1]) hcyl(PAN_HOLE, PAN_T + 2);
    for (i = [0 : 2])
      rotate([0, 0, 120 * i])
        translate([PAN / 2, PAN / 2 + 62, -1]) hcyl(6.2, PAN_T + 2);
    // 无螺丝版：中心两侧各开一个 φ3.2 扎带孔，扎带穿下去绕过梁的受力孔再拉回来收紧
    if (NO_SCREW)
      for (sx = [-15, 15])
        translate([PAN / 2 + sx, PAN / 2, -1]) hcyl(3.2, PAN_T + 2);
    if (DRAIN_HOLE > 0)
      translate([PAN / 2, PAN / 2 + 30, -1]) hcyl(DRAIN_HOLE, PAN_T + 2);
  }
}

/* ---------------- ④ 泵夹 ---------------- */
// NO_SCREW = false：L 型夹，两组 M3（底板 2 + 立板 2）
// NO_SCREW = true ：改成一个凹槽座，泵横放进去，四周点胶固定
module clamp() {
  if (NO_SCREW) {
    PS_L = 68; PS_W = 40; WALL = 4; PS_H = 20;
    difference() {
      hull() {
        for (a = [[FIL, FIL], [PS_L + WALL * 2 - FIL, FIL],
                  [FIL, PS_W + WALL * 2 - FIL], [PS_L + WALL * 2 - FIL, PS_W + WALL * 2 - FIL]])
          translate(a) cylinder(r = FIL, h = 6);
      }
      // 内腔（泵体 66×37，留 2mm 松，垫一层泡棉更好）
      translate([WALL, WALL, 5.6]) cube([PS_L, PS_W, PS_H]);
    }
    // 四壁（贴在内腔外侧）
    difference() {
      translate([0, 0, 5.6]) cube([PS_L + WALL * 2, PS_W + WALL * 2, PS_H]);
      translate([WALL, WALL, 5.5]) cube([PS_L, PS_W, PS_H + 2]);
    }
    // 前壁开一个口给宝塔接头和出水软管
    translate([PS_L / 2 + WALL - 14, -1, 5.5]) cube([28, WALL + 2, PS_H + 2]);
  } else {
    arm = PMP_PITCH;
    difference() {
      union() {
        hull() {
          for (a = [[0, 0], [arm + 16, 0], [0, 26], [arm + 16, 26]])
            translate([a[0], a[1], 0]) cylinder(r = FIL, h = 5);
        }
        translate([0, 20, 0])
          hull() {
            for (a = [[FIL, FIL], [arm + 16 - FIL, FIL], [FIL, 6 - FIL], [arm + 16 - FIL, 6 - FIL]])
              translate([a[0], a[1], 0]) cylinder(r = FIL, h = 58);
          }
      }
      translate([8, 13, -1]) hcyl(M3_D, 7);
      translate([arm + 8, 13, -1]) hcyl(M3_D, 7);
      translate([8, 23, 24]) rotate([90, 0, 0]) hcyl(M3_D, 8);
      translate([arm + 8, 23, 24]) rotate([90, 0, 0]) hcyl(M3_D, 8);
    }
  }
}

/* ---------------- ⑤ 键盘面板 ---------------- */
module bezel() {
  difference() {
    hull() {
      for (a = [[FIL, FIL], [KP_W - FIL, FIL], [KP_W - FIL, KP_D - FIL], [FIL, KP_D - FIL]])
        translate(a) cylinder(r = FIL, h = 3);
    }
    translate([(KP_W - KP_CUT) / 2, (KP_D - KP_CUT) / 2, -1])
      cube([KP_CUT, KP_CUT, 5]);
    translate([(KP_W - KP_CUT) / 2, KP_D - 6, -1])
      cube([KP_CUT, 7, 5]);
    for (sx = [8, KP_W - 8]) for (sy = [8, KP_D - 8])
      translate([sx, sy, -1]) hcyl(3.0, 5);
  }
}

/* ---------------- ⑥ 管架底座（套在立杆底部） ---------------- */
// Ø26 圆盘，中心 φ8.4 让立杆穿过；有螺丝版一个 M3 顶丝压紧、一个 M4 上底板。
// 无螺丝版：孔改成 φ8.2 过盈，立杆涂 AB 胶插进去，底座整个平贴粘在底板上。
module post_base() {
  difference() {
    hull() {
      for (a = [[-13, -13], [13, -13], [13, 13], [-13, 13]])
        translate([a[0], a[1], 0]) cylinder(r = 2, h = 6);
    }
    translate([0, 0, -1]) hcyl(NO_SCREW ? POST_D + 0.15 : POST_D + 0.4, 8);
    if (!NO_SCREW) {
      translate([9, 0, -1]) hcyl(M4_D, 8);                   // M4 固定到底板
      translate([-9, 0, 3]) rotate([0, 90, 0]) hcyl(M3_D, 6.5);  // M3 顶丝（从 -X 侧拧进）
    }
  }
}

/* ---------------- ⑦ 管架横臂（带 C 形管夹） ---------------- */
// 一端套在立杆上，另一端 C 形夹夹住硅胶管。
// 无螺丝版：套孔 φ8.5 松配，高度调好后点一滴热熔胶固定，加热就能改。
module pipe_arm() {
  difference() {
    union() {
      // 套筒
      translate([-9, -9, 0]) cube([18, 18, ARM_T]);
      // 臂
      translate([0, -6, 0]) hull() {
        for (a = [[0, 0], [ARM_L, 0], [0, 12], [ARM_L, 12]])
          translate([a[0], a[1] - 6, 0]) cylinder(r = 2.5, h = ARM_T);
      }
      // C 形夹外圆
      translate([ARM_L, 0, 0]) cylinder(d = PIPE_OD + 7, h = ARM_T + 4);
    }
    translate([0, 0, -1]) hcyl(NO_SCREW ? POST_D + 0.7 : POST_D + 0.4, ARM_T + 6);
    if (!NO_SCREW)
      translate([-11, 0, ARM_T / 2]) rotate([0, 90, 0]) hcyl(M3_D, 8);  // 顶丝
    translate([ARM_L, 0, -1]) hcyl(PIPE_OD, ARM_T + 6);    // 管孔
    // 开口（朝 -Y，避开臂的方向，管子从侧面按进去）
    translate([ARM_L, -(PIPE_OD + 8) / 2, -1])
      cube([PIPE_SLOT, PIPE_OD + 8, ARM_T + 6]);
  }
}

/* ---------------- 输出 ---------------- */
if (parts == "all") {
  base();
  translate([0, 0, BOARD_T + 0.4]) pedestal();
  translate([PAN / 2 + 40, BOARD_D + 30, 0]) pan();
  translate([PAN + 110, BOARD_D + 30, 0]) clamp();
  translate([PAN + 110 + 90, BOARD_D + 30, 0]) bezel();
  translate([PAN + 110 + 210, BOARD_D + 60, 0]) post_base();
  translate([PAN + 110 + 240, BOARD_D + 30, 0]) pipe_arm();
} else if (parts == "base") { base(); }
else if (parts == "pedestal") { pedestal(); }
else if (parts == "pan") { pan(); }
else if (parts == "clamp") { clamp(); }
else if (parts == "bezel") { bezel(); }
else if (parts == "postbase") { post_base(); }
else if (parts == "pipearm") { pipe_arm(); }
