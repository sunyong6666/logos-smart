//------剩余的输出模块-----------

namespace LogosSmart {

    // ==================== 舵机模块 ====================
    //% blockId=LogosSmart_Servo
    //% block="Servo pin %num angle %value"
    //% value.min=0 value.max=180
    //% group="Servo"
    //% weight=99
    export function Servo4(num: enGPIOpin, value: number): void {
        pins.servoWritePin(num, value)
    }

    //% blockId=LED_on
    //% block="LED pin %num on"
    //% group="LED"
    //% weight=89
    export function LEDOn(num: enGPIOpin): void {
        pins.digitalWritePin(num, 1)
    }


    //% blockId=LED_off
    //% block="LED pin %num off"
    //% group="LED"
    //% weight=88
    export function LEDOff(num: enGPIOpin): void {
        pins.digitalWritePin(num, 0)
    }

}
