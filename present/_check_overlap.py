from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
import sys

P = r'E:\hardness\Rice-Water-Ratio-STEM-Project-Report-6\ricemix-stem-appendix.pptx'
prs = Presentation(P)

def box(sh):
    L = round(sh.left / 12700) if sh.left is not None else 0
    T = round(sh.top / 12700) if sh.top is not None else 0
    W = round(sh.width / 12700) if sh.width is not None else 0
    H = round(sh.height / 12700) if sh.height is not None else 0
    return L, T, W, H

def overlap(a, b):
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    ox = max(0, min(ax + aw, bx + bw) - max(ax, bx))
    oy = max(0, min(ay + ah, by + bh) - max(ay, by))
    return ox * oy

bad = 0
for i, sd in enumerate(prs.slides, 1):
    pics, texts = [], []
    for sh in sd.shapes:
        L, T, W, H = box(sh)
        if sh.shape_type == MSO_SHAPE_TYPE.PICTURE:
            pics.append((sh.name, L, T, W, H))
        elif sh.has_text_frame and sh.text_frame.text.strip():
            texts.append((sh.text_frame.text.strip()[:26], L, T, W, H))
    for pn, px, py, pw, ph in pics:
        for tn, tx, ty, tw, th in texts:
            ov = overlap((px, py, pw, ph), (tx, ty, tw, th))
            if ov > 400:
                bad += 1
                print(f'slide {i:2d}  [{pn}] x={px} y={py} w={pw} h={ph}'
                      f'   压住  "{tn}"  x={tx} y={ty} w={tw} h={th}  重叠={ov}')

print('---')
print(f'共 {bad} 处图片压文字' if bad else '没有图片压文字')
