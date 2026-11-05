import re
p = r'E:\hardness\ricemix\present\preview_deck.py'
s = open(p, encoding='utf-8').read()
s = re.sub(r'SRC = r"[^"]*"', 'SRC = r"E:\\\\hardness\\\\Rice-Water-Ratio-STEM-Project-Report-6\\\\ricemix-stem-appendix.pptx"', s)
s = re.sub(r'PICK = \[[^\]]*\]', 'PICK = [28,29,30,31,32,33,34,35]', s)
open(p, 'w', encoding='utf-8').write(s)
print('patched')
