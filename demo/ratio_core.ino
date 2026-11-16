/*
 * ============================================================================
 *  Rice–Water Ratio · Core Algorithm (standalone minimal build)
 * ============================================================================
 *
 *  This is not the full project. It is the "how much water, when to stop" part
 *  of demo.ino pulled out into one file. No keypad, no 7-segment display, no
 *  protection diodes. Just a scale and a pump.
 *
 *  You can flash this onto an UNO with only an HX711 and a relay connected,
 *  and check whether the algorithm behaves.
 *
 * ----------------------------------------------------------------------------
 *  THE ONE THING PEOPLE GET WRONG
 *  Only "tare" moves the zero point. "Start" does not.
 * ----------------------------------------------------------------------------
 *
 *  Press TARE  -> scale reads 0. This tells the scale "the empty bowl is 0".
 *  Press START -> no tare. The current reading is stored in riceW, which is
 *                 simply how heavy the rice is.
 *
 *  From then on, every sample does this:
 *
 *      added = totalWeightOnScale - riceW        <- water is subtracted, not weighed
 *
 *  The rice never leaves the scale, so the scale never reports water alone.
 *  Subtract the rice and what is left is the water.
 *
 * ----------------------------------------------------------------------------
 *  WALKTHROUGH: 100 g of rice at 1:1.2
 * ----------------------------------------------------------------------------
 *
 *   Action              Scale    riceW    target    added    Decision
 *   -----------------   -----    -----    ------    -----    ------------------
 *   Empty bowl, tare        0        0         0        -     (waiting)
 *   Pour in 100 g rice    100        0         0        -     (waiting)
 *   Press START           100    ->100     ->120        -     record, pump on
 *   +30 g water           130      100       120       30     30 < 115, keep going
 *   +60 g water           160      100       120       60     60 < 115, keep going
 *   +114 g water          214      100       120      114    114 < 115, keep going
 *   +115 g water          215      100       120      115   115 >= 115, pump off
 *   Runoff adds ~5 g      220      100       120      120     done
 *
 *  Final reading is 220 g = 100 g rice + 120 g water. The scale reports
 *  "rice + water" the whole time. The program only ever looks at `added`.
 *
 * ----------------------------------------------------------------------------
 *  WHY YOU MUST NOT TARE WHEN START IS PRESSED
 *  (this mistake gives you one-fifth of the water you asked for)
 * ----------------------------------------------------------------------------
 *
 *  Suppose START tared the scale. Then:
 *    - 100 g of rice is still sitting on it, but the software zero has been
 *      moved to the 100 g mark.
 *    - `added` starts at 0.
 *    - Add 20 g of water. Scale now reads 120.
 *    - Program sees 120 >= target(120) and stops.
 *    - You actually added 20 g of water. That is 0.2x, not 1.2x.
 *
 *  This is the classic "looks fine, off by six times" bug. The zero point
 *  belongs to the empty bowl. The rice lives in riceW. The water is derived
 *  by subtraction. Never mix the three.
 *
 * ----------------------------------------------------------------------------
 *  WHAT LEAD_G IS FOR
 * ----------------------------------------------------------------------------
 *
 *  When the relay opens, the pump does not stop instantly: water already in
 *  the tube keeps flowing for another 0.2-0.5 s. Waiting until `added` hits
 *  120 guarantees an overshoot. So cut power 5 g early and let the runoff
 *  close the gap.
 *
 *  5 g is a conservative value (12 g/s x ~0.4 s = 4.8 g). A faster pump needs
 *  a bigger number, a weaker one a smaller number. Tuning steps at the end.
 *
 *  Build: Arduino IDE + Bogdan Necula's HX711 library, board = UNO.
 * ============================================================================
 */

#include <HX711.h>

/* ── Pins ─────────────────────────────────────────────────────────────── */
const uint8_t PIN_DT   = A1;   // HX711 DT  -> A1
const uint8_t PIN_SCK  = A0;   // HX711 SCK -> A0  (swapped = reads 0 forever, but no damage)
const uint8_t PIN_PUMP = 8;    // Relay IN  -> D8

/* ── Parameters ───────────────────────────────────────────────────────── */
const float    RATIO      = 1.20;    // water per unit rice: 1 g rice -> 1.2 g water
const float    LEAD_G     = 5.0;     // cut power this many grams early (runoff)
const uint32_t SAMPLE_MS  = 200;     // weigh every 200 ms
const uint32_t TIMEOUT_MS = 30000;   // hard stop after 30 s (overflow guard)

/* ── State ────────────────────────────────────────────────────────────── */
HX711    scale;
float    tareOff = 0;      // tare offset (empty bowl weight)
float    riceW   = 0;      // how much rice went in this batch
float    target  = 0;      // how much water this batch needs
bool     running = false;  // is the pump on
uint32_t t0      = 0;      // batch start time

/* ── Read the scale ───────────────────────────────────────────────────── */
/* get_units(2) averages two samples to shave off some noise. */
float readG() {
  return scale.get_units(2) - tareOff;
}

/* ── Pump ─────────────────────────────────────────────────────────────── */
void pump(bool on) {
  digitalWrite(PIN_PUMP, on ? HIGH : LOW);
}

/* ── Tare: the only place the zero point moves ────────────────────────── */
void doTare() {
  if (running) return;          // no taring mid-fill, it corrupts the baseline
  scale.tare(10);               // hardware tare, 10-sample average
  tareOff = 0;                  // software offset reset, never both at once
}

/* ── Start: record the rice, do NOT tare ──────────────────────────────── */
void startCycle() {
  if (running) return;

  float w = readG();            // at this point the scale holds rice only
  if (w < 20.0) {               // under 20 g counts as "no rice"
    return;
  }

  riceW  = w;                   // * remember the rice weight
  target = riceW * RATIO;       // * target water = rice x ratio
  t0     = millis();
  running = true;
  pump(true);
}

/* ── Stop ─────────────────────────────────────────────────────────────── */
void stopCycle() {
  pump(false);
  running = false;
}

/* ── setup ────────────────────────────────────────────────────────────── */
void setup() {
  Serial.begin(9600);
  pinMode(PIN_PUMP, OUTPUT);
  digitalWrite(PIN_PUMP, LOW);

  scale.begin(PIN_DT, PIN_SCK);
  scale.set_scale(420.0);       // placeholder until calibrated, see the end

  Serial.println(F("Tare with an empty bowl first."));
  Serial.println(F("Then add rice and send 's' to start."));
}

/* ── loop: the whole algorithm is right here ──────────────────────────── */
void loop() {
  /* Serial console: t = tare, s = start, x = stop */
  if (Serial.available()) {
    char c = Serial.read();
    if (c == 't') { doTare();    Serial.println(F("tared")); }
    if (c == 's') { startCycle(); }
    if (c == 'x') { stopCycle(); Serial.println(F("stopped")); }
  }

  if (!running) return;

  /* 1) Timeout guard: pump running dry or a blocked line shows up here. */
  if (millis() - t0 > TIMEOUT_MS) {
    stopCycle();
    Serial.println(F("timeout, forced stop"));
    return;
  }

  /* 2) Weigh once, work out how much water went in. */
  float w     = readG();
  float added = w - riceW;      // * water = total - rice

  /* 3) Target check: stop LEAD_G early, runoff covers the rest. */
  if (added >= target - LEAD_G) {
    stopCycle();
    Serial.print(F("done, scale "));
    Serial.print(w, 1);
    Serial.print(F(" g, water "));
    Serial.print(added, 1);
    Serial.println(F(" g"));
    return;
  }

  delay(SAMPLE_MS);
}

/*
 * ============================================================================
 *  KEYPAD MAP  (4x4 membrane keypad, S1-S16, counted row by row)
 * ============================================================================
 *
 *  Physical layout, silkscreen facing you:
 *
 *      S1    S2    S3    S4        <- row 1, wire = R1
 *      S5    S6    S7    S8        <- row 2, wire = R2
 *      S9    S10   S11   S12       <- row 3, wire = R3
 *      S13   S14   S15   S16       <- row 4, wire = R4
 *       |     |     |     |
 *      C1    C2    C3    C4
 *
 *  Key index k = (row - 1) * 4 + (col - 1), so S1 = 0 and S16 = 15.
 *
 * ----------------------------------------------------------------------------
 *  THE DEMO BUILD USES 3 OF THE 16 KEYS
 * ----------------------------------------------------------------------------
 *
 *      S9    start a batch      (same as serial 's')
 *      S10   stop the pump      (same as serial 'x')
 *      S11   tare the scale     (same as serial 't')
 *
 *  That is the whole interface. S1-S8 and S12-S16 are wired but do nothing.
 *  The ratio is a single constant in the code (RATIO = 1.20), not a key.
 *  Changing it means editing one line and re-flashing, which for a classroom
 *  build is fine: you set it once and leave it.
 *
 *  Earlier revisions used six keys for six ratios plus six for functions.
 *  That was too many buttons for a demo, and every extra key is another thing
 *  to explain during a presentation.
 *
 * ----------------------------------------------------------------------------
 *  Wiring for the keypad: R1-R4 -> D2 D3 D4 D5, C1-C4 -> D6 D7 D9 D10.
 *
 *  If you press two keys at once nothing bad happens, the scan just returns
 *  whichever row it hit first. There are no shorts between rows because only
 *  one row is driven low at a time.
 * ============================================================================
 */

/*
 * ============================================================================
 *  TUNING NOTES
 * ============================================================================
 *
 *  Change the ratio
 *      Edit RATIO. Congee 1:9, thick porridge 1:6, soft rice 1:2, all on this
 *      one line.
 *      Remember to move TIMEOUT_MS with it: 1:9 means 100 g rice needs 900 g
 *      water, which is 75 s at 12 g/s. A 30 s timeout means congee never
 *      finishes.
 *
 *  Tune the lead
 *      Run one batch. Note the scale reading A at the moment the program says
 *      it stopped. Wait for the surface to settle, read B.
 *        B > target  -> runoff overshot, increase LEAD_G (1 g is about 0.08 s)
 *        B < target  -> stopped too early, decrease LEAD_G
 *      Average three runs. Do not eyeball it.
 *
 *  Calibrate calFactor
 *      1. Empty scale, send 't' to tare
 *      2. Put on something with a known weight (a 500 g bag of rice works)
 *      3. Read the raw count the sketch prints
 *      4. new calFactor = old calFactor * 500 / raw
 *      5. Put that number into scale.set_scale(...) and re-flash
 *
 *  Three traps everyone hits
 *      1. DT and SCK swapped: nothing burns, but the reading stays at 0 and it
 *         looks like a dead scale.
 *      2. Forgot common ground: the 12 V supply negative must connect to the
 *         Arduino GND. Otherwise the relay LED flickers and the pump either
 *         never runs or never stops.
 *      3. Taring after pressing START "to be safe": that alone makes you add
 *         one-fifth of the water. See the walkthrough at the top.
 * ============================================================================
 */
