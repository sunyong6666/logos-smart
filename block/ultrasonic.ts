//-------超声波-------
const ultrasonicI2cAddress = 0x23;
const ULTRASONIC_BASE = 0x0A;
//炫彩超声波
const rgbultrasonicI2cAddress = 0x57;

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
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, 0x01);

        pins.i2cWriteBuffer(rgbultrasonicI2cAddress,cmdBuff,true);
        // 读取3字节原始距离数据
        let readBuff = pins.i2cReadBuffer(rgbultrasonicI2cAddress,3);

        // 24位数据
        let rawDistance =
            (readBuff[0] << 16) |
            (readBuff[1] << 8) |
            readBuff[2];

        // 转换为mm
        let distance = Math.round(rawDistance / 1000);
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
        if (brightness < 0) brightness = 0;
        if (brightness > 255) brightness = 255;

        // 限制 R
        if (red < 0) red = 0;
        if (red > 255) red = 255;

        // 限制 G
        if (green < 0) green = 0;
        if (green > 255) green = 255;

        // 限制 B
        if (blue < 0) blue = 0;
        if (blue > 255) blue = 255;


        // 1字节命令 + 4字节参数
        let cmdBuff = pins.createBuffer(5);
        // 指令 ID
        cmdBuff.setNumber(NumberFormat.UInt8BE,0,0x02);

        // 亮度
        cmdBuff.setNumber(NumberFormat.UInt8BE,1,brightness);

        // R
        cmdBuff.setNumber(NumberFormat.UInt8BE,2,red);

        // G
        cmdBuff.setNumber(NumberFormat.UInt8BE,3,green);

        // B
        cmdBuff.setNumber(NumberFormat.UInt8BE,4,blue);

        // 发送
        pins.i2cWriteBuffer(rgbultrasonicI2cAddress,cmdBuff);
    }

}