const fs = require('fs');
const W = 1560, H = 1040;

const INK = '#121212', GRAY = '#5F5B55';
const OR = '#E45B24', RED = '#C8342A', GRN = '#1F7A4D', BLU = '#1F5FA8';
const BORD = '#D9D3C7', CARD = '#FCFBF9';

let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="'Microsoft YaHei','PingFang SC',sans-serif">`;
s += `<rect width="${W}" height="${H}" fill="#ffffff"/>`;

const T = (x, y, t, o = {}) => {
  s += `<text x="${x}" y="${y}" font-size="${o.sz || 13}" fill="${o.c || INK}"${o.w ? ` font-weight="${o.w}"` : ''}${o.a ? ` text-anchor="${o.a}"` : ''} font-family="${o.m ? "'Consolas',monospace" : "'Microsoft YaHei','PingFang SC',sans-serif"}">${t}</text>`;
};
const RC = (x, y, w, h, fill, stroke, sw = 1.5, rx = 8) => {
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}/>`;
};
const LN = (x1, y1, x2, y2, c, w = 2, dash) => {
  s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`;
};
const PT = (d, stroke, w = 2, fill = 'none', dash) => {
  s += `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linejoin="round" stroke-linecap="round"/>`;
};
const DOT = (x, y, r, c) => { s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`; };

T(46, 50, 'RiceMix on ESP32', { sz: 30, w: 700 });
T(46, 78, 'ESP32 插在扩展板上 · XW112 自带数码管显重量，LCD 只显示系统状态', { sz: 13.5, c: GRAY });
LN(46, 92, 300, 92, OR, 4);

const bd  = { x: 470, y: 168, w: 410, h: 452 };
const esp = { x: 592, y: 258, w: 166, h: 272 };
const ROW0 = bd.y + 58, ROWG = 19.6;

RC(bd.x, bd.y, bd.w, bd.h, '#5b2a86', '#3d1a5c', 2.4, 10);
T(bd.x + bd.w / 2, bd.y + 28, 'ESP32 扩展板', { sz: 15.5, c: '#f0e0ff', a: 'middle', w: 700 });
T(bd.x + bd.w / 2, bd.y - 12, 'ESP32 38 针扩展板（ESP32 插在中间）', { sz: 12, c: INK, a: 'middle', w: 700 });

for (let i = 0; i < 19; i++) {
  const yy = ROW0 + i * ROWG;
  RC(bd.x + 12, yy - 5, 26, 10, '#241033', '#150820', 1, 2);
  RC(bd.x + bd.w - 38, yy - 5, 26, 10, '#241033', '#150820', 1, 2);
}
T(bd.x + bd.w / 2, bd.y + bd.h - 8, '38 针 · 两侧各 19 针母座', { sz: 8.5, c: '#c8a8e0', a: 'middle' });

RC(bd.x + 8, bd.y + bd.h - 60, 86, 42, '#241033', '#150820', 1, 4);
T(bd.x + 51, bd.y + bd.h - 42, '5V   3V3', { sz: 8.4, c: '#7CE0A8', a: 'middle', m: 1, w: 700 });
T(bd.x + 51, bd.y + bd.h - 28, 'GND  GND', { sz: 8.4, c: '#7CE0A8', a: 'middle', m: 1, w: 700 });
T(bd.x + 8, bd.y + bd.h - 84, 'DC 5-12V 输入', { sz: 8.5, c: '#c8a8e0' });
T(bd.x + 100, bd.y + bd.h - 30, '★ 脚位以扩展板丝印为准，这里只标用到的 12 个', { sz: 9, c: '#e8b87a' });

RC(esp.x, esp.y, esp.w, esp.h, '#1a3f6b', '#0f2b4a', 2, 8);
T(esp.x + esp.w / 2, esp.y + 32, 'ESP32', { sz: 18, c: '#fff', w: 700, a: 'middle' });
T(esp.x + esp.w / 2, esp.y + 48, 'DevKit v1', { sz: 9, c: '#8fb6dd', a: 'middle' });
T(esp.x + esp.w / 2, esp.y + esp.h - 12, 'USB', { sz: 8.6, c: '#8fb6dd', a: 'middle', m: 1 });
RC(esp.x + 20, esp.y + 62, esp.w - 40, 44, '#b8bcc4', '#8f959e', 1.2, 3);
T(esp.x + esp.w / 2, esp.y + 88, 'ESP-WROOM-32', { sz: 7.6, c: '#3a4048', a: 'middle', m: 1 });

const LP = [
  { nm: '3V3',    y: ROW0 + 0 * ROWG },
  { nm: 'GPIO34', y: ROW0 + 4 * ROWG },
  { nm: 'GPIO32', y: ROW0 + 6 * ROWG },
  { nm: 'GPIO33', y: ROW0 + 7 * ROWG },
  { nm: 'GPIO25', y: ROW0 + 8 * ROWG },
  { nm: 'GPIO26', y: ROW0 + 9 * ROWG },
  { nm: 'GPIO27', y: ROW0 + 10 * ROWG },
  { nm: 'GPIO14', y: ROW0 + 11 * ROWG },
  { nm: 'GPIO13', y: ROW0 + 12 * ROWG },
  { nm: 'GPIO5',  y: ROW0 + 13 * ROWG },
  { nm: 'GPIO4',  y: ROW0 + 16 * ROWG },
  { nm: 'GND',    y: ROW0 + 14 * ROWG },
];
const RP = [
  { nm: 'GPIO22', y: ROW0 + 2 * ROWG },
  { nm: 'GPIO21', y: ROW0 + 3 * ROWG },
  { nm: 'GPIO19', y: ROW0 + 4 * ROWG },
  { nm: 'GPIO18', y: ROW0 + 5 * ROWG },
  { nm: 'GPIO17', y: ROW0 + 7 * ROWG },
  { nm: 'GPIO16', y: ROW0 + 8 * ROWG },
  { nm: '5V',     y: ROW0 + 15 * ROWG },
];
LP.forEach(p => T(bd.x + 50, p.y + 3.6, p.nm, { sz: 9.2, c: '#f0e6ff', m: 1, w: 700 }));
RP.forEach(p => T(bd.x + bd.w - 50, p.y + 3.6, p.nm, { sz: 9.2, c: '#f0e6ff', a: 'end', m: 1, w: 700 }));

const pinL = (nm) => { const p = LP.find(q => q.nm === nm); return { x: bd.x + 12, y: p.y }; };
const pinR = (nm) => { const p = RP.find(q => q.nm === nm); return { x: bd.x + bd.w - 12, y: p.y }; };

const lcd = { x: 906, y: 104, w: 292, h: 92 };
RC(lcd.x, lcd.y, lcd.w, lcd.h, '#2f6b4f', '#1d4633', 2, 6);
RC(lcd.x + 14, lcd.y + 14, lcd.w - 28, lcd.h - 40, '#9fd67a', '#7ab055', 1.5, 3);
T(lcd.x + lcd.w / 2, lcd.y + 50, '####......  45%', { sz: 14, c: '#14351f', a: 'middle', m: 1, w: 700 });
T(lcd.x + lcd.w / 2, lcd.y + 69, ' 54.0 / 144.0 g', { sz: 11.5, c: '#14351f', a: 'middle', m: 1 });
T(lcd.x + lcd.w / 2, lcd.y - 12, 'LCD1602 · I2C 0x27', { sz: 12, c: INK, a: 'middle', w: 700 });

const p22 = pinR('GPIO22'), p21 = pinR('GPIO21');
LN(lcd.x, lcd.y + 22, 888, lcd.y + 22, OR, 2.4);
LN(888, lcd.y + 22, 888, p21.y, OR, 2.4);
LN(888, p21.y, p21.x + 12, p21.y, OR, 2.4);
T(896, lcd.y + 14, 'SDA→21', { sz: 9.2, c: OR, m: 1 });

LN(lcd.x, lcd.y + 48, 872, lcd.y + 48, BLU, 2.4);
LN(872, lcd.y + 48, 872, p22.y, BLU, 2.4);
LN(872, p22.y, p22.x + 12, p22.y, BLU, 2.4);
T(880, lcd.y + 40, 'SCL→22', { sz: 9.2, c: BLU, m: 1 });
T(lcd.x + 4, lcd.y + lcd.h + 16, 'VCC 从扩展板 5V 排针取，GND 同源', { sz: 9.8, c: GRAY });

const xw = { x: 906, y: 336, w: 246, h: 100 };
RC(xw.x, xw.y, xw.w, xw.h, '#1f4d7a', '#123454', 2, 8);
T(xw.x + xw.w / 2, xw.y + 34, 'XW112', { sz: 21, c: '#fff', w: 700, a: 'middle' });
T(xw.x + xw.w / 2, xw.y + 52, '称重 · 四线 · UART', { sz: 10.5, c: '#8fb6dd', a: 'middle' });
RC(xw.x + 62, xw.y + 62, 122, 30, '#101820', '#000', 1.4, 3);
T(xw.x + xw.w / 2, xw.y + 84, '120.4', { sz: 16, c: '#ff3b30', a: 'middle', m: 1, w: 700 });
T(xw.x + xw.w / 2, xw.y - 78, '欣薇 XW112 V1.0 · STC8H1K28 · 串口', { sz: 12, c: INK, a: 'middle', w: 700 });
T(xw.x + xw.w / 2, xw.y + xw.h + 18, '★ 重量它自己显示，LCD 不再重复', { sz: 10, c: GRN, a: 'middle', w: 700 });

RC(xw.x + 34, xw.y - 60, 178, 24, '#c9ccd1', '#9aa0a8', 1.5, 4);
RC(xw.x + 48, xw.y - 74, 150, 15, '#e6e8ea', '#b9bdc2', 1.5, 3);
T(xw.x + 123, xw.y - 62, '称重平台', { sz: 9.2, c: '#5a6068', a: 'middle' });
LN(xw.x + 44, xw.y - 12, xw.x + 44, xw.y, '#7a818a', 1.6);

const p16 = pinR('GPIO16'), p17 = pinR('GPIO17');
LN(xw.x, xw.y + 22, 886, xw.y + 22, '#1f9e8e', 2.4);
LN(886, xw.y + 22, 886, p16.y, '#1f9e8e', 2.4);
LN(886, p16.y, p16.x + 12, p16.y, '#1f9e8e', 2.4);
T(894, xw.y + 14, 'SCK→16', { sz: 9.2, c: '#1f9e8e', m: 1 });

const p4 = pinL('GPIO4');
LN(xw.x, xw.y + 46, 874, xw.y + 46, '#8B6BD8', 2.2);
LN(874, xw.y + 46, 874, 928, '#8B6BD8', 2.2);
LN(874, 928, 296, 928, '#8B6BD8', 2.2);
LN(296, 928, 296, p4.y, '#8B6BD8', 2.2);
LN(296, p4.y, p4.x + 12, p4.y, '#8B6BD8', 2.2);
T(880, xw.y + 38, 'TX→4（交叉，走板下）', { sz: 9.2, c: '#8B6BD8', m: 1 });

T(xw.x + 4, xw.y + xw.h + 36, '4pin = VCC / TX / RX / G  ·  9600 8N1', { sz: 9.8, c: '#1f9e8e', m: 1, w: 700 });
T(xw.x + 4, xw.y + xw.h + 54, '板TX→GPIO4（我们的RX）  板RX→GPIO16   VCC→3V3   G→GND', { sz: 9.2, c: GRAY, m: 1 });
T(xw.x + 4, xw.y + xw.h + 70, '★ 收发要交叉：板子TX接我们RX，不是TX接TX', { sz: 9.4, c: RED, m: 1 });
T(xw.x + 4, xw.y + xw.h + 86, '  帧格式 \'0123\r\n\' = 123 克；只在称重界面发送', { sz: 9.2, c: GRAY, m: 1 });

const wl = { x: 58, y: 300, w: 210, h: 100 };
RC(wl.x, wl.y, wl.w, wl.h, '#f0efe9', BORD, 1.6, 8);
T(wl.x + 14, wl.y + 24, '水位计', { sz: 14, w: 700 });
T(wl.x + 14, wl.y + 44, '模拟 · 防干烧', { sz: 10.5, c: GRAY });
RC(wl.x + 14, wl.y + 56, wl.w - 28, 28, '#dfe7ee', '#b8c4d0', 1.2, 4);
for (let i = 0; i < 6; i++) LN(wl.x + 24 + i * 28, wl.y + 60, wl.x + 24 + i * 28, wl.y + 80, '#8fa3b8', 2);

const p34 = pinL('GPIO34');
LN(wl.x + wl.w, wl.y + 18, 452, wl.y + 18, GRN, 2.4);
LN(452, wl.y + 18, 452, p34.y, GRN, 2.4);
LN(452, p34.y, p34.x + 12, p34.y, GRN, 2.4);
T(wl.x + 4, wl.y + wl.h + 15, 'OUT→34  VCC→3V3排针  GND→GND', { sz: 9.6, c: GRAY, m: 1 });

const rly = { x: 40, y: 452, w: 232, h: 116 };
/* L298N — kept because the kit's wiring is tidy: pump screws into the
   terminal block, no dupont spaghetti, and it can reverse to flush.  */
RC(rly.x, rly.y, rly.w, rly.h, '#1f5fa8', '#123d70', 2, 8);
T(rly.x + rly.w / 2, rly.y - 14, 'L298N 双路驱动（保留）', { sz: 12.5, c: INK, a: 'middle', w: 700 });
T(rly.x + rly.w / 2, rly.y + 26, 'L298N', { sz: 17, c: '#fff', a: 'middle', w: 700 });
T(rly.x + rly.w / 2, rly.y + 44, '双H桥 · 12V/2A', { sz: 9, c: '#9fc4e8', a: 'middle' });
/* 左侧控制端子 */
RC(rly.x + 8, rly.y + 52, 46, 46, '#0f2b4a', '#071a2e', 1, 3);
T(rly.x + 31, rly.y + 66, 'IN1', { sz: 7.6, c: '#9fc4e8', a: 'middle', m: 1 });
T(rly.x + 31, rly.y + 78, 'IN2', { sz: 7.6, c: '#9fc4e8', a: 'middle', m: 1 });
T(rly.x + 31, rly.y + 90, 'ENA', { sz: 7.6, c: '#9fc4e8', a: 'middle', m: 1 });
/* 右侧输出端子 */
RC(rly.x + rly.w - 58, rly.y + 52, 46, 30, '#0f2b4a', '#071a2e', 1, 3);
T(rly.x + rly.w - 35, rly.y + 64, 'OUT1', { sz: 7.6, c: '#9fc4e8', a: 'middle', m: 1 });
T(rly.x + rly.w - 35, rly.y + 76, 'OUT2', { sz: 7.6, c: '#9fc4e8', a: 'middle', m: 1 });
/* 下方电源端子 */
RC(rly.x + 8, rly.y + rly.h - 26, rly.w - 16, 18, '#0f2b4a', '#071a2e', 1, 3);
T(rly.x + rly.w / 2, rly.y + rly.h - 13, '+12V   GND   +5V', { sz: 8, c: '#9fc4e8', a: 'middle', m: 1 });

const p18 = pinR('GPIO18'), p19 = pinR('GPIO19');
LN(rly.x + rly.w, rly.y + 66, 420, rly.y + 66, '#8B6BD8', 2.2);
LN(420, rly.y + 66, 420, p18.y, '#8B6BD8', 2.2);
LN(420, p18.y, p18.x + 12, p18.y, '#8B6BD8', 2.2);
T(392, rly.y + 58, 'IN1→18', { sz: 9, c: '#8B6BD8', m: 1, w: 700 });

LN(rly.x + rly.w, rly.y + 80, 406, rly.y + 80, '#c58bd8', 2.2);
LN(406, rly.y + 80, 406, p19.y, '#c58bd8', 2.2);
LN(406, p19.y, p19.x + 12, p19.y, '#c58bd8', 2.2);
T(378, rly.y + 104, 'IN2→19', { sz: 9, c: '#c58bd8', m: 1, w: 700 });
T(rly.x + rly.w / 2, rly.y + rly.h + 15, 'ENA 跳线帽接 5V（默认全速，不调速）', { sz: 8.8, c: GRAY, a: 'middle', m: 1 });

const pmp = { x: 1272, y: 300, w: 196, h: 132 };
RC(pmp.x, pmp.y, pmp.w, pmp.h, '#2b2b2b', '#111', 2, 10);
T(pmp.x + pmp.w / 2, pmp.y + 46, 'AD20P-1230C', { sz: 11.5, c: '#fff', a: 'middle', w: 700 });
T(pmp.x + pmp.w / 2, pmp.y + 64, '12V 3.6W 0.3A', { sz: 9.5, c: '#a8a8a8', a: 'middle' });
T(pmp.x + pmp.w / 2, pmp.y - 34, '12V 直流水泵', { sz: 12, c: INK, a: 'middle', w: 700 });
RC(pmp.x + 62, pmp.y - 24, 20, 24, '#1a1a1a', '#000', 1.2, 3);
RC(pmp.x + 112, pmp.y - 24, 20, 24, '#1a1a1a', '#000', 1.2, 3);

PT(`M ${rly.x + rly.w} ${rly.y + 96} L 344 ${rly.y + 96} L 344 ${900} L 1210 ${900} L 1210 ${pmp.y + 84} L ${pmp.x} ${pmp.y + 84}`, OR, 2.6);
T(1218, pmp.y + 76, 'OUT1→泵+', { sz: 9.2, c: OR, m: 1 });
PT(`M ${rly.x + rly.w - 8} ${rly.y + rly.h - 17} L 330 ${rly.y + rly.h - 17} L 330 ${920} L 1226 ${920} L 1226 ${pmp.y + pmp.h - 14} L ${pmp.x + pmp.w} ${pmp.y + pmp.h - 14}`, '#333', 2.4);
T(1234, pmp.y + pmp.h - 22, 'OUT2→泵−', { sz: 9, c: '#333', m: 1 });

const bat = { x: 1272, y: 486, w: 196, h: 100 };
RC(bat.x, bat.y, bat.w, bat.h, '#f0efe9', BORD, 1.6, 8);
T(bat.x + 14, bat.y + 24, '12V 1A 适配器', { sz: 12.5, w: 700 });
T(bat.x + 14, bat.y + 44, '泵独立供电', { sz: 10, c: GRAY });
T(bat.x + 14, bat.y + 66, '+12V → COM', { sz: 9.6, c: OR, m: 1 });
T(bat.x + 14, bat.y + 84, '−   → 泵黑线', { sz: 9.6, c: GRAY, m: 1 });

PT(`M ${bat.x} ${bat.y + 34} L 1240 ${bat.y + 34} L 1240 ${936} L 320 ${936} L 320 ${rly.y + rly.h - 8} L ${rly.x + 8} ${rly.y + rly.h - 8}`, OR, 2.6);
T(1250, bat.y + 26, '+12V→L298N', { sz: 9, c: OR, m: 1 });


const gnd = pinL('GND');
PT(`M ${bat.x + 40} ${bat.y + 86} L ${bat.x + 40} ${972} L 300 ${972} L 300 400 L 452 400 L 452 ${gnd.y} L ${gnd.x + 12} ${gnd.y}`, RED, 2.4, 'none', '7 5');
T(314, 966, '★ 共地：12V 负极 → 扩展板 GND 排针，不接地继电器会乱跳', { sz: 11, c: RED, w: 700 });

const kp = { x: 58, y: 612, w: 226, h: 210 };
RC(kp.x, kp.y, kp.w, kp.h, '#2f6b4f', '#1d4633', 2, 8);
T(kp.x + kp.w / 2, kp.y + 24, '4×4 键盘', { sz: 14.5, c: '#fff', a: 'middle', w: 700 });
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    const bx = kp.x + 18 + c * 48, by = kp.y + 40 + r * 41;
    RC(bx, by, 38, 30, '#1c1c1c', '#000', 1.2, 5);
    T(bx + 19, by + 20, 'S' + (r * 4 + c + 1), { sz: 9, c: r < 1 ? '#7CE0A8' : '#8a8a8a', a: 'middle', m: 1, w: r < 1 ? 700 : 400 });
  }
}
T(kp.x, kp.y + kp.h + 20, 'S1 去皮   S2 开始   S3 急停   S4 翻页', { sz: 10, c: GRN, w: 700, m: 1 });
T(kp.x, kp.y + kp.h + 40, '8 pin：R1–R4 → 32 33 26 27', { sz: 9.2, c: GRAY, m: 1 });
T(kp.x, kp.y + kp.h + 56, '        C1–C4 → 14 13 5 17', { sz: 9.2, c: GRAY, m: 1 });

/* 8 pin header on the keypad's right edge */
const hdrX = kp.x + kp.w + 6, hdrY0 = kp.y + 44, hdrG = 18;
RC(hdrX, hdrY0 - 8, 14, hdrG * 7 + 16, '#111', '#000', 1, 2);
for (let i = 0; i < 8; i++) {
  RC(hdrX + 3, hdrY0 + i * hdrG - 2, 8, 8, '#C9A227', '#8a6d14', 0.8, 1);
}
T(hdrX + 20, hdrY0 + hdrG * 4 - 2, '8pin', { sz: 8.8, c: '#333', m: 1, w: 700 });

/* rows R1-R4 -> left header (green) */
['GPIO32', 'GPIO33', 'GPIO26', 'GPIO27'].forEach((nm, i) => {
  const sy = hdrY0 + i * hdrG + 2;
  const d = pinL(nm);
  PT(`M ${hdrX + 14} ${sy} L 330 ${sy} L 330 ${d.y} L ${d.x + 12} ${d.y}`, '#2f8f5b', 1.7, 'none', '5 4');
});
/* cols C1-C2 -> left header (teal) */
['GPIO14', 'GPIO13'].forEach((nm, i) => {
  const sy = hdrY0 + (4 + i) * hdrG + 2;
  const d = pinL(nm);
  PT(`M ${hdrX + 14} ${sy} L 344 ${sy} L 344 ${d.y} L ${d.x + 12} ${d.y}`, '#1F9E8E', 1.7, 'none', '5 4');
});
/* cols C3-C4 -> right header (purple), routed under the board */
['GPIO5', 'GPIO4'].forEach((nm, i) => {
  const sy = hdrY0 + (6 + i) * hdrG + 2;
  const d = pinL(nm);
  PT(`M ${hdrX + 14} ${sy} L 368 ${sy} L 368 ${d.y} L ${d.x + 12} ${d.y}`, '#8B6BD8', 1.7, 'none', '5 4');
});

const note = (x, y, w, title, body, c = INK) => {
  RC(x, y, w, 116, CARD, BORD, 1.2, 6);
  T(x + 14, y + 23, title, { sz: 12.5, c, w: 700 });
  body.forEach((b, i) => T(x + 14, y + 44 + i * 17, b, { sz: 10.5, c: GRAY }));
};
note(1188, 620, 268, '删掉了什么', ['DHT11 温湿度 · GPIO4', '光敏 · GPIO35', '土壤湿度 · GPIO33', '有源蜂鸣器 · GPIO15'], RED);
note(1188, 748, 268, '扩展板给了什么', ['5V / 3V3 / GND 排针直取', 'DC 5-12V 输入，板载稳压', '两侧母座引出全部 GPIO', '不用再单独做电源轨'], GRN);

const by2 = 940;
RC(46, by2, 1470, 84, CARD, BORD, 1.2, 8);
T(64, by2 + 22, '三条控制路径，任一条能用就不算断', { sz: 13.5, w: 700 });
[['键盘', '不需要网络', GRN], ['手机网页', '同 WiFi 或机器热点 192.168.4.1', OR], ['MQTT 巴法云', '有外网即可，mixcmd / mixdata', BLU]].forEach((p, i) => {
  const x = 64 + i * 486;
  DOT(x + 5, by2 + 48, 5, p[2]);
  T(x + 20, by2 + 53, p[0], { sz: 12.5, c: p[2], w: 700 });
  T(x + 20, by2 + 73, p[1], { sz: 10, c: GRAY });
});

s += '</svg>';
fs.writeFileSync('E:/hardness/ricemix/esp32/wiring.svg', s, 'utf8');
console.log('wiring.svg', Buffer.byteLength(s), 'bytes');
