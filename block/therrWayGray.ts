//-------三路灰度巡线-------

const ThreeWayGray_I2cAddress = 0x29

enum GraySensor {
    //% block="1"
    Sensor1 = 0,

    //% block="2"
    Sensor2 = 1,

    //% block="3"
    Sensor3 = 2
}


namespace LogosSmart {

    //读值
    //% blockId=ThreeWayGray_Read
    //% block="three way gray gray sensor read %sensor"
    //% group="Three Way Gray Sensor"
    //% weight=100
    export function threeWayGrayRead(sensor: GraySensor): number {
        let buf = pins.i2cReadBuffer(ThreeWayGray_I2cAddress, 3)
        return buf[sensor]
    }

    //判断值
    //% blockId=ThreeWayGray_Check
    //% block="three way gray sensor %sensor value %compare %value"
    //% value.min=0 value.max=255
    //% group="Three Way Gray Sensor"
    //% weight=99
    export function threeWayGrayCheck(sensor: GraySensor, compare: SmartCompare, value: number): boolean {
        let buf = pins.i2cReadBuffer(ThreeWayGray_I2cAddress, 3)
        let data = buf[sensor]

        if (compare == SmartCompare.Greater) {
            return data > value
        }

        if (compare == SmartCompare.GreaterEqual) {
            return data >= value
        }

        if (compare == SmartCompare.Equal) {
            return data == value
        }

        if (compare == SmartCompare.LessEqual) {
            return data <= value
        }

        if (compare == SmartCompare.Less) {
            return data < value
        }

        return false
    }

}