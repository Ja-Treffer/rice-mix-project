/* ===========================================================================
 *  RiceMix · Arduino UNO R3 · 全硬件控制版（v3）
 *
 *  硬件
 *    主控    Arduino UNO R3 (5V)
 *    测重    WX112 V1.0 电子秤，串口输出（默认 9600 8N1，见 XW_BAUD）
 *            秤自带去皮，碗重由秤自己扣掉，固件不再去皮
 *    显示    LCD1602 + PCF8574 转接板（I2C 四线：VCC/GND/SDA/SCL）
 *    输入    4×4 矩阵键盘，只用 S1–S8，S9–S16 留空
 *    执行    5V 直流泵 + L9110S（IA/IB 双线，见下方泵线接反说明）
 *
 *  键位（S1–S8；S9/S13 是备用键，D7 那列断线时顶上）
 *    S1  锁定 / 解锁米重（故障态下 = 清故障）
 *    S2  开始自动加水        （备用 S9，S1 正下方）
 *    S3  急停（任何时候都有效）
 *    S4  切换显示页（主页面 ↔ 上一批记录）
 *    S5  目标水量 +5g
 *    S6  目标水量 -5g        （备用 S13，S5 正下方）
 *    S7  手动开泵（排空气 / 冲管用）
 *    S8  手动关泵
 *  注：S2 和 S6 都走键盘 C2 列（D7），这根线松了两个键同时失灵。
 *
 *  默认水米比 1:1.2，S5/S6 在这个基础上 ±5g 微调，掉电复位。
 *  没有 WiFi、没有网页、没有 App。插上电就能用。
 *
 *  ------------------------------------------------------------------------
 *  引脚账（按功能分组，连号好接线）
 *  ------------------------------------------------------------------------
 *  固定占用（不可改）
 *    D0 / D1    USB 串口（Serial 调试用，不接外设）
 *    A4         SDA —— LCD I2C，UNO 硬件固定
 *    A5         SCL —— LCD I2C，UNO 硬件固定
 *
 *  矩阵键盘（8 根，连续；只用前两行 S1–S8，后两行空着）
 *    D2  R1  第一行 S1 S2 S3 S4
 *    D3  R2  第二行 S5 S6 S7 S8
 *    D4  R3  第三行 S9 S10 S11 S12（空）
 *    D5  R4  第四行 S13 S14 S15 S16（空）
 *    D6  C1  第一列
 *    D7  C2  第二列
 *    D8  C3  第三列
 *    D9  C4  第四列
 *
 *  测重（SoftwareSerial，只收不发）
 *    D10 RX —— 接秤的 TX（交叉：秤发，我们收）
 *
 *  泵驱动（L9110S，双线）
 *    D11 IA —— L9110S 的 IA
 *    D12 IB —— L9110S 的 IB（泵线接反，靠这根掰回来）
 *
 *  备用
 *    A0  A1  A2  A3  模拟口备用（水位已移除）
 *    D13 数字口备用（板载 LED）
 *
 *  合计占用：A4/A5 + D2–D12 = 13 个 IO，剩 A0–A3 + D13 = 5 个富余。
 *
 *  LCD 背面那块 PCF8574 转接板只有四个脚：VCC / GND / SDA / SCL。
 *  I2C 地址 0x27（A0/A1/A2 全短接时），找不到就试 0x3F。
 *  驱动是自己写的，只依赖 Wire，不需要装 LiquidCrystal_I2C。
 * ========================================================================*/

#include <Wire.h>
#include <SoftwareSerial.h>
#include <EEPROM.h>
#include <stdlib.h>
#include <string.h>

/* ======================= 1. 引脚与可调参数 ======================= */

#define KP_R1    2
#define KP_R2    3
#define KP_R3    4
#define KP_R4    5

#define KP_C1    6
#define KP_C2    7
#define KP_C3    8
#define KP_C4    9

#define XW_RX      10       /* 秤 TX -> 这里 */

/* 水位传感器已移除（2026-11-15）。A0 归回备用。 */
#define PIN_PUMP_A 11       /* L9110S IA */
#define PIN_PUMP_B 12       /* L9110S IB —— 泵线接反了，靠它掰回来 */

/* ---- 电子秤串口 --------------------------------------------------------
 * 读不进秤数据时，按这个顺序排查：
 *   1. 打开串口监视器（115200），看每 2 秒打印的 [diag] bytes= 是不是 0。
 *        bytes=0   → 线没通 / 秤没在称重界面 / 电平不对，查硬件。
 *        bytes>0 但 weight=0 → 协议/波特率不对，改 XW_BAUD 或开 XW_RAW_DBG
 *                            看原始字节。
 *   2. 常见波特率：2400 / 4800 / 9600，挨个试。
 *   3. 终极手段：把秤 TX 改接 D0（硬件串口 RX），用硬件串口读，不会丢字节。
 *      注意烧录时必须拔掉 D0 上的秤线，否则 USB 上传会冲突。
 * ---------------------------------------------------------------------- */
#define XW_BAUD    9600
#define XW_SCALE   1.0f     /* 秤读数 = 克；若秤发公斤，改成 0.001 */
#define XW_RAW_DBG 0        /* 1 = 把秤的原始字节以 HEX 打到串口，诊断用 */

/* 停泵电平。L9110S 各家模块不完全一样，哪个能让泵停下就用哪个。 */
#define PUMP_OFF_BOTH_HIGH 1

/* ======================= 2. 常量 ======================= */

const float    RATIO_DEF    = 1.20f;    /* 出厂默认水米比 1:1.2 */
const float    RATIO_MIN    = 0.50f;    /* 终端可调下限 */
const float    RATIO_MAX    = 10.0f;    /* 终端可调上限 */

/* 当前生效的水米比。键盘改不了它，只有终端命令 r <值> 能改，
 * 改完写 EEPROM（地址 1..4），掉电不丢。 */
float ratio = RATIO_DEF;

/* ---- EEPROM 布局（4 字节对齐） ----
 *   addr 0    : magic 0xA5，不等于它说明从没存过
 *   addr 1..4 : float ratio
 *   addr 5..8 : float waterOffset
 */
#define EE_MAGIC_ADDR 0
#define EE_RATIO_ADDR 1
#define EE_OFF_ADDR   5
#define EE_MAGIC      0xA5
/* 单批加水超时。原来 120 秒太长——加水其实只要 12 秒左右（12 g/s × 144 g），
 * 留 45 秒给慢速和脉冲模式足够了。超时越短，泵空转的时间越短。 */
const uint16_t TIMEOUT_MS   = 45000;
const float    ADJ_STEP     = 5.0f;     /* S5/S6 步进 5g */
const float    ADJ_MAX_OFF  = 200.0f;   /* 水量偏移上下限 ±200g */

const uint16_t SAMPLE_MS    = 200;

/* ---- 泵调速（2026-11-16）----
 * L9110S 的 IA 接在 D11 上，D11 是 PWM 脚，所以可以直接调速 ——
 * 不用开关脉冲，泵持续转但转速低，电流平稳，没有启停冲击。
 * DC 从主板稳压器来，压差大、发热重，低速能把总电流压下来。 */
const uint8_t  PUMP_DUTY      = 100;    /* 运行占空比 0-255，约 39% */
const uint8_t  PUMP_DUTY_KICK = 255;    /* 启动瞬间全速，克服静摩擦 */
const uint16_t PUMP_KICK_MS   = 180;    /* 全速持续多久 */

const float    LEAD_G       = 15.0f;    /* 提前断流量。脉冲模式下余流更大，从 5 提到 15 */
const float    MAX_TOTAL    = 3000.0f;
const float    JUMP_G       = 100.0f;   /* 单次读数跳变超过这个值 = 干扰，丢弃 */

#define LCD_ADDR 0x27

/* ======================= 3. LCD 驱动（PCF8574） =======================
 *  接线：转接板 VCC → 5V，GND → GND，SDA → A4，SCL → A5
 *  板载 PCF8574 位映射：P0=RS P1=RW P2=EN P3=背光 P4..P7=D4..D7
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

/* ======================= 4. 对象与状态 ======================= */

/* TX 脚用 A3(17) 占位，实际只收不发。 */
SoftwareSerial xw(XW_RX, 17);

enum State { S_IDLE, S_FILL, S_SETTLE, S_DONE, S_FAULT };
State state = S_IDLE;

float weightNow   = 0;
float lastGoodW   = 0;   /* 上一个可信读数，用于跳变过滤 */
float riceWeight  = 0;
float targetWater = 0;
float addedWater  = 0;
float flowEst     = 0;
float waterOffset = 0;                  /* S5/S6 微调的 ±5g 偏移 */

bool     riceLocked  = false;           /* S1 锁定米重 */
bool     manualPump  = false;           /* S7/S8 手动泵 */
uint32_t tStart = 0, tSettle = 0, tSample = 0;
char     faultMsg[17] = {0};

uint8_t  lcdPage   = 0;                 /* 0 主页面  1 上一批 */
uint16_t lastRice  = 0;
float    lastWater = 0;
uint8_t  batchNo   = 0;

/* 泵当前方向：1=正转加水  0=停  -1=反转冲管。
 * 初值设成不可能的值，保证 setup 里第一次 pumpOff() 一定会写引脚。 */
int8_t pumpDir = -127;

/* 秤串口缓冲：整行存下来再解析，兼容 "123.45g" / "+0012.3 g" / 无结束符 */
char     xwBuf[24];
uint8_t  xwLen = 0;
uint32_t xwLastMs = 0;                  /* 最近一次收到字节的时间 */
uint32_t xwBytes  = 0;                  /* 累计收到字节数，诊断用 */
uint32_t lastScaleMs = 0;               /* 最近一次成功解析的时间 */
bool     scaleLost = true;              /* 5 秒没解析到数据 = 丢秤 */

const char* stateName();

/* 命令层的前向声明：setup()/loop() 在它们定义之前就要用 */
void cfgSave();
void cfgLoad();
void printStatus();
void runCommand(char* s);
void reportState();
void serialPoll();
void lcdHardReset();

/* ======================= 5. 称重（健壮版解析） ======================= */

/* 秤量程 0–5000 g。超出这个范围的一定是干扰产生的乱码，
 * 绝不能当成真值用（2026-11-16 新增）。 */
const float XW_VALID_MIN = -200.0f;
const float XW_VALID_MAX = 5200.0f;

/* 连续多少次合法读数才更新 weightNow。
 * 干扰产生的乱码通常只出现一两帧，连续 2 帧都对才认。 */
uint8_t xwGoodStreak = 0;
float   xwPending   = 0;

void parseXwLine() {
  xwBuf[xwLen] = 0;

  /* 先做字符级白名单检查：整行只允许 数字 / 负号 / 小数点 / 空格。
   * XW112 发的是 "0123\r\n"，干扰打进来会混入 0x00、0xFF、
   * 或者把 '0' 打成 'P' 之类 —— 这些在 atof 里会静默变成 0 或半个数。 */
  for (uint8_t i = 0; i < xwLen; i++) {
    char c = xwBuf[i];
    if (!((c >= '0' && c <= '9') || c == '-' || c == '.' || c == ' ')) {
      xwLen = 0;
      return;                       /* 整行作废，不更新任何东西 */
    }
  }

  char* p = xwBuf;
  while (*p && !((*p >= '0' && *p <= '9') || *p == '-' || *p == '.')) p++;
  if (!*p) { xwLen = 0; return; }

  float v = (float)atof(p) / XW_SCALE;

  if (v < XW_VALID_MIN || v > XW_VALID_MAX) {
    xwLen = 0;
    return;                         /* 超出量程 = 乱码 */
  }

  /* 两帧确认：上一帧的候选值和这一帧差得远，就先不认，
   * 等下一帧回来对得上再更新。防止单帧乱跳冲过目标量。 */
  if (xwGoodStreak == 0) {
    xwPending = v;
    xwGoodStreak = 1;
  } else if (fabsf(v - xwPending) <= 50.0f) {
    weightNow   = v;                /* 两帧对上了，认 */
    xwPending   = v;
    xwGoodStreak = 2;
    lastScaleMs = millis();
    scaleLost   = false;
  } else {
    xwPending   = v;                /* 差太远，以这一帧为准重新数 */
    xwGoodStreak = 1;
  }

  xwLen = 0;
}

void xwPoll() {
  while (xw.available()) {
    char c = (char)xw.read();
    xwBytes++;
    xwLastMs = millis();
#if XW_RAW_DBG
    Serial.print((uint8_t)c, HEX); Serial.write(' ');
#endif
    if (c == '\r' || c == '\n') {
      if (xwLen) parseXwLine();
    } else {
      if (xwLen < sizeof(xwBuf) - 1) xwBuf[xwLen++] = c;
      else xwLen = 0;                 /* 行太长，丢弃重来 */
    }
  }
  /* 有些秤连续输出不带 \r\n：超过 200ms 没新字符，就把缓冲当一行解析 */
  if (xwLen > 0 && (millis() - xwLastMs) > 200) parseXwLine();

  if (millis() - lastScaleMs > 3000) scaleLost = true;
}

/* ======================= 6. 泵（只在方向变化时写引脚） =======================
 *
 *  泵只在「方向真的变了」的时候才动。重复调用 pumpOn()/pumpOff() 不会
 *  反复拉引脚，避免 I2C 卡顿或串口中断时把泵抖成脉冲。
 *
 *  ---- 泵 · 商家把线接反了 ----------------------------------------------
 *  实际到货：OB → 泵红线，OA → 泵黑线，防呆头插不反，改不了。
 *  所以在这里把逻辑掰回来：
 *    IA=0, IB=1  →  OA 低、OB 高  →  泵红线高、黑线低  →  正转（加水）
 *    IA=1, IB=0  →  OA 高、OB 低  →  泵反转（冲管）
 *  ----------------------------------------------------------------------
 */

/* 当前占空比。255 = 全速，0 = 停。默认全速，
 * runFill 里会临时调低。 */
uint8_t pumpDuty = 255;

void pumpSet(int8_t dir) {
  /* 方向没变且占空比没变 → 不用重写引脚。
   * 但 PWM 下占空比会变，所以要一起比较。 */
  static int8_t  lastDir  = -127;
  static uint8_t lastDuty = 255;
  if (dir == lastDir && pumpDuty == lastDuty) return;
  lastDir  = dir;
  lastDuty = pumpDuty;
  pumpDir  = dir;

  if (dir > 0) {                         /* 正转 = 加水 */
    /* 正转条件是 IA=低、IB=高。IA 在 D11（PWM 脚），
     * 所以对 IA 写反相值：占空比越大 → IA 低的时间越长 → 越快。 */
    analogWrite(PIN_PUMP_A, 255 - pumpDuty);
    digitalWrite(PIN_PUMP_B, HIGH);
  } else if (dir < 0) {                  /* 反转 = 冲管（全速，IB 不是 PWM 脚） */
    digitalWrite(PIN_PUMP_A, HIGH);
    digitalWrite(PIN_PUMP_B, LOW);
  } else {                               /* 停 */
#if PUMP_OFF_BOTH_HIGH
    /* 双高 = 刹车。bootloader 阶段引脚浮空会被干扰成高，
     * 双高下浮空 = 刹车，泵不动；比双低（浮空 = 空转）安全。 */
    analogWrite(PIN_PUMP_A, 255);
    digitalWrite(PIN_PUMP_B, HIGH);
#else
    analogWrite(PIN_PUMP_A, 0);
    digitalWrite(PIN_PUMP_B, LOW);
#endif
  }
}

/* 带占空比的启动：duty 0-255 */
void pumpSetSpeed(uint8_t duty) {
  pumpDuty = duty;
  pumpSet(1);
}

void pumpOn()      { pumpDuty = 255; pumpSet(1); }
void pumpOff()     { pumpSet(0); }
void pumpReverse() { pumpDuty = 255; pumpSet(-1); }

/* ======================= 7. 键盘 ======================= */

const uint8_t ROW_PINS[4] = { KP_R1, KP_R2, KP_R3, KP_R4 };
const uint8_t COL_PINS[4] = { KP_C1, KP_C2, KP_C3, KP_C4 };

/* 键位索引（r*4+c）：
 *   0 1 2 3 = S1 S2 S3 S4  锁定 / 开始 / 急停 / 翻页
 *   4 5 6 7 = S5 S6 S7 S8  +5g / -5g / 手动开泵 / 手动关泵
 *   8..15   = S9–S16 留空
 */
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

/* ======================= 8. 控制 ======================= */

void latchFault(const char* msg) {
  pumpOff();
  manualPump = false;
  state = S_FAULT;
  strncpy(faultMsg, msg, sizeof(faultMsg) - 1);
  faultMsg[sizeof(faultMsg) - 1] = 0;
}

void startBatch() {
  Serial.print(F("[start] state=")); Serial.print((int)state);
  Serial.print(F(" scaleLost=")); Serial.print(scaleLost ? F("YES") : F("no"));
  Serial.print(F(" riceLocked=")); Serial.print(riceLocked ? F("yes") : F("no"));
  Serial.print(F(" riceWeight=")); Serial.print(riceWeight);
  Serial.print(F(" weightNow=")); Serial.println(weightNow);

  if (state == S_FILL) { Serial.println(F("[start] ABORT: already filling")); return; }

  if (scaleLost) { Serial.println(F("[start] ABORT: no scale")); latchFault("no scale"); return; }

  /* 秤自带去皮：碗重已在秤上扣掉。
   * S1 锁定过就用锁定的米重；没锁定就抓当前读数（兜底）。 */
  if (!riceLocked) riceWeight = weightNow;

  targetWater = riceWeight * ratio + waterOffset;
  addedWater  = 0;
  flowEst     = 0;
  tStart      = millis();
  tSample     = millis();
  faultMsg[0] = 0;

  if (riceWeight  < 20.0f)  { Serial.println(F("[start] ABORT: rice <20g")); latchFault("lock rice first"); return; }
  if (targetWater < 10.0f)  { Serial.println(F("[start] ABORT: water <10g")); latchFault("water too low");  return; }

  Serial.println(F("[start] GO -> pump on"));
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

  /* 【2026-11-16】读数跳变过滤：泵干扰会让秤突然跳几十上百克，
   * 这种值不能用，否则 addedWater 一下冲过目标。 */
  if (fabsf(weightNow - lastGoodW) > JUMP_G && lastGoodW > 0.1f) {
    weightNow = lastGoodW;          /* 用上一次的可信值顶上 */
  } else {
    lastGoodW = weightNow;
  }

  addedWater = weightNow - riceWeight;

  /* 【2026-11-16 新增】秤断线立刻停泵。
   * 泵一带负载就把 5V 拉塌，秤的 MCU 掉电后不再发数据，
   * weightNow 停在最后一个值不动 —— addedWater 永远到不了量，
   * 以前只有 30 秒超时能救，那 30 秒里泵一直在空转加水。 */
  if (scaleLost)                                 { latchFault("scale lost"); return; }

  if (now - tStart > TIMEOUT_MS)                 { latchFault("timeout");  return; }
  if (weightNow > MAX_TOTAL)                     { latchFault("overload"); return; }

  /* 【2026-11-16 新增】泵转了 8 秒还没涨 1 g：管路堵了 / 泵空转 / 秤没读数。 */
  if (now - tStart > 8000 && addedWater < 1.0f)  { latchFault("no water"); return; }

  /* 干抽保护已彻底移除（2026-11-15）。
   * 干调试时要靠手动按压 / 手动开泵替代加水，重量本来就不涨，
   * 这条检查会把每一条调试路径都锁死。宁可让它空转，
   * 也不能让机器在你调管路的时候自锁。 */

  float lead = flowEst > 0.5f ? flowEst * (LEAD_G / 12.0f) : LEAD_G;
  if (addedWater >= targetWater - lead) {
    pumpOff();
    tSettle = now;
    state = S_SETTLE;
    return;
  }

  /* 【2026-11-16】低速加水：前 PUMP_KICK_MS 全速起步，之后降到 PUMP_DUTY。
   * 泵持续转、转速低，电流平稳，不会像开关那样反复冲击 5V。 */
  uint8_t want = ((now - tStart) < PUMP_KICK_MS) ? PUMP_DUTY_KICK : PUMP_DUTY;
  if (pumpDuty != want) pumpSetSpeed(want);
}

void runSettle() {
  if (millis() - tSettle < 400) return;
  stopBatch("done");
}

/* ======================= 9. 显示 ======================= */

const char* stateName() {
  switch (state) {
    case S_IDLE:   return "READY";
    case S_FILL:   return "FILL";
    case S_SETTLE: return "SETTLE";
    case S_DONE:   return "DONE";
    default:       return "FAULT";
  }
}

/* 主页面：丢秤 / 手动泵 / 加水中 / 空闲锁定，四种状态各显示各的 */
void showMain() {
  if (scaleLost) {
    lcdAt(0, 0); lcdStr("NO SCALE        ");
    lcdAt(0, 1); lcdStr("wire/mode/baud  ");
    return;
  }

  if (manualPump) {
    lcdAt(0, 0); lcdStr("MANUAL PUMP "); lcdFix(weightNow, 1); lcdStr("g  ");
    lcdAt(0, 1); lcdStr("S8 off  S3 stop ");
    return;
  }

  if (state == S_FILL || state == S_SETTLE) {
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
    return;
  }

  /* IDLE / DONE：锁定状态 + 预期水量 */
  lcdAt(0, 0);
  if (riceLocked) {
    lcdStr("RICE "); lcdNum((long)riceWeight); lcdStr("g LOCK    ");
  } else {
    lcdStr("NOW "); lcdFix(weightNow, 1); lcdStr("g          ");
  }

  lcdAt(0, 1);
  if (riceLocked) {
    long want = (long)(riceWeight * ratio + waterOffset + 0.5f);
    lcdStr("WATER "); lcdNum(want); lcdStr("g");
    if (waterOffset > 0.1f)       { lcdStr(" +"); lcdNum((long)(waterOffset + 0.5f)); }
    else if (waterOffset < -0.1f) { lcdStr(" -"); lcdNum((long)(-waterOffset + 0.5f)); }
    lcdStr("        ");
  } else {
    lcdStr("S1 lock  S2 go     ");
  }
}

/* 第 1 页：上一批记录 */
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
  lcdAt(0, 0);
  lcdStr("FAULT ");
  for (uint8_t i = 0; i < 10 && faultMsg[i]; i++) lcdData((uint8_t)faultMsg[i]);
  lcdStr("     ");

  lcdAt(0, 1);
  lcdStr("S1/S2 clear     ");
}

void updateLcd() {
  static uint32_t tLast = 0;
  if (millis() - tLast < 250) return;
  tLast = millis();

  if (state == S_FAULT) { showFault(); return; }
  if (lcdPage == 1)     { showLast();  return; }
  showMain();
}

/* LCD 硬复位：I2C 转接板被干扰后常出乱码，重新跑一遍初始化序列就能恢复。
 * 顺序：拉低 EN 复位状态 → 走 8 位模式的两次 nibble → 4 位模式 → 显示参数。
 * 比单纯 lcdClear() 强，能救回「上电乱码」这种状态。 */
void lcdHardReset() {
  Wire.begin();
  delay(10);

  /* 手工发 0x30 三次（8 位模式复位序列），每次带一个 EN 脉冲 */
  for (uint8_t i = 0; i < 3; i++) {
    lcdNibble(0x03, 0);
    delay(5);
  }
  lcdNibble(0x02, 0);          /* 切 4 位模式 */
  delay(1);

  lcdCmd(0x28);                /* 4 位 / 2 行 / 5x8 */
  delay(1);
  lcdCmd(0x0C);                /* 显示开，光标关 */
  delay(1);
  lcdCmd(0x06);                /* 输入模式：右移 */
  delay(1);
  lcdClear();

  Serial.println(F("[lcd] hard reset"));
}

/* ======================= 10. 按键（S1–S8 新映射） ======================= */

void handleKey(uint8_t k) {
  /* S3 急停：任何时候都有效，优先级最高 */
  if (k == 2) {
    pumpOff();
    manualPump = false;
    if (state == S_FILL || state == S_SETTLE) latchFault("key stop");
    return;
  }

  /* S8 手动关泵：任何时候都有效。
   * 泵转着的时候你得能关掉它——被状态机挡着是设计错误。
   * 只关泵、不改状态机，正在加水就让它继续（水满了自己会停）。 */
  if (k == 7) {
    pumpOff();
    manualPump = false;
    /* 【2026-11-16】故障态下 S8 顺手把故障清掉回 IDLE。
     * 原来只关泵不改状态，卡在 FAULT 里得再按 S1，实机上很别扭。 */
    if (state == S_FAULT) {
      state = S_IDLE;
      faultMsg[0] = 0;
      lcdPage = 0;
    }
    return;
  }

  /* S4 翻页：主页面 ↔ 上一批 */
  if (k == 3) {
    lcdPage = (uint8_t)((lcdPage + 1) % 2);
    lcdClear();
    return;
  }

  /* S16 重启 LCD：任何时候都有效（加水途中乱码也能按），优先级仅次于急停 */
  if (k == 15) {
    lcdHardReset();
    return;
  }

  /* 故障态：S1 清故障回到待机；S2/S9 清故障并直接重试启动（避免按了没反应）
   * S9 是 S2 的备用键（D7/C2 列断线时用，S2/S6/S10/S14 都在那一列） */
  if (state == S_FAULT) {
    if (k == 0) {                        /* S1 清故障 */
      state = S_IDLE;
      faultMsg[0] = 0;
      lcdPage = 0;
    } else if (k == 1 || k == 8) {       /* S2 / S9 清故障 + 启动 */
      state = S_IDLE;
      faultMsg[0] = 0;
      lcdPage = 0;
      manualPump = false;
      startBatch();
    }
    return;
  }

  /* 加水 / 沉降中：S7 在这个状态下当「停泵」用（2026-11-16 改）。
   * 原来这里直接 return，S7 按了没反应 —— 主人在实机上就是这么卡的。
   * 现在按 S7 = 停泵 + 停在加水态，再按 S2 继续或按 S1 重置。 */
  if (state == S_FILL || state == S_SETTLE) {
    if (k == 6) {                       /* S7 */
      pumpOff();
      manualPump = false;
      latchFault("key stop");
    }
    return;
  }

  /* 以下只在 IDLE / DONE 状态生效 */
  switch (k) {
    case 0:                              /* S1 锁定 / 解锁米重 */
      riceLocked = !riceLocked;
      if (riceLocked) riceWeight = weightNow;
      break;

    case 1:                              /* S2 开始 */
    case 8:                              /* S9 = S2 备用键（D7/C2 列断线时用） */
      manualPump = false;
      startBatch();
      break;

    case 4:                              /* S5 目标水量 +5g */
      waterOffset += ADJ_STEP;
      if (waterOffset > ADJ_MAX_OFF) waterOffset = ADJ_MAX_OFF;
      break;

    case 5:                              /* S6 目标水量 -5g */
    case 12:                             /* S13 = S6 备用键（D7/C2 列断线时用） */
      waterOffset -= ADJ_STEP;
      if (waterOffset < -ADJ_MAX_OFF) waterOffset = -ADJ_MAX_OFF;
      break;

    case 6:                              /* S7 手动开泵（排空气 / 冲管） */
      pumpOn();
      manualPump = true;
      break;

    default: break;                      /* S8 已在函数开头处理；S9–S14 留空 */
  }
}

/* ======================= 11. setup / loop ======================= */

void setup() {
  /* 第一件事就把泵钉死，别让它在后面初始化外设时乱转。
   * pumpDir 初值 = -127，所以这里一定会真的写一次引脚。 */
  pinMode(PIN_PUMP_A, OUTPUT);
  pinMode(PIN_PUMP_B, OUTPUT);
  pumpOff();

  Serial.begin(115200);
  Serial.println(F("\n=== RiceMix UNO v4 ==="));
  Serial.println(F("[diag] open serial @115200, watch [diag] lines every 2s"));

  cfgLoad();                          /* 比例和偏移从 EEPROM 恢复 */
  Serial.print(F("[cfg] ratio=")); Serial.print(ratio, 2);
  Serial.print(F(" offset="));     Serial.println(waterOffset, 1);

  for (uint8_t i = 0; i < 4; i++) pinMode(ROW_PINS[i], INPUT_PULLUP);
  for (uint8_t i = 0; i < 4; i++) pinMode(COL_PINS[i], INPUT_PULLUP);

  lcdBegin();
  lcdAt(0, 0);  lcdStr("RiceMix UNO");
  lcdAt(0, 1);  lcdStr("S1 lock rice");

  xw.begin(XW_BAUD);
  Serial.print(F("[xw] ")); Serial.print(XW_BAUD); Serial.println(F(" 8N1 on D10"));
  Serial.println(F("[lcd] PCF8574 @0x27"));

  delay(1500);
  lcdClear();
}

/* ======================= 11. EEPROM 与终端命令 =======================
 *
 *  协议：一行一条，\r 或 \n 结束，大小写不敏感，参数用空格分隔。
 *
 *  电脑 → UNO
 *    r?  / status          查全部状态
 *    r 1.35                设比例（钳 0.5–10）
 *    off +5 / off -5       水量偏移（同 S5 / S6）
 *    off 0                 偏移清零
 *    lock                  锁定米重（同 S1）
 *    unlock                解锁
 *    go                    开始（同 S2）
 *    stop                  急停（同 S3，任何状态生效）
 *    pump on|off|rev       手动泵
 *    save                  存 EEPROM
 *    reset                 恢复出厂并清 EEPROM
 *
 *  UNO → 电脑
 *    OK ...                命令成功
 *    ERR ...               命令失败
 *    STATE ...             每 500 ms 或状态变化时一行
 *    DONE ...              一批结束
 *    FAULT ...             故障
 *    [diag] / [start] …    调试信息，前端忽略
 */

void cfgSave() {
  EEPROM.put(EE_MAGIC_ADDR, (uint8_t)EE_MAGIC);
  EEPROM.put(EE_RATIO_ADDR, ratio);
  EEPROM.put(EE_OFF_ADDR,   waterOffset);
}

void cfgLoad() {
  uint8_t magic = EEPROM.read(EE_MAGIC_ADDR);
  if (magic != EE_MAGIC) return;                 /* 从没存过，用默认 */
  EEPROM.get(EE_RATIO_ADDR, ratio);
  EEPROM.get(EE_OFF_ADDR,   waterOffset);
  if (ratio < RATIO_MIN || ratio > RATIO_MAX) ratio = RATIO_DEF;
  if (waterOffset > ADJ_MAX_OFF)  waterOffset = ADJ_MAX_OFF;
  if (waterOffset < -ADJ_MAX_OFF) waterOffset = -ADJ_MAX_OFF;
}

void printStatus() {
  Serial.print(F("OK ratio="));   Serial.print(ratio, 2);
  Serial.print(F(" offset="));    Serial.print(waterOffset, 1);
  Serial.print(F(" rice="));      Serial.print(riceWeight, 1);
  Serial.print(F(" locked="));    Serial.print(riceLocked ? 1 : 0);
  Serial.print(F(" state="));     Serial.print(stateName());
  Serial.print(F(" weight="));    Serial.print(weightNow, 1);
  Serial.print(F(" flow="));      Serial.print(flowEst, 1);
  Serial.print(F(" target="));    Serial.print(targetWater, 1);
  Serial.print(F(" scale="));     Serial.println(scaleLost ? 0 : 1);
}

/* 终端与键盘共用同一套底层函数，天然互斥，不需要额外加锁 */
void runCommand(char* s) {
  for (char* p = s; *p; p++) if (*p >= 'A' && *p <= 'Z') *p = (char)(*p + 32);

  if (!strcmp(s, "r?") || !strcmp(s, "status") || !strcmp(s, "")) {
    printStatus(); return;
  }

  if (!strncmp(s, "r ", 2)) {
    float v = (float)atof(s + 2);
    if (v < RATIO_MIN || v > RATIO_MAX) { Serial.println(F("ERR range")); return; }
    ratio = v;
    cfgSave();
    Serial.print(F("OK ratio=")); Serial.println(ratio, 2);
    return;
  }

  if (!strncmp(s, "off ", 4)) {
    float v = (float)atof(s + 4);
    waterOffset = v;
    if (waterOffset > ADJ_MAX_OFF)  waterOffset = ADJ_MAX_OFF;
    if (waterOffset < -ADJ_MAX_OFF) waterOffset = -ADJ_MAX_OFF;
    cfgSave();
    Serial.print(F("OK offset=")); Serial.println(waterOffset, 1);
    return;
  }

  if (!strcmp(s, "lock")) {
    riceLocked = true;
    riceWeight = weightNow;
    Serial.print(F("OK rice=")); Serial.print(riceWeight, 1);
    Serial.print(F(" target=")); Serial.println(riceWeight * ratio + waterOffset, 1);
    return;
  }

  if (!strcmp(s, "unlock")) {
    riceLocked = false;
    Serial.println(F("OK unlocked"));
    return;
  }

  if (!strcmp(s, "go")) { startBatch(); return; }
  if (!strcmp(s, "stop")) {
    pumpOff();
    manualPump = false;
    if (state == S_FILL || state == S_SETTLE) latchFault("serial stop");
    Serial.println(F("OK STOPPED"));
    return;
  }

  if (!strcmp(s, "pump on"))  { pumpOn();      manualPump = true;  Serial.println(F("OK pump on"));  return; }
  if (!strcmp(s, "pump off")) { pumpOff();     manualPump = false; Serial.println(F("OK pump off")); return; }
  if (!strcmp(s, "pump rev")) { pumpReverse(); manualPump = true;  Serial.println(F("OK pump rev")); return; }

  if (!strcmp(s, "save"))  { cfgSave(); Serial.println(F("OK saved")); return; }
  if (!strcmp(s, "reset")) {
    ratio = RATIO_DEF;
    waterOffset = 0;
    cfgSave();
    Serial.println(F("OK reset"));
    return;
  }

  /* clear = 清空状态机回待机。和 reset 不是一回事：
   * reset 把比例/偏移恢复出厂并存 EEPROM；
   * clear 只把这一批的账清掉，参数不动。
   * 配料完成（DONE）、出故障（FAULT）、或者只是想重新来一遍，都用它。 */
  if (!strcmp(s, "clear")) {
    if (state == S_FILL || state == S_SETTLE) {
      pumpOff();
      manualPump = false;
      Serial.println(F("ERR busy - stop first"));
      return;
    }
    pumpOff();
    manualPump   = false;
    state        = S_IDLE;
    addedWater   = 0;
    targetWater  = 0;
    flowEst      = 0;
    faultMsg[0]  = 0;
    lcdPage      = 0;
    tStart       = millis();
    lcdClear();
    Serial.println(F("OK cleared"));
    return;
  }

  Serial.print(F("ERR unknown ")); Serial.println(s);
}

/* 主动上报：状态变了立刻发，否则 500 ms 一发 */
void reportState() {
  static State    lastState = S_IDLE;
  static uint32_t tRep = 0;
  uint32_t now = millis();
  bool changed = (state != lastState);
  if (!changed && now - tRep < 500) return;

  tRep = now;
  if (changed) {
    lastState = state;
    if (state == S_DONE) {
      Serial.print(F("DONE batch=")); Serial.print(batchNo);
      Serial.print(F(" rice="));      Serial.print(lastRice);
      Serial.print(F(" water="));     Serial.println(lastWater, 1);
      return;
    }
    if (state == S_FAULT) {
      Serial.print(F("FAULT ")); Serial.println(faultMsg);
      return;
    }
  }

  Serial.print(F("STATE "));       Serial.print(stateName());
  Serial.print(F(" added="));      Serial.print(addedWater, 1);
  /* target 实时算，不用 targetWater——那个变量只在 startBatch() 里赋值，
   * 锁定米重之后它还是旧值（甚至 0），网页就永远看不到目标更新。 */
  Serial.print(F(" target="));     Serial.print(riceWeight * ratio + waterOffset, 1);
  Serial.print(F(" rice="));       Serial.print(riceWeight, 1);
  Serial.print(F(" locked="));     Serial.print(riceLocked ? 1 : 0);
  Serial.print(F(" offset="));     Serial.print(waterOffset, 1);
  Serial.print(F(" ratio="));      Serial.print(ratio, 2);
  Serial.print(F(" flow="));       Serial.print(flowEst, 1);
  Serial.print(F(" weight="));     Serial.println(weightNow, 1);
}

/* 串口手动试泵：a = 反转(IA=H IB=L)，b = 正转(IA=L IB=H)，x = 停
 * l = 双低，h = 双高 —— 用来现场确认哪种电平组合能让泵停。
 * l/h 直接写引脚并把 pumpDir 标脏，下次 pumpSet 会强制重同步。 */
void serialPoll() {
  static char    buf[48];
  static uint8_t len = 0;

  while (Serial.available()) {
    char c = (char)Serial.read();

    if (c == '\r' || c == '\n') {
      if (len) {
        buf[len] = 0;

        /* 单字符试泵命令：只有整行恰好一个字符时才算。
         * 否则 "lock" 的 l 会被当成「双低」吃掉，剩下 "ock" 报 unknown，
         * "unlock" 同理——这条曾经让锁定米重整个失效。 */
        if (len == 1 && strchr("abxlh", buf[0])) {
          if (buf[0] == 'a') {
            pumpSet(-1);
            Serial.println(F("[pump] IA=H IB=L (reverse)"));
          } else if (buf[0] == 'b') {
            pumpSet(1);
            Serial.println(F("[pump] IA=L IB=H (forward)"));
          } else if (buf[0] == 'x') {
            pumpSet(0);
            Serial.println(F("[pump] off"));
          } else if (buf[0] == 'l') {
            digitalWrite(PIN_PUMP_A, LOW);
            digitalWrite(PIN_PUMP_B, LOW);
            pumpDir = -127;
            Serial.println(F("[pump] both LOW"));
          } else {
            digitalWrite(PIN_PUMP_A, HIGH);
            digitalWrite(PIN_PUMP_B, HIGH);
            pumpDir = -127;
            Serial.println(F("[pump] both HIGH"));
          }
        } else {
          runCommand(buf);
        }
        len = 0;
      }
    } else if (len < sizeof(buf) - 1) {
      buf[len++] = c;
    } else {
      len = 0;                       /* 一行太长，丢掉重来 */
    }
  }
}

void loop() {
  serialPoll();
  xwPoll();
  updateLcd();
  reportState();

  if (state == S_FILL)   runFill();
  if (state == S_SETTLE) runSettle();

  /* 手动泵也受超重保护 */
  if (manualPump && !scaleLost && weightNow > MAX_TOTAL) {
    pumpOff();
    manualPump = false;
    latchFault("overload");
  }

  /* 诊断输出：每 2 秒一行，看秤到底有没有字节进来 */
  static uint32_t tDiag = 0;
  if (millis() - tDiag > 2000) {
    tDiag = millis();
    Serial.print(F("[diag] bytes="));
    Serial.print(xwBytes);
    Serial.print(F(" weight="));
    Serial.print(weightNow);
    Serial.print(F(" scaleLost="));
    Serial.println(scaleLost ? F("YES") : F("no"));
  }

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
