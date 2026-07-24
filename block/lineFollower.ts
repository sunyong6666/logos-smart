//-------三路光电巡线-------

const LineFollower_I2cAddress = 0x28

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
        let buf = pins.i2cReadBuffer(LineFollower_I2cAddress, 3)
        return buf[sensor]
        
    }


    //% blockId=LineFollower_Detected
    //% block="line follower sensor %sensor detected black"
    //% group="Line Follower"
    //% weight=99
    export function lineFollowerDetected(sensor: LineSensor): boolean {
        let buf = pins.i2cReadBuffer(LineFollower_I2cAddress, 3)
        return buf[sensor] == 1
    }

}