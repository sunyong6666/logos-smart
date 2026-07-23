//------舵机模块-----------

namespace LogosSmart {

    //% blockId=LogosSmart_Servo
    //% block="Servo pin %num angle %value"
    //% value.min=0 value.max=180
    //% group="Servo"
    export function Servo4(num: enGPIOpin, value: number): void {
        pins.servoWritePin(num, value)
    }

}
