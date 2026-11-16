# -*- coding: utf-8 -*-
"""full-sim.html 硬件描述换成当前架构（只动显示文本，不动 Wokwi JSON）"""
import io, re

p = r"E:\hardness\_pages\full-sim.html"
s = io.open(p, encoding="utf-8").read()
before = len(s)

REPS = [
    # 徽章 / 标题
    ("HX711 + 5kg 悬臂梁", "XW112 电子秤"),
    ("HX711 + 5 kg 悬臂梁", "XW112 电子秤"),
    ("单路光耦继电器", "L9110S 双路驱动"),
    ("12V 直流水泵 · 独立供电", "5V 水泵 · 板载供电"),
    ("12 V 直流水泵 · 独立供电", "5 V 水泵 · 板载供电"),
    ("12V 直流水泵", "5V 水泵"),
    # 接线步骤 chip
    ('data-step="2">2 HX711→主控', 'data-step="2">2 XW112→主控'),
    ('data-step="3">3 继电器→主控', 'data-step="3">3 L9110S→主控'),
    ('data-step="4">4 595→主控', 'data-step="4">4 LCD→主控'),
    ('data-step="5">5 595→数码管', 'data-step="5">5 屏线→LCD'),
    # 说明段落
    ("一律以 HX711 模块丝印 E+ / E− / A+ / A− 为准",
     "一律以 XW112 秤壳丝印 VCC / TX / RX / G 为准"),
    ("逐根核对：主控 5V ↔ HX711 VCC、主控 GND ↔ HX711 GND。",
     "逐根核对：主控 5V ↔ 秤 VCC、主控 GND ↔ 秤 G。"),
    ("12V 电源负极 → 主控 GND，<b>必须连</b>（图上橙色标注那条）。",
     "泵的负极回路要回到主控 GND，<b>必须连</b>（图上橙色标注那条）。"),
    ("顺手量工作电流，确认 12V 电源余量 ≥1.5 倍。",
     "顺手量工作电流，确认 5 V 轨余量 ≥1.5 倍。"),
    ("泵必须独立 12V 供电，只共地不共用电源。",
     "泵是 5 V 的，直接取板子的 5 V —— 整套套件插 USB 就能跑。"),
    # 电源相关
    ("12V 电源", "5 V 电源"),
]

hit = []
for old, new in REPS:
    n = s.count(old)
    if n:
        s = s.replace(old, new)
        hit.append((n, old[:46]))

# 兜底：只替换 HTML 文本里的裸词（跳过 <script> 内部）
# 先切出 script 区块做保护
parts = re.split(r"(<script\b.*?</script>)", s, flags=re.S)
plain_reps = [
    ("HX711", "XW112"),
    ("单路光耦继电器", "L9110S 双路驱动"),
]
for i, blk in enumerate(parts):
    if blk.startswith("<script"):
        continue
    for old, new in plain_reps:
        if old in blk:
            n = blk.count(old)
            blk = blk.replace(old, new)
            hit.append((n, f"(HTML段) {old}"))
    parts[i] = blk
s = "".join(parts)

io.open(p, "w", encoding="utf-8").write(s)
print(f"替换 {len(hit)} 项，{before} -> {len(s)} 字符\n")
for n, o in hit:
    print(f"  {n}x  {o!r}")

print("\n=== 复查（script 段内保留 Wokwi 配置）===")
for kw in ("HX711", "单路光耦继电器", "12V 直流水泵"):
    print(f"  {kw}: {s.count(kw)}")
