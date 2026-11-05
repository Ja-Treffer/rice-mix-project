# HANDOFF · 这个包现在是什么状态

写给接手的人（或下一个 agent）。只记**已经验证过的事实**和**还没做的**，不写计划、不写愿望。

## 已完成并验证

**固件**
- `01-firmware/demo.ino` —— 216 行（含注释）。avr-g++ 编译通过，`text 2455 / data 9 / bss 26`。
- `01-firmware/ricemix_firmware.ino` —— 716 行。avr-g++ 编译通过，`text 11359 / data 109 / bss 150`。与 `03-wokwi/sketch.ino` 字节级相同。

**网页**
- `02-web/demo.html` —— 1051 行。两个 `<script>` 块 `node --check` 均通过。五段：接线图（原理/实物双视图）、四个按键、实时模拟、完整代码、采购清单。
- `02-web/simulator.html` —— 4325 行。六段 `<script>` 块全部 `node --check` 通过。五页签：飞线图、实时模拟、机制原理、固件与配重编辑、采购清单。
- 页面内嵌的固件源码与 `01-firmware/ricemix_firmware.ino` 一致（`fwSrc == ino` 校验过）。

**支架**
- `04-bracket/stl/` 六个 STL，包围盒逐个量过：`01_pedestal_base` 56×70×19.5 / `02_pan` 150×150×5 / `03_pump_socket` 76×48×25.6 / `04_keypad_bezel` 76×76×3 / `05_post_base` 26×26×6 / `06_pipe_arm` 152.5×18×12。
- `04-bracket/build_svg.js` 出两份：`bracket_laser.svg` 带标注（自己看）、`bracket_laser_cut.svg` 纯切割（text=0 / dasharray=0 / 只有 `#e5484d` 一种颜色，发切割店用）。

**文档** —— `05-docs/` 四份 + 本目录 `README.md`。

## 没有验证过的

- **真实泵的流量、余流尾巴、HX711 零漂** —— 这三样必须上秤实测，仿真测不出来。`03-wokwi/README.md` 里写了怎么测。
- **Wokwi 的 diagram.json 没在线上跑过** —— 元件 id、引脚名是照官方文档核对的（`wokwi-hx711` 支持 `type:"5kg"`，`wokwi-relay-module` 的 `transistor:"pnp"` 才能让高电平触发接 NO），但没实际点过运行。
- **STL 没实际打印** —— 几何用 JSCAD 生成并量过包围盒，没上机。
- **键盘 8 针的物理方向** —— 照片看不清，代码按 `R1→D2 … C4→D10` 写，接反了要整体倒插。

## 环境依赖

| 要跑什么 | 需要 |
|---|---|
| 烧固件 | Arduino IDE + `HX711` 库（完整版还要 `EEPROM`，Uno 自带） |
| 看网页 | 任意浏览器，无外部依赖，双击就开 |
| 跑 Wokwi | 浏览器，无需本地环境 |
| 重出 STL | node + `cd 04-bracket && npm install`（@jscad/modeling + @jscad/stl-serializer） |
| 重出激光/纸皮图 | 只要 node，无依赖 |

本机没有 OpenSCAD，所以 `bracket.scad` 只是**参数事实来源**，实际几何在 `build_stl.js` 里用 JSCAD 重写了一遍。改尺寸要**两边都改**，或者只改 `build_stl.js` 并接受 `.scad` 过时。

## 生成脚本的对应关系

```
bracket.scad            ← 参数定义（人读，OpenSCAD 打开）
  ↓ 手工同步
build_stl.js            → stl/*.stl
build_svg.js            → bracket_laser.svg + bracket_laser_cut.svg + bracket_assembly.svg
build_cardboard_svg.js  → cardboard_plan.svg（A3 1:1）
build_manual_svg.js     → manual_template.svg（1:1）
```

四个脚本各自独立，不互相引用。改一个不动其他。

## 几个数字，别记错

- 秤台：**150**（图纸版）/ **130**（砧板版）/ **120**（纸皮版）
- 底板：**340×210**（图纸版）/ **300×200**（砧板版）/ **280×180**（纸皮版）
- 支座到秤台底面间隙：**8mm** —— 这个不能省，蹭上就称不准
- 梁固定端到受力孔：**80 − 12.7 = 67.3mm**
- 提前断流量 `LEAD_G = 5.0 g`：12 g/s 的泵，400ms 内的余流约 4.8g，5.0 刚好抵消
- 键盘键码 `k = 行 × 4 + 列`，0–7 选配方，8 启动 / 9 停止 / 10 去皮 / 11 状态

## 下一个能做的

按价值排：

1. **上秤实测三件事**（流量、余流、零漂），把 `LEAD_G` 从 5.0 校准到真值。这是唯一能实质提升精度的事。
2. 把 Wokwi 工程真跑一遍，确认 `diagram.json` 里的元件 id 和 pin 名没写错。
3. `02-web/simulator.html` 里"机制原理"页的执行器对比表（泵 vs 夹管阀）还没配图，只有文字。
