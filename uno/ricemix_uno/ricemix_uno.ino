/* ===========================================================================
 *  RiceMix · Arduino UNO R3 · 全硬件控制版
 *
 *  硬件
 *    主控    Arduino UNO R3 (5V)
 *    测重    WX112 V1.0 电子秤，串口 9600 8N1，"<数字>\r\n" = 克
 *    显示    LCD1602 + PCF8574 转接板（I2C 四线：VCC/GND/SDA/SCL）
 *    输入    4×4 矩阵键盘，8 档配方
 *    执行    5V 直流泵 + L9110S（IA/IB 双线，见下方泵线接反说明）
 *    兜底    水位传感器（可选，A0）
 *
 *  引脚账（全部连号，好接线）
 *    A4 / A5   LCD I2C —— UNO 的 SDA=A4、SCL=A5 是硬件固定的，改不了
 *    D2 – D5   键盘行 R1–R4
 *    D6 – D9   键盘列 C1–C4
 *    D10       测重 RX（SoftwareSerial）
 *    D11 / D12 泵 IA / IB（L9110S）
 *    A0        水位
 *    A1–A3, D13 空着备用
 *
 *  LCD 背面那块 PCF8574 转接板只有四个脚：VCC / GND / SDA / SCL。
 *  I2C 地址 0x27（A0/A1/A2 全短接时），找不到就试 0x3F。
 *  驱动是自己写的，只依赖 Wire，不需要装 LiquidCrystal_I2C。
 *
 *  没有 WiFi、没有网页、没有 App。插上电就能用。
 * ========================================================================*/

#include <Wire.h>
#include <SoftwareSerial.h>

/* ======================= 1. 引脚 ======================= */

#define KP_R1    2
#define KP_R2    3
#define KP_R3    4
#define KP_R4    5

#define KP_C1    6
#define KP_C2    7
#define KP_C3    8
#define KP_C4    9

#define XW_RX      10       /* 秤 TX -> 这里 */
#define PIN_PUMP_A 11       /* L9110S IA */
#define PIN_PUMP_B 12       /* L9110S IB —— 泵线接反了，靠它掰回来 */
#define PIN_WATER  A0

#define USE_WATER 1

/* 停泵电平。
 * L9110S 各家模块不完全一样：
 *   有的板子 IA=0 IB=0 是停止，IA=1 IB=1 是刹车；
 *   有的板子反过来。
 * 哪个能让泵停下就用哪个。改这一个数字重烧即可。 */
#define PUMP_OFF_BOTH_HIGH 1

/* ======================= 2. 配方 ======================= */

struct Recipe {
  const char* name;
  float       ratio;
  uint16_t    timeoutMs;
};

const Recipe RECIPES[8] = {
  { "Dongbei", 1.20f,  60000 },
  { "Thai",    1.10f,  60000 },
  { "Soft",    2.00f,  90000 },
  { "Mushy",   3.00f, 120000 },
  { "Thick",   6.00f, 150000 },
  { "Thin",    9.00f, 180000 },
  { "CustomA", 1.50f,  90000 },
  { "CustomB", 1.80f,  90000 },
};

/* ======================= 3. 常量 ======================= */

const uint16_t SAMPLE_MS    = 200;
const float    LEAD_G       = 5.0f;
const float    MAX_TOTAL    = 3000.0f;
const float    XW_SCALE     = 1.0f;
const uint16_t DRY_CHECK_MS = 3000;
const float    DRY_DELTA    = 0.5f;

#define LCD_ADDR 0x27

/* ======================= 4. LCD 驱动（PCF8574） =======================
 *  接线：转接板 VCC → 5V，GND → GND，SDA → A4，SCL → A5
 *
 *  板载 PCF8574 的位映射（市面上绝大多数 IIC 转接板）：
 *    P0=RS  P1=RW  P2=EN  P3=背光  P4..P7=D4..D7
 */

void lcdNibble(uint8_t nib, uint8_t rs) {
  uint8_t b = (uint8_t)((nib << 4) | 0x08 | (rs ? 0x01 : 0x00));
  Wire.beginTransmission(LCD_ADDR);
  Wire.write(b | 0x04);                 /* EN 拉高 */
  Wire.endTransmission();
  delayMicroseconds(3);
  Wire.beginTransmission(LCD_ADDR);
  Wire.write(b & (uint8_t)~0x04);       /* EN 拉低，数据锁进去 */
  Wire.endTransmission();
  delayMicroseconds(60);
}

void lcdByte(uint8_t v, uint8_t rs) {
  lcdNibble(v >> 4, rs);
  lcdNibble(v & 0x0F, rs);
}

void lcdCmd(uint8_t c)  { lcdByte(c, 0); }
void lcdData(uint8_t c) { lcdByte(c, 1); }

void lcdBegin() {
  Wire.begin();
  delay(60);
  lcdNibble(0x03, 0); delay(5);
  lcdNibble(0x03, 0); delay(5);
  lcdNibble(0x03, 0); delay(1);
  lcdNibble(0x02, 0); delay(1);         /* 切到 4 位模式 */
  lcdCmd(0x28);                         /* 2 行，5x8 */
  lcdCmd(0x0C);                         /* 显示开，光标关 */
  lcdCmd(0x06);                         /* 写入后光标右移 */
  lcdCmd(0x01);                         /* 清屏 */
  delay(2);
}

void lcdClear() { lcdCmd(0x01); delay(2); }

void lcdAt(uint8_t col, uint8_t row) {
  lcdCmd((uint8_t)(0x80 | (row ? 0x40 : 0x00) | (col & 0x0F)));
}

void lcdStr(const char* s) { while (*s) lcdData((uint8_t)*s++); }

void lcdNum(long v) {
  char b[12];
  ltoa(v, b, 10);
  lcdStr(b);
}

void lcdFix(float v, uint8_t dec) {
  char b[14];
  dtostrf(v, 0, dec, b);
  lcdStr(b);
}

/* ======================= 5. 对象与状态 ======================= */

SoftwareSerial xw(XW_RX, 255);          /* 只收不发 */

enum State { S_IDLE, S_FILL, S_SETTLE, S_DONE, S_FAULT };
State state = S_IDLE;

float weightNow   = 0;
float riceWeight  = 0;
float targetWater = 0;
float addedWater  = 0;
float flowEst     = 0;

int8_t   recipeIdx = 0;
uint32_t tStart = 0, tSettle = 0, tSample = 0;
char     faultMsg[17] = {0};

uint8_t  lcdPage   = 0;
uint16_t lastRice  = 0;
float    lastWater = 0;
uint8_t  batchNo   = 0;

char    xwBuf[12];
uint8_t xwLen = 0;

const char* stateName();

/* ======================= 6. 称重 ======================= */

void xwPoll() {
  while (xw.available()) {
    char c = (char)xw.read();
    if (c == '\r' || c == '\n') {
      if (xwLen) {
        xwBuf[xwLen] = 0;
        long v = atol(xwBuf);
        if (v >= 0) weightNow = (float)v / XW_SCALE;
        xwLen = 0;
      }
    } else if (c >= '0' && c <= '9') {
      if (xwLen < sizeof(xwBuf) - 1) xwBuf[xwLen++] = c;
    }
  }
  if (xwLen > sizeof(xwBuf) - 1) xwLen = 0;
}

/* ======================= 7. 水位 ======================= */

float waterMM() {
#if USE_WATER
  int raw = analogRead(PIN_WATER);
  if (raw < 50) return 0;
  float mm = (raw - 50) * 100.0f / (500 - 50);
  return mm < 0 ? 0 : mm;
#else
  return 999;
#endif
}

/* ======================= 8. 泵 ======================= */

/* ---- 泵 · 商家把线接反了 ----------------------------------------------
 *
 *  正常接法：OA → 泵红线(+)，OB → 泵黑线(−)，IA=1 IB=0 时正转。
 *  实际到货：**OB → 泵红e:\harde:\hardness\ricemix\uno\豆姐\RiceMix_UNO\RiceMix_UNO.inoness\ricemix\uno\豆姐\RiceMix_UNO.ino线，OA → 泵黑线**，而且那个头带防呆方向，插不反过来，
 *            也只有这一根细线，改不了。
 *
 *  所以在这里把逻辑掰回来：
 *    IA=0, IB=1  →  OA 低、OB 高  →  泵红线高、黑线低  →  正转（加水）
 *    IA=1, IB=0  →  OA 高、OB 低  →  泵反转（冲管）e:\hardness\ricemix\uno\豆姐\RiceMix_UNO\RiceMix_UNO.ino
 *    IA=0, IB=0  →  两端同低  →  自然停转，不刹车
 *
 *  白捡的：以后想冲管，reversePump() 就是现成的。
 */

void pumpOn() {
  digitalWrite(PIN_PUMP_A, LOW);
  digitalWrite(PIN_PUMP_B, HIGH);
}

/* 停泵用「双高」而不是「双低」。
 *
 * L9110S 真值表：
 *   IA=0 IA=0  →  OA=L OB=L  →  高阻，理论上不转
 *   IA=1 IB=1  →  OA=H OB=H  →  刹车，两端同电位，强行制动
 *
 * 为什么选双高：UNO 从上电到 setup() 跑起来之间有一两秒的 bootloader，
 * 这段时间引脚是「悬空输入」，L9110S 的输入浮空会被干扰成高电平。
 * 双低状态下浮空 = 输出乱跳 = 泵空转；双高状态下浮空 = 刹车 = 泵不动。
 * 刹车会有几毫安静态电流，但比空转安全得多。
 */
void pumpOff() {
#if PUMP_OFF_BOTH_HIGH
  digitalWrite(PIN_PUMP_A, HIGH);
  digitalWrite(PIN_PUMP_B, HIGH);
#else
  digitalWrite(PIN_PUMP_A, LOW);
  digitalWrite(PIN_PUMP_B, LOW);
#endif
}

/* 反转 = 把管子里剩的水推回桶里。现在没接按钮，留着自己调 */
void pumpReverse() {
  digitalWrite(PIN_PUMP_A, HIGH);
  digitalWrite(PIN_PUMP_B, LOW);
}

/* ======================= 9. 键盘 ======================= */

const uint8_t ROW_PINS[4] = { KP_R1, KP_R2, KP_R3, KP_R4 };
const uint8_t COL_PINS[4] = { KP_C1, KP_C2, KP_C3, KP_C4 };

uint8_t scanKey() {
  for (uint8_t r = 0; r < 4; r++) {
    pinMode(ROW_PINS[r], OUTPUT);
    digitalWrite(ROW_PINS[r], LOW);
    for (uint8_t c = 0; c < 4; c++) {
      if (digitalRead(COL_PINS[c]) == LOW) {
        delay(18);
        if (digitalRead(COL_PINS[c]) == LOW) {
          pinMode(ROW_PINS[r], INPUT_PULLUP);
          return (uint8_t)(r * 4 + c);
        }
      }
    }
    pinMode(ROW_PINS[r], INPUT_PULLUP);
  }
  return 255;
}

/* ======================= 10. 控制 ======================= */

void latchFault(const char* msg) {
  pumpOff();
  state = S_FAULT;
  strncpy(faultMsg, msg, sizeof(faultMsg) - 1);
  faultMsg[sizeof(faultMsg) - 1] = 0;
  lcdPage = 3;
}

void startBatch(int8_t idx) {
  if (state == S_FILL) return;
  recipeIdx   = idx;
  riceWeight  = weightNow;
  targetWater = riceWeight * RECIPES[idx].ratio;
  addedWater  = 0;
  flowEst     = 0;
  tStart      = millis();
  tSample     = millis();
  faultMsg[0] = 0;

  if (riceWeight < 20.0f) { latchFault("put rice first"); return; }
  if (waterMM() < 5.0f)   { latchFault("no water tank");  return; }

  state = S_FILL;
  pumpOn();
}

void stopBatch(const char* msg) {
  pumpOff();
  lastRice  = (uint16_t)(riceWeight + 0.5f);
  lastWater = addedWater;
  batchNo++;
  state = S_DONE;
  strncpy(faultMsg, msg, sizeof(faultMsg) - 1);
  faultMsg[sizeof(faultMsg) - 1] = 0;
}

void runFill() {
  uint32_t now = millis();

  if (now - tSample >= SAMPLE_MS) {
    float prev = weightNow;
    float dt   = (now - tSample) / 1000.0f;
    tSample    = now;
    if (dt > 0.01f) {
      float inst = (weightNow - prev) / dt;
      if (inst > 0 && inst < 100) flowEst = flowEst * 0.7f + inst * 0.3f;
    }
  }

  addedWater = weightNow - riceWeight;

  if (now - tStart > RECIPES[recipeIdx].timeoutMs) { latchFault("timeout");  return; }
  if (weightNow > MAX_TOTAL)                       { latchFault("overload"); return; }
  if (now - tStart > DRY_CHECK_MS && addedWater < DRY_DELTA) {
    latchFault("no flow"); return;
  }

  float lead = flowEst > 0.5f ? flowEst * (LEAD_G / 12.0f) : LEAD_G;
  if (addedWater >= targetWater - lead) {
    pumpOff();
    tSettle = now;
    state = S_SETTLE;
    return;
  }

  if (waterMM() < 5.0f) latchFault("tank empty");
}

void runSettle() {
  if (millis() - tSettle < 400) return;
  stopBatch("done");
}

/* ======================= 11. 显示 ======================= */

const char* stateName() {
  switch (state) {
    case S_IDLE:   return "READY";
    case S_FILL:   return "FILL";
    case S_SETTLE: return "SETTLE";
    case S_DONE:   return "DONE";
    default:       return "FAULT";
  }
}

void showProgress() {
  lcdAt(0, 0);
  lcdStr(stateName());
  lcdStr(" ");
  float frac = targetWater > 0 ? addedWater / targetWater : 0;
  if (frac < 0) frac = 0;
  if (frac > 1) frac = 1;
  for (uint8_t i = 0; i < 8; i++) lcdData(i < (uint8_t)(frac * 8) ? '#' : '.');
  lcdStr("   ");

  lcdAt(0, 1);
  lcdFix(addedWater, 1);
  lcdStr("/");
  lcdFix(targetWater, 1);
  lcdStr("g   ");
}

void showRatio() {
  lcdAt(0, 0);
  lcdStr(RECIPES[recipeIdx].name);
  lcdStr(" 1:");
  lcdFix(RECIPES[recipeIdx].ratio, 2);
  lcdStr("   ");

  lcdAt(0, 1);
  lcdStr("FLOW ");
  lcdFix(flowEst, 1);
  lcdStr("g/s   ");
}

void showLast() {
  lcdAt(0, 0);
  lcdStr("#");
  lcdNum(batchNo);
  lcdStr(" RICE ");
  lcdNum(lastRice);
  lcdStr("g   ");

  lcdAt(0, 1);
  lcdStr("WATER ");
  lcdNum((long)lastWater);
  lcdStr("g    ");
}

void showFault() {
  /* 一行只有 16 个字符，"FAULT " 占 6 个，消息最多留 10 个 */
  lcdAt(0, 0);
  lcdStr("FAULT ");
  for (uint8_t i = 0; i < 10 && faultMsg[i]; i++) lcdData((uint8_t)faultMsg[i]);
  lcdStr("     ");

  lcdAt(0, 1);
  lcdStr("S9 clr  S12 pg ");
}

void updateLcd() {
  static uint32_t tLast = 0;
  if (millis() - tLast < 250) return;
  tLast = millis();

  if (state == S_FAULT) { showFault(); return; }

  switch (lcdPage) {
    case 1:  showRatio(); break;
    case 2:  showLast();  break;
    default: showProgress(); break;
  }
}

/* ======================= 12. 按键 ======================= */

void handleKey(uint8_t k) {
  switch (k) {
    case 0: case 1: case 2: case 3:
    case 4: case 5: case 6: case 7:
      if (state != S_FILL) { recipeIdx = k; lcdPage = 1; }
      break;

    case 8:                                   /* S9 去皮 */
      if (state != S_FILL) riceWeight = weightNow;
      break;

    case 9:                                   /* S10 开始 */
      if (state != S_FILL && state != S_SETTLE) startBatch(recipeIdx);
      break;

    case 10:                                  /* S11 急停 */
      pumpOff();
      if (state == S_FILL || state == S_SETTLE) latchFault("key stop");
      break;

    case 11:                                  /* S12 翻页 */
      lcdPage = (uint8_t)((lcdPage + 1) % 3);
      lcdClear();
      break;

    default: break;
  }
}

/* ======================= 13. setup / loop ======================= */

void setup() {
  /* 第一件事就把泵钉死，别让它在后面初始化外设时乱转 */
  pinMode(PIN_PUMP_A, OUTPUT);
  pinMode(PIN_PUMP_B, OUTPUT);
  pumpOff();

  Serial.begin(115200);
  Serial.println(F("\n=== RiceMix UNO ==="));

  for (uint8_t i = 0; i < 4; i++) pinMode(ROW_PINS[i], INPUT_PULLUP);
  for (uint8_t i = 0; i < 4; i++) pinMode(COL_PINS[i], INPUT_PULLUP);

#if USE_WATER
  pinMode(PIN_WATER, INPUT);
#endif

  lcdBegin();
  lcdAt(0, 0);  lcdStr("RiceMix UNO");
  lcdAt(0, 1);  lcdStr("bowl + rice");

  xw.begin(9600);
  Serial.println(F("[xw] 9600 8N1 on D10"));
  Serial.println(F("[lcd] PCF8574 @0x27"));

  delay(1500);
  lcdClear();
}

/* 串口手动试泵：a = 只拉 IA 高，b = 只拉 IB 高，x = 停
 * 用来现场确认这块 L9110S 到底哪种电平组合能让泵停 */
void pumpProbe() {
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == 'a') {
      digitalWrite(PIN_PUMP_A, HIGH);
      digitalWrite(PIN_PUMP_B, LOW);
      Serial.println(F("[pump] IA=H IB=L"));
    } else if (c == 'b') {
      digitalWrite(PIN_PUMP_A, LOW);
      digitalWrite(PIN_PUMP_B, HIGH);
      Serial.println(F("[pump] IA=L IB=H"));
    } else if (c == 'x') {
      pumpOff();
      Serial.println(F("[pump] off"));
    } else if (c == 'l') {
      digitalWrite(PIN_PUMP_A, LOW);
      digitalWrite(PIN_PUMP_B, LOW);
      Serial.println(F("[pump] both LOW"));
    } else if (c == 'h') {
      digitalWrite(PIN_PUMP_A, HIGH);
      digitalWrite(PIN_PUMP_B, HIGH);
      Serial.println(F("[pump] both HIGH"));
    }
  }
}

void loop() {
  pumpProbe();
  xwPoll();
  updateLcd();

  if (state == S_FILL)   runFill();
  if (state == S_SETTLE) runSettle();

  static uint32_t tKey = 0;
  if (millis() - tKey >= 40) {
    tKey = millis();
    uint8_t k = scanKey();
    if (k != 255) {
      handleKey(k);
      while (scanKey() != 255) delay(10);
    }
  }
}
