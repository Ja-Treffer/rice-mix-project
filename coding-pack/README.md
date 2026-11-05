# RiceMix · 继电器驱动式闭环米水配比系统 · Coding Pack

一块 Arduino、一个 5kg 悬臂梁、一个继电器、一个 12V 泵。按下开始，它一边称一边加水，到量自己停。

**核心不是"定时加水"，是"称重闭环"**：每 200ms 称一次总重，算出还差多少水，按实测流量提前断流。泵老化、管子堵了、电压掉了都不影响结果；泵卡死不会一直转，超时强制停。

---

## 三条路线，按你需要选

| 路线 | 用来干什么 | 起手文件 |
|---|---|---|
| **A · 课堂 demo** | 期末作业：称重 / 去皮 / 按比例加水，216 行，一块键盘按四个键 | `01-firmware/demo.ino` + `02-web/demo.html` |
| **B · 完整版** | 8 档配方（东北米/泰国米/软饭/烂饭/稠粥/稀饭/自定义×2）、EEPROM 存参数、补泵、串口命令 | `01-firmware/ricemix_firmware.ino` + `02-web/simulator.html` |
| **C · 纯仿真** | 没硬件，先在线上跑通决策逻辑 | `03-wokwi/` 三个文件贴进 wokwi.com |

三条路线**硬件完全一样**，固件可以随时换。先做 A，跑通了再换 B。

---

## 目录

```
01-firmware/
  demo.ino                 216 行（含注释），课堂版。称重/去皮/加水/超时
  ricemix_firmware.ino     716 行，完整版。8 档配方 + EEPROM + 补泵 + 串口

02-web/
  demo.html                课堂版单页（新固件 294 行 + 面包板接线）：接线图（原理/实物双视图）、四个按键、
                           实时模拟、完整代码、采购清单
  simulator.html           完整版单页（4325 行）：飞线图、实时模拟、机制原理、
                           固件与配重编辑、采购清单（五个页签）

03-wokwi/
  diagram.json             粘到 Wokwi 的 diagram.json 标签
  sketch.ino               粘到 sketch.ino 标签
  libraries.txt            只写一行 HX711
  README.md                首跑四步、五个故意搞坏它的实验、仿真测不到的五件事

04-bracket/
  bracket.scad             OpenSCAD 参数化支架（改顶部参数区即可）
  build_stl.js             node 跑，出 6 个 STL（不依赖 OpenSCAD）
  build_svg.js             出激光切割图（带标注版 + 纯切割版）
  build_cardboard_svg.js   出纸皮版 A3 排版图
  build_manual_svg.js      出砧板版模板图
  stl/                    六个件的 STL，可直接发打印店
  README.md               尺寸表、装配顺序、紧固件清单、NO_SCREW 模式

05-docs/
  demo_bom.md             课堂版采购清单，¥84–199
  cardboard_build.md      纸皮 + 筷子方案，花 ¥5
  manual_build.md         塑料砧板方案，¥40–50
  cardboard_plan.svg      纸皮版 A3 1:1 排版图
  manual_template.svg     砧板版 1:1 模板
```

---

## 硬件接线（三个版本通用）

| 从 | 到 |
|---|---|
| HX711 VCC / GND | 面包板左红轨（5V）/ 左灰轨（GND） |
| HX711 DT / SCK | A1 / A0 |
| 继电器 VCC / GND / IN | 左红轨 / 左灰轨 / D8 |
| 74HC595 DS / SHCP / STCP | D11 / D12 / D13 |
| 74HC595 Q0–Q7 | 8 个 220Ω → 5461AS 的 a b c d e f g dp |
| 5461AS 位选 DIG1–4 | A2 A3 A4 A5（共阴，低电平点亮） |
| 12V+ | 继电器 COM |
| 继电器 NO | 泵 +（经 KF301 端子） |
| 泵 − | 12V−（经 KF301 端子） |
| **12V− / 左灰轨** | **一根跳线短接 —— 必须共地** |
| 键盘 8 线 | R1–R4 → D2–D5，C1–C4 → D6 D7 D9 D10 |

不共地，继电器指示灯会乱闪，泵要么不转要么一直转。

**D13 原来接的 LED 让给 595 的 STCP 了。** 数码管本身就能看重量，泵在不在转听声音或看串口，比一个 LED 直观。

完整的“哪个脚插第几列”看 `04-bracket/breadboard_wiring.svg`（A3 1:1，三张跳线表）。

---

## 快速开始

### A · 课堂 demo

1. 装 HX711 库（Arduino IDE → 库管理器 → 搜 HX711 → 装 bogde 那个）
2. 打开 `01-firmware/demo.ino`，选好板子和串口，烧进去
3. 上电，串口监视器 9600
4. 空秤按 `2`（去皮）→ 放米 → 按 `1`（开始）→ 它自己加水到量
5. 键盘上第 1 个键 = 开始，第 2 个 = 去皮，第 3 个 = 停止，第 4 个 = 换比例

不接硬件也能看：直接开 `02-web/demo.html` 的「实时模拟」，拖投米量、按开始，数字一路涨到目标就停。

### B · 完整版

1. 需要 **HX711 + EEPROM** 两个库
2. 烧 `01-firmware/ricemix_firmware.ino`
3. 串口 9600，先 `ZERO` 去皮，再 `CAL 500` 用已知 500g 标定
4. `SET PORTION 100 150` = 秤上 100g 配重代表 150g 米，然后 `SAVE` 存进 EEPROM
5. `RECIPES` 看八档配方，键盘直接按键切档

### C · 纯仿真

1. 打开 [wokwi.com](https://wokwi.com) 新建 Arduino Uno 工程
2. 把 `03-wokwi/diagram.json` 和 `sketch.ino` 分别贴进对应标签页
3. `libraries.txt` 里只写一行 `HX711`
4. 点绿三角跑，串口监视器里跟着敲命令

**Wokwi 没有水路模型** —— 泵开多久，秤上的数字不会自己变。它能验证的是决策序列（什么时候开泵、什么时候断流、三重保险会不会踩），物理那段得靠 `02-web/` 的实时模拟。

---

## 关键参数在哪改

| 想改什么 | 文件 | 位置 |
|---|---|---|
| 米水比默认值 | `demo.ino` | `RATIO` 常量 |
| 提前断流量 | `demo.ino` | `LEAD_G`（默认 5.0 g） |
| 注水超时 | `demo.ino` | `TIMEOUT_MS`（默认 30000） |
| 八档配方数值 | `ricemix_firmware.ino` | `recipes[]` 数组 |
| 配重映射 | 串口 | `SET PORTION <配重g> <代表米g>` + `SAVE` |
| 键盘引脚 | 两个 .ino | `KP_ROWS[]` / `ROWS[]` |
| 支架尺寸 | `bracket.scad` | 顶部参数区，改完重跑 `build_stl.js` |

改完固件记得重新烧。改完 `bracket.scad` 记得重跑 `node build_stl.js` —— STL 不会自动跟着变。

---

## 已知的坑

**继电器触发极性对不上** —— 实物模块多数是低电平触发，固件出厂是高电平。接好先串口发 `SET TRIG 0` 再 `SAVE`，不然泵的行为是反的。Wokwi 那边 `diagram.json` 写的是 `"transistor": "pnp"` 去迁就高电平，两边不要混着推。

**Wokwi 的 HX711 标定值是 0.42** —— 5kg 量程原始读数 0–2100，1kg 对应 420。所以 `CAL 1000` 算出 `calFactor=0.42`，这是正常值不是错误。实物标定通常落在 200–450 之间。

**键盘 8 针方向不明** —— 照片上丝印是 `R4 R3 R2 R1 C4 C3 C2 C1`，实际方向看运气。接反不烧，只是按键对不上，按一下看串口打印哪个键号就能反推，或者整体倒过来插。

**亚克力孔不能用自攻** —— 会裂。要机牙螺丝 + 背面螺母，或者直接走 `bracket.scad` 里的 `NO_SCREW = true` 全胶接模式（梁的固定端胶接面积 193mm²，AB 胶抗剪 10–15MPa，5kg 满载只需 0.26MPa，安全系数 40 倍）。

**热熔胶会蠕变** —— 梁的固定端只靠热熔胶粘，几小时后零点会飘。要稳就用 AB 胶，粘完静置 24 小时。

**别用学校那个打印店** —— HK$20 基础费 + $1/克，六个件 HK$403，激光还要 HK$100 整张。纸皮方案花 ¥5，淘宝代打印 ¥30–140。

---

## 秤准不准跟支架没关系

只要悬臂梁的固定端不动、秤台不蹭支座、容器不偏心，5kg 梁该是 ±1g 就是 ±1g。亚克力、砧板、纸皮，课堂十分钟测一次没有区别。真正该花钱的是那个 5kg 悬臂梁（¥12–25）和 HX711，不是支架。
