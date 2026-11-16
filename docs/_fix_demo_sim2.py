# -*- coding: utf-8 -*-
"""清掉 demo-sim.html 里剩下的 HX711 / 继电器 / IN->D8"""
import io, re

p = r"E:\hardness\_pages\demo-sim.html"
s = io.open(p, encoding="utf-8").read()
before = len(s)

REPS = [
    # 内嵌代码块
    ("#include <HX711.h>", "/* 秤走 UART，不需要额外库 */\nSoftwareSerial xwSerial(10, 11);  // RX=D10"),
    ("HX711 scale;", "float scaleG = 0.0;   // 当前秤读数"),
    # SVG 绘图：HX711 模块 → XW112 模块
    ("const H=dip(400,150,120,132,'HX711','24-Bit ADC',4,4,     ['VCC','DT','SCK','GND'],['E+','E-','A-','A+']",
     "const H=dip(400,150,120,132,'XW112','电子秤 UART',2,2,     ['VCC','TX','RX','G'],[]"),
    ("TX(g,X.x+75,X.y+50,'HX711',", "TX(g,X.x+75,X.y+50,'XW112',"),
    ("TX(g,X.x+X.w/2,X.y-9,'HX711 称重放大',", "TX(g,X.x+X.w/2,X.y-9,'XW112 电子秤',"),
    ("HX711（DIP-16 外观，实际只画出用到的 8 脚）", "XW112 电子秤（4 针：VCC / TX / RX / G）"),
    ("/* ===== HX711 ===== */", "/* ===== XW112 ===== */"),
    # BOM
    ("['HX711 + 5kg 悬臂梁套装','24 位 ADC，精度约 1 g',1,12,25,'整套系统的眼睛，买套装']",
     "['XW112 电子秤（5 kg，自带显示）','UART 9600，板内已带 AD',1,25,40,'整套系统的眼睛，是台成品秤']"),
    ("['单路 5V 继电器模块','光耦隔离，高电平可触发',1,5,12,'用低压信号开关 5V 泵']",
     "['L9110S 双路 H 桥','1.2 A，正反转都能控',1,5,10,'驱动 5 V 泵，还能反转冲管']"),
    # 实物图：继电器 → L9110S
    ("/* ================= 继电器 ================= */", "/* ================= L9110S ================= */"),
    ("const R=dip(400,330,130,104,'JQC-3FF'", "const R=dip(400,330,130,104,'L9110S'"),
    ("'单路光耦继电器（红板 JQC-3FF）'", "'L9110S 双路驱动（蓝板）'"),
    ("/* ===== 单路光耦继电器（红板 JQC-3FF） ===== */", "/* ===== L9110S 双路 H 桥 ===== */"),
    ("TX(g,R.x+R.w/2,R.y-9,'单路光耦继电器',", "TX(g,R.x+R.w/2,R.y-9,'L9110S 双路驱动',"),
    ("'照实物的真实长相画：4×4 轻触按键板（绿）、单路光耦继电器（红板 JQC-3FF）、AD20P-1230C 无刷泵'",
     "'照实物的真实长相画：4×4 轻触按键板（绿）、L9110S 双路驱动（蓝板）、5 V 微型泵'"),
    ("'黄针=排针    灰端子=继电器 DC- DC+ IN / NO COM NC    米黄=米    蓝=水'",
     "'黄针=排针    灰端子=L9110S VCC GND IA IB / OUT1 OUT2    米黄=米    蓝=水'"),
    # 代码注释
    ("继电器  VCC->左红轨      GND->左灰轨        IN->D8",
     "L9110S  VCC->5V          GND->GND          IA->D11  IB->D12"),
    ("继电器 VCC->左红轨 GND->左灰轨 IN->D8", "L9110S VCC->5V GND->GND IA->D11 IB->D12"),
    # 剩余叙述
    ("不共地的话继电器指示灯会乱闪，泵要么不转要么一直转。", ""),
    ("''主控，负责称重、算数、控继电器''", "''主控，负责称重、算数、控泵''"),
    ("'主控，负责称重、算数、控继电器'", "'主控，负责称重、算数、控泵'"),
    ("缺 D1 继电器触点会被反冲打黑", "缺 D1 驱动管会被反冲打穿"),
    ("D8 → 继电器 IN（走 y=240 走廊到 x=354 再下）", "D11/D12 → L9110S IA/IB"),
    ("继电器 COM → 电源 +；NO → 泵 +；泵 − → 电源 −", "L9110S OUT1 → 泵 +；OUT2 → 泵 −"),
]

hit = []
for old, new in REPS:
    n = s.count(old)
    if n:
        s = s.replace(old, new)
        hit.append((n, old[:50]))

# 兜底：把裸词换掉
plain = [
    ("HX711 称重放大", "XW112 电子秤"),
    ("HX711", "XW112"),
    ("单路光耦继电器", "L9110S 双路驱动"),
    ("继电器", "L9110S"),
]
for old, new in plain:
    n = s.count(old)
    if n:
        s = s.replace(old, new)
        hit.append((n, f"(兜底) {old}"))

io.open(p, "w", encoding="utf-8").write(s)
print(f"替换 {len(hit)} 项，{before} -> {len(s)} 字符\n")
for n, o in hit:
    print(f"  {n}x  {o!r}")

print("\n=== 复查 ===")
for kw in ("HX711", "继电器", "IN->D8", "5461AS", "74HC595", "12V", "数码管"):
    print(f"  {kw}: {s.count(kw)}")
