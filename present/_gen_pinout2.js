/* 两张脚位图：595 与 5461AS-1 —— 一律「上1..上N / 下1..下N」从左往右数 */
const fs = require('fs');

const W = 1240, H = 620;
const O = '#E85D26', R = '#C8342A', B = '#1E5FA8', K = '#1A1A1A';
const P = '#5B34B8', MUT = '#6E6A64';

function make(cfg) {
  const s = [];
  const push = (x) => s.push(x);
  push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);

  const TX = (x, y, t, o = {}) => {
    const a = o.a || 'start', sz = o.sz || 13, c = o.c || K;
    const w = o.w ? ` font-weight="${o.w}"` : '';
    const f = o.m ? 'Consolas, Courier New, monospace' : 'Segoe UI, Arial, sans-serif';
    push(`<text x="${x}" y="${y}" fill="${c}" font-size="${sz}" font-family="${f}" text-anchor="${a}"${w}>${t}</text>`);
  };
  const LN = (pts, c, w = 2) => {
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
    push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`);
  };
  const RC = (x, y, w, h, f, st, sw = 1, rx = 0) =>
    push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}${rx ? ` rx="${rx}"` : ''}/>`);
  const CI = (cx, cy, r, f) => push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"/>`);

  TX(40, 44, cfg.title, { sz: 26, w: 700 });
  TX(40, 70, cfg.sub, { sz: 13, c: MUT });
  RC(40, 84, 240, 4, O);

  const LX = 150, RX = 1090, TY = cfg.ty || 210, BY = cfg.by || 430;
  RC(LX, TY, RX - LX, BY - TY, '#2b2b2b', '#111', 2, 4);
  const nY = (TY + BY) / 2;
  push(`<path d="M ${LX + 2} ${nY - 26} A 26 26 0 0 0 ${LX + 2} ${nY + 26}" fill="#ffffff" stroke="#111" stroke-width="2"/>`);
  CI(LX + 34, BY - 26, 6, '#ffffff');
  TX((LX + RX) / 2, nY - 6, cfg.name, { a: 'middle', sz: 24, c: '#ffffff', w: 700 });
  TX((LX + RX) / 2, nY + 16, cfg.pkg, { a: 'middle', sz: 11.5, c: '#9a9a9a' });
  TX(LX + 26, nY + 44, '1 脚在这头', { sz: 11, c: '#8a8a8a' });

  const n = cfg.pins, span = RX - LX, step = span / n;
  const px = (i) => LX + step / 2 + i * step;

  cfg.up.forEach(([pos, elec, nm, to, col], i) => {
    const x = px(i);
    LN([[x, TY], [x, TY - 44]], '#777', 3);
    CI(x, TY - 44, 4, '#777');
    TX(x, TY + 22, elec, { a: 'middle', sz: 10, c: '#a8a8a8', m: 1 });
    TX(x, TY - 62, pos, { a: 'middle', sz: 16, c: K, w: 700 });
    TX(x, TY - 80, nm, { a: 'middle', sz: 11, c: MUT, m: 1 });
    push(`<rect x="${x - 56}" y="${TY - 132}" width="112" height="26" rx="4" fill="${col}1a" stroke="${col}" stroke-width="1.2"/>`);
    TX(x, TY - 114, to, { a: 'middle', sz: 11, c: col, w: 700 });
    LN([[x, TY - 106], [x, TY - 86]], col, 1.6);
  });

  cfg.dn.forEach(([pos, elec, nm, to, col], i) => {
    const x = px(i);
    LN([[x, BY], [x, BY + 44]], '#777', 3);
    CI(x, BY + 44, 4, '#777');
    TX(x, BY - 10, elec, { a: 'middle', sz: 10, c: '#a8a8a8', m: 1 });
    TX(x, BY + 70, pos, { a: 'middle', sz: 16, c: K, w: 700 });
    TX(x, BY + 88, nm, { a: 'middle', sz: 11, c: MUT, m: 1 });
    push(`<rect x="${x - 56}" y="${BY + 98}" width="112" height="26" rx="4" fill="${col}1a" stroke="${col}" stroke-width="1.2"/>`);
    TX(x, BY + 116, to, { a: 'middle', sz: 11, c: col, w: 700 });
    LN([[x, BY + 92], [x, BY + 98]], col, 1.6);
  });

  TX(40, TY - 120, '上排', { sz: 15, c: MUT, w: 700 });
  TX(40, TY - 100, '从左往右数', { sz: 11, c: MUT });
  TX(40, BY + 60, '下排', { sz: 15, c: MUT, w: 700 });
  TX(40, BY + 80, '从左往右数', { sz: 11, c: MUT });

  push('</svg>');
  fs.writeFileSync(cfg.out, s.join('\n'), 'utf8');
  console.log('written', cfg.out);
}

/* ══════ 74HC595 ══════ */
make({
  title: '74HC595 怎么数脚',
  sub: '缺口朝左，就这么看。上排从左往右 上1–上8，下排从左往右 下1–下8。灰字才是芯片说明书上的脚号，接线只看「上几」「下几」。',
  name: '74HC595', pkg: 'DIP-16', pins: 8, ty: 230, by: 430,
  out: 'E:/hardness/ricemix/demo/sch_595_pinout.svg',
  up: [
    ['上1', '16', 'VCC', 'Arduino 5V', R],
    ['上2', '15', 'QA', '数码管 a', P],
    ['上3', '14', 'SER', 'Arduino D11', B],
    ['上4', '13', 'OE', 'Arduino GND', K],
    ['上5', '12', 'RCLK', 'Arduino D13', B],
    ['上6', '11', 'SRCLK', 'Arduino D12', B],
    ['上7', '10', 'SRCLR', 'Arduino 5V', R],
    ['上8', '9', "QH'", '不接', MUT],
  ],
  dn: [
    ['下1', '1', 'QB', '数码管 b', P],
    ['下2', '2', 'QC', '数码管 c', P],
    ['下3', '3', 'QD', '数码管 d', P],
    ['下4', '4', 'QE', '数码管 e', P],
    ['下5', '5', 'QF', '数码管 f', P],
    ['下6', '6', 'QG', '数码管 g', P],
    ['下7', '7', 'QH', '数码管 dp', P],
    ['下8', '8', 'GND', 'Arduino GND', K],
  ],
});

/* ══════ 5461AS-1 ══════ */
make({
  title: '5461AS-1 怎么数脚',
  sub: '丝印面朝你，就这么看。上排从左往右 上1–上6，下排从左往右 下1–下6。灰字是段名，接线只看「上几」「下几」。',
  name: '5461AS-1', pkg: '四位共阴 · 12 脚', pins: 6, ty: 240, by: 430,
  out: 'E:/hardness/ricemix/demo/sch_digit_pinout.svg',
  up: [
    ['上1', 'a', 'a', '595 上2', P],
    ['上2', 'b', 'b', '595 下1', P],
    ['上3', 'c', 'c', '595 下2', P],
    ['上4', 'd', 'd', '595 下3', P],
    ['上5', 'e', 'e', '595 下4', P],
    ['上6', 'f', 'f', '595 下5', P],
  ],
  dn: [
    ['下1', 'g', 'g', '595 下6', P],
    ['下2', 'dp', 'dp', '595 下7', P],
    ['下3', 'DIG1', '位选1', 'Arduino A2', O],
    ['下4', 'DIG2', '位选2', 'Arduino A3', O],
    ['下5', 'DIG3', '位选3', 'Arduino A4', O],
    ['下6', 'DIG4', '位选4', 'Arduino A5', O],
  ],
});
