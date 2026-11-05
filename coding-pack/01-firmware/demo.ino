/*
 * 米水配比 —— 课堂 demo 版
 * 只做四件事：称重 / 去皮 / 按比例加水 / 超时停泵
 *
 * 接线（和完整版完全一样，硬件不用改）：
 *   HX711  VCC->5V  GND->GND  DT->A1  SCK->A0
 *   继电器 VCC->5V  GND->GND  IN->D8
 *   键盘   行 R1-R4 -> D2 D3 D4 D5     列 C1-C4 -> D6 D7 D9 D10
 *   LED    D13 串联 220Ω 到 GND
 *   水泵   12V+ -> 继电器 COM，NO -> 泵+，泵- -> 12V-，12V- 接 Arduino GND
 *
 * 按键：
 *   左上  开始配水      第 2 个  去皮      第 3 个  停止      第 4 个  换比例
 *
 * 串口 9600 也能控：t=去皮  s=开始  x=停止  r=换比例  ?=打印状态
 */

#include <HX711.h>

/* ---------- 引脚 ---------- */
const uint8_t PIN_DT   = A1;
const uint8_t PIN_SCK  = A0;
const uint8_t PIN_PUMP = 8;
const uint8_t PIN_LED  = 13;

const uint8_t ROWS[4] = {2, 3, 4, 5};
const uint8_t COLS[4] = {6, 7, 9, 10};

HX711 scale;

/* ---------- 参数 ---------- */
float RATIO   = 1.20;   // 米水比：1 斤米配 1.2 斤水
float LEAD_G  = 5.0;    // 提前量：泵停后管路里的水还会流下来约 5 g
const uint32_t SAMPLE_MS  = 200;    // 每 200 ms 称一次
const uint32_t TIMEOUT_MS = 30000;  // 30 秒还没加够就强制停（防溢水）

/* ---------- 状态 ---------- */
float tareOff  = 0;      // 去皮偏移
float riceW    = 0;      // 这次要配多少米（克）
float target   = 0;      // 目标水量（克）
uint32_t t0    = 0;      // 开泵时刻
bool filling   = false;
uint32_t lastMs = 0;
uint32_t lastPrint = 0;

/* ================= 秤 ================= */
float readG() {
  return scale.get_units(3) - tareOff;
}

/* ================= 键盘 ================= */
uint8_t kpScan() {
  for (uint8_t r = 0; r < 4; r++) {
    for (uint8_t c = 0; c < 4; c++) pinMode(COLS[c], INPUT_PULLUP);
    pinMode(ROWS[r], OUTPUT);
    digitalWrite(ROWS[r], LOW);
    delayMicroseconds(30);
    for (uint8_t c = 0; c < 4; c++) {
      if (digitalRead(COLS[c]) == LOW) {
        pinMode(ROWS[r], INPUT);
        return r * 4 + c;
      }
    }
    pinMode(ROWS[r], INPUT);
  }
  return 255;
}

uint8_t lastKey = 255;

/* 返回 true 表示这一刻有新键按下 */
bool getKey(uint8_t &out) {
  uint8_t k = kpScan();
  if (k != 255 && lastKey == 255) {
    lastKey = k;
    delay(20);                    // 消抖
    out = k;
    return true;
  }
  if (k == 255) lastKey = 255;
  return false;
}

/* ================= 泵 ================= */
void pump(bool on) {
  digitalWrite(PIN_PUMP, on ? HIGH : LOW);
  digitalWrite(PIN_LED,  on ? HIGH : LOW);
}

/* ================= 动作 ================= */
void doTare() {
  if (filling) return;
  pump(false);
  tareOff = scale.get_units(10);
  Serial.print(F("去皮完成，当前 "));
  Serial.print(readG(), 1);
  Serial.println(F(" g"));
}

void doStart() {
  if (filling) return;
  float w = readG();
  if (w < 20) {
    Serial.println(F("秤上东西太轻（<20 g），先放米再按开始"));
    return;
  }
  riceW  = w;
  target = w * RATIO;
  t0     = millis();
  filling = true;
  pump(true);
  Serial.print(F("开始：米 "));   Serial.print(riceW, 1);
  Serial.print(F(" g -> 目标水 ")); Serial.print(target, 1);
  Serial.println(F(" g"));
}

void doStop(const __FlashStringHelper *why) {
  pump(false);
  if (!filling) return;
  filling = false;
  float w = readG() - riceW;
  Serial.print(F("停（"));
  Serial.print(why);
  Serial.print(F("）：共加水 "));
  Serial.print(w, 1);
  Serial.print(F(" g，目标 "));
  Serial.print(target, 1);
  Serial.print(F(" g，误差 "));
  Serial.print(w - target, 1);
  Serial.println(F(" g"));
}

void doRatio() {
  if (RATIO < 1.15)      RATIO = 1.20;
  else if (RATIO < 1.45) RATIO = 1.50;
  else if (RATIO < 1.75) RATIO = 2.00;
  else                   RATIO = 1.00;
  Serial.print(F("米水比 = 1 : "));
  Serial.println(RATIO, 2);
}

void doStatus() {
  float w = readG();
  Serial.print(F("总重 ")); Serial.print(w, 1);
  Serial.print(F(" g | 米 ")); Serial.print(riceW, 1);
  Serial.print(F(" g | 目标水 ")); Serial.print(target, 1);
  Serial.print(F(" g | 已加 ")); Serial.print(w - riceW, 1);
  Serial.print(F(" g | "));
  Serial.print(filling ? F("加水中") : F("空闲"));
  Serial.print(F(" | 比例 1:"));
  Serial.println(RATIO, 2);
}

/* ================= 主流程 ================= */
void setup() {
  Serial.begin(9600);
  pinMode(PIN_PUMP, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
  pump(false);

  scale.begin(PIN_DT, PIN_SCK);
  scale.set_scale(420.0);        // 出厂系数；不准就用 CAL 重新标
  delay(500);
  tareOff = scale.get_units(10);

  Serial.println(F("=== 米水配比 demo ==="));
  Serial.println(F("左上=开始  第2键=去皮  第3键=停止  第4键=换比例"));
  Serial.println(F("串口: t 去皮 / s 开始 / x 停止 / r 换比例 / ? 状态"));
}

void loop() {
  uint32_t now = millis();

  /* --- 键盘 --- */
  uint8_t k;
  if (getKey(k)) {
    if (k == 0) doStart();
    else if (k == 1) doTare();
    else if (k == 2) doStop(F("按键"));
    else if (k == 3) doRatio();
  }

  /* --- 串口 --- */
  if (Serial.available()) {
    char c = Serial.read();
    if (c == 's' || c == 'S') doStart();
    else if (c == 't' || c == 'T') doTare();
    else if (c == 'x' || c == 'X') doStop(F("串口"));
    else if (c == 'r' || c == 'R') doRatio();
    else if (c == '?') doStatus();
  }

  /* --- 闭环：每 200 ms 称一次 --- */
  if (filling && now - lastMs >= SAMPLE_MS) {
    lastMs = now;
    float w = readG();
    float water = w - riceW;
    float remain = target - water;

    if (water >= target - LEAD_G) {
      doStop(F("到位"));
    } else if (now - t0 > TIMEOUT_MS) {
      doStop(F("超时保护"));
    }
  }

  /* --- 每秒打一行，方便看曲线 --- */
  if (now - lastPrint >= 1000) {
    lastPrint = now;
    if (filling) {
      Serial.print(readG() - riceW, 1);
      Serial.println(F(" g"));
    }
  }
}
