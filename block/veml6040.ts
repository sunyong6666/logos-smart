//----------------------------------颜色传感器-------------------------------
const GAIN_R = 1.82
const GAIN_G = 1.5
const GAIN_B = 2.4

// ===== VEML6040 I2C 地址 =====
const VEML6040_ADDR = 0x10

// ===== 寄存器地址 =====
const REG_CONF = 0x00
const REG_RED = 0x08
const REG_GREEN = 0x09
const REG_BLUE = 0x0A
const REG_WHITE = 0x0B

// ===== 积分时间 =====
const IT_320MS = 0x30

// ===== 自动 / 强制 =====
const AF_AUTO = 0x00
const SD_ENABLE = 0x00

enum DetectedColor {
    //% block="red"
    Red,
    //% block="orange"
    Orange,
    //% block="yellow"
    Yellow,
    //% block="green"
    Green,
    //% block="cyan"
    Cyan,
    //% block="blue"
    Blue,
    //% block="purple"
    Purple,
    //% block="white"
    White,
    //% block="black"
    Black
}

// 颜色
enum enRGB {
    //% block="R"
    Red,
    //% block="G"
    Green,
    //% block="B"
    Blue,
}

namespace LogosSmart {
    let veml_initialized = false

    // ==================== 辅助函数 ====================

    function setConfiguration() {
        let buf = pins.createBuffer(3)
        buf[0] = REG_CONF;
        buf[1] = IT_320MS | AF_AUTO | SD_ENABLE;
        buf[2] = 0;
        pins.i2cWriteBuffer(VEML6040_ADDR, buf, false);
    }

    //读取颜色值
    function readReg(reg: number): number {
        let regBuf = pins.createBuffer(1)
        regBuf[0] = reg

        pins.i2cWriteBuffer(VEML6040_ADDR, regBuf, true)
        basic.pause(5)

        let data = pins.i2cReadBuffer(VEML6040_ADDR, 2, false)

        return data[0] | (data[1] << 8)
    }

    let cacheR = 0
    let cacheG = 0
    let cacheB = 0
    let cacheW = 0

    let lastReadTime = 0
    const READ_INTERVAL = 320

    function updateRGB() {
        if (!veml_initialized) {
            init_veml()
        }

        let now = control.millis()

        // 控制读取频率
        if (now - lastReadTime < READ_INTERVAL) return

        let s = readReg(REG_RED)
        let h = readReg(REG_GREEN)
        let c = readReg(REG_BLUE)
        let w = readReg(REG_WHITE)

        // 防止异常值
        if (s == 0 && h == 0 && c == 0 && w == 0) return

        cacheR = s
        cacheG = h
        cacheB = c
        cacheW = w
        //serial.writeLine("R=" + s + " G=" + h + " B=" + c + " W=" + w)

        lastReadTime = now
    }


    // ==================== 功能模块 ====================

    //初始化
    //% blockId=init_veml
    //% block="init color sensor"
    //% group="Color Sensor" 
    //% weight=99
    export function init_veml(): void {
        if (!veml_initialized) {
            setConfiguration();
            // 等待时间
            basic.pause(320);
            veml_initialized = true
        }
    }

    //检测颜色
    //% blockId=isColorDetected
    //% block="detect color %color?"
    //% group="Color Sensor" 
    //% weight=98
    export function isColorDetected(color: DetectedColor): boolean {
        updateRGB()

        let r = cacheR
        let g = cacheG
        let b = cacheB
        let w = cacheW

        // ===== 增益 + 白光归一化 =====
        let nr = (r / w) * GAIN_R
        let ng = (g / w) * GAIN_G
        let nb = (b / w) * GAIN_B

        // ===== 再归一化=====
        let sum = nr + ng + nb
        nr /= sum
        ng /= sum
        nb /= sum

        serial.writeLine("r="+nr + " g="+ng + " b="+nb)

        // ===== 计算 max/min =====
        let max = max3(nr, ng, nb)
        let min = min3(nr, ng, nb)

        // ===== 饱和度 =====
        if (max == 0) return false
        let s = 0
        if (max != min) {
            s = (max - min) / max
        }
        //serial.writeLine("S="+s + " w="+w)
        // ===== 黑白判断 =====
        // 黑色：亮度低
        if (w < 8500) {
            //serial.writeLine( "black")
            return color == DetectedColor.Black
        }
        // 白色：亮度高 + 饱和度低
        if (s < 0.07) {
            //serial.writeLine("white")
            return color == DetectedColor.White
        }

        // ===== Hue =====
        let h = 0

        if (max == nr) {
            h = 60 * ((ng - nb) / (max - min))
        } else if (max == ng) {
            h = 60 * (2 + (nb - nr) / (max - min))
        } else {
            h = 60 * (4 + (nr - ng) / (max - min))
        }

        if (h < 0) h += 360

        //serial.writeLine("H=" + h + " S=" + s)

        // ===== 分类（区间判断）=====
        if (color == DetectedColor.Red) {
            if (h < 16 || h >= 345) return true
            return false
        } else if (color == DetectedColor.Orange) {
            if (h >= 16 && h < 35) return true
            return false
        } else if (color == DetectedColor.Yellow) {
            if (h >= 35 && h < 70) return true
            return false
        } else if (color == DetectedColor.Green) {
            if (h >= 70 && h < 180) return true
            return false
        } else if (color == DetectedColor.Cyan) {
            if (h >= 180 && h < 200) return true
            return false
        } else if (color == DetectedColor.Blue) {
            if (h >= 200 && h < 240) return true
            return false
        } else if (color == DetectedColor.Purple) {
            if (h >= 240 && h < 345) return true
            return false
        }
        return false
    }

    //读取亮度
    //% blockId=readWhiteValue
    //% block="read brightness"
    //% group="Color Sensor" 
    //% weight=97
    export function readWhiteValue(): number {
        updateRGB()

        let nw = Math.round(cacheW * 255 / 65535)

        if (nw > 255) nw = 255
        if (nw < 0) nw = 0

        return nw
    }

    function max3(a: number, b: number, c: number): number {
        let m = a
        if (b > m) m = b
        if (c > m) m = c
        return m
    }

    function min3(a: number, b: number, c: number): number {
        let m = a
        if (b < m) m = b
        if (c < m) m = c
        return m
    }
}

