/* ============================================================================
 *  RiceMix ESP32 — closed-loop rice : water mixer
 *  ---------------------------------------------------------------------------
 *  Hardware      : ESP32 DevKit v1 (30-pin) + XW112 weighing module (UART)
 *  Replaces      : Arduino Uno + HX711 + 5461AS-1 + 74HC595 build
 *  Removed       : buzzer, DHT11, LDR, soil probe
 *  Kept          : water level sensor (dry-run guard)
 *  Adds          : WiFi (MQTT + local web page), 4x4 keypad as offline fallback
 *
 *  Control law (identical to the Uno build, the physics did not change):
 *      target = riceWeight * RATIO
 *      added  = now - riceWeight           (subtracted, never re-tared)
 *      stop   when added >= target - LEAD_G
 *
 *  Four guards, any one of them latches FAULT:
 *      timeout      pump ran too long
 *      overload     total weight beyond MAX_TOTAL
 *      dry run      water level too low, or weight stopped rising
 *      overshoot    added already past target + TOL
 * ==========================================================================*/

#include <WiFi.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include <WebServer.h>
#include <Preferences.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

/* ===========================================================================
 *  1. USER CONFIGURATION — everything you are likely to change lives here
 * ========================================================================*/

/* ---- WiFi ----------------------------------------------------------------
 * Two entry types. If STA fails for STA_TIMEOUT_MS the board falls back to its
 * own AP, so the machine keeps working on a campus network that wants SSO.
 *
 * Campus WiFi (eduroam, university-SSO, 802.1X) cannot be joined with a plain
 * SSID + password. Leave STA_SSID empty on campus and use the AP fallback, or
 * tether from a phone hotspot.
 */
const char* STA_SSID     = "YourPhoneHotspot";   // 2.4 GHz only, ESP32 has no 5 GHz radio
const char* STA_PASSWORD = "hotspotpassword";

const char* AP_SSID      = "RiceMix";            // appears when STA fails
const char* AP_PASSWORD  = "12345678";           // >= 8 chars, or "" for open AP
const uint32_t STA_TIMEOUT_MS = 15000;

/* ---- MQTT (Bemfa / 巴法云 — same platform the original sketch used) ------
 * Client id is the private key, topics are plain names under that key.
 * Set MQTT_ENABLE to 0 to run fully offline.
 */
#define MQTT_ENABLE 1
const char* MQTT_HOST = "bemfa.com";
const uint16_t MQTT_PORT = 9501;
const char* MQTT_UID  = "207a31bb9be70df6839f3a3ca7e1ddc3";  // your private key
const char* MQTT_SUB_CMD  = "mixcmd";      // phone -> board
const char* MQTT_PUB_STATE = "mixdata";    // board -> phone (JSON)

/* ---- 4x4 keypad, optional ------------------------------------------------
 * Set KEYPAD_ENABLE to 0 if you have no keypad; the board then relies on the
 * web page and MQTT. Everything still works.
 */
#define KEYPAD_ENABLE 1

/* ---- Pins ---------------------------------------------------------------
 * Chosen to avoid every ESP32 strapping pin (0 2 12 15) except the LED, and to
 * avoid GPIO 6-11 which are wired to the internal flash.
 */
#define PIN_XW_RX      4     // XW112 TX -> ESP32 RX    (crossover!)
#define PIN_XW_TX     16     // XW112 RX <- ESP32 TX    (crossover!)
#define PIN_L298_IN1  18     // L298N IN1 — forward (normal filling)
#define PIN_L298_IN2  19     // L298N IN2 — reverse (line flush only)
#define PIN_L298_ENA  23     // L298N ENA — PWM speed; -1 if the jumper is left on
#define PIN_WATER     34     // water level, analog in only
#define PIN_STATUS    2      // on-board LED

#define PIN_I2C_SDA   21
#define PIN_I2C_SCL   22
#define LCD_I2C_ADDR  0x27

#if KEYPAD_ENABLE
const uint8_t KP_ROWS[4] = {32, 33, 26, 27};
const uint8_t KP_COLS[4] = {13, 14, 5, 17};  // 18/19 = L298N, 4 = HX711 DT
#endif

/* ---- Scale — from the vendor manual (112.pdf) -------------------------
 *
 *   chip      STC8H1K28 + a separate ADC, firmware U-1.3, brand 欣薇
 *   baud      9600, 8 data bits, 1 stop bit, no parity
 *   frame     "<digits>\r\n"   e.g. "0123\r\n" means 123 grams
 *   rate      menu "ts": 0 = send on change (max 3/s), else every ts seconds
 *             factory default ts = 0.5 s
 *
 *   The board only transmits while it sits on the weighing screen — not in
 *   the menu, not during calibration. So if the stream goes silent, look at
 *   the four-digit display before blaming our wiring.
 *
 *   The 4-pin header is VCC / TX / RX / G and must be crossed over:
 *     board TX  -> ESP32 GPIO4   (our RX)
 *     board RX  -> ESP32 GPIO16  (our TX, unused for now)
 *     board GND -> ESP32 GND
 *     board VCC -> 3V3
 */
#define XW_BAUD       9600

/* The manual says the serial number is already grams. If your unit sends
 * kilograms instead (dot menu set to 0), set this to 1000.0f. */
float XW_SCALE = 1.0f;

/* ---- Recipe -------------------------------------------------------------
 * RATIO is water : rice by weight. 1.20 is a firm rice, 1.6 a soft one.
 */
float RATIO     = 1.20f;
float LEAD_G    = 5.0f;        // stop this many grams early, tube water makes it up
float MIN_RICE  = 20.0f;       // below this the start key is ignored
float MAX_TOTAL = 3000.0f;     // overload guard
float TOL_G     = 2.0f;        // final accuracy claim
uint32_t TIMEOUT_MS = 30000;   // hard limit on one fill

/* ---- Water level --------------------------------------------------------
 * Analog reading, roughly linear. Calibrate once: dry = 0 mm, full = 100 mm.
 */
const int WL_DRY    = 200;     // below this = no water, pump must not run
const int WL_FULL   = 3000;

const uint16_t SAMPLE_MS = 200;   // control loop period

/* ===========================================================================
 *  2. GLOBALS
 * ========================================================================*/

LiquidCrystal_I2C lcd(LCD_I2C_ADDR, 16, 2);
WiFiClient net;
PubSubClient mqtt(net);
WebServer web(80);
Preferences prefs;

enum State : uint8_t { S_IDLE, S_FILL, S_DONE, S_FAULT };
enum Page  : uint8_t { P_WEIGHT, P_RATIO, P_STATUS, P_NET, P_COUNT };

State  state = S_IDLE;
Page   page  = P_WEIGHT;

float  weightNow  = 0;      // grams, from XW112
float  riceWeight = 0;      // grams, captured when the cycle started
float  targetWater = 0;
float  flowEst    = 12.0f;  // g/s, learned during the fill

uint32_t tCycle = 0, tSample = 0, tLcd = 0, tPublish = 0, tWifi = 0;
bool   wifiUp = false;
bool   apMode = false;
char   faultMsg[24] = {0};
uint8_t lcdPageHold = 0;

/* UART line buffer */
char    xwBuf[16];
uint8_t xwLen = 0;
long    xwRaw = 0;        // last number as received, before scaling

/* ===========================================================================
 *  3. SCALE — XW112 over UART
 * ========================================================================*/

/* Vendor sends plain decimal digits terminated by CR/LF. Nothing to decode. */
void xwPoll() {
  while (Serial2.available()) {
    char c = (char)Serial2.read();
    if (c == '\r' || c == '\n') {
      if (xwLen) {
        xwBuf[xwLen] = 0;
        long v = atol(xwBuf);
        if (v >= 0) {
          xwRaw     = v;
          weightNow = v / XW_SCALE;
        }
        xwLen = 0;
      }
    } else if (c >= '0' && c <= '9') {
      if (xwLen < sizeof(xwBuf) - 1) xwBuf[xwLen++] = c;
    }
  }
}

void hxPoll() { xwPoll(); }        // keep the old call site working

/* The scale does its own tare with its own key. Ours only zeroes the bowl
 * so the water maths starts from 0. */
void xwTare() {
  weightNow  = 0;
  riceWeight = 0;
  Serial.println(F("[xw] software tare"));
}

/* ===========================================================================
 *  4. WATER LEVEL
 * ========================================================================*/

float waterLevelMM() {
  int raw = analogRead(PIN_WATER);
  if (raw <= WL_DRY) return 0;
  float mm = (raw - WL_DRY) * 100.0f / (float)(WL_FULL - WL_DRY);
  return mm < 0 ? 0 : mm;
}

bool waterOK() { return waterLevelMM() >= 5.0f; }

/* ===========================================================================
 *  5. PUMP + STATE MACHINE
 * ========================================================================*/

/* L298N drives the pump as a bridge, so we get three states instead of two.
 * Forward fills. Reverse flushes the line after a batch — something a plain
 * relay can never do, and the reason this module is worth keeping.        */
inline void pumpOn() {
  digitalWrite(PIN_L298_IN2, LOW);
  digitalWrite(PIN_L298_IN1, HIGH);
  digitalWrite(PIN_STATUS, HIGH);
}
inline void pumpOff() {
  digitalWrite(PIN_L298_IN1, LOW);
  digitalWrite(PIN_L298_IN2, LOW);
  digitalWrite(PIN_STATUS, LOW);
}
inline void pumpReverse() {
  digitalWrite(PIN_L298_IN1, LOW);
  digitalWrite(PIN_L298_IN2, HIGH);
  digitalWrite(PIN_STATUS, HIGH);
}

void latchFault(const char* why) {
  pumpOff();
  state = S_FAULT;
  strncpy(faultMsg, why, sizeof(faultMsg) - 1);
  faultMsg[sizeof(faultMsg) - 1] = 0;
  Serial.printf("[fault] %s\n", faultMsg);
}

bool startCycle() {
  if (state == S_FILL) return false;

  /* drop anything the operator left on the platform before blaming the rice */
  weightNow = constrain(weightNow, 0, 20000);
  if (weightNow < MIN_RICE) {
    Serial.printf("[skip] only %.1f g, need %.0f\n", weightNow, MIN_RICE);
    return false;
  }
  if (!waterOK()) { latchFault("no water"); return false; }

  riceWeight  = weightNow;
  targetWater = riceWeight * RATIO;

  if (riceWeight + targetWater > MAX_TOTAL) { latchFault("overload"); return false; }

  state   = S_FILL;
  tCycle  = millis();
  flowEst = 12.0f;
  faultMsg[0] = 0;
  pumpOn();
  Serial.printf("[start] rice %.1f g, target water %.1f g\n", riceWeight, targetWater);
  return true;
}

/* Reverse the pump for FLUSH_MS to push the tube water back into the tank.
 * Only meaningful with a bridge driver; a relay build simply skips it. */
uint32_t tFlush = 0;
bool     flushing = false;

void flushStart() {
  if (state == S_FILL) return;
  flushing = true;
  tFlush = millis();
  pumpReverse();
  Serial.println(F("[flush] line reverse"));
}

void flushPoll() {
  if (!flushing) return;
  if (millis() - tFlush >= 3000) {
    pumpOff();
    flushing = false;
    Serial.println(F("[flush] done"));
  }
}

void stopCycle(const char* why) {
  pumpOff();
  if (state == S_FILL) {
    state = S_DONE;
    Serial.printf("[stop] %s, added %.1f / %.1f\n", why, weightNow - riceWeight, targetWater);
  }
}

void runCycle() {
  if (state != S_FILL) return;

  float added  = weightNow - riceWeight;      // subtracted, never re-tared
  uint32_t dt  = millis() - tCycle;

  /* learn the real flow so the early-stop is not a guess */
  if (added > 0.5f && dt > 500) flowEst = added * 1000.0f / dt;

  /* guard 1 — timeout */
  if (dt > TIMEOUT_MS) { latchFault("timeout"); return; }

  /* guard 2 — overload */
  if (weightNow > MAX_TOTAL) { latchFault("overload"); return; }

  /* guard 3 — dry run: water gone, or weight stopped rising */
  if (!waterOK()) { latchFault("no water"); return; }
  if (dt > 3000 && added < 0.5f) { latchFault("no flow"); return; }

  /* guard 4 — overshoot */
  if (added > targetWater + TOL_G * 3) { latchFault("overshoot"); return; }

  /* normal stop: stop early by the amount that will still arrive in the tube */
  float lead = flowEst * (LEAD_G / 12.0f);
  if (lead < 2.0f) lead = 2.0f;
  if (added >= targetWater - lead) { stopCycle("target"); }
}

/* ===========================================================================
 *  6. DISPLAY
 *  ---------------------------------------------------------------------------
 *  XW112 has its own digit display and shows the weight itself. Putting grams
 *  on this LCD again would waste the only 32 characters we have. So the LCD
 *  answers the questions the scale cannot:
 *
 *      page 0  how far along is this batch
 *      page 1  is the machine healthy (state, tank level, guards)
 *      page 2  is it on the network, where is it
 *      page 3  what happened last time
 * ========================================================================*/

void lcdLine(uint8_t row, const char* txt) {
  char buf[17];
  snprintf(buf, sizeof(buf), "%-16s", txt);
  lcd.setCursor(0, row);
  lcd.print(buf);
}

/* last completed batch, kept for page 3 */
float lastRice = 0, lastWater = 0;
uint32_t lastMs = 0;
uint16_t batchNo = 0;

/* a 10-cell bar: '#' filled, '.' empty */
void bar(char* out, float frac) {
  if (frac < 0) frac = 0;
  if (frac > 1) frac = 1;
  int n = (int)(frac * 10 + 0.5f);
  for (int i = 0; i < 10; i++) out[i] = (i < n) ? '#' : '.';
  out[10] = 0;
}

void updateLcd() {
  char l0[20], l1[20];

  switch (page) {

    /* ---- 0: progress ------------------------------------------------- */
    case P_PROGRESS: {
      float added = (state == S_FILL || state == S_DONE) ? weightNow - riceWeight : 0;
      float frac  = targetWater > 0 ? added / targetWater : 0;
      char  b[12]; bar(b, frac);
      if (state == S_FILL)      snprintf(l0, sizeof(l0), "%s %3d%%", b, (int)(frac * 100));
      else if (state == S_DONE) snprintf(l0, sizeof(l0), "DONE  %s", "##########");
      else if (state == S_FAULT)snprintf(l0, sizeof(l0), "FAULT %s", b);
      else                      snprintf(l0, sizeof(l0), "READY  put rice");
      if (state == S_IDLE)
        snprintf(l1, sizeof(l1), "S1 tare  S2 start");
      else
        snprintf(l1, sizeof(l1), "%5.1f /%5.1f g", added, targetWater);
      break;
    }

    /* ---- 1: health --------------------------------------------------- */
    case P_HEALTH: {
      const char* st = state == S_IDLE ? "IDLE" : state == S_FILL ? "FILL"
                     : state == S_DONE ? "DONE" : "FAULT";
      snprintf(l0, sizeof(l0), "%-5s tank%3.0fmm", st, waterLevelMM());
      if (state == S_FAULT)
        snprintf(l1, sizeof(l1), "!%s", faultMsg);
      else if (state == S_FILL)
        snprintf(l1, sizeof(l1), "flow%4.1f g/s pump*", flowEst);
      else
        snprintf(l1, sizeof(l1), "R1:%.2f lead%.1f", RATIO, LEAD_G);
      break;
    }

    /* ---- 2: network -------------------------------------------------- */
    case P_NET: {
      if (apMode) {
        snprintf(l0, sizeof(l0), "AP %s", AP_SSID);
        snprintf(l1, sizeof(l1), "http://192.168.4.1");
      } else if (wifiUp) {
        snprintf(l0, sizeof(l0), "%.16s", WiFi.SSID().c_str());
        snprintf(l1, sizeof(l1), "%s %ddB", WiFi.localIP().toString().c_str(), WiFi.RSSI());
      } else {
        snprintf(l0, sizeof(l0), "no wifi");
        snprintf(l1, sizeof(l1), "keypad only");
      }
#if MQTT_ENABLE
      if (mqtt.connected()) {
        size_t n = strlen(l0);
        if (n < 13) { l0[n] = ' '; l0[n + 1] = 'M'; l0[n + 2] = 0; }
      }
#endif
      break;
    }

    /* ---- 3: last batch ----------------------------------------------- */
    default: {
      if (batchNo == 0) {
        snprintf(l0, sizeof(l0), "no batch yet");
        snprintf(l1, sizeof(l1), "S2 to start");
      } else {
        snprintf(l0, sizeof(l0), "#%u rice%.0f g", batchNo, lastRice);
        snprintf(l1, sizeof(l1), "w%.0f g %lu.%lus", lastWater,
                 (unsigned long)(lastMs / 1000), (unsigned long)((lastMs % 1000) / 100));
      }
      break;
    }
  }
  lcdLine(0, l0);
  lcdLine(1, l1);
}

/* ===========================================================================
 *  7. KEYPAD
 * ========================================================================*/

#if KEYPAD_ENABLE
void keypadBegin() {
  for (uint8_t i = 0; i < 4; i++) pinMode(KP_ROWS[i], OUTPUT), digitalWrite(KP_ROWS[i], HIGH);
  for (uint8_t i = 0; i < 4; i++) pinMode(KP_COLS[i], INPUT_PULLUP);
}

/* returns 0..15, or 255 when nothing is pressed */
uint8_t keypadScan() {
  for (uint8_t r = 0; r < 4; r++) {
    digitalWrite(KP_ROWS[r], LOW);
    delayMicroseconds(50);
    for (uint8_t c = 0; c < 4; c++) {
      if (digitalRead(KP_COLS[c]) == LOW) {
        delay(12);                                   // debounce
        bool still = digitalRead(KP_COLS[c]) == LOW;
        digitalWrite(KP_ROWS[r], HIGH);
        if (still) { while (digitalRead(KP_COLS[c]) == LOW) delay(5); return r * 4 + c; }
        return 255;
      }
    }
    digitalWrite(KP_ROWS[r], HIGH);
  }
  return 255;
}

void handleKey(uint8_t k) {
  /* S1 tare, S2 start, S3 stop — the three that matter.
   * S4 cycles the display. Everything else is unused. */
  switch (k) {
    case 0: if (state != S_FILL) { xwTare(); } break;
    case 1: if (state != S_FILL) { startCycle(); } break;
    case 2:                                     // S3 is the panic button
      pumpOff();
      if (state == S_FILL) { state = S_FAULT; strcpy(faultMsg, "key stop"); }
      break;
    case 3: page = (Page)((page + 1) % P_COUNT); updateLcd(); break;
    default: break;
  }
}
#endif

/* ===========================================================================
 *  8. NETWORK — WiFi with AP fallback, MQTT, local web page
 * ========================================================================*/

const char PAGE_HTML[] PROGMEM = R"HTML(
<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>RiceMix</title>
<style>
body{font:16px/1.5 system-ui;margin:0;background:#0d1117;color:#e6edf3;padding:16px}
h1{font-size:20px;margin:0 0 14px}
.card{background:#161b22;border:1px solid #21262d;border-radius:10px;padding:14px;margin-bottom:12px}
.big{font-size:34px;font-weight:700;letter-spacing:-1px}
.k{color:#7d8590;font-size:13px}
.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #21262d}
.row:last-child{border:0}
button{font:600 15px system-ui;padding:12px;border-radius:8px;border:0;margin:4px 4px 0 0;color:#fff;cursor:pointer}
.b1{background:#238636}.b2{background:#8b949e}.b3{background:#da3633}
.act{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.act button{width:100%;margin:0}
input{width:100%;padding:10px;border-radius:8px;border:1px solid #30363d;background:#0d1117;color:#e6edf3;font-size:16px;box-sizing:border-box}
</style>
<h1>RiceMix</h1>
<div class=card><div class=k>Weight</div><div class=big id=w>--</div><div class=k id=s>--</div></div>
<div class=card>
<div class=row><span>Rice</span><b id=rice>--</b></div>
<div class=row><span>Target water</span><b id=tgt>--</b></div>
<div class=row><span>Added</span><b id=add>--</b></div>
<div class=row><span>Ratio</span><b id=rat>--</b></div>
<div class=row><span>Water tank</span><b id=wl>--</b></div>
</div>
<div class=act>
<button class=b1 onclick=c('tare')>Tare</button>
<button class=b2 onclick=c('stop')>Stop</button>
<button class=b1 onclick=c('start')>Start</button>
<button class=b2 onclick=c('flush')>Flush line</button>
<button class=b2 onclick=c('clear')>Clear fault</button>
</div>
<div class=card style="margin-top:12px">
<div class=k style="margin-bottom:6px">Ratio</div>
<input id=ri type=number step=0.05 min=1 max=3 value=1.2>
<button class=b1 style="width:100%;margin-top:8px" onclick=setR()>Set ratio</button>
</div>
<script>
async function p(){try{const r=await fetch('/api/state');const j=await r.json();
w.textContent=j.w.toFixed(1)+' g';s.textContent=j.state+(j.fault?' — '+j.fault:'');
rice.textContent=j.rice.toFixed(1)+' g';tgt.textContent=j.target.toFixed(1)+' g';
add.textContent=j.added.toFixed(1)+' g';rat.textContent='1 : '+j.ratio.toFixed(2);
wl.textContent=j.water.toFixed(0)+' mm';}catch(e){}}
async function c(a){await fetch('/api/cmd?do='+a);p()}
async function setR(){await fetch('/api/ratio?v='+ri.value);p()}
p();setInterval(p,700);
</script>
)HTML";

void flushStart();

void webApiState() {
  float added = (state == S_FILL || state == S_DONE) ? weightNow - riceWeight : 0;
  const char* st = state == S_IDLE ? "IDLE" : state == S_FILL ? "FILL"
                 : state == S_DONE ? "DONE" : "FAULT";
  char j[220];
  snprintf(j, sizeof(j),
    "{\"w\":%.1f,\"rice\":%.1f,\"target\":%.1f,\"added\":%.1f,"
    "\"ratio\":%.2f,\"water\":%.0f,\"state\":\"%s\",\"fault\":\"%s\"}",
    weightNow, riceWeight, targetWater, added, RATIO, waterLevelMM(), st, faultMsg);
  web.send(200, "application/json", j);
}

void webApiCmd() {
  String a = web.arg("do");
  if      (a == "tare")  { if (state != S_FILL) xwTare(); }
  else if (a == "start") { if (state != S_FILL) { state = S_IDLE; startCycle(); } }
  else if (a == "stop")  { pumpOff(); if (state == S_FILL) { state = S_FAULT; strcpy(faultMsg, "web stop"); } }
  else if (a == "clear") { if (state != S_FILL) { state = S_IDLE; faultMsg[0] = 0; } }
  else if (a == "flush") { flushStart(); }
  web.send(200, "text/plain", "ok");
}

void webApiRatio() {
  float v = web.arg("v").toFloat();
  if (v >= 1.0f && v <= 3.0f) { RATIO = v; prefs.putFloat("ratio", v); }
  web.send(200, "text/plain", "ok");
}

void netBegin() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(STA_SSID, STA_PASSWORD);
  Serial.printf("[wifi] joining %s\n", STA_SSID);

  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < STA_TIMEOUT_MS) delay(300);

  if (WiFi.status() == WL_CONNECTED) {
    wifiUp = true;
    Serial.printf("[wifi] %s\n", WiFi.localIP().toString().c_str());
  } else {
    /* campus SSO, 5 GHz only, or just out of range — bring up our own AP so
     * the phone can still reach the machine. Nothing else changes. */
    WiFi.mode(WIFI_AP);
    WiFi.softAP(AP_SSID, AP_PASSWORD);
    apMode = true;
    Serial.printf("[wifi] AP %s -> http://192.168.4.1\n", AP_SSID);
  }

  web.on("/",          []() { web.send_P(200, "text/html", PAGE_HTML); });
  web.on("/api/state", webApiState);
  web.on("/api/cmd",   webApiCmd);
  web.on("/api/ratio", webApiRatio);
  web.begin();

#if MQTT_ENABLE
  if (wifiUp) {
    mqtt.setServer(MQTT_HOST, MQTT_PORT);
    mqtt.setCallback(mqttCallback);
  }
#endif
}

#if MQTT_ENABLE
void mqttEnsure() {
  if (!wifiUp || mqtt.connected()) return;
  if (!mqtt.connect(MQTT_UID)) return;          // Bemfa uses the key as client id
  mqtt.subscribe(MQTT_SUB_CMD);
  Serial.println(F("[mqtt] connected"));
}

void mqttCallback(char* topic, byte* payload, unsigned int len) {
  char msg[48];
  if (len >= sizeof(msg)) len = sizeof(msg) - 1;
  memcpy(msg, payload, len); msg[len] = 0;

  if (strcmp(msg, "tare")  == 0) { if (state != S_FILL) xwTare(); }
  if (strcmp(msg, "start") == 0) { if (state != S_FILL) { state = S_IDLE; startCycle(); } }
  if (strcmp(msg, "stop")  == 0) { pumpOff(); if (state == S_FILL) { state = S_FAULT; strcpy(faultMsg, "mqtt stop"); } }
  if (strcmp(msg, "clear") == 0) { if (state != S_FILL) { state = S_IDLE; faultMsg[0] = 0; } }
  if (strcmp(msg, "flush") == 0) { flushStart(); }
}

void mqttPublish() {
  if (!mqtt.connected()) return;
  char j[200];
  snprintf(j, sizeof(j),
    "{\"w\":%.1f,\"rice\":%.1f,\"tgt\":%.1f,\"add\":%.1f,\"st\":\"%s\"}",
    weightNow, riceWeight, targetWater,
    (state == S_FILL || state == S_DONE) ? weightNow - riceWeight : 0,
    state == S_IDLE ? "IDLE" : state == S_FILL ? "FILL" : state == S_DONE ? "DONE" : "FAULT");
  mqtt.publish(MQTT_PUB_STATE, j);
}
#endif

/* ===========================================================================
 *  9. SERIAL PROTOCOL — same command set as MQTT, so the USB app and the
 *     WiFi app speak one language. Type plain text, one command per line.
 *
 *     tare | start | stop | clear | ratio 1.6 | status
 *
 *     The board answers every 2 s with one JSON line that the app parses:
 *     {"w":123.4,"rice":100.0,"target":120.0,"added":23.4,
 *      "ratio":1.20,"water":62,"state":"FILL","fault":""}
 * ========================================================================*/

char serBuf[32];
uint8_t serLen = 0;

void serialStateLine() {
  float added = (state == S_FILL || state == S_DONE) ? weightNow - riceWeight : 0;
  const char* st = state == S_IDLE ? "IDLE" : state == S_FILL ? "FILL"
                 : state == S_DONE ? "DONE" : "FAULT";
  Serial.printf("{\"w\":%.1f,\"rice\":%.1f,\"target\":%.1f,\"added\":%.1f,"
                "\"ratio\":%.2f,\"water\":%.0f,\"state\":\"%s\",\"fault\":\"%s\"}\n",
                weightNow, riceWeight, targetWater, added,
                RATIO, waterLevelMM(), st, faultMsg);
}

void serialCmd(const char* c) {
  if (!strcmp(c, "tare"))       { if (state != S_FILL) xwTare(); Serial.println(F("ok tare")); }
  else if (!strcmp(c, "start")) { if (state != S_FILL) { state = S_IDLE; startCycle(); } Serial.println(F("ok start")); }
  else if (!strcmp(c, "stop"))  { pumpOff(); if (state == S_FILL) { state = S_FAULT; strcpy(faultMsg, "usb stop"); } Serial.println(F("ok stop")); }
  else if (!strcmp(c, "clear")) { if (state != S_FILL) { state = S_IDLE; faultMsg[0] = 0; } Serial.println(F("ok clear")); }
  else if (!strncmp(c, "ratio ", 6)) {
    float v = atof(c + 6);
    if (v >= 1.0f && v <= 3.0f) { RATIO = v; prefs.putFloat("ratio", v); Serial.printf("ok ratio %.2f\n", v); }
    else Serial.println(F("err ratio range 1.0-3.0"));
  }
  else if (!strcmp(c, "selftest")) { hxSelfTest(); }
  else if (!strncmp(c, "cal ", 4)) {
    float g = atof(c + 4);
    if (g > 1.0f && weightNow > 1.0f) {
      XW_SCALE = weightNow / g;
      Serial.printf("ok cal  XW_SCALE=%.4f  (board said %.1f, real %.1fg)\n",
                    XW_SCALE, weightNow, g);
    } else Serial.println(F("err: put the known mass on first, then cal <grams>"));
  }
  else if (!strcmp(c, "flush"))  { flushStart(); Serial.println(F("ok flush")); }
  else if (!strcmp(c, "status")) { serialStateLine(); }
  else if (c[0])                 { Serial.printf("err unknown '%s'\n", c); }
}

void serialPoll() {
  while (Serial.available()) {
    char ch = (char)Serial.read();
    if (ch == '\r') continue;
    if (ch == '\n') {
      serBuf[serLen] = 0;
      if (serLen) serialCmd(serBuf);
      serLen = 0;
    } else if (serLen < sizeof(serBuf) - 1) {
      serBuf[serLen++] = ch;
    }
  }
}

/* ===========================================================================
 *  10. SETUP / LOOP
 * ========================================================================*/

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println(F("\n=== RiceMix ESP32 ==="));

  pinMode(PIN_L298_IN1, OUTPUT);
  pinMode(PIN_L298_IN2, OUTPUT);
  pinMode(PIN_STATUS, OUTPUT);
  pumpOff();
#if PIN_L298_ENA >= 0
  pinMode(PIN_L298_ENA, OUTPUT);
  digitalWrite(PIN_L298_ENA, HIGH);        // full speed; no PWM needed for water
#endif
  analogReadResolution(12);

  Serial2.begin(XW_BAUD, SERIAL_8N1, PIN_XW_RX, PIN_XW_TX);
  Serial.printf("[xw] uart2 %d 8N1  rx=%d tx=%d\n", XW_BAUD, PIN_XW_RX, PIN_XW_TX);

  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  lcd.init();
  lcd.backlight();
  lcdLine(0, "RiceMix ESP32");
  lcdLine(1, "starting...");

#if KEYPAD_ENABLE
  keypadBegin();
  Serial.println(F("[kp] 4x4 enabled"));
#else
  Serial.println(F("[kp] disabled"));
#endif

  prefs.begin("ricemix", false);
  RATIO = prefs.getFloat("ratio", RATIO);

  netBegin();
  Serial.printf("[cfg] ratio %.2f lead %.1f timeout %u\n", RATIO, LEAD_G, TIMEOUT_MS);

  lcd.clear();
  updateLcd();

  /* One-shot verdict on that 4-pin header. Read the first ten lines of the
   * serial monitor before you trust anything else. */
  hxSelfTest(10);
}

void loop() {
  hxPoll();
  serialPoll();
  flushPoll();
  web.handleClient();

#if MQTT_ENABLE
  if (wifiUp) { mqttEnsure(); mqtt.loop(); }
#endif

  uint32_t now = millis();

  if (now - tSample >= SAMPLE_MS) {
    tSample = now;
    runCycle();
  }

#if KEYPAD_ENABLE
  uint8_t k = keypadScan();
  if (k != 255) handleKey(k);
#endif

  if (now - tLcd >= 250) {
    tLcd = now;
    updateLcd();
  }

#if MQTT_ENABLE
  if (now - tPublish >= 2000) {
    tPublish = now;
    mqttPublish();
  }
#endif

  /* USB app also gets a state line every 2 s, same JSON shape as /api/state */
  static uint32_t tSer = 0;
  if (now - tSer >= 2000) { tSer = now; serialStateLine(); }
}
