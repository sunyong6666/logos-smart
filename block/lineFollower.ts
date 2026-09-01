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

    //% blockId=LineFollower_Read
    //% block="line follower read sensor %sensor"
    //% group="Line Follower"
    //% weight=100
    export function lineFollowerRead(sensor: LineSensor): number {
        // let buf = pins.i2cReadBuffer(LineFollower_I2cAddress, 3)
        // return buf[sensor]

        // 光电循线模块寄存器地址
        let cmdBuff = pins.createBuffer(1);
        cmdBuff.setNumber(NumberFormat.UInt8BE,0,LINE_FOLLOWER_BASE + 0x00);

        // 指定读取寄存器
        pins.i2cWriteBuffer(LineFollower_I2cAddress,cmdBuff,true);

        // 读取三个传感器数据
        let buf = pins.i2cReadBuffer(LineFollower_I2cAddress,3);

        // 返回指定传感器数据
        return buf[sensor];
    }


    //% blockId=LineFollower_Detected
    //% block="line follower sensor %sensor detected black"
    //% group="Line Follower"
    //% weight=99
    export function lineFollowerDetected(sensor: LineSensor): boolean {
        // 光电循线模块寄存器地址
        let cmdBuff = pins.createBuffer(1);
        cmdBuff.setNumber(NumberFormat.UInt8BE,0,LINE_FOLLOWER_BASE + 0x00);

        // 指定读取寄存器
        pins.i2cWriteBuffer(LineFollower_I2cAddress,cmdBuff,true);

        // 读取三个传感器数据
        let buf = pins.i2cReadBuffer(LineFollower_I2cAddress,3);
        return buf[sensor] == 0;
    }

}


