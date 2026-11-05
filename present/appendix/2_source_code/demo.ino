/*
 * 米水配比 —— 课堂 demo 版（面包板 + 74HC595 段驱动 + 5461AS-1 数码管）
 *
 * 做五件事：称重 / 去皮 / 按比例加水 / 超时停泵 / 把米重显示在数码管上
 *
 * ══════════ 接线（全部走面包板，不直接并线）══════════
 *  HX711   VCC→5V轨   GND→GND轨   DT→A1   SCK→A0
 *  继电器  VCC→5V轨   GND→GND轨   IN→D8
 *  键盘    行 R1-R4 → D2 D3 D4 D5      列 C1-C4 → D6 D7 D9 D10
 *  74HC595 14 SER→D11   11 SRCLK→D12   12 RCLK→D13
 *          16 VCC→5V轨  8 GND→GND轨
 *          10 SRCLR→5V（必须！接低就永远清零，屏全黑）
 *          13 OE→GND（必须！悬空就永远关着输出）
 *          QA-QH → 8 个 220Ω → 数码管 a b c d e f g dp
 *  数码管  DIG1 DIG2 DIG3 DIG4 → A2 A3 A4 A5（共阴，低电平点亮，位选不串电阻）
 *  水泵    12V+ → 继电器 COM，NO → 泵+，泵- → 12V-
 *          12V- 必须接 Arduino GND（共地）
 *  保护件  D1 1N4007 白环端接泵+，另一端接泵-（反并联）
 *          C1 1000μF 长脚接 12V+，白条端接 12V-（并在电源两端）
 *
 * ══════════ 按键（键盘 S1-S16）══════════
 *  第一行 S1-S4    东北米 / 泰国米 / 软饭 / 烂饭
 *  第二行 S5-S8    稠粥 / 稀饭 / 自定义A / 自定义B
 *  第三行 S9-S12   启动 / 停止 / 去皮 / 状态
 *  第四行 S13-S16  校准 / 加100g水 / 存参数 / 恢复出厂
 *
 * 串口 9600：s=开始  x=停止  t=去皮  r=换比例  c=校准  ?=状态
 */

#include <HX711.h>

/* ══════════ 引脚 ══════════ */
const uint8_t PIN_DT   = A1;
const uint8_t PIN_SCK  = A0;
const uint8_t PIN_PUMP = 8;

/* 74HC595 */
const uint8_t PIN_SER   = 11;   // 14 SER   串行数据
const uint8_t PIN_SRCLK = 12;   // 11 SRCLK 移位时钟
const uint8_t PIN_RCLK  = 13;   // 12 RCLK  锁存时钟

/* 键盘 4×4 */
const uint8_t ROWS[4] = {2, 3, 4, 5};
const uint8_t COLS[4] = {6, 7, 9, 10};

/* 数码管位选（共阴：给低电平点亮这一位） */
const uint8_t DIG[4] = {A2, A3, A4, A5};

HX711 scale;

/* ══════════ 参数 ══════════ */
float    RATIO      = 1.20;    // 米水比：1 斤米配 1.2 斤水
float    LEAD_G     = 5.0;     // 提前量：泵停后管内余水还会流下约 5 g
uint32_t SAMPLE_MS  = 200;     // 每 200 ms 称一次
uint32_t TIMEOUT_MS = 30000;   // 30 秒没加够就强制停（防溢水）
float    MIN_RICE   = 20.0;    // 少于 20 g 米不启动
float    MAX_TOTAL  = 3000.0;  // 秤上总重上限

/* ══════════ 状态 ══════════ */
float  tareOff  = 0;      // 去皮偏移
float  riceW    = 0;      // 这次配多少米
float  target   = 0;      // 目标水量
bool   running  = false;  // 是否正在加水
uint32_t t0     = 0;      // 本轮开始时刻
uint32_t tSample = 0;     // 上次称重时刻

/* ══════════ 段码表（共阴，bit0=a ... bit6=g, bit7=dp）══════════ */
const uint8_t SEG[10] = {
  0x3F, 0x06, 0x5B, 0x4F, 0x66,
  0x6D, 0x7D, 0x07, 0x7F, 0x6F
};
const uint8_t SEG_DP    = 0x80;
const uint8_t SEG_BLANK = 0x00;

uint8_t disp[4] = {SEG_BLANK, SEG_BLANK, SEG_BLANK, SEG_BLANK};

/* ══════════ 数码管 ══════════ */
void displayOff() {
  for (uint8_t i = 0; i < 4; i++) digitalWrite(DIG[i], HIGH);   // 共阴：高=灭
}

void showMilligrams(uint32_t v) {          // v 单位 0.1 g，1204 = "120.4"
  if (v > 9999) v = 9999;
  disp[3] = SEG[v % 10]; v /= 10;
  disp[2] = SEG[v % 10]; v /= 10;
  disp[1] = SEG[v % 10] | SEG_DP;
  disp[0] = SEG[v % 10];
  if (disp[0] == SEG[0]) disp[0] = SEG_BLANK;   // 前导零消隐
}

void showText(const char *s) {
  for (uint8_t i = 0; i < 4; i++) disp[i] = SEG_BLANK;
  for (uint8_t i = 0; i < 4 && s[i]; i++) {
    char c = s[i];
    if (c >= '0' && c <= '9') disp[i] = SEG[c - '0'];
    else if (c == '-')        disp[i] = 0x40;   // g 段
  }
}

/* 每 2 ms 调一次，一次只点一位 —— 整屏 8 ms 刷新，肉眼不闪 */
void scanDisplay() {
  static uint8_t k = 0;
  displayOff();
  digitalWrite(PIN_RCLK, LOW);
  shiftOut(PIN_SER, PIN_SRCLK, MSBFIRST, disp[k]);
  digitalWrite(PIN_RCLK, HIGH);
  digitalWrite(DIG[k], LOW);
  k = (k + 1) & 3;
}

/* ══════════ 称重 ══════════ */
float readG() {
  if (!scale.is_ready()) return NAN;
  return scale.get_units(2) - tareOff;
}

void doTare() {
  scale.tare(10);
  tareOff = 0;
  Serial.println(F("[去皮] 归零"));
  showText("----");
}

/* ══════════ 泵 ══════════ */
void pump(bool on) { digitalWrite(PIN_PUMP, on ? HIGH : LOW); }

/* ══════════ 一轮配水 ══════════ */
void startCycle() {
  float w = readG();
  if (isnan(w) || w < MIN_RICE) {
    Serial.println(F("[跳过] 秤上米太少，先倒米再按启动"));
    showText("----");
    return;
  }
  riceW = w;
  target = riceW * RATIO;
  running = true;
  t0 = millis();
  tSample = t0;
  pump(true);
  Serial.print(F("[开始] 米 ")); Serial.print(riceW, 1);
  Serial.print(F(" g → 目标水 ")); Serial.print(target, 1); Serial.println(F(" g"));
}

void stopCycle(const __FlashStringHelper *why) {
  pump(false);
  running = false;
  Serial.print(F("[停] ")); Serial.println(why);
}

/* ══════════ 键盘 ══════════ */
uint8_t kpScan() {
  for (uint8_t r = 0; r < 4; r++) {
    for (uint8_t i = 0; i < 4; i++) pinMode(ROWS[i], i == r ? OUTPUT : INPUT_PULLUP);
    digitalWrite(ROWS[r], LOW);
    delayMicroseconds(30);
    for (uint8_t c = 0; c < 4; c++) {
      if (digitalRead(COLS[c]) == LOW) {
        while (digitalRead(COLS[c]) == LOW) { scanDisplay(); delay(1); }  // 等松手，顺便刷屏
        for (uint8_t i = 0; i < 4; i++) pinMode(ROWS[i], INPUT_PULLUP);
        return r * 4 + c;            // 0-15 对应 S1-S16
      }
    }
  }
  for (uint8_t i = 0; i < 4; i++) pinMode(ROWS[i], INPUT_PULLUP);
  return 255;
}

/* ══════════ 按键动作 ══════════ */
void handleKey(uint8_t k) {
  switch (k) {
    case 0:  RATIO = 1.20; Serial.println(F("[档] 东北米 1:1.20")); break;
    case 1:  RATIO = 1.10; Serial.println(F("[档] 泰国米 1:1.10")); break;
    case 2:  RATIO = 2.00; Serial.println(F("[档] 软饭 1:2.00"));   break;
    case 3:  RATIO = 3.00; Serial.println(F("[档] 烂饭 1:3.00"));   break;
    case 4:  RATIO = 6.00; Serial.println(F("[档] 稠粥 1:6.00"));   break;
    case 5:  RATIO = 9.00; Serial.println(F("[档] 稀饭 1:9.00"));   break;
    case 8:  if (!running) startCycle(); break;
    case 9:  if (running) stopCycle(F("手动停止")); break;
    case 10: doTare(); break;
    case 11:
      Serial.print(F("[状态] 米 ")); Serial.print(riceW, 1);
      Serial.print(F(" 目标 "));   Serial.print(target, 1);
      Serial.print(F(" 当前 "));   Serial.print(readG(), 1);
      Serial.print(F(" 比例 1:")); Serial.println(RATIO, 2);
      break;
    case 12: {
      float raw = scale.get_value(10);
      if (fabs(raw) > 1) {
        scale.set_scale(scale.get_scale() * raw / 500.0);
        Serial.println(F("[校准] 已按 500g 标定"));
      } else Serial.println(F("[校准] 秤上没东西"));
      break;
    }
    case 13:
      Serial.println(F("[加水] 手动开泵 2 秒"));
      pump(true); delay(2000); pump(false);
      break;
    case 15:
      RATIO = 1.20; LEAD_G = 5.0; TIMEOUT_MS = 30000;
      Serial.println(F("[复位] 参数回默认"));
      break;
    default: break;
  }
}

/* ══════════ 串口 ══════════ */
void pollSerial() {
  if (!Serial.available()) return;
  char c = Serial.read();
  switch (c) {
    case 's': if (!running) startCycle(); break;
    case 'x': if (running) stopCycle(F("串口停止")); break;
    case 't': doTare(); break;
    case 'r': RATIO = (RATIO > 2.9) ? 1.0 : RATIO + 0.1;
              Serial.print(F("[比例] 1:")); Serial.println(RATIO, 2); break;
    case 'c': { float raw = scale.get_value(10);
                if (fabs(raw) > 1) scale.set_scale(scale.get_scale() * raw / 500.0);
                Serial.println(F("[校准] 完成")); break; }
    case '?': handleKey(11); break;
    default: break;
  }
}

/* ══════════ setup / loop ══════════ */
void setup() {
  Serial.begin(9600);
  Serial.println(F("\n=== 米水配比 Demo（595 + 5461AS-1）==="));
  Serial.println(F("S9 启动 / S10 停止 / S11 去皮 / S12 状态"));

  pinMode(PIN_PUMP, OUTPUT); pump(false);
  pinMode(PIN_SER, OUTPUT);
  pinMode(PIN_SRCLK, OUTPUT);
  pinMode(PIN_RCLK, OUTPUT);
  for (uint8_t i = 0; i < 4; i++) { pinMode(DIG[i], OUTPUT); digitalWrite(DIG[i], HIGH); }
  for (uint8_t i = 0; i < 4; i++) pinMode(ROWS[i], INPUT_PULLUP);
  for (uint8_t i = 0; i < 4; i++) pinMode(COLS[i], INPUT_PULLUP);

  scale.begin(PIN_DT, PIN_SCK);
  scale.set_scale(420.0);       // 出厂值，跑一次校准会覆盖
  delay(300);
  scale.tare(10);

  showText("8888");             // 上电自检：四位数码管全亮一下
  delay(600);
  showText("----");
}

void loop() {
  static uint32_t tDisp = 0, tKey = 0, tIdle = 0;

  if (millis() - tDisp >= 2) { tDisp = millis(); scanDisplay(); }

  if (millis() - tKey >= 20) {
    tKey = millis();
    uint8_t k = kpScan();
    if (k != 255) handleKey(k);
  }

  pollSerial();

  if (running) {
    uint32_t now = millis();
    if (now - tSample >= SAMPLE_MS) {
      tSample = now;
      float w = readG();
      if (!isnan(w)) {
        showMilligrams((uint32_t)(w * 10 + 0.5));
        float added = w - riceW;

        if (now - t0 > TIMEOUT_MS)            { stopCycle(F("超时保护")); return; }
        if (w > MAX_TOTAL)                    { stopCycle(F("超重保护")); return; }
        if (now - t0 > 3000 && added < 0.5)   { stopCycle(F("没出水，查泵和管路")); return; }
        if (added >= target - LEAD_G)         { stopCycle(F("到量")); }
      }
    }
  } else {
    if (millis() - tIdle >= 300) {
      tIdle = millis();
      float w = readG();
      if (!isnan(w)) showMilligrams((uint32_t)(w * 10 + 0.5));
    }
  }
}
