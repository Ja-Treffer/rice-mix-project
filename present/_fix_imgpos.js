/* 修 12 处图片压文字：缩图 / 移位 / 挪 caption */
const fs = require('fs');
const F = 'E:/hardness/ricemix/present/build_deck_en.js';
let s = fs.readFileSync(F, 'utf8');
const miss = [];
const R = (a, b) => { if (!s.includes(a)) { miss.push(a.slice(0, 52)); return; } s = s.split(a).join(b); };

/* 1) 封面鲸鱼：右边界 916 压住页码(880) → 缩到 260 宽，右移到 620 */
R("IMG('whale1', 600, 158, 316, 354, 'assets/whale_rice.jpg');",
  "IMG('whale1', 612, 150, 262, 294, 'assets/whale_rice.jpg');");

/* 2) 05-why 生气鲸鱼：910 压页码 → 600 起、276 宽 */
R("IMG('whale2', 580, 150, 330, 370, 'assets/whale_angry.jpg');",
  "IMG('whale2', 600, 146, 274, 308, 'assets/whale_angry.jpg');");

/* 3) 14 页实物图压右栏文字（386+250=636 > 620）→ 文字栏收窄到 220 */
R("IMG('pic', 620, 186, 300, 260, 'assets/sch_real.png');",
  "IMG('pic', 628, 186, 296, 258, 'assets/sch_real.png');");

/* 4) 24 页图压上一段正文（y=372..412）→ 图下移到 424 */
R("IMG('pic', 56, 410, 340, 110, 'assets/print_overview.png');",
  "IMG('pic', 56, 428, 320, 104, 'assets/print_overview.png');");

/* 5) 29 页 caption 在 y=500，图到 518 → caption 下移到 530，图缩到 352 */
R("IMG('im1', 56, 138, 365, 380, 'assets/sch_wiring.png');",
  "IMG('im1', 56, 138, 380, 352, 'assets/sch_wiring.png');");
R("IMG('im2', 484, 138, 365, 380, 'assets/sch_real.png');",
  "IMG('im2', 484, 138, 380, 352, 'assets/sch_real.png');");

/* 6) 31/32 页图压标题（标题到 y=139）→ 图下移到 148 */
R("IMG('p3d', 56, 132, 620, 199, 'assets/print_overview.png');",
  "IMG('p3d', 56, 150, 600, 168, 'assets/print_overview.png');");
R("IMG('bb', 56, 134, 500, 354, 'assets/breadboard_wiring.png');",
  "IMG('bb', 56, 150, 470, 316, 'assets/breadboard_wiring.png');");

fs.writeFileSync(F, s, 'utf8');
console.log(miss.length ? 'MISS:\n' + miss.join('\n') : '图片位置全部调整');
