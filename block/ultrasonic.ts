//-------超声波-------
const ultrasonicI2cAddress = 0x23;
const ULTRASONIC_BASE = 0x0A;
//炫彩超声波
const rgbUltrasonicI2cAddress = 0x2A;
const RGB_ULTRASONIC_LED_BASE = 0x14;

enum RgbUltrasonicLed {
    //% block="LED1"
    LED1 = 1,
    //% block="LED2"
    LED2 = 2,
    //% block="LED3"
    LED3 = 3
}

// 运行期状态：3 个 LED × 3 通道
let rgbUltrasonicLedState: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];

function clampRgbByte(v: number): number {
    if (v < 0) return 0;
    if (v > 255) return 255;
    return v | 0;
}

// 把当前记忆的全部颜色一次性写入硬件
function rgbUltrasonicFlushLeds(): void {
    let cmdBuff = pins.createBuffer(10);
    cmdBuff[0] = RGB_ULTRASONIC_LED_BASE + 0x01;
    for (let i = 0; i < 9; i++) {
        cmdBuff[i + 1] = clampRgbByte(rgbUltrasonicLedState[i]);
    }
    pins.i2cWriteBuffer(rgbUltrasonicI2cAddress, cmdBuff);
}

namespace LogosSmart {
    //% blockId=ultrasonicGetDistance
    //% block="ultrasonic distance (mm)"
    //% group="Distance Sensor"
    //% weight=99
    export function ultrasonicDistance(): number {
        basic.pause(20);
        let buf = pins.createBuffer(1);
        buf[0] = ULTRASONIC_BASE + 0x00;

        pins.i2cWriteBuffer(ultrasonicI2cAddress, buf, true);

        // 读取 2 字节距离
        let r = pins.i2cReadBuffer(ultrasonicI2cAddress, 2);

        // 大端拼接
        return (r[0] << 8) | r[1];
    }

    //% blockId=ultrasonicRgbGetDistance
    //% block="rgb ultrasonic distance (mm)"
    //% group="RGB Ultrasonic"
    //% weight=99
    export function ultrasonicRgbGetDistance(): number {
        //发送距离读取指令
        let cmdBuff = pins.createBuffer(1);
        cmdBuff[0] = ULTRASONIC_BASE + 0x00;

        pins.i2cWriteBuffer(rgbUltrasonicI2cAddress,cmdBuff,true);
        // 读取2字节原始距离数据
        let readBuff = pins.i2cReadBuffer(rgbUltrasonicI2cAddress,2);

        // 24位数据
        let rawDistance = (readBuff[0] << 8) | readBuff[1];

        // 转换为mm
        let distance = Math.round(rawDistance / 1);
        // 两次读取间隔必须 >50ms
        basic.pause(60);

        return distance;
    }

   

    //% blockId=ultrasonicRgbSetColor
    //% block="set RGB light brightness %brightness R %red G %green B %blue"
    //% brightness.min=0 brightness.max=255 brightness.defl=255
    //% red.min=0 red.max=255 red.defl=255
    //% green.min=0 green.max=255 green.defl=0
    //% blue.min=0 blue.max=255 blue.defl=0
    //% group="RGB Ultrasonic"
    //% weight=98
    //% inlineInputMode=inline
    export function ultrasonicRgbSetColor(brightness: number,red: number,green: number,blue: number): void {
        // 限制亮度
        brightness = clampRgbByte(brightness);

        // 限制 R
        red = clampRgbByte(red);
        // 限制 G
        green = clampRgbByte(green);
        // 限制 B
        blue = clampRgbByte(blue);


        // 1字节命令 + 4字节参数
        let cmdBuff = pins.createBuffer(5);
        // 指令 ID
        //cmdBuff.setNumber(NumberFormat.UInt8BE,0,0x01);
        cmdBuff[0] = ULTRASONIC_BASE + 0x01;

        // 亮度
        cmdBuff.setNumber(NumberFormat.UInt8BE,1,brightness);

        // R
        cmdBuff.setNumber(NumberFormat.UInt8BE,2,red);
        // G
        cmdBuff.setNumber(NumberFormat.UInt8BE,3,green);
        // B
        cmdBuff.setNumber(NumberFormat.UInt8BE,4,blue);

        // 发送
        pins.i2cWriteBuffer(rgbUltrasonicI2cAddress,cmdBuff);
    }

    //% blockId=rgbUltrasonicSetAllLedColors
    //% block="RGB Ultrasonic set all LED colors R %red G %green B %blue"
    //% red.min=0 red.max=255 red.defl=255
    //% green.min=0 green.max=255 green.defl=0
    //% blue.min=0 blue.max=255 blue.defl=0
    //% group="RGB Ultrasonic"
    //% weight=97
    //% inlineInputMode=inline
    export function rgbUltrasonicSetAllLedColors(red: number,green: number,blue: number): void {
        // 限制 RGB 参数范围
        if (red < 0) red = 0;
        if (red > 255) red = 255;

        if (green < 0) green = 0;
        if (green > 255) green = 255;

        if (blue < 0) blue = 0;
        if (blue > 255) blue = 255;

        // 寄存器地址 + 3 个灯的 RGB 数据
        // 寄存器 0x01：分别设置 3 个灯的颜色
        let cmdBuff = pins.createBuffer(10);

        cmdBuff[0] = RGB_ULTRASONIC_LED_BASE + 0x01;

        // LED 1
        cmdBuff[1] = red;
        cmdBuff[2] = green;
        cmdBuff[3] = blue;

        // LED 2
        cmdBuff[4] = red;
        cmdBuff[5] = green;
        cmdBuff[6] = blue;

        // LED 3
        cmdBuff[7] = red;
        cmdBuff[8] = green;
        cmdBuff[9] = blue;

        pins.i2cWriteBuffer(rgbUltrasonicI2cAddress,cmdBuff);
    }


    //% blockId=rgbUltrasonicSetLedColor
    //% block="RGB Ultrasonic set %led to R %r G %g B %b"
    //% group="RGB Ultrasonic"
    //% weight=96
    //% inlineInputMode=inline
    //% r.min=0 r.max=255 r.defl=0
    //% g.min=0 g.max=255 g.defl=0
    //% b.min=0 b.max=255 b.defl=0
    export function rgbUltrasonicSetLedColor(led: RgbUltrasonicLed, r: number, g: number, b: number): void {
        let base = (led - 1) * 3;
        if (base < 0 || base > 6) return;   // 防御越界

        rgbUltrasonicLedState[base] = clampRgbByte(r);
        rgbUltrasonicLedState[base + 1] = clampRgbByte(g);
        rgbUltrasonicLedState[base + 2] = clampRgbByte(b);
        
        rgbUltrasonicFlushLeds();
    }


    //% blockId=rgbUltrasonicSetAllLedOff
    //% block="RGB Ultrasonic turn off all LEDs"
    //% group="RGB Ultrasonic"
    //% weight=95
    export function rgbUltrasonicSetAllLedOff(): void {
        for (let i = 0; i < 9; i++) {
            rgbUltrasonicLedState[i] = 0;
        }
        rgbUltrasonicFlushLeds();
    }



}