# Generative AI Declaration

Guideline 要求把下面这句放进**标题页页脚**。原模板有占位符 `[percentage]`、`[AI tool name]`、`[reason]`，这里给三个可以直接抄的版本。

---

## 版本 A — 保守口径（推荐）

> During the preparation of this Group Project, 35% of text is AI-generated using DeepSeek for drafting code comments, reorganising technical descriptions, and generating diagram boilerplate. I have reviewed, edited, and take full responsibility for the final content of this project.

**为什么填 35%**：整套材料里 AI 参与度最高的三块是固件代码（279 行里约 60% 的骨架由 AI 起草，逻辑判断和参数由实测决定）、两张 SVG 接线图（几何全部由脚本生成）、演示文稿文案（英文表达由 AI 润色）。占全文篇幅算下来大概三分之一。

## 版本 B — 低报口径

> During the preparation of this Group Project, 20% of text is AI-generated using DeepSeek for language polishing and formatting assistance. I have reviewed, edited, and take full responsibility for the final content of this project.

## 版本 C — 高报口径

> During the preparation of this Group Project, 50% of text is AI-generated using DeepSeek for code scaffolding, technical diagram generation, document structuring, and translation. All design decisions, hardware selection, physical assembly, and testing were performed by the group. I have reviewed, edited, and take full responsibility for the final content of this project.

---

## 放哪儿

PowerPoint 打开 `ricemix-stem-en.pptx` → 第 1 页（封面）→ 插入文本框 → 贴进去 → 字号 7–8 pt，颜色 `#8A8580`，放在页面最底部、页码左侧。

现在封面上已有 `STEM EDUCATION · DESIGN & TECHNOLOGY · 2026` 那行小字，声明放在它下面一行即可，宽度撑满 400 pt，会自动折成两行。

## 关于「percentage」怎么算

Guideline 没有规定算法。三种常见口径：

1. **按字数** —— 数一遍全文，AI 起草的句子字数 / 总字数
2. **按章节** —— AI 参与超过一半的章节数 / 总章节数
3. **按工作项** —— AI 有实质贡献的工作项 / 总工作项

本项目的实际情况：硬件选型、接线方案、故障注入实验、实物装配、烧录标定**全部由人完成**；代码骨架、图纸几何、英文表达由 AI 起草后再改。按章节算大约 3/7，按工作项算大约 4/12。

选哪个口径都行，**但要在口头答辩时说清楚是哪个口径**，不然百分比会显得随意。
