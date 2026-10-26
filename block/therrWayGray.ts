//-------三路灰度巡线-------
const ColorSensor_I2cAddress = 0x29

// 传感器通道
enum ColorSensor {
    //% block="1"
    Sensor1 = 0,
    //% block="2"
    Sensor2 = 1,
    //% block="3"
    Sensor3 = 2
}

// 传感器工作模式
enum ColorSensorMode {
    //% block="color recognition"
    ColorRecognition = 1,

    //% block="grayscale recognition"
    GrayscaleRecognition = 2,

    //% block="binary recognition"
    BinaryRecognition = 3
}


// 颜色类型
enum ColorType {
    //% block="Red"
    Red = 1,

    //% block="Green"
    Green = 2,

    //% block="Blue"
    Blue = 3,

    //% block="Yellow"
    Yellow = 4,

    //% block="Cyan"
    Cyan = 5,

    //% block="Purple"
    Purple = 6
}



namespace LogosSmart {

    //==================================================
    // 设置传感器模式
    //==================================================
    function setMode(mode: number): void {
        pins.i2cWriteNumber(ColorSensor_I2cAddress, mode, NumberFormat.UInt8BE)
        // 等待传感器完成模式切换
        basic.pause(80)
    }

    //==================================================
    // 读取完整的数据包
    //==================================================
    function readData(mode: number): Buffer {
        let data = pins.i2cReadBuffer(ColorSensor_I2cAddress, 4)
        if (mode != data[3]){
            if(mode != 15){
                setMode(mode)
            }
            setMode(15)
            return pins.createBuffer(0)
        }
        //serial.writeLine("最后一位数据: " + data[3])
        return data
    }

    //==================================================
    // 学习命令
    //==================================================
    function sendLearnCommand(cmd: number): void {
        pins.i2cWriteNumber(ColorSensor_I2cAddress, cmd, NumberFormat.UInt8BE)
        basic.pause(100)
    }


    // 设置工作模式
    // // % blockId=ColorSensor_SetMode
    // // % block="Three Way Gray Sensor set mode %mode"
    // // % group="Three Way Gray Sensor"
    // // % weight=100
    export function setColorSensorMode(mode: ColorSensorMode): void {
        setMode(mode)
    }

    // 灰度学习模式
    //% blockId=ColorSensor_LearnGrayscale
    //% block="Three Way Gray Sensor learn grayscale threshold"
    //% group="Three Way Gray Sensor"
    //% weight=99
    export function learnGrayscale(): void {
        sendLearnCommand(4)
    }

    // 二值化学习模式
    //% blockId=ColorSensor_LearnBinary
    //% block="Three Way Gray Sensor learn binary threshold"
    //% group="Three Way Gray Sensor"
    //% weight=98
    export function learnBinary(): void {
        sendLearnCommand(5)
    }

    // 学习指定颜色阈值
    //% blockId=ColorSensor_LearnColor
    //% block="Three Way Gray Sensor learn color %color"
    //% group="Three Way Gray Sensor"
    //% weight=97
    export function learnColor(color: ColorType): void {
        sendLearnCommand(color + 6)
    }

    // 清除所有颜色学习数据
    //% blockId=ColorSensor_ClearColorData
    //% block="Three Way Gray Sensor clear all color learning data"
    //% group="Three Way Gray Sensor"
    //% weight=96
    export function clearColorLearningData(): void {
        sendLearnCommand(6)
    }

    // 判断指定通道是否检测到指定颜色
    //% blockId=ColorSensor_DetectedColor
    //% block="Three Way Gray Sensor %sensor detects %color"
    //% group="Three Way Gray Sensor"
    //% weight=90
    export function detectedColor(sensor: ColorSensor, color: ColorType): boolean {
        // 自动进入颜色识别模式
        //setMode(ColorSensorMode.ColorRecognition)

        // 必须完整读取 4 bytes
        let buf = readData(ColorSensorMode.ColorRecognition)
        // 返回值与目标颜色比较
        return buf[sensor] == color
    }

    // 判断指定通道是否检测到黑线
    //% blockId=ColorSensor_DetectedBlack
    //% block="Three Way Gray Sensor %sensor detected black"
    //% group="Three Way Gray Sensor"
    //% weight=95
    export function threeGrayDetected(sensor: ColorSensor): boolean {
        // 自动进入二值识别模式
        //setMode(ColorSensorMode.BinaryRecognition)

        // 必须完整读取 4 bytes
        let buf = readData(ColorSensorMode.BinaryRecognition)
        return buf[sensor] == 1
    }


    // 读取灰度识别值
    //% blockId=ColorSensor_ReadGrayscale
    //% block="Three Way Gray Sensor %sensor grayscale value"
    //% group="Three Way Gray Sensor"
    //% weight=80
    export function readGrayscale(sensor: ColorSensor): number {
        //setMode(ColorSensorMode.GrayscaleRecognition)

        let buf = readData(ColorSensorMode.GrayscaleRecognition)
        return buf[sensor]
    }

    // 读取原始光敏值
    //% blockId=ColorSensor_ReadRaw
    //% block="Three Way Gray Sensor %sensor raw photosensitive value"
    //% group="Three Way Gray Sensor"
    //% weight=70
    export function readRaw(sensor: ColorSensor): number {
        //setMode(15)

        let buf = readData(15)
        return buf[sensor]
    }

    //% blockId=ColorSensor_SetMode_off
    //% block="Three Way Gray Sensor off"
    //% group="Three Way Gray Sensor"
    //% weight=60
    export function setColorSensorModeOff(): void {
        setMode(0)
    }

}