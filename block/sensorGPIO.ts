//---------------------------------- GPIO传感器模块 -------------------------------

namespace LogosSmart {

    // ==================== Button按钮模块 ====================
    //% blockId=LogosSmart_Button
    //% block="button pin %num pressed?"
    //% group="Sensor"
    //% weight=100
    export function Button( num: enGPIOpin): boolean {
        return pins.digitalReadPin(num) == 1
    }


    // ==================== 电位器模块 ====================
    //% blockId=LogosSmart_Potentiometer
    //% block="Potentiometer pin %num value"
    //% group="Sensor"
    //% weight=98
    export function Potentiometer( num: enGPIOpin): number {
        return pins.analogReadPin(num)
    }


    // ==================== 光敏传感器模块 ====================
    //% blockId=LogosSmart_Photosensitive
    //% block="Photosensitive pin %num value"
    //% group="Sensor"
    //% weight=96
    export function Photosensitive(num: enGPIOpin): number {
        return pins.analogReadPin(num)
    }


    // ==================== 灰度传感器模块 ====================
    //% blockId=LogosSmart_Grayscale
    //% block="Grayscale pin %num value"
    //% group="Sensor"
    //% weight=94
    export function Grayscale( num: enGPIOpin): number {
        return pins.analogReadPin(num)
    }


    // ==================== 土壤湿度传感器模块 ====================
    //% blockId=LogosSmart_SoilHumidity
    //% block="Soil humidity sensor pin %num value"
    //% group="Sensor"
    //% weight=92
    export function SoilHumiditySensor( num: enGPIOpin): number {
        return pins.analogReadPin(num)
    }

}