# -*- coding: utf-8 -*-
"""把 demo-sim.html 里的旧硬件描述整批换成当前架构"""
import io, re, sys

p = r"E:\hardness\_pages\demo-sim.html"
s = io.open(p, encoding="utf-8").read()
orig_len = len(s)

# 顺序很重要：长的、具体的先换
REPS = [
    # chips / 概述
    ("HX711 + 5kg 秤", "XW112 电子秤"),
    ("HX711 + 5 kg 秤", "XW112 电子秤"),
    ("单路继电器", "L9110S 双路驱动"),
    ("12V 水泵", "5V 水泵"),
    ("12 V 水泵", "5 V 水泵"),
    # lead 段落
    ("一块 Arduino、一个秤、一个继电器、一个泵、一块键盘。",
     "一块 Arduino、一台电子秤、一块 LCD、一个泵、一块键盘。"),
    ("代码 294 行，接线 27 根，一节课能讲完。",
     "称重走 UART、显示走 I2C、泵走双路 H 桥，一根 USB 就能跑。"),
    # 核心提示
    ("★ 最容易炸的一点</b>：12V 电源的负极<b>必须</b>接到 Arduino 的 GND。       不共地的话继电器指示灯会乱闪，泵要么不转要么一直转。",
     "★ 只容易忘的一点</b>：泵是 <b>5 V</b> 的，直接取板子的 5 V 就行 —— 整套套件插 USB 就能跑，不用外接电源。"),
    ("★ 最容易炸的一点</b>：12V 电源的负极<b>必须</b>接到 Arduino 的 GND。",
     "★ 只容易忘的一点</b>：泵是 <b>5 V</b> 的，直接取板子的 5 V 就行。"),
    # 接线说明
    ("HX711   VCC->左红轨(5V)  GND->左灰轨(GND)  DT->A1  SCK->A0",
     "XW112   VCC->5V  G(黑)->GND  TX->D10（9600 8N1）"),
    ("HX711 VCC->左红轨(5V) GND->左灰轨(GND) DT->A1 SCK->A0",
     "XW112 VCC->5V G->GND TX->D10"),
    ("继电器  VCC->左红轨  GND->左灰轨  IN->D8",
     "L9110S  VCC->5V  GND->GND  IA->D11  IB->D12"),
    ("继电器 VCC->左红轨 GND->左灰轨 IN->D8",
     "L9110S VCC->5V GND->GND IA->D11 IB->D12"),
    ("水泵    12V+ -> 继电器 COM，NO -> 泵+，泵- -> 12V-，12V- 必须接 Arduino GND",
     "水泵    L9110S OUT1 -> 泵+，OUT2 -> 泵-（5 V，取自板子）"),
    ("水泵 12V+ -> 继电器 COM，NO -> 泵+，泵- -> 12V-，12V- 必须接 Arduino GND",
     "水泵 L9110S OUT1 -> 泵+，OUT2 -> 泵-（5 V）"),
    ("位选 DIG1-DIG4 -> A2 A3 A4 A5（共阴，低电平点亮）",
     "屏    SDA->A4  SCL->A5（I2C 地址 0x27）"),
    # 代码注释里的引脚
    ("const uint8_t PIN_DT   = A1;", "const uint8_t PIN_XW_RX = 10;   // 秤 TX -> D10"),
    ("const uint8_t PIN_SCK  = A0;", "const uint8_t PIN_PUMP_A = 11;  // L9110S IA"),
    ("const uint8_t PIN_PUMP = 8;",  "const uint8_t PIN_PUMP_B = 12;  // L9110S IB"),
    # 显示
    ("5461AS-1 四位显示", "LCD1602 显示"),
    ("5461AS-1：四位共阴，位选低电平点亮", "LCD1602：I2C 地址 0x27"),
    ("5461AS-1 —— 12 脚（上 6 / 下 6）", "LCD1602 —— I2C 两线"),
    ("5461AS-1", "LCD1602"),
    ("74HC595", "PCF8574"),
    ("数码管本身就能看重量", "屏幕本身就能看重量"),
    ("数码管", "LCD"),
    # 电源
    ("12V 电源", "5 V 电源"),
    ("12V-", "GND"),
    ("12V", "5V"),
]

hit = []
for old, new in REPS:
    n = s.count(old)
    if n:
        s = s.replace(old, new)
        hit.append((n, old[:44], new[:36]))

io.open(p, "w", encoding="utf-8").write(s)
print(f"替换 {len(hit)} 项，{orig_len} -> {len(s)} 字符\n")
for n, o, nw in hit:
    print(f"  {n}x  {o!r} -> {nw!r}")

print("\n=== 复查残留 ===")
for kw in ("HX711", "5461AS", "74HC595", "12V", "继电器", "数码管", "DT->A1", "SCK->A0", "IN->D8"):
    print(f"  {kw}: {s.count(kw)}")
