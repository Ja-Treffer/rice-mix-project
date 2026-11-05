# Source code — two files, two purposes

| File | Use it for |
|---|---|
| `demo_source_listing.txt` | Reading and printing. Line numbers on the left, header block explaining the pins and what the program does. Paste this into the PDF report. |
| `demo_code.ino` | Building. Open in the Arduino IDE, select **Arduino Uno**, install the **HX711** library, press Upload. |

Both contain exactly the same 285 lines of C++ — the only difference is the line numbers and the header/footer blocks around them.

## Library to install

Arduino IDE → Tools → Manage Libraries → search **HX711** → install the one by Bogdan Necula.

If the scale reads zero or jumps around, the wiring is wrong, not the code. Check DT is on **A1** and SCK is on **A0** — they are easy to swap, and swapping them gives a perfectly silent, perfectly broken scale.

## What the constants do

Change these at the top of the file, nothing else needs touching:

| Constant | Default | Meaning |
|---|---|---|
| `RATIO` | 1.20 | water ÷ rice by weight. Northeast rice 1.2, Thai rice 1.1, congee 6–9 |
| `LEAD_G` | 5.0 | grams to stop early. Covers the water already in the tube |
| `TIMEOUT_MS` | 30000 | hard stop. Guards against a stuck pump |
| `MAX_TOTAL` | 3000 | hard stop on total weight. Guards against a stuck scale |
| `CAL_FACTOR` | 420.0 | counts per gram. Must be calibrated on the real load cell |

## The four guards in plain language

```
timeout    — 30 s elapsed, stop. The pump might be jammed.
overload   — total weight above 3000 g, stop. Something is wrong.
dry-run    — 3 s elapsed and weight has not moved, stop. Pump out of water or tube blocked.
on-target  — added weight reached target minus 5 g, stop. This is the normal exit.
```

The third one is the one people forget. Timeout and overload both need the weight to move to notice a problem — if the pump is dead, nothing moves, and only the dry-run check catches it.

## Product build

`ricemix_firmware_full.ino` in the same folder is the 716-line version: 8 recipe presets, EEPROM persistence, serial command interface, top-up logic. The 279-line classroom build above is a strict subset — same control idea, fewer features.
