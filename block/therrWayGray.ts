//-------三路灰度巡线-------

const LineFollower_I2cAddress_2 = 0x29


    
namespace LogosSmart {

     //% blockId=LineFollower29_Debug
    //% block="Line follower 0x29 debug read"
    //% group="Line Follower Sensor"
    //% weight=99
    export function lineFollower29Debug(): string {

        let buf = pins.i2cReadBuffer(LineFollower_I2cAddress_2, 1)

        return buf[0].toString()
}

}