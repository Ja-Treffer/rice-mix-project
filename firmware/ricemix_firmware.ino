/* =====================================================================
 *  RiceMix — 继电器驱动式闭环米水配比控制器
 *  硬件：Arduino Uno R3 + HX711(5kg 悬臂梁) + 单路光耦继电器 + 12V 直流水泵
 *
 *  核心机制（闭环，不依赖"流量恒定"）：
 *    1) 称出容器内米重 -> 按米水比算出目标加水量 targetWater
 *    2) 开泵，每 200ms 读一次总重，实时算已加水量
 *    3) 用实测流量提前断流（管内有残流，关早了不够、关晚了就溢）
 *    4) 回稳后复核，不够就补泵（最多 3 次）
 *    5) 三重保险：注水超时 / 干抽检测 / 总重上限
 *
 *  「可编辑配重代表多少米」：
 *    传感器读到的物理配重(g) 与 它代表的米量(g) 用一条过原点直线映射：
 *        riceGrams = 配重(g) × (portionRice / portionWeight)
 *    两个参数都能用串口现场改，SAVE 存进 EEPROM 掉电不丢。
 *    例：SET PORTION 100 150  ->  100g 配重(量杯/砝码/一袋米) 代表 150g 米
 *    例：SET PORTION 200 200  ->  1:1 直读
 *
 *  串口命令一览（波特率 9600，行尾 \n）：
 *    HELP                      打印命令表
 *    STATUS                    打印当前状态与全部参数
 *    SET PORTION <w> <rice>    改「配重 w 克代表 rice 克米」
 *    SET RATIO <x>             改米水比（1.2 = 1 斤米 1.2 斤水）
 *    SET TIMEOUT <ms>          注水超时（防溢水保险）
 *    SET MINRICE <g>           最小识米量（防噪声误触发）
 *    SET MAXTOTAL <g>          总重上限（二级溢出保护）
 *    SET FLOW <g/s>            泵的预估流量（仅为提前断流的初值，运行中会被实测覆盖）
 *    SET LEAD <ms>             停泵余流延迟（管子里的水不会立刻停）
 *    SET TRIG <0|1>            继电器触发电平 0=LOW 1=HIGH
 *    CAL <已知克数>            用已知重量的东西标定 HX711 比例系数
 *    ZERO                      去皮（把当前读数当 0）
 *    MANUAL <米克数>           跳过称重，直接按指定米量开始一次配比
 *    SIM <克数>                进入软件模拟称重（无硬件也能跑逻辑）
 *    SIMOFF                    退出模拟，回到真实 HX711
 *    RUN / STOP                放行 / 急停
 *    SAVE                      参数写 EEPROM
 *    LOAD                      从 EEPROM 读参数
 *    RESETCFG                  参数恢复出厂值
 *    PRESET <0-7>              直接切到第 N 档配方（键盘也能切）
 *    RECIPES                   列出全部 8 档配方
 *
 *  4x4 矩阵键盘（行 D2-D5 / 列 D6,D7,D9,D10）：
 *    行0  东北米 泰国米 软饭 烂饭      行1  稠粥 稀饭 自定义A 自定义B
 *    行2  启动   停止   去皮 状态      行3  校准 手动加水100g 存参数 恢复出厂
 *    短按选配方，LED 闪 (档号+1) 次确认；长按模式键 800ms = 把当前参数存进该档
 * ===================================================================== */

#include <HX711.h>
#include <EEPROM.h>

/* ---------------- 1. 引脚 ---------------- */
#define PIN_HX_DT   A1
#define PIN_HX_SCK  A0
#define PIN_PUMP    8
#define PIN_LED     13

/* 4x4 矩阵键盘：行线 4 根（扫描时逐个拉低），列线 4 根（上拉读低） */
#define KP_N        4
const uint8_t KP_ROWS[KP_N] = { 2, 3, 4, 5 };
const uint8_t KP_COLS[KP_N] = { 6, 7, 9, 10 };

/* ---------------- 2. 出厂默认值（这里就是"简单编辑"区） ---------------- */
#define CFG_ADDR      0
#define CFG_MAGIC     0xA5C3
#define CFG_VERSION   2

struct __attribute__((packed)) Config {
  uint16_t magic;
  uint16_t version;
  float    calFactor;      // HX711 比例系数 counts/g（CAL 命令自动算）
  float    ratio;          // 米水比
  float    portionWeight;  // 配重：物理重量 g
  float    portionRice;    // 配重：代表米量 g
  uint32_t timeoutMs;      // 注水超时
  float    minRice;        // 最小识米量 g
  float    maxTotal;       // 总重上限 g
  float    estFlow;        // 预估流量 g/s
  uint16_t leadMs;         // 停泵余流延迟 ms
  uint8_t  trigLevel;      // 0=LOW 1=HIGH
  uint8_t  presetIdx;      // 当前配方档位 0..7
  uint16_t crc;
};

Config cfg;
HX711  scale;

/* ---------------- 2b. 配方表：这就是"产品配方"，改这里就是改产品 ----------------
 * 每一档存一组参数，不是一个数字 —— 因为米水比一变大，注水时间就变长，
 * 20 秒固定超时会在半路把稀饭掐断（1:9 配 100g 米要 900g 水，75 秒）。
 * ratio 是重量比；timeoutMs 必须 >= 目标水量 / 实测流量 × 1.8；
 * maxTotal 是总重上限（含容器自重），防溢水。 */
struct Recipe {
  float    ratio;
  uint32_t timeoutMs;
  float    maxTotal;
};

Recipe recipes[8] = {
  { 1.20,  25000UL, 3000 },   // 0 东北米：圆粒粳米，标准饭，水刚好被吸干
  { 1.10,  25000UL, 3000 },   // 1 泰国米：长粒籼米，偏干一点才粒粒分明
  { 2.00,  35000UL, 4000 },   // 2 软饭：煲仔饭底那种，不是稀饭
  { 3.00,  45000UL, 5000 },   // 3 烂饭：给老人小孩的糊状饭
  { 6.00,  75000UL, 6000 },   // 4 稠粥：米开花，还有流动的汤
  { 9.00, 100000UL, 8000 },   // 5 稀饭：米汤占大半
  { 1.20,  25000UL, 3000 },   // 6 自定义 A（长按该键写入当前参数）
  { 1.20,  25000UL, 3000 },   // 7 自定义 B
};

const char* const RECIPE_NAME[8] = {
  "东北米 1:1.20", "泰国米 1:1.10", "软饭 1:2.00",  "烂饭 1:3.00",
  "稠粥 1:6.00",   "稀饭 1:9.00",   "自定义A",      "自定义B"
};

/* ---------------- 3. 运行时状态 ---------------- */
enum State { S_IDLE, S_FILL, S_SETTLE, S_FAULT };
const char* stateName[] = { "IDLE", "FILL", "SETTLE", "FAULT" };

const uint16_t SAMPLE_MS   = 200;   // 采样周期
const uint16_t DRY_CHECK_MS = 3000; // 开泵后多久没有增重就判干抽
const uint8_t  MAX_TOPUPS  = 3;     // 最多补泵次数
const float    TOPUP_TOL   = 1.5;   // 补泵容差 g

State    state = S_IDLE;
bool     runEnabled = true;   // RUN/STOP 放行
bool     simMode    = false;  // 软件模拟称重
float    simWeight  = 0.0;    // 模拟读数
float    tareOffset = 0.0;    // 软件去皮偏移

float    riceGrams     = 0;   // 本轮米量
float    targetWater   = 0;   // 目标加水量
float    startTotal    = 0;   // 开泵时基准重量
float    addedWater    = 0;   // 已加水量
float    flowEst       = 0;   // 实测流量 g/s
uint8_t  topups        = 0;
uint32_t tSample = 0, tFillStart = 0, tSettle = 0;

char     cmdBuf[40];
uint8_t  cmdLen = 0;

/* ---------------- 4. 配置校验与存取 ---------------- */
uint16_t cfgCrc(const Config &c) {
  const uint8_t *p = (const uint8_t*)&c;
  uint16_t s = 0x1234;
  for (size_t i = 0; i < sizeof(Config) - sizeof(c.crc); i++) {
    s = (uint16_t)((s + p[i]) * 31u + 7u);
  }
  return s;
}

void cfgDefault() {
  cfg.magic         = CFG_MAGIC;
  cfg.version       = CFG_VERSION;
  cfg.calFactor     = 420.0;    // 常见 5kg 悬臂梁在 HX711 通道 A/gain128 下的量级，必须用 CAL 现场标定
  cfg.ratio         = 1.20;     // 100g 米 -> 120g 水
  cfg.portionWeight = 100.0;    // 默认：100g 配重
  cfg.portionRice   = 100.0;    // 代表 100g 米（1:1 直读）
  cfg.timeoutMs     = 20000UL;
  cfg.minRice       = 20.0;
  cfg.maxTotal      = 3000.0;
  cfg.estFlow       = 12.0;     // 常见 12V 小泵 10~15 g/s 量级，仅作初值
  cfg.leadMs        = 200;
  cfg.trigLevel     = 1;
  cfg.presetIdx     = 0;      // 默认第 0 档：东北米 1:1.2
  cfg.crc           = cfgCrc(cfg);
}

void cfgSave() {
  cfg.magic   = CFG_MAGIC;
  cfg.version = CFG_VERSION;
  cfg.crc     = cfgCrc(cfg);
  EEPROM.put(CFG_ADDR, cfg);
}

bool cfgLoad() {
  EEPROM.get(CFG_ADDR, cfg);
  if (cfg.magic != CFG_MAGIC || cfg.version != CFG_VERSION) return false;
  if (cfg.crc != cfgCrc(cfg)) return false;
  if (cfg.portionWeight <= 1.0 || cfg.portionRice <= 0.0) return false;
  /* 下界放到 0.001：Wokwi 的 HX711 量程 0-2100 @5kg，标定出来正好 0.42 counts/g */
  if (cfg.calFactor < 0.001 || cfg.calFactor > 100000.0) return false;
  if (cfg.presetIdx > 7) return false;
  return true;
}

/* ---------------- 5. 称重与配重映射 ---------------- */
float rawWeight() {
  if (simMode) return simWeight;
  return scale.get_units(3);          // 库内已按 calFactor 换算成克
}

float readWeight() {
  return rawWeight() - tareOffset;
}

// 配重(g) -> 米量(g)：过原点直线，斜率由「多少配重代表多少米」决定
float weightToRice(float w) {
  if (w <= 0.0) return 0.0;
  return w * (cfg.portionRice / cfg.portionWeight);
}

/* ---------------- 6. 泵控制 ---------------- */
void pumpOn() {
  digitalWrite(PIN_PUMP, cfg.trigLevel ? HIGH : LOW);
  digitalWrite(PIN_LED, HIGH);
}

void pumpOff() {
  digitalWrite(PIN_PUMP, cfg.trigLevel ? LOW : HIGH);
  digitalWrite(PIN_LED, LOW);
}

void fault(const char* why) {
  pumpOff();
  state = S_FAULT;
  Serial.print("!! FAULT: ");
  Serial.println(why);
  Serial.println("   已强制停泵。修好后发 STOP 再发 RUN 复位。");
}

/* ---------------- 6b. 4x4 键盘：扫描、消抖、长短按 ---------------- */
void startCycle(float rice, float baseWeight);   // 前向声明，按键要用

void kpInit() {
  for (uint8_t i = 0; i < KP_N; i++) {
    pinMode(KP_ROWS[i], INPUT);
    pinMode(KP_COLS[i], INPUT_PULLUP);
  }
}

/* 逐个把一行拉低，看哪一列被拉低；没键返回 255 */
uint8_t kpScan() {
  for (uint8_t r = 0; r < KP_N; r++) {
    for (uint8_t i = 0; i < KP_N; i++) pinMode(KP_ROWS[i], (i == r) ? OUTPUT : INPUT);
    digitalWrite(KP_ROWS[r], LOW);
    delayMicroseconds(30);
    for (uint8_t c = 0; c < KP_N; c++) {
      if (digitalRead(KP_COLS[c]) == LOW) {
        for (uint8_t i = 0; i < KP_N; i++) pinMode(KP_ROWS[i], INPUT);
        return (uint8_t)(r * KP_N + c);
      }
    }
  }
  for (uint8_t i = 0; i < KP_N; i++) pinMode(KP_ROWS[i], INPUT);
  return 255;
}

uint8_t  keyEvent = 255, keyHold = 255;
uint8_t  kpSeen = 255, kpStable = 255;
uint32_t kpChangeMs = 0, kpDownMs = 0;
bool     kpLongDone = false;

void pollKeypad() {
  uint8_t v = kpScan();
  if (v != kpSeen) { kpSeen = v; kpChangeMs = millis(); return; }
  if (v == kpStable) return;
  if (millis() - kpChangeMs < 20) return;          // 20ms 消抖
  kpStable = v;
  if (v == 255) { kpLongDone = false; return; }    // 松开
  if (state != S_IDLE && v != 9) return;           // 注水途中只放行「停止」
  keyEvent   = v;
  kpDownMs   = millis();
  kpLongDone = false;
}

void pollKeyHold() {
  if (kpStable == 255 || kpLongDone) return;
  if (millis() - kpDownMs < 800) return;
  kpLongDone = true;
  if (state == S_IDLE) keyHold = kpStable;
}

void flashLed(uint8_t n) {
  for (uint8_t i = 0; i < n; i++) {
    digitalWrite(PIN_LED, HIGH); delay(110);
    digitalWrite(PIN_LED, LOW);  delay(160);
  }
}

void applyRecipe(uint8_t i) {
  if (i >= 8) { Serial.println(F("档位 0-7")); return; }
  cfg.presetIdx = i;
  cfg.ratio     = recipes[i].ratio;
  cfg.timeoutMs = recipes[i].timeoutMs;
  cfg.maxTotal  = recipes[i].maxTotal;
  Serial.print(F("模式 ")); Serial.print(i); Serial.print(F("  "));
  Serial.print(RECIPE_NAME[i]);
  Serial.print(F("  -> 1:")); Serial.print(cfg.ratio, 2);
  Serial.print(F("  超时 ")); Serial.print(cfg.timeoutMs / 1000UL); Serial.println(F(" s"));
  flashLed((uint8_t)(i + 1));
  cfgSave();
}

void saveRecipe(uint8_t i) {
  if (i >= 8) return;
  recipes[i].ratio     = cfg.ratio;
  recipes[i].timeoutMs = cfg.timeoutMs;
  recipes[i].maxTotal  = cfg.maxTotal;
  cfg.presetIdx = i;
  cfgSave();
  Serial.print(F("已把当前参数写进档位 ")); Serial.print(i);
  Serial.print(F("  ")); Serial.println(RECIPE_NAME[i]);
  flashLed(3);
}

void doKey(uint8_t k) {
  Serial.print(F("[KEY] ")); Serial.print(k); Serial.print(F("  "));
  if (k < 8) { Serial.println(RECIPE_NAME[k]); applyRecipe(k); return; }
  switch (k) {
    case 8: {   // 启动
      runEnabled = true;
      if (state == S_FAULT) { state = S_IDLE; Serial.println(F("已复位 FAULT")); break; }
      float w = readWeight();
      float rice = weightToRice(w);
      if (rice < cfg.minRice) { Serial.println(F("米量不够，先投米")); flashLed(2); break; }
      Serial.println(F("手动启动"));
      startCycle(rice, w);
      break;
    }
    case 9:     // 停止
      runEnabled = false; pumpOff(); state = S_IDLE;
      Serial.println(F("急停"));
      break;
    case 10:    // 去皮（只在待机时允许，注水中改基准会算错目标）
      if (state != S_IDLE) { Serial.println(F("[tare] busy, stop first")); break; }
      tareOffset = rawWeight();
      Serial.print(F("已去皮，当前 ")); Serial.print(readWeight(), 1); Serial.println(F(" g"));
      flashLed(1);
      break;
    case 11:    // 状态
      Serial.print(F("状态 ")); Serial.print(stateName[state]);
      Serial.print(F("  总重 ")); Serial.print(readWeight(), 1);
      Serial.print(F(" g  米 ")); Serial.print(weightToRice(readWeight()), 1);
      Serial.print(F(" g  档 ")); Serial.print(cfg.presetIdx);
      Serial.print(F(" 1:")); Serial.println(cfg.ratio, 2);
      break;
    case 12: {  // 校准：放 500g 标准重物
      Serial.println(F("3 秒后按 500 g 标定，请先把 500 g 重物放上去…"));
      delay(3000);
      float raw = rawWeight();
      if (raw < 50.0) { Serial.println(F("读数太小，标定取消")); flashLed(2); break; }
      cfg.calFactor = cfg.calFactor * 500.0 / raw;
      scale.set_scale(cfg.calFactor);
      cfgSave();
      Serial.print(F("calFactor -> ")); Serial.println(cfg.calFactor, 3);
      flashLed(2);
      break;
    }
    case 13: {  // 手动加水 100 g（测泵、测余流用）
      Serial.println(F("手动加水 100 g…"));
      float w0 = readWeight();
      uint32_t t0 = millis();
      pumpOn();
      while (millis() - t0 < 20000UL) {
        if (readWeight() - w0 >= 100.0) break;
        delay(20);
      }
      pumpOff();
      Serial.print(F("实际加了 ")); Serial.print(readWeight() - w0, 1); Serial.println(F(" g"));
      break;
    }
    case 14:    // 存参数到当前档
      saveRecipe(cfg.presetIdx);
      break;
    case 15:    // 恢复出厂
      cfgDefault(); cfgSave();
      Serial.println(F("已恢复出厂，档位 0"));
      flashLed(4);
      break;
  }
}

void onKeyHold(uint8_t k) {
  if (k < 8) saveRecipe(k);
  else Serial.println(F("长按只对模式键有效"));
}

/* ---------------- 7. 一轮配比 ---------------- */
void startCycle(float rice, float baseWeight) {
  riceGrams   = rice;
  targetWater = rice * cfg.ratio;
  startTotal  = baseWeight;
  addedWater  = 0;
  topups      = 0;
  flowEst     = cfg.estFlow;
  tFillStart  = millis();
  tSample     = millis();
  Serial.println(F("--------------------------------------------------"));
  Serial.print(F("米量 rice      = ")); Serial.print(riceGrams, 1);   Serial.println(F(" g"));
  Serial.print(F("目标水 water   = ")); Serial.print(targetWater, 1); Serial.println(F(" g"));
  Serial.print(F("配重映射       = ")); Serial.print(cfg.portionWeight, 0); Serial.print(F(" g 配重 -> "));
  Serial.print(cfg.portionRice, 0); Serial.println(F(" g 米"));
  pumpOn();
  state = S_FILL;
  tFillStart = millis();
}

void finishCycle() {
  pumpOff();
  Serial.print(F("== 完成：加水 ")); Serial.print(addedWater, 1);
  Serial.print(F(" g / 目标 "));      Serial.print(targetWater, 1);
  Serial.print(F(" g，误差 "));       Serial.print(addedWater - targetWater, 1); Serial.println(F(" g"));
  Serial.print(F("== 耗时 "));        Serial.print(millis() - tFillStart);
  Serial.print(F(" ms，补泵 "));      Serial.print(topups); Serial.println(F(" 次"));
  Serial.println(F("--------------------------------------------------"));
  state = S_IDLE;
  // 交出一轮后自动去皮，等下一次投料
  tareOffset = rawWeight();
  Serial.println(F("已去皮，等待下次投米..."));
}

/* 实测流量：两次采样之间的增量 / 时间 */
void updateFlow(float w) {
  static float    lastW = 0;
  static uint32_t lastT = 0;
  uint32_t now = millis();
  if (lastT != 0) {
    uint32_t dt = now - lastT;
    if (dt >= 50) {
      float inst = (w - lastW) * 1000.0 / (float)dt;
      if (inst < 0) inst = 0;                       // 重量下降视为噪声，不计负流量
      if (inst > cfg.estFlow * 4.0) inst = cfg.estFlow * 4.0;  // 限幅，防抖动炸表
      flowEst = flowEst * 0.7 + inst * 0.3;          // 一阶低通
    }
  }
  lastW = w;
  lastT = now;
}

/* ---------------- 8. 状态机 ---------------- */
void stepIdle() {
  if (millis() - tSample < SAMPLE_MS) return;
  tSample = millis();
  float w = readWeight();
  float rice = weightToRice(w);
  if (rice < cfg.minRice) return;         // 没投料或已取出

  if (!runEnabled) {
    Serial.print(F("[PAUSE] 检测到 ")); Serial.print(rice, 1);
    Serial.println(F(" g 米，但 STOP 状态未放行"));
    return;
  }
  startCycle(rice, w);
}

void stepFill() {
  if (millis() - tSample < SAMPLE_MS) return;
  tSample = millis();

  float w = readWeight();
  addedWater = w - startTotal;
  updateFlow(w);
  uint32_t elapsed = millis() - tFillStart;

  /* 保险 1：超时 */
  if (elapsed > cfg.timeoutMs) { fault("TIMEOUT 注水超时"); return; }
  /* 保险 2：总重上限 */
  if (w > cfg.maxTotal)        { fault("OVERFLOW 超过总重上限"); return; }
  /* 保险 3：干抽 / 泵堵 / 传感器卡死 */
  if (elapsed > DRY_CHECK_MS && addedWater < 0.5) {
    fault("DRY-RUN 泵未出水或读数不动"); return;
  }

  /* 提前断流：剩余量 <= 流量 × (余流延迟 + 一个采样周期) 就停泵 */
  float leadG = flowEst * ((float)(cfg.leadMs + SAMPLE_MS) / 1000.0);
  float remain = targetWater - addedWater;

  Serial.print(F("t="));   Serial.print(elapsed);
  Serial.print(F("ms 总重="));  Serial.print(w, 1);
  Serial.print(F("g 已加="));   Serial.print(addedWater, 1);
  Serial.print(F("g 剩余="));   Serial.print(remain, 1);
  Serial.print(F("g 流量="));   Serial.print(flowEst, 2);
  Serial.print(F("g/s 提前量=")); Serial.println(leadG, 1);

  if (remain <= leadG) {
    pumpOff();
    state  = S_SETTLE;
    tSettle = millis();
    Serial.println(F("[STOP] 已提前断流，等待管内余流落定..."));
  }
}

void stepSettle() {
  // 等余流落定：余流延迟 + 400ms 缓冲
  if (millis() - tSettle < (uint32_t)cfg.leadMs + 400UL) return;

  float w = readWeight();
  addedWater = w - startTotal;
  float deficit = targetWater - addedWater;

  if (deficit > TOPUP_TOL && topups < MAX_TOPUPS) {
    topups++;
    Serial.print(F("[TOPUP] 差 ")); Serial.print(deficit, 1);
    Serial.print(F(" g，第 "));    Serial.print(topups); Serial.println(F(" 次补泵"));
    pumpOn();
    state = S_FILL;
    tSample = millis();
    return;
  }
  finishCycle();
}

void stepFault() {
  // 快闪报警，等 STOP 复位
  static uint32_t tBlink = 0;
  static bool on = false;
  if (millis() - tBlink > 150) {
    tBlink = millis();
    on = !on;
    digitalWrite(PIN_LED, on ? HIGH : LOW);
  }
}

/* ---------------- 9. 串口命令 ---------------- */
void printHelp() {
  Serial.println(F("========== 命令 =========="));
  Serial.println(F("STATUS / HELP / RUN / STOP / ZERO"));
  Serial.println(F("SET PORTION <配重g> <代表米g>   例: SET PORTION 100 150"));
  Serial.println(F("SET RATIO <x>    例: SET RATIO 1.2"));
  Serial.println(F("SET TIMEOUT <ms> / SET MINRICE <g> / SET MAXTOTAL <g>"));
  Serial.println(F("SET FLOW <g/s> / SET LEAD <ms> / SET TRIG <0|1>"));
  Serial.println(F("CAL <已知g>     用已知重物标定"));
  Serial.println(F("MANUAL <米g>    跳过称重直接按指定米量配比"));
  Serial.println(F("SIM <g> / SIMOFF  软件模拟称重"));
  Serial.println(F("SAVE / LOAD / RESETCFG"));
  Serial.println(F("=========================="));
}

void printStatus() {
  Serial.print(F("state="));    Serial.print(stateName[state]);
  Serial.print(F("  sim="));     Serial.println(simMode ? F("ON") : F("OFF"));
  Serial.print(F("重量="));      Serial.print(readWeight(), 1);
  Serial.print(F(" g  米量="));  Serial.print(weightToRice(readWeight()), 1); Serial.println(F(" g"));
  Serial.print(F("ratio="));      Serial.print(cfg.ratio, 3);
  Serial.print(F("  portion="));  Serial.print(cfg.portionWeight, 1);
  Serial.print(F(" g -> "));      Serial.print(cfg.portionRice, 1); Serial.println(F(" g 米"));
  Serial.print(F("timeout="));    Serial.print(cfg.timeoutMs);
  Serial.print(F(" ms  minRice=")); Serial.print(cfg.minRice, 1);
  Serial.print(F(" g  maxTotal=")); Serial.print(cfg.maxTotal, 1); Serial.println(F(" g"));
  Serial.print(F("estFlow="));    Serial.print(cfg.estFlow, 2);
  Serial.print(F(" g/s  lead=")); Serial.print(cfg.leadMs);
  Serial.print(F(" ms  trig="));  Serial.println(cfg.trigLevel ? F("HIGH") : F("LOW"));
  Serial.print(F("calFactor="));  Serial.println(cfg.calFactor, 3);
}

void upper(char *s) { for (; *s; ++s) if (*s >= 'a' && *s <= 'z') *s -= 32; }

void handleCommand(char *line) {
  char raw[40];
  strncpy(raw, line, sizeof(raw) - 1);
  raw[sizeof(raw) - 1] = 0;

  upper(line);
  char *cmd = strtok(line, " \t");
  if (!cmd) return;

  if (!strcmp(cmd, "PRESET")) {
    char *a = strtok(NULL, " \t");
    if (!a) { Serial.println(F("用法 PRESET <0-7>")); return; }
    applyRecipe((uint8_t)atoi(a));
    return;
  }
  if (!strcmp(cmd, "RECIPES")) {
    for (uint8_t i = 0; i < 8; i++) {
      Serial.print(i); Serial.print(F("  "));
      Serial.print(RECIPE_NAME[i]);
      Serial.print(F("  超时 ")); Serial.print(recipes[i].timeoutMs / 1000UL);
      Serial.print(F(" s  上限 ")); Serial.print(recipes[i].maxTotal, 0); Serial.println(F(" g"));
    }
    return;
  }

  if (!strcmp(cmd, "HELP"))    { printHelp();  return; }
  if (!strcmp(cmd, "STATUS"))  { printStatus(); return; }

  if (!strcmp(cmd, "RUN"))  { runEnabled = true;  if (state == S_FAULT) state = S_IDLE; Serial.println(F("已放行")); return; }
  if (!strcmp(cmd, "STOP")) { runEnabled = false; pumpOff(); state = S_IDLE;  Serial.println(F("已急停")); return; }

  if (!strcmp(cmd, "ZERO")) {
    tareOffset = rawWeight();
    Serial.println(F("已去皮"));
    return;
  }

  if (!strcmp(cmd, "SIM")) {
    char *a = strtok(NULL, " \t");
    simMode = true;
    if (a) simWeight = atof(a);
    Serial.print(F("模拟模式 ON，当前读数 ")); Serial.print(simWeight, 1); Serial.println(F(" g"));
    return;
  }
  if (!strcmp(cmd, "SIMOFF")) {
    simMode = false;
    tareOffset = 0;
    Serial.println(F("模拟模式 OFF，回到 HX711"));
    return;
  }
  if (!strcmp(cmd, "CAL")) {
    char *a = strtok(NULL, " \t");
    if (!a) { Serial.println(F("用法 CAL <已知克数>")); return; }
    float known = atof(a);
    if (!simMode) {
      float rawCounts = scale.get_value(10);
      if (fabs(rawCounts) < 1.0) { Serial.println(F("读数过小，先放重物")); return; }
      cfg.calFactor = rawCounts / known;
      scale.set_scale(cfg.calFactor);
      Serial.print(F("标定完成 calFactor=")); Serial.println(cfg.calFactor, 3);
    } else {
      Serial.println(F("模拟模式下标定无意义"));
    }
    return;
  }
  if (!strcmp(cmd, "MANUAL")) {
    char *a = strtok(NULL, " \t");
    if (!a) { Serial.println(F("用法 MANUAL <米克数>")); return; }
    startCycle(atof(a), readWeight());
    return;
  }
  if (!strcmp(cmd, "SAVE"))     { cfgSave(); Serial.println(F("参数已写入 EEPROM")); return; }
  if (!strcmp(cmd, "LOAD"))     { if (cfgLoad()) Serial.println(F("参数已从 EEPROM 读取")); else Serial.println(F("EEPROM 无有效参数")); return; }
  if (!strcmp(cmd, "RESETCFG")) { cfgDefault(); Serial.println(F("参数已恢复出厂值")); return; }

  if (!strcmp(cmd, "SET")) {
    char *k = strtok(NULL, " \t");
    if (!k) { Serial.println(F("用法 SET <KEY> <值>")); return; }

    if (!strcmp(k, "PORTION")) {
      char *a = strtok(NULL, " \t");
      char *b = strtok(NULL, " \t");
      if (!a || !b) { Serial.println(F("用法 SET PORTION <配重g> <代表米g>")); return; }
      float w = atof(a), r = atof(b);
      if (w <= 0 || r <= 0) { Serial.println(F("两个值都要大于 0")); return; }
      cfg.portionWeight = w;
      cfg.portionRice   = r;
      Serial.print(F("配重映射已改为: ")); Serial.print(w, 1);
      Serial.print(F(" g 配重 = "));        Serial.print(r, 1); Serial.println(F(" g 米"));
      return;
    }
    char *v = strtok(NULL, " \t");
    if (!v) { Serial.println(F("缺少数值")); return; }
    float x = atof(v);

    if      (!strcmp(k, "RATIO"))    { if (x > 0.1 && x < 5)   { cfg.ratio = x; Serial.println(F("ratio 已更新")); } }
    else if (!strcmp(k, "TIMEOUT"))  { if (x >= 1000)          { cfg.timeoutMs = (uint32_t)x; Serial.println(F("timeout 已更新")); } }
    else if (!strcmp(k, "MINRICE"))  { if (x >= 1)             { cfg.minRice = x; Serial.println(F("minRice 已更新")); } }
    else if (!strcmp(k, "MAXTOTAL")) { if (x > 100)            { cfg.maxTotal = x; Serial.println(F("maxTotal 已更新")); } }
    else if (!strcmp(k, "FLOW"))     { if (x > 0 && x < 200)   { cfg.estFlow = x; Serial.println(F("estFlow 已更新")); } }
    else if (!strcmp(k, "LEAD"))     { if (x >= 0 && x <= 3000) { cfg.leadMs = (uint16_t)x; Serial.println(F("lead 已更新")); } }
    else if (!strcmp(k, "TRIG"))     {
      cfg.trigLevel = (x > 0.5) ? 1 : 0;
      pumpOff();
      Serial.println(F("触发电平已更新（泵已关闭，注意继电器当前状态）"));
    }
    else Serial.println(F("未知参数"));
    return;
  }

  Serial.print(F("未知命令: ")); Serial.println(raw);
  Serial.println(F("发 HELP 看命令表"));
}

void pollSerial() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\r') continue;
    if (c == '\n') {
      cmdBuf[cmdLen] = 0;
      if (cmdLen) handleCommand(cmdBuf);
      cmdLen = 0;
    } else if (cmdLen < sizeof(cmdBuf) - 1) {
      cmdBuf[cmdLen++] = c;
    }
  }
}

/* ---------------- 10. setup / loop ---------------- */
void setup() {
  Serial.begin(9600);

  pinMode(PIN_PUMP, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
  kpInit();

  if (!cfgLoad()) { cfgDefault(); }

  // 先把泵置为关闭，避免上电抖动误开泵
  digitalWrite(PIN_PUMP, cfg.trigLevel ? LOW : HIGH);
  digitalWrite(PIN_LED, LOW);

  scale.begin(PIN_HX_DT, PIN_HX_SCK);
  scale.set_scale(cfg.calFactor);
  scale.tare();
  tareOffset = 0;

  Serial.println(F("===== RiceMix 闭环米水配比 ====="));
  Serial.print (F("配重映射: ")); Serial.print(cfg.portionWeight, 0);
  Serial.print (F(" g 配重 = ")); Serial.print(cfg.portionRice, 0); Serial.println(F(" g 米"));
  Serial.print (F("米水比  : 1 : ")); Serial.println(cfg.ratio, 2);
  Serial.print (F("当前配方: ")); Serial.print(cfg.presetIdx);
  Serial.print (F("  ")); Serial.println(RECIPE_NAME[cfg.presetIdx]);
  Serial.println(F("投入大米后自动开始；4x4 键盘选档位；串口发 HELP 看命令"));
  Serial.println(F("无硬件调试：SIM 100 造一个 100g 的读数"));
}

void loop() {
  pollKeypad();
  pollKeyHold();
  if (keyEvent != 255) { doKey(keyEvent);      keyEvent = 255; }
  if (keyHold  != 255) { onKeyHold(keyHold);   keyHold  = 255; }
  pollSerial();
  switch (state) {
    case S_IDLE:   stepIdle();   break;
    case S_FILL:   stepFill();   break;
    case S_SETTLE: stepSettle(); break;
    case S_FAULT:  stepFault();  break;
  }
}
