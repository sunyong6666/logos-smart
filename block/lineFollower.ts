//-------三路光电巡线调试-------

const LineFollower_I2cAddress = 0x28

namespace LogosSmart {

    //% blockId=LineFollower_Debug
    //% block="Line follower debug read"
    //% group="Line Follower Sensor"
    //% weight=100
    export function lineFollowerDebug(): string {

        let buf = pins.i2cReadBuffer(LineFollower_I2cAddress, 1)

        let result = ""

        for (let i = 0; i < buf.length; i++) {
            result += buf[i]

            if (i < buf.length - 1) {
                result += ","
            }
        }

        return result
    }

}