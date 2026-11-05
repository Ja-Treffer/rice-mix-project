/* 生成两份独立的代码文件：
   1) demo_source_listing.txt —— 带行号的可读版，直接贴进 PDF 报告
   2) demo_code.ino            —— 可运行版，Arduino IDE 打开就能编译烧录
*/
const fs = require('fs');
const path = require('path');

const SRC = 'E:/hardness/ricemix/demo/demo.ino';
const OUT = 'E:/hardness/ricemix/present/appendix/2_source_code';

const raw = fs.readFileSync(SRC, 'utf8');
const lines = raw.split('\n');
const total = lines.length;

/* ---------- 1. 可运行版：原样一份，只换文件名 ---------- */
fs.writeFileSync(path.join(OUT, 'demo_code.ino'), raw, 'utf8');

/* ---------- 2. 带行号的阅读版 ---------- */
const W = String(total).length + 2;
const body = lines.map((ln, i) => {
  const n = String(i + 1).padStart(W - 1, ' ');
  return n + ' | ' + ln;
}).join('\n');

const header = [
  '='.repeat(76),
  '  Rice-Water Ratio Dispenser  ·  Arduino Uno',
  '  Source listing — ' + total + ' lines',
  '='.repeat(76),
  '',
  '  Board      Arduino Uno R3 (ATmega328P, 16 MHz)',
  '  Library    HX711 (only external library)',
  '  Pins       HX711  DT=A1  SCK=A0',
  '             Pump   D8   (relay, active HIGH)',
  '             74HC595 DS=D11 SHCP=D12 STCP=D13',
  '             Display digit select  A2 A3 A4 A5',
  '             Keypad rows D2-D5, cols D6 D7 D9 D10',
  '',
  '  What it does',
  '    1. Reads the scale at 10 Hz through HX711, software tare.',
  '    2. Waits for rice weight, multiplies by the ratio to get a target.',
  '    3. Runs the pump, checks weight every 200 ms, stops EARLY by LEAD_G',
  '       grams to compensate for the water still in the tube.',
  '    4. Four guards fire on the way: timeout, overload, dry-run, on-target.',
  '    5. Drives a 4-digit common-cathode display through a 74HC595.',
  '',
  '  This file is a listing, not the build file.',
  '  To compile: open demo_code.ino in the Arduino IDE and press Upload.',
  '='.repeat(76),
  '',
  '',
].join('\n');

const footer = [
  '',
  '',
  '='.repeat(76),
  '  End of listing  ·  ' + total + ' lines',
  '='.repeat(76),
  '',
].join('\n');

fs.writeFileSync(path.join(OUT, 'demo_source_listing.txt'), header + body + footer, 'utf8');

/* ---------- 3. 说明两份的区别 ---------- */
const readme = `# Source code — two files, two purposes

| File | Use it for |
|---|---|
| \`demo_source_listing.txt\` | Reading and printing. Line numbers on the left, header block explaining the pins and what the program does. Paste this into the PDF report. |
| \`demo_code.ino\` | Building. Open in the Arduino IDE, select **Arduino Uno**, install the **HX711** library, press Upload. |

Both contain exactly the same ${total} lines of C++ — the only difference is the line numbers and the header/footer blocks around them.

## Library to install

Arduino IDE → Tools → Manage Libraries → search **HX711** → install the one by Bogdan Necula.

If the scale reads zero or jumps around, the wiring is wrong, not the code. Check DT is on **A1** and SCK is on **A0** — they are easy to swap, and swapping them gives a perfectly silent, perfectly broken scale.

## What the constants do

Change these at the top of the file, nothing else needs touching:

| Constant | Default | Meaning |
|---|---|---|
| \`RATIO\` | 1.20 | water ÷ rice by weight. Northeast rice 1.2, Thai rice 1.1, congee 6–9 |
| \`LEAD_G\` | 5.0 | grams to stop early. Covers the water already in the tube |
| \`TIMEOUT_MS\` | 30000 | hard stop. Guards against a stuck pump |
| \`MAX_TOTAL\` | 3000 | hard stop on total weight. Guards against a stuck scale |
| \`CAL_FACTOR\` | 420.0 | counts per gram. Must be calibrated on the real load cell |

## The four guards in plain language

\`\`\`
timeout    — 30 s elapsed, stop. The pump might be jammed.
overload   — total weight above 3000 g, stop. Something is wrong.
dry-run    — 3 s elapsed and weight has not moved, stop. Pump out of water or tube blocked.
on-target  — added weight reached target minus 5 g, stop. This is the normal exit.
\`\`\`

The third one is the one people forget. Timeout and overload both need the weight to move to notice a problem — if the pump is dead, nothing moves, and only the dry-run check catches it.

## Product build

\`ricemix_firmware_full.ino\` in the same folder is the 716-line version: 8 recipe presets, EEPROM persistence, serial command interface, top-up logic. The 279-line classroom build above is a strict subset — same control idea, fewer features.
`;

fs.writeFileSync(path.join(OUT, 'README.md'), readme, 'utf8');

console.log('listing lines:', total);
console.log('wrote: demo_code.ino, demo_source_listing.txt, README.md');
