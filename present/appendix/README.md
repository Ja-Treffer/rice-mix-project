# Appendix · Rice-Water Ratio Prototype

对应 `Present_guideline.md` 里 **Appendix** 那一节的六条要求。每条要求对应一个子目录，编号就是要求出现的顺序。

---

## 六条要求 → 本目录

### 1 · Circuit diagrams
> `Screenshots or links of Circuit diagrams`

| 文件 | 是什么 |
|---|---|
| `A_schematic.png` | 原理接线图，1500×1500，含 74HC595 完整 DIP-16 与 12 脚数码管 |
| `B_physical_wiring.png` | 实物装配图，按键标了 S1–S16，保护件带方向标注 |
| `C_interactive_diagram_demo.html` | 课堂版交互图，双击打开，可在「原理图 / 实物图」之间切换 |
| `D_interactive_diagram_full.html` | 产品版交互图，五个页签：飞线图 / 实时仿真 / 机制原理 / 固件编辑 / 采购清单 |

后两个是**单文件网页**，不需要联网也不需要装东西。答辩时想现场演示接线怎么走，直接打开比放 PPT 有说服力。

### 2 · Source code and libraries
> `links to Arduino sketches/source code/Arduino libraries`

| 文件 | 是什么 |
|---|---|
| `demo_source_listing.txt` | **阅读版**，285 行带行号，头尾有引脚表和「它到底干了什么」的说明，直接贴进 PDF 报告 |
| `demo_code.ino` | **可运行版**，Arduino IDE 打开就能编译烧录，与上面同一份代码 |
| `README.md` | 装哪个库、五个参数常量各管什么、四道保险的白话解释 |
| `demo.ino` | 同一份代码的原始副本 |
| `ricemix_firmware_full.ino` | 产品版固件，716 行，多出 8 档配方、EEPROM 存参、串口命令、补泵逻辑 |
| `wokwi_sketch.ino` | Wokwi 线上仿真用的副本（与 `demo.ino` 同源） |
| `wokwi_diagram.json` | Wokwi 接线描述，粘进 wokwi.com 就能跑 |
| `wokwi_libraries.txt` | 依赖库清单，只有一行 `HX711` |

**外部库只有两个**：`HX711`（称重芯片驱动，公共库）和 `EEPROM`（Arduino 内置，产品版才用）。没有自定义库。

固件头部的引脚定义、参数区都有注释；改参数只需要改文件顶部那十几行，不用翻正文。

### 3 · Video
> `Links to Video (if any)`

**待录。** 见 `3_video_PLACEHOLDER\VIDEO_README.md`，里面列了三个待拍片段和必拍的三个瞬间。

### 4 · 3D design and STL
> `Picture and Link of 3D design of prototype, including STL file`

| 文件 | 是什么 |
|---|---|
| `bracket.scad` | OpenSCAD 参数化源文件，改顶部参数区就能换尺寸，`parts` 变量可单独导出某一件 |
| `assembly_view.svg` | 装配示意，俯视 1:1 加侧视高度栈 |
| `laser_cut_file.svg` | 激光切割排版，纯切割线（无文字、无虚线），可直接发切割店 |
| `01_pedestal_base.stl` | 支座 56×70×19.5 mm |
| `02_pan.stl` | 秤台 150×150×5 mm |
| `03_pump_socket.stl` | 泵座 76×48×25.6 mm |
| `04_keypad_bezel.stl` | 键盘面板 76×76×3 mm |
| `05_post_base.stl` | 管架底座 26×26×6 mm |
| `06_pipe_arm.stl` | 管架横臂 152.5×18×12 mm |

六个 STL 都是**毫米单位、实体网格**，直接扔进切片软件就行。设计的关键数字：秤台底面离支座顶 8 mm —— 这个间隙是称得准的前提，装的时候别垫东西。

### 5 · Rough prototype drawings
> `Rough prototype drawings, screenshots, 3D design of prototype, or design documents`

现有四份是导出的成品图；手绘草图和实物拍照还缺，清单在 `5_prototype_drawings\MISSING_ITEMS.md`。

| 文件 | 是什么 |
|---|---|
| `breadboard_layout.png` | 面包板分区图，器件占第几列一目了然 |
| `cardboard_cutting_plan.svg` | 纸皮版 A3 1:1 切割排版，带 100 mm 校准尺 |
| `cutting_board_template.svg` | 砧板版 300×200 1:1 模板 |
| `print_parts_overview.png` | 六个打印件的俯视轮廓与包围盒 |

### 6 · Additional documentation
> `Additional design documentation (if any)`

| 文件 | 是什么 |
|---|---|
| `Assembly_Guide.md` | **装配指南**，十二步接线、面包板分区表、烧录标定六步、九种「不亮」排查表 |
| `Bill_of_Materials.md` | 采购清单，11 项必买，含参考价区间 |
| `Wokwi_Simulation_README.md` | 线上仿真的用法，和两个必踩的坑 |

---

## 另外

**`AI_Declaration.md`** 是生成式 AI 声明，Guideline 要求放在标题页页脚。文件里给了三个百分比口径的版本，选一个抄进去。

---

## 提交

Guideline 要求提交 **PDF**，命名 `Class number_Group Project.PDF`。

转换顺序：
1. 把 `AI_Declaration.md` 选定的那句话加到封面页脚
2. 检查第 14 页（装配）和第 22 页（演示）的留白处，把实物照片插进去
3. 文件 → 导出 → PDF
4. 改名为 `[班级号]_Group Project.PDF` 上传 Moodle

PPTX 里所有元素都是可编辑对象（27 页 360 个），不是图片，改字改色都行。
