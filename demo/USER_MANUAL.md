# Rice Mixer — How to Use It

Put the bowl on, press S1, pour rice, press S2. It adds the water and stops.

That is the whole machine. Everything after step 6 is for the day you build it,
not for the day you use it.

---

## The three buttons

| | |
|---|---|
| **S1** | **Tare.** Bowl on the scale, press this, display goes to `0.0`. |
| **S2** | **Start.** After the rice is in. Pump runs, display counts water, stops by itself. |
| **S3** | **Stop.** Slams the pump shut. Works any time, including mid-fill. |

S4 to S16 are wired but ignored.

---

## Making a batch

**1.** Empty bowl on the scale.

**2.** Press **S1**. Display flashes `----`, then `0.0`.

> The bowl is now weightless. From here the scale only sees what you add.

**3.** Pour in the rice. The display tracks it live.

> Want 100 g? Pour to `100.0`. Go slow at the end — it settles over about a
> second, so a fast pour overshoots.

**4.** Press **S2**.

> The pump starts, and the display switches from rice to **water**. It climbs
> to about 115 and stops. The last few grams arrive after the pump goes quiet —
> that is the water still sitting in the tube.

**5.** Wait for it to stop on its own. About 10 seconds for 120 g.

**6.** Lift the bowl off. Next batch: bowl back on, S1, pour, S2.

> **If anything looks wrong, press S3.** Water on the counter, bowl about to
> overflow, pump making a bad noise — S3 cuts power to the pump instantly.
> Pressing it when nothing is happening does no harm, so do not hesitate.

---

## What the display means

| Display | Meaning |
|---|---|
| `  0.0` | Idle, nothing on the scale |
| `100.0` | Idle, 100 g of rice on the scale |
| ` 30.0` | Filling — 30 g of water added so far |
| `120.4` | Filling, about to stop |
| `----` | Just tared, or waiting for the scale to settle |
| `Err.1` | Timeout — pump ran 30 s and never reached target |
| `Err.2` | Overload — something much heavier than expected |

`Err` stays on screen until you press S1.

---

## When something goes wrong

| What you see | What to do |
|---|---|
| Press S2, nothing happens | Under 20 g of rice on the scale. Add rice, press S2 again. |
| Display reads `0.0` and never moves when you pour | Scale is not talking. Check the four wires between HX711 and Arduino. |
| Weight drifts while the bowl just sits there | Bowl is touching the table or the frame. Move it to the middle of the platform. |
| Pump runs, no water | Intake is out of the water or the pump is dry. Lift the intake, suck once, put it back. |
| Water keeps flowing after the pump stops | Normal. That is the tube emptying. It stops within a second. |
| Overshoots by more than 10 g every time | Pump is stronger than expected. In `demo.ino` raise `LEAD_G` from 5.0 to 8.0, re-upload. |
| Always stops 10 g short | Opposite problem. Lower `LEAD_G` to 3.0. |
| `Err.1` every single time | Pump is not moving water at all. Check intake, check the tube is not kinked. |

---

## First-time setup

Once. You will not need this again.

### Wire it up

Six groups, in this order, testing after each.

**Scale → Arduino**

| HX711 | Arduino |
|---|---|
| VCC | 5V |
| GND | GND |
| DT | A1 |
| SCK | A0 |

Load cell's four wires go to the HX711's other side — E+, E−, A−, A+, colour
to matching name. Bolt the two-hole end to the table; the free end holds the bowl.

**Relay → Arduino**

| Relay | Arduino |
|---|---|
| VCC | 5V |
| GND | GND |
| IN | D8 |

**Pump loop**

| From | To |
|---|---|
| 12 V + | Relay COM |
| Relay NO | Pump red |
| Pump black | 12 V − |
| **12 V −** | **Arduino GND** |

That last wire is the one people skip. Two power supplies, one shared ground.
Without it the relay behaves randomly — indicator flickers, pump runs when it
should not.

Pump wires are bare copper. Fold the wire over once and push it into the female
end of a jumper; plug the male end into the breadboard. Tape the cable to the
pump body so nothing pulls on the joint.

**Display — 74HC595 to 5461AS-1**

Lay the 595 flat, notch on the left. Bottom row counts 1–8 left to right, top
row counts 16–9 left to right.

| Position | Pin | Connects to |
|---|---|---|
| top 1 | 16 | 5V |
| top 2 | 15 | display `a`, through 220 Ω |
| top 3 | 14 | Arduino D11 |
| top 4 | 13 | **GND** — leave it floating and nothing lights up |
| top 5 | 12 | Arduino D13 |
| top 6 | 11 | Arduino D12 |
| top 7 | 10 | **5V** — held low and it clears forever |
| top 8 | 9 | not connected |
| bottom 1 | 1 | display `b`, 220 Ω |
| bottom 2 | 2 | display `c`, 220 Ω |
| bottom 3 | 3 | display `d`, 220 Ω |
| bottom 4 | 4 | display `e`, 220 Ω |
| bottom 5 | 5 | display `f`, 220 Ω |
| bottom 6 | 6 | display `g`, 220 Ω |
| bottom 7 | 7 | display `dp`, 220 Ω |
| bottom 8 | 8 | GND |

Display, silkscreen facing you. Top row 6 pins left to right, bottom row 6 pins
left to right.

| Position | Segment | Connects to |
|---|---|---|
| top 1–6 | a b c d e f | 595 top 2, bottom 1, bottom 2, bottom 3, bottom 4, bottom 5 |
| bottom 1 | g | 595 bottom 6 |
| bottom 2 | dp | 595 bottom 7 |
| bottom 3–6 | DIG1–DIG4 | Arduino A2 A3 A4 A5 |

Segments get 220 Ω. Digit-select pins get none.

**Keypad**

R1–R4 → D2 D3 D4 D5. C1–C4 → D6 D7 D9 D10. Straight into the Arduino headers;
the keypad sits on the desk.

**Protection**

| Part | Fits | Direction |
|---|---|---|
| 1N4007 | across the pump | **white ring to pump +** |
| 1000 µF | across 12 V and GND | long leg +, white stripe − |

Skip these and it works fine for a day, then the relay contacts pit.

### Check it before wiring the display

1. **Relay.** USB only, pump unplugged. Press S2 — you should hear a click.
   Press S3 — another click.
2. **Scale.** Press the platform with a finger. Number moves, comes back to zero.
3. **Pump.** Touch the pump red wire to 12 V + for two seconds. Water flows.

Three checks, three different failure modes. Which one fails tells you where
to look.

### Upload

Arduino IDE, board **Uno**, install the **HX711** library by Bogdan Necula, open
`demo.ino`, upload. Serial monitor at 9600 if you want to watch numbers scroll.

### Calibrate once

The scale ships with a rough factor. One calibration makes it exact.

**1.** Empty bowl on the scale, press **S1**.

**2.** Put on something you know — a 500 g bag of rice.

**3.** Open the serial monitor. It prints the raw count.

**4.** New factor = `current factor × 500 ÷ raw count`. Round it.

**5.** In `demo.ino`, find `scale.set_scale(420.0)`, drop your number in, re-upload.

Check: 500 g bag back on, display should read 500 within 1 g.

---

## Four things worth knowing

- **Ratio is 1:1.20**, a constant in the code, not a button. Edit
  `const float RATIO = 1.20;` and re-upload.
- **It stops 5 g early on purpose.** The tube water tops it up. That number is
  `LEAD_G`.
- **30 seconds is the hard limit.** No target by then and it shuts off with `Err.1`.
- **Do the first batch with 50 g.** Watch it. If the overshoot is bad you want
  to find that out with 50 g on the counter, not 300.
