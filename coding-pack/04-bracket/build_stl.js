/**
 * bracket.scad 的 JSCAD 等价实现 —— 只导出 3D 打印件。
 * 用法：node build_stl.js   （依赖 @jscad/modeling + @jscad/stl-serializer）
 * 几何常量与 bracket.scad 一一对应，改尺寸时两边一起改。
 *
 * 注意：JSCAD 所有 primitive 默认以原点为中心，所以这里用 cyl()/box()
 * 统一包一层，语义改成「从 at 这个点开始，往 +X/+Y/+Z 长」。
 */
const fs = require('fs');
const path = require('path');
const { primitives, booleans, transforms, hulls } = require('@jscad/modeling');
const { serialize } = require('@jscad/stl-serializer');

const { cuboid, cylinder } = primitives;
const { subtract, union } = booleans;
const { translate } = transforms;
const { hull } = hulls;

/* ---------------- 常量（对齐 bracket.scad） ---------------- */
const PED_W = 56, PED_D = 64, PED_X = 170, PED_Y = 178, LIFT = 15;
const BEAM_L = 80, BEAM_WD = 12.7;

const PAN = 150, PAN_T = 5, PAN_HOLE = 4.6;

const KP_W = 76, KP_D = 76, KP_CUT = 70;

const POST_D = 8, ARM_L = 135, ARM_T = 8, PIPE_OD = 10, PIPE_SLOT = 7;

const FIL = 2, SEG = 48;

/* ---------------- 工具（全部从 at 往正方向长） ---------------- */
const cyl = (r, h, at = [0, 0, 0], seg = SEG) =>
  translate([at[0], at[1], at[2] + h / 2], cylinder({ radius: r, height: h, segments: seg }));

const box = (w, d, h, at = [0, 0, 0]) =>
  translate([at[0] + w / 2, at[1] + d / 2, at[2] + h / 2], cuboid({ size: [w, d, h] }));

// 圆角矩形挤出，等价于 OpenSCAD 的 hull(4 个 cylinder)
const roundRect = (w, d, h, r = FIL, at = [0, 0, 0]) => hull(
  cyl(r, h, [at[0] + r, at[1] + r, at[2]], 24),
  cyl(r, h, [at[0] + w - r, at[1] + r, at[2]], 24),
  cyl(r, h, [at[0] + r, at[1] + d - r, at[2]], 24),
  cyl(r, h, [at[0] + w - r, at[1] + d - r, at[2]], 24),
);

/* ---------------- ① 支座 ---------------- */
function pedestal() {
  const bx = PED_X - PED_W / 2;      // 142
  const by = PED_Y - PED_D / 2;      // 146
  const ly = by + PED_D - 8;         // 202，梁固定端
  const slotY = ly - BEAM_L + 18;    // 140

  const body = roundRect(PED_W, PED_D, LIFT, FIL, [bx, by, 0]);

  // 梁槽：朝 -Y 贯通，深到 1.55（比梁厚 2 少一点点，靠胶填满）
  const slot = box(BEAM_WD + 0.3, BEAM_L - 18, 1.55,
    [PED_X - (BEAM_WD + 0.3) / 2, slotY, LIFT - 1.45]);

  // 两侧挡墙，兜胶
  const wallL = box(3.2, BEAM_L - 16, 4.5, [PED_X - BEAM_WD / 2 - 3.2, slotY, LIFT]);
  const wallR = box(3.2, BEAM_L - 16, 4.5, [PED_X + BEAM_WD / 2, slotY, LIFT]);

  return subtract(union(body, wallL, wallR), slot);
}

/* ---------------- ② 秤台 ---------------- */
function pan() {
  const body = roundRect(PAN, PAN, PAN_T, FIL, [0, 0, 0]);
  const holes = [
    cyl(PAN_HOLE / 2, PAN_T + 4, [PAN / 2, PAN / 2, -2]),
    cyl(3.1, PAN_T + 4, [PAN / 2, PAN / 2 + 62, -2]),
    cyl(3.1, PAN_T + 4, [PAN / 2 - 62 * Math.sin(2 * Math.PI / 3), PAN / 2 + 62 * Math.cos(2 * Math.PI / 3), -2]),
    cyl(3.1, PAN_T + 4, [PAN / 2 - 62 * Math.sin(4 * Math.PI / 3), PAN / 2 + 62 * Math.cos(4 * Math.PI / 3), -2]),
    // 无螺丝版：两根扎带孔
    cyl(1.6, PAN_T + 4, [PAN / 2 - 15, PAN / 2, -2]),
    cyl(1.6, PAN_T + 4, [PAN / 2 + 15, PAN / 2, -2]),
  ];
  return subtract(body, ...holes);
}

/* ---------------- ③ 泵凹槽座 ---------------- */
function pumpSocket() {
  const L = 68, W = 40, WALL = 4, H = 20;
  const OW = L + WALL * 2;     // 76
  const OD = W + WALL * 2;     // 48

  const base = roundRect(OW, OD, 6, FIL, [0, 0, 0]);
  const walls = box(OW, OD, H, [0, 0, 5.6]);
  const cavity = box(L, W, H + 2, [WALL, WALL, 5.5]);
  // 前壁开口，给宝塔接头和出水管让位
  const notch = box(28, WALL + 2, H + 2, [L / 2 + WALL - 14, -1, 5.5]);

  return subtract(union(base, walls), cavity, notch);
}

/* ---------------- ④ 键盘面板 ---------------- */
function bezel() {
  const body = roundRect(KP_W, KP_D, 3, FIL, [0, 0, 0]);
  const win = box(KP_CUT, KP_CUT, 6, [(KP_W - KP_CUT) / 2, (KP_D - KP_CUT) / 2, -1]);
  const slot = box(KP_CUT, 7, 6, [(KP_W - KP_CUT) / 2, KP_D - 6, -1]);
  const holes = [[8, 8], [KP_W - 8, 8], [8, KP_D - 8], [KP_W - 8, KP_D - 8]]
    .map(p => cyl(1.5, 6, [p[0], p[1], -1], 24));
  return subtract(body, win, slot, ...holes);
}

/* ---------------- ⑤ 管架底座 ---------------- */
function postBase() {
  const body = roundRect(26, 26, 6, 2, [0, 0, 0]);
  return subtract(body, cyl(POST_D / 2 + 0.075, 9, [13, 13, -1]));
}

/* ---------------- ⑥ 管架横臂 ---------------- */
function pipeArm() {
  // 套筒 + 臂 + C 形夹外圆
  const sleeve = box(18, 18, ARM_T, [-9, -9, 0]);
  const arm = hull(
    cyl(2.5, ARM_T, [0, -6, 0], 24), cyl(2.5, ARM_T, [ARM_L, -6, 0], 24),
    cyl(2.5, ARM_T, [0, 6, 0], 24), cyl(2.5, ARM_T, [ARM_L, 6, 0], 24),
  );
  const ring = cyl((PIPE_OD + 7) / 2, ARM_T + 4, [ARM_L, 0, 0]);

  const solid = union(sleeve, arm, ring);
  const holePost = cyl((POST_D + 0.7) / 2, ARM_T + 8, [0, 0, -2]);
  const holePipe = cyl(PIPE_OD / 2, ARM_T + 8, [ARM_L, 0, -2]);
  const gap = box(PIPE_SLOT, PIPE_OD + 8, ARM_T + 8,
    [ARM_L - PIPE_SLOT / 2, -(PIPE_OD + 8) / 2, -2]);

  return subtract(solid, holePost, holePipe, gap);
}

/* ---------------- 输出 ---------------- */
const OUT = path.join(__dirname, 'stl');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const parts = {
  '01_pedestal_base.stl': pedestal(),
  '02_pan.stl': pan(),
  '03_pump_socket.stl': pumpSocket(),
  '04_keypad_bezel.stl': bezel(),
  '05_post_base.stl': postBase(),
  '06_pipe_arm.stl': pipeArm(),
};

let total = 0;
for (const [name, geom] of Object.entries(parts)) {
  const raw = serialize({ binary: false }, geom);
  const buf = Buffer.from(raw[0], 'utf8');
  fs.writeFileSync(path.join(OUT, name), buf);
  const tris = (buf.toString().match(/facet normal/g) || []).length;
  console.log(`${name.padEnd(24)} ${String(tris).padStart(7)} 面  ${(buf.length / 1024).toFixed(0)} KB`);
  total += tris;
}
console.log(`\n${Object.keys(parts).length} 件 / ${total} 面`);
