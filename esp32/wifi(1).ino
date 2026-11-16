#include <WiFi.h>                          //调用了库文件，上传程序之前需要手动导入对应库文件到arduino里
#include <PubSubClient.h>                 //调用了库文件，上传程序之前需要手动导入对应库文件到arduino里
#include <LiquidCrystal_I2C.h>           //调用了库文件，上传程序之前需要手动导入对应库文件到arduino里
#include <DHT.h>                        //调用了库文件，上传程序之前需要手动导入对应库文件到arduino里
#include <SimpleTimer.h>               //调用了库文件，上传程序之前需要手动导入对应库文件到arduino里

// WiFi 和 MQTT 参数
const char* ssid = "ChinaNet-FsNN";            // 引号内容修改为：自己 wifi 的名称，频段需为 2.4G，非5G
const char* password = "4sz5bx4d";            // 引号内容修改为：自己 wifi 的密码
const char* mqtt_server = "bemfa.com"; 
const int mqtt_port = 9501;
const String UID = "207a31bb9be70df6839f3a3ca7e1ddc3";   // 引号内容修改为：自己巴法云的私钥
const char* UserName = "";
const char* PassWord = "";

// 传感器引脚定义  
#define   dht11Pin      4       //定义温湿度传感器引脚
#define   ledPin       12      //定义LED灯模块引脚
#define   buzzerPin    15      //定义有源蜂鸣器引脚
#define   INAPin       18      //定义电机驱动模块引脚
#define   INBPin       19      //定义电机驱动模块引脚
#define   soilPin      33      //定义土壤湿度模块引脚
#define   waterPin     34      //定义水位传感器引脚
#define   lightPin     35      //定义光敏模块引脚   


WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(dht11Pin, 11); // 创建一个dht对象
LiquidCrystal_I2C lcd(0x27,16,2);  
SimpleTimer timer;

boolean state = false;
bool subTopicCenterFlag = false;
int Light;
float Water,data,Humi,Temp,Soil,i,j;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}
//巴法云平台的MQTT连接，订阅：手动模式和智能模块状态；
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(UID.c_str(), UserName, PassWord)) {
      Serial.println("connected");
      subTopicCenterFlag = true;
      client.subscribe("pump");
      client.subscribe("auto");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 1 second");
      delay(1000);
    }
  }
}

//当手机app切换成手动模式时，点击：开始浇花，水泵将会自动浇水；当点击：停止浇花，水泵将会关闭，停止浇水；
void callback(char* rtopic, byte* payload, unsigned int length) {
  String msg = "";
  String topic = rtopic;
  for (int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }
  if (topic == "pump") {
    if (msg == "pump_on") {            //点击：开始浇水，水泵将自动浇水；
      analogWrite(INAPin, 100);  
      analogWrite(INBPin, 255);  
    } else if (msg == "pump_off") {    //点击：停止浇水，水泵将停止浇水；
      analogWrite(INAPin, 255);
      analogWrite(INBPin, 255);
    }
  }
  else if (topic == "auto") {     //切换手动模块或智能模式
    if (msg == "auto_on") {
     state = true;
    }
    else if (msg == "auto_off"){
      analogWrite(INAPin, 255);  
      analogWrite(INBPin, 255); 
      digitalWrite(ledPin,LOW);
      digitalWrite(buzzerPin,LOW);
      state = false;
    }   
  } 
}

void publish_sensor_data() {
  
  if (isnan(Temp) || isnan(Humi)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
//将温度，湿度，光敏值，土壤湿度值，水位的数据发送到巴法云平台，手机app订阅平台数据，从而实现手机app实时显示数据
  client.publish("wendu", String(Temp).c_str());
  client.publish("shidu", String(Humi).c_str());
  client.publish("light", String(Light).c_str());
  client.publish("soil", String(j).c_str());
  client.publish("water", String(data).c_str());
}

void IO_Init() {
  pinMode(lightPin, INPUT);     
  pinMode(waterPin, INPUT);     
  pinMode(soilPin, INPUT);          
  pinMode(ledPin,OUTPUT);      
  pinMode(buzzerPin,OUTPUT);    
  pinMode(INAPin,OUTPUT);     
  pinMode(INBPin,OUTPUT);    
  digitalWrite(ledPin,LOW);
  digitalWrite(buzzerPin,LOW);
  analogWrite(INAPin,255);
  analogWrite(INBPin,255);
}

void setup() {
  Serial.begin(9600);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  reconnect();
  dht.begin();
  IO_Init();
  Lcd();
  timer.setInterval(500L, publish_sensor_data);
}

void Lcd()
{
  lcd.init();                    
  lcd.backlight();
  lcd.setCursor(1,0);
  lcd.print("Automatic watering");     //LCD显示屏开头语，可根据自己需求修改，只能显示英文
  lcd.setCursor(1,1);
  lcd.print("Let's do it!");          //LCD显示屏开头语，可根据自己需求修改，只能显示英文
  delay(1000);
  lcd.clear();
}

void Display()
{
  lcd.setCursor(0,0);
  lcd.print("T:");            //显示屏实时显示数据，T：环境温度
  lcd.print(Temp);
  lcd.setCursor(8,0);
  lcd.print("H:");            //显示屏实时显示数据，H：环境湿度
  lcd.print(Humi);
  lcd.setCursor(0,1);
  lcd.print("L:");            //显示屏实时显示数据，L：光敏值
  lcd.print(Light);
  lcd.print("   ");
  lcd.setCursor(8,1);
  lcd.print("S:");            //显示屏实时显示数据，S：土壤湿度值   
  lcd.print(j,1);
  lcd.setCursor(15,1);
  lcd.print("%");
  delay(500);
}

void light(){
   if(Light < 2500)                    //当模拟值小于2500时，代表光线充足，灯关闭；大于2500，即处于光线黑暗环境，LED灯打开，
   {
   digitalWrite(ledPin,LOW);          //LED灯关闭
   }
   else
   {
   digitalWrite(ledPin,HIGH);        //LED灯开启
   }
}

void soil(){    
    if (j < 30){                        //当土壤湿度小于30%，处于干燥状态
      if (data > 2){                    //如果水位大于2cm时
        analogWrite(INAPin,100);        //电机驱动模块会启动水泵自动浇水
        analogWrite(INBPin,255);
        digitalWrite(buzzerPin,LOW);    //水位大于2cm，蜂鸣器不会报警提示
      }
      else{                             //如果水位低于2cm，处于水池缺水状况，水泵无法启动，蜂鸣器会响起报警提示
        analogWrite(INAPin,255);        //电机驱动模块关闭
        analogWrite(INBPin,255);        
        digitalWrite(buzzerPin,HIGH);   //蜂鸣器报警
      }
    }
    else if(j >= 30)                     //当土壤湿度大于30%，处于湿润状态时，水泵不会启动浇水，无需浇水 
    {
      if (data > 2){                     //水位大于2cm
        analogWrite(INAPin,255);         //电机驱动模块关闭
        analogWrite(INBPin,255);
        digitalWrite(buzzerPin,LOW);     //蜂鸣器关闭
     }
       else {                            //如果水位低于2cm，处于水池缺水状况，蜂鸣器会响起报警
        analogWrite(INAPin,255);         //电机驱动模块关闭
        analogWrite(INBPin,255);
        digitalWrite(buzzerPin,HIGH);    //蜂鸣器报警
      }
     }
}


void loop() {
  Temp = dht.readTemperature();     //读取温湿度模块的温度
  Humi = dht.readHumidity();        //读取温湿度模块的湿度
  Light = analogRead(lightPin);     //读取光敏传感器模拟值
  Soil = analogRead(soilPin);       //读取土壤湿度值
  i = Soil/4095;
  j = (1-i) * 100;
  Water = analogRead(waterPin);
  data = Water/1250*4;              //水位"1250"数据可根据实际测得的数据写入，具体可看水位传感器实验教程
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  timer.run();  
  Display();
  if (state){ 
    light();
    soil();
  }
    
  }
