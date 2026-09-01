//-------三路光电巡线-------

const LineFollower_I2cAddress = 0x28
const LINE_FOLLOWER_BASE = 0x0A;

enum LineSensor {
    //% block="1"
    Sensor1 = 0,

    //% block="2"
    Sensor2 = 1,

    //% block="3"
    Sensor3 = 2
}

namespace LogosSmart {
    // 读取探头值
    //% blockId=LineFollower_Read
    //% block="line follower read sensor %sensor"
    //% group="Line Follower"
    //% weight=100
    export function lineFollowerRead(sensor: LineSensor): number {
        let cmdBuff = pins.createBuffer(1);
        cmdBuff.setNumber(NumberFormat.UInt8BE,0,LINE_FOLLOWER_BASE + 0x00);
        pins.i2cWriteBuffer(LineFollower_I2cAddress,cmdBuff,true);

        let buf = pins.i2cReadBuffer(LineFollower_I2cAddress,3);

        return buf[sensor];
    }

    //探头是否识别到黑色
    //% blockId=LineFollower_Detected
    //% block="line follower sensor %sensor detected black"
    //% group="Line Follower"
    //% weight=99
    export function lineFollowerDetected(sensor: LineSensor): boolean {
        let cmdBuff = pins.createBuffer(1);
        cmdBuff.setNumber(NumberFormat.UInt8BE,0,LINE_FOLLOWER_BASE + 0x00);
        pins.i2cWriteBuffer(LineFollower_I2cAddress,cmdBuff,true);

        let buf = pins.i2cReadBuffer(LineFollower_I2cAddress,3);

        return buf[sensor] == 0;
    }

}


