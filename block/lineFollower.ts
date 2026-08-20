// //-------三路光电巡线-------

// const LineFollower_I2cAddress = 0x28

// enum LineSensor {
//     //% block="1"
//     Sensor1 = 0,

//     //% block="2"
//     Sensor2 = 1,

//     //% block="3"
//     Sensor3 = 2
// }

// namespace LogosSmart {

//     //% blockId=LineFollower_Read
//     //% block="line follower read sensor %sensor"
//     //% group="Line Follower"
//     //% weight=100
//     export function lineFollowerRead(sensor: LineSensor): number {
//         let buf = pins.i2cReadBuffer(LineFollower_I2cAddress, 3)
//         return buf[sensor]
        
//     }


//     //% blockId=LineFollower_Detected
//     //% block="line follower sensor %sensor detected black"
//     //% group="Line Follower"
//     //% weight=99
//     export function lineFollowerDetected(sensor: LineSensor): boolean {
//         let buf = pins.i2cReadBuffer(LineFollower_I2cAddress, 3)
//         return buf[sensor] == 1
//     }

// }

//------- 三路颜色/光电巡线传感器 -------
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
    let currentMode = -1


    //==================================================
    // 设置传感器模式
    //==================================================
    function setMode(mode: number): void {
        pins.i2cWriteNumber(
            ColorSensor_I2cAddress,
            mode,
            NumberFormat.UInt8BE
        )
        // 等待传感器完成模式切换
        basic.pause(80)
        currentMode = mode
    }


    //==================================================
    // 读取完整的数据包
    //==================================================
    function readData(): Buffer {
        return pins.i2cReadBuffer(
            ColorSensor_I2cAddress,
            4
        )
    }

    //==================================================
    // 设置工作模式
    //==================================================
    //% blockId=ColorSensor_SetMode
    //% block="line follower set mode %mode"
    //% group="Line Follower"
    //% weight=100
    export function setColorSensorMode(mode: ColorSensorMode): void {
        setMode(mode)
    }


    //==================================================
    // 判断指定通道是否检测到指定颜色
    //==================================================
    //% blockId=ColorSensor_DetectedColor
    //% block="line follower %sensor detects %color"
    //% group="Line Follower"
    //% weight=90
    export function detectedColor(
        sensor: ColorSensor,
        color: ColorType
    ): boolean {

        // 自动进入颜色识别模式
        if (currentMode != ColorSensorMode.ColorRecognition) {
            setMode(ColorSensorMode.ColorRecognition)
        }

        // 必须完整读取 4 bytes
        let buf = readData()

        // 返回值与目标颜色比较
        return buf[sensor] == color
    }


    //==================================================
    // 判断指定通道是否检测到黑线
    //==================================================
    //% blockId=LineFollower_DetectedBlack
    //% block="line follower %sensor detected black"
    //% group="Line Follower"
    //% weight=95
    export function lineFollowerDetected(
        sensor: ColorSensor
    ): boolean {

        // 自动进入二值识别模式
        if (currentMode != ColorSensorMode.BinaryRecognition) {
            setMode(ColorSensorMode.BinaryRecognition)
        }

        // 必须完整读取 4 bytes
        let buf = readData()
        return buf[sensor] == 1
    }


    //==================================================
    // 读取灰度识别值
    //==================================================
    //% blockId=ColorSensor_ReadGrayscale
    //% block="line follower %sensor grayscale value"
    //% group="Line Follower"
    //% weight=80
    export function readGrayscale(
        sensor: ColorSensor
    ): number {
        if (currentMode != ColorSensorMode.GrayscaleRecognition) {
            setMode(ColorSensorMode.GrayscaleRecognition)
        }
        let buf = readData()
        return buf[sensor]
    }

    //==================================================
    // 读取原始光敏值
    //==================================================
    //% blockId=ColorSensor_ReadRaw
    //% block="line follower %sensor raw photosensitive value"
    //% group="Line Follower"
    //% weight=70
    export function readRaw(
        sensor: ColorSensor
    ): number {
        if (currentMode != 15) {
            setMode(15)
        }

        let buf = readData()

        return buf[sensor]
    }


    // //==================================================
    // // 读取模块当前状态
    // //==================================================

    // //% blockId=ColorSensor_Status
    // //% block="line follower status"
    // //% group="Line Follower"
    // //% weight=60
    // export function status(): number {
    //     // 必须完整读取 4 bytes
    //     let buf = readData()
    //     return buf[3]
    // }
}