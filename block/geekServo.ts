//------舵机模块-----------

namespace LogosSmart {

    //% blockId=servo
    //% block="servo pin %num angle %value"
    //% value.min=0 value.max=180
    //% group="Servo"
    export function servo(num: enGPIOpin, value: number): void {
        pins.servoWritePin(num, value)
    }

}
