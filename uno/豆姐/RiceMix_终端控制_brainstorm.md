# RiceMix · 电脑终端调比例 / 前端控制 — Brainstorm

> 目标：比例调整从键盘搬到电脑终端（USB 串口，同时供电），电脑作为前端控制；键盘保留现有键位，作为脱机运行的基础功能保证。
> 状态：草案，未实现。

---

## 一、一句话结论

UNO 通过 USB 连电脑，**硬件 Serial（115200）跑一行一条的文本命令**，电脑端用「串口助手 / Python 脚本 / WebSerial 单页 HTML」任一形态当前端；比例改成可写变量并可选 EEPROM 持久化；键盘原封不动，脱机时仍能锁定→启动→急停→±5g。

---

## 二、为什么是终端而不是 WiFi/屏幕

- UNO 没有网，加 ESP 又是一套固件和故障点；**USB 线本来就要插**（供电 + 烧录），复用它做控制零成本。
- 电脑供电 + 通信一根线，前端不用额外硬件。
- 比例调整是低频操作（一次调好很久不动），在电脑上敲命令或拖滑块比键盘按 ±0.1 高效得多；键盘只留高频/应急操作。

---

## 三、前端形态（三选一，按成本递增）

| 方案 | 成本 | 体验 | 适用 |
|---|---|---|---|
| **A. 串口助手手动敲命令** | 零，Arduino IDE 监视器即可 | 敲 `r 1.35`、`go`、`stop`，看返回文本 | 调试期、自己用 |
| **B. Python + pyserial 命令行** | 装个 pyserial，50 行脚本 | 命令补全、实时刷新状态、批次记 CSV | 常用、想留记录 |
| **C. WebSerial 单页 HTML** | 零安装，Chrome/Edge 打开本地 html 即可 | 滑块拖比例、按钮锁定/启动/急停、进度条实时刷新 | 最像"前端控制"，推荐最终形态 |

方案 C 关键：浏览器原生 **Web Serial API**，纯前端直连串口，不需要后端服务。一个 HTML 文件里放滑块（比例 0.5–10，步进 0.05）、±5g 按钮、锁定/启动/急停、重量与进度显示、日志窗口。电脑供电 → 开浏览器 → 点连接 → 用。

---

## 四、串口协议草案（行协议，`\n` 结束，大小写不敏感）

### 4.1 命令（电脑 → UNO）

| 命令 | 作用 | 返回 |
|---|---|---|
| `r?` / `status` | 查询全部状态 | `OK ratio=1.20 offset=0 rice=0 locked=0 state=IDLE weight=0 flow=0 target=0` |
| `r 1.35` | 设置比例（钳制 0.5–10.0） | `OK ratio=1.35` / `ERR range` |
| `off +5` / `off -5` | 水量偏移 ±5g（同 S5/S6） | `OK offset=5` |
| `lock` | 锁定当前米重（同 S1） | `OK rice=120.5 target=162.7` |
| `go` | 启动加水（同 S9） | `OK START` / `ERR no scale` / `ERR rice<20g` |
| `stop` | 急停（同 S3，最高优先级，任何状态生效） | `OK STOPPED` |
| `pump on` / `pump off` / `pump rev` | 手动泵（同 S7/S8 + 冲管） | `OK` |
| `save` | 把 ratio+offset 写入 EEPROM（掉电不丢） | `OK saved` |
| `reset` | 恢复默认 ratio=1.2 offset=0 并清 EEPROM | `OK reset` |

兼容保留原单字符调试 `a/b/x/l/h`（试泵电平用），不与行命令冲突（行命令都 >1 字符）。

### 4.2 主动上报（UNO → 电脑）

- 每 **500ms** 或**状态变化时**上报一行，前缀 `STATE ` 便于前端过滤：
  `STATE FILL added=52.3 target=162.7 flow=11.8 weight=172.3`
- 批次结束上报：`DONE batch=3 rice=120 water=162.5 duration=14s`
- 故障上报：`FAULT no scale` / `FAULT timeout` / `FAULT no flow` / `FAULT overload`
- 调试信息仍用 `[diag]` / `[start]` 前缀，前端可忽略。

### 4.3 示例会话

```
> r?
< OK ratio=1.20 offset=0 rice=0 locked=0 state=IDLE weight=0 flow=0 target=0
> r 1.35
< OK ratio=1.35
> lock
< OK rice=120.5 target=162.7
> go
< OK START
< STATE FILL added=12.3 target=162.7 flow=11.8 weight=132.8
< STATE FILL added=158.0 target=162.7 flow=12.1 weight=278.5
< STATE SETTLE ...
< DONE batch=3 rice=120 water=162.5 duration=14s
```

---

## 五、固件改动清单（在 v3.2 基础上）

1. **`RATIO` 从 const 改成可写变量** `float ratio = 1.20f;`，所有 `RATIO` 引用换 `ratio`。
2. **`pumpProbe()` 扩展成 `serialPoll()`**：攒一行 → 按空格分词 → 查表执行命令 → 打印 `OK/ERR`。单字符 `a/b/x/l/h` 仍走原逻辑（兼容）。
3. **状态上报**：加 `reportState()`，500ms 定时 + 状态变化时触发。
4. **可选 EEPROM 持久化**：`#include <EEPROM.h>`，地址 0 放 magic（0xA5），4 字节 ratio + 4 字节 offset。上电 magic 对则读入；`save` 命令写入。**加防抖**：改比例后 5 秒无新命令再写，避免 EEPROM 磨损（寿命约 10 万次）。
5. **命令走同一套底层函数**：`lock`→锁定逻辑、`go`→`startBatch()`、`stop`→`latchFault("serial stop")`、`pump`→`pumpSet()`。和键盘共用闸门（`scaleLost` / `riceWeight<20` / `targetWater<10`），自然互斥，不需要额外加锁。
6. **急停优先级**：`stop` 命令任何状态立即生效，和 S3 同级。

---

## 六、键盘脱机保证（保持现状，一个键都不改）

| 键 | 脱机功能 | 终端对应命令 |
|---|---|---|
| S1 | 锁定/解锁米重、清故障 | `lock` |
| S2 / S9 | 启动 | `go` |
| S3 | 急停 | `stop` |
| S4 | 翻页 | —（前端自己显示） |
| S5 / S13 | ±5g 偏移 | `off +5` / `off -5` |
| S7 / S8 | 手动泵开/关 | `pump on` / `pump off` |

- 比例调整**只在终端**：脱机时用最后一次设置的比例（EEPROM 持久化后），没有 EEPROM 则默认 1.2，键盘 ±5g 仍可微调。
- 终端断线/电脑关机不影响正在进行的加水——状态机在 UNO 上跑，终端只是"遥控器+仪表盘"。
- 键盘和终端同时操作：最后写入者生效；急停任一来源触发即锁死，必须 S1/`lock` 清故障。

---

## 七、供电与安全（必须注意）

- **泵电源永远独立 5V/2A 适配器**，只共 GND。USB 只能供 UNO + LCD + 秤，泵启动瞬间 1A，USB 500mA 会烧稳压器——电脑供电不改变这一点。
- USB 和外部电源同时接：UNO 有自动切换，没问题。
- 终端发 `go` 同样过 `scaleLost` 检查：秤没连上拒绝启动，报 `ERR no scale`。
- 比例钳制 0.5–10.0，偏移钳制 ±200g，命令格式错返回 `ERR parse`，不执行。
- 波特率建议保持 115200：秤用 SoftwareSerial(D10) 接收时会关中断 ~1ms/字节，硬件 Serial 接收靠 UDR 缓冲（2 字节），115200 下 1ms ≈ 1.15 字节不会溢出；但**终端命令要短、发一条等 `OK` 再发下一条**，别灌数据。

---

## 八、分阶段落地

| 阶段 | 内容 | 工作量 | 交付 |
|---|---|---|---|
| **P1** | 固件行协议 + `r/r?/lock/go/stop/off/pump`，串口助手手动调 | 小 | 电脑上敲命令就能调比例、远程启动 |
| **P2** | + 主动 `STATE` 上报 + EEPROM `save`/`reset` | 中 | 脱机也用终端调好的比例 |
| **P3** | + WebSerial 单页 HTML（滑块+按钮+进度条+日志） | 中 | 真正的"前端控制"，零安装 |

---

## 九、开放问题（待定）

1. 比例调完是**自动存 EEPROM** 还是手动 `save`？自动存方便但有磨损；手动存多一步。倾向：改后 5 秒防抖自动存。
2. 前端要不要**批次历史记录**（CSV 导出、每碗米的米重/水量/耗时曲线）？电脑端存很容易，看需求。
3. 终端断线时正在加水，要不要**超时自动停**？目前设计是不停（状态机在 UNO）。如果担心电脑死机导致失控，可加"终端心跳"，但和"脱机可用"冲突，倾向不加。
4. WebSerial 只支持 Chrome/Edge，Safari 不行。若用 Mac Safari，选方案 B（Python）。
5. 泵的反转冲管（`pump rev`）要不要暴露给前端？键盘上没留键，终端可以加，调试完水管后很实用。
