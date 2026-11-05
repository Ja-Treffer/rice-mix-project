from pptx import Presentation
p = Presentation(r'E:\hardness\Rice-Water-Ratio-STEM-Project-Report-6\ricemix-stem-appendix.pptx')
for idx in (28, 29, 30, 31, 32, 33, 34):
    sl = p.slides[idx]
    pics = [s for s in sl.shapes if s.shape_type == 13]
    txt = [s for s in sl.shapes if s.has_text_frame and s.text_frame.text.strip()]
    print(f'--- slide {idx+1}: pics={len(pics)} texts={len(txt)}')
    for s in pics:
        print(f'    PIC {s.name}  {round(s.left/12700)}x{round(s.top/12700)} '
              f'{round(s.width/12700)}x{round(s.height/12700)}pt')
