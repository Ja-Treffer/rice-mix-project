# -*- coding: utf-8 -*-
"""把 ODP 里残留的旧硬件描述全部换成当前 5V 套件架构"""
import os, re

p = os.path.join(os.environ["TEMP"], "odp_v2", "content.xml")
xml = open(p, encoding="utf-8").read()
before = len(xml)

# (旧, 新) —— 按长度降序，避免短串先吃掉长串
REPS = [
    # 第 12 页 引脚总览
    ("HX711 DT→A1, SCK→A0 · relay IN→D8 · keypad rows D2–D5, cols D6/D7/D9/D10",
     "XW112 TX→D10 · L9110S IA/IB→D11/D12 · keypad rows D2–D5, cols D6–D9"),
    ("HX711 reads the load cell", "XW112 sends grams over UART at 9600"),
    ("IN → D8 · 12 V pump", "IA/IB → D11/D12 · 5 V pump"),
    ("Relay closes, pump runs, relay opens", "Bridge drives the pump, then releases it"),
    # 第 15 页 BOM
    ("5461AS-1 4-digit + LCD1602 I2C + 8 × 220 Ω", "LCD1602 + PCF8574 I2C backpack"),
    ("12 V pump + 1 A adapter + jack + terminal", "5 V pump (comes with the kit)"),
    ("1N4007 across the pump: without it the relay contacts arc and pit.",
     "1N4007 across the pump: without it the bridge sees the coil kickback."),
    # 第 16 页 装配
    ("HX711: VCC/GND to rails; DT → A1, SCK → A0", "XW112: VCC/G to 5 V/GND; TX → D10"),
    ("Load cell E+/E−/A−/A+ into the HX711 pads", "The scale is one piece — no load-cell wiring"),
    ("Adapter through a DC jack; +12 V to relay COM", "Nothing to wire — the pump runs off 5 V from the board"),
    # 第 19 页 接线图卡片
    ("HX711 → A1/A0 · relay → D8 · keypad → D2–D5 / D6,D7,D9,D10",
     "XW112 → D10 · L9110S → D11/D12 · keypad → D2–D5 / D6–D9"),
    ("L9110S → 12 V pump", "L9110S → 5 V pump"),
    # 第 10 页 规格
    ("5 kg load cell + HX711, 24-bit ADC", "5 kg load cell, XW112 UART 9600 8N1"),
    # 第 22 页 决策链
    ("poured ≥ target − 5 g → open the relay", "poured ≥ target − 5 g → pump off"),
    # 第 11 页 余流说明
    ("Water already in the tube keeps falling after the relay opens.",
     "Water already in the tube keeps falling after the pump stops."),
    # 第 19 页 拆散的短串
    ("HX711 +", "XW112"),
]

hit = 0
for old, new in REPS:
    n = xml.count(old)
    if n:
        xml = xml.replace(old, new)
        hit += 1
        print(f"OK  {n}x  {old[:58]!r}")
    else:
        print(f"--  0x   {old[:58]!r}")

open(p, "w", encoding="utf-8").write(xml)
print(f"\n改了 {hit}/{len(REPS)} 项，XML {before} -> {len(xml)} 字符")

# 复查
print("\n=== 复查残留 ===")
for kw in ("HX711", "5461AS", "74HC595", "12 V pump", "single-channel"):
    print(f"  {kw}: {xml.count(kw)}")
print(f"  relay: {xml.count('relay')}  (第31/32页的 Wokwi 复盘保留)")
