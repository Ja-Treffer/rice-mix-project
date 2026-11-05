# 极简 PPTX → SVG 预览（只为视觉核对版式，不是排版器）
import sys, os
from pptx import Presentation
from pptx.util import Emu

SRC = r"E:\hardness\Rice-Water-Ratio-STEM-Project-Report-6\ricemix-stem-appendix.pptx"
OUT = r"E:\hardness\ricemix\_shots\deck_preview.html"
PICK = [28,29,30,31,32,33,34,35]

prs = Presentation(SRC)
W = 960.0
H = 540.0
EMU_PT = 12700.0

def esc(t):
    return (t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))

html = ['<!doctype html><meta charset="utf-8"><style>',
        'body{margin:0;background:#555;font-family:"Microsoft YaHei",sans-serif}',
        '.pg{width:960px;height:540px;margin:14px auto;position:relative;overflow:hidden;box-shadow:0 4px 18px #0008}',
        'div.t{position:absolute;white-space:pre-wrap;line-height:1.25}',
        '</style>']

for idx, slide in enumerate(prs.slides, start=1):
    if idx not in PICK:
        continue
    # 背景色
    bg = '#FFFFFF'
    try:
        if slide.background.fill.type is not None:
            bg = '#' + str(slide.background.fill.fore_color.rgb)
    except Exception:
        bg = '#121212' if idx in (3,6,8,9,13,15,18,21,25) else '#FFFFFF'
    html.append(f'<div class="pg" style="background:{bg}">')
    for sh in slide.shapes:
        if not sh.has_text_frame:
            continue
        txt = sh.text_frame.text
        if not txt.strip():
            continue
        x = sh.left / EMU_PT
        y = sh.top / EMU_PT
        w = sh.width / EMU_PT
        run = None
        for p in sh.text_frame.paragraphs:
            for r in p.runs:
                run = r
                break
            if run:
                break
        sz = 18
        col = '#121212'
        bold = False
        if run is not None:
            if run.font.size:
                sz = run.font.size.pt
            try:
                if run.font.color and run.font.color.rgb:
                    col = '#' + str(run.font.color.rgb)
            except Exception:
                pass
            bold = bool(run.font.bold)
        align = 'left'
        try:
            if sh.text_frame.paragraphs[0].alignment is not None:
                a = str(sh.text_frame.paragraphs[0].alignment)
                if 'CENTER' in a:
                    align = 'center'
                elif 'RIGHT' in a:
                    align = 'right'
        except Exception:
            pass
        wt = '700' if bold else '400'
        html.append(
            f'<div class="t" style="left:{x:.1f}px;top:{y:.1f}px;width:{w:.1f}px;'
            f'font-size:{sz:.1f}px;color:{col};font-weight:{wt};text-align:{align}">{esc(txt)}</div>')
    html.append('</div>')

html.append('</html>')
with open(OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html))
print('written', OUT, 'slides picked', len(PICK))

