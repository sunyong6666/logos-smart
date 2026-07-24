//---------------------------------- GPIO传感器模块 -------------------------------

namespace LogosSmart {

    // ==================== Button按钮模块 ====================
    //% blockId=LogosSmart_Button
    //% block="button pin %num pressed?"
    //% group="Button Sensor"
    //% weight=99
    //% color="#f1bd42"
    export function Button( num: enGPIOpin): boolean {
        return pins.digitalReadPin(num) == 0
    }


    // ==================== 电位器模块 ====================
    //% blockId=LogosSmart_Potentiometer
    //% block="potentiometer pin %num value"
    //% group="Potentiometer Module"
    //% weight=99
    //% color="#f1bd42"
    export function Potentiometer( num: enGPIOpin): number {
        return pins.analogReadPin(num)
    }


    // ==================== 光敏传感器模块 ====================
    //% blockId=LogosSmart_Photosensitive
    //% block="photosensitive pin %num value"
    //% group="Photosensitive Sensor"
    //% weight=99
    //% color="#f1bd42"
    export function Photosensitive(num: enGPIOpin): number {
        return pins.analogReadPin(num)
    }


    // ==================== 灰度传感器模块 ====================
    //% blockId=LogosSmart_Grayscale
    //% block="grayscale pin %num value"
    //% group="Grayscale Sensor"
    //% weight=99
    //% color="#f1bd42"
    export function Grayscale( num: enGPIOpin): number {
        return pins.analogReadPin(num)
    }


    // ==================== 土壤湿度传感器模块 ====================
    //% blockId=LogosSmart_SoilHumidity
    //% block="soil humidity sensor pin %num value"
    //% group="Soil Humidity Sensor"
    //% weight=99
    //% color="#f1bd42"
    export function SoilHumiditySensor( num: enGPIOpin): number {
        return pins.analogReadPin(num)
    }

}