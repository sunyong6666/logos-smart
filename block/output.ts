//------剩余的输出模块-----------

namespace LogosSmart {
    // ==================== 舵机模块 ====================
    //% blockId=LogosSmart_Servo
    //% block="servo pin %num angle %value"
    //% value.min=0 value.max=180
    //% group="Servo"
    //% weight=99
    //% color="#f1bd42"
    export function Servo(num: enGPIOpin, value: number): void {
        pins.servoWritePin(num, value)
    }


    // ==================== LED模块 ====================
    //% blockId=LogosSmart_LED_on
    //% block="LED pin %num on"
    //% group="LED"
    //% weight=89
    //% color="#f1bd42"
    export function LEDOn(num: enGPIOpin): void {
        pins.digitalWritePin(num, 0)
    }

    //% blockId=LogosSmart_LED_off
    //% block="LED pin %num off"
    //% group="LED"
    //% weight=88
    //% color="#f1bd42"
    export function LEDOff(num: enGPIOpin): void {
        pins.digitalWritePin(num, 1)
    }


    // ==================== 风扇模块 ====================
    //% blockId=LogosSmart_Fan_on
    //% block="fan pin %num on"
    //% group="Fan"
    //% weight=79
    //% color="#f1bd42"
    export function FanOn(num: enGPIOpin): void {
        pins.digitalWritePin(num, 1)
    }

    //% blockId=LogosSmart_Fan_off
    //% block="fan pin %num off"
    //% group="Fan"
    //% weight=78
    //% color="#f1bd42"
    export function FanOff(num: enGPIOpin): void {
        pins.digitalWritePin(num, 0)
    }

}
