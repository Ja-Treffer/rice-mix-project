"""Extract text from the two source DOCX files into UTF-8 dumps."""
import io
from docx import Document

paths = [
    (r"C:\Users\doubl\Desktop\继电器驱动式闭环米水配比系统完整方案(1).docx", r"E:\hardness\_dump_plan.txt"),
    (r"C:\Users\doubl\Desktop\自动米水.docx", r"E:\hardness\_dump_auto.txt"),
]

for src, dst in paths:
    out = io.StringIO()
    d = Document(src)
    for para in d.paragraphs:
        t = para.text.strip()
        if t:
            out.write(t + "\n")
    for i, tb in enumerate(d.tables):
        out.write(f"--TABLE {i}--\n")
        for row in tb.rows:
            out.write(" | ".join(c.text.strip() for c in row.cells) + "\n")
    with open(dst, "w", encoding="utf-8") as f:
        f.write(out.getvalue())
    print("wrote", dst, len(out.getvalue()))
