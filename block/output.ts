//------剩余的输出模块-----------

namespace LogosSmart {
    // ==================== 舵机模块 ====================
    //% blockId=setServo
    //% block="Servo pin %num angle %value"
    //% value.min=0 value.max=180
    //% group="Servo"
    //% weight=99
    export function setServo(num: enGPIOpin, value: number): void {
        pins.servoWritePin(num, value)
    }


    // ==================== LED模块 ====================
    //% blockId=LED_on
    //% block="LED pin %num on"
    //% group="LED"
    //% weight=89
    export function LEDOn(num: enGPIOpin): void {
        pins.digitalWritePin(num, 0)
    }

    //% blockId=LED_off
    //% block="LED pin %num off"
    //% group="LED"
    //% weight=88
    export function LEDOff(num: enGPIOpin): void {
        pins.digitalWritePin(num, 1)
    }


    // ==================== 风扇模块 ====================
    //% blockId=fan_on
    //% block="fan pin %num on"
    //% group="Fan"
    //% weight=79
    export function fanOn(num: enGPIOpin): void {
        pins.digitalWritePin(num, 1)
    }

    //% blockId=fan_off
    //% block="fan pin %num off"
    //% group="Fan"
    //% weight=78
    export function fanOff(num: enGPIOpin): void {
        pins.digitalWritePin(num, 0)
    }

}
