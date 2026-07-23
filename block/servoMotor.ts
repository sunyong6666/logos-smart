//---------------------------------- Servo Motor模块 -------------------------------

enum MotorAddr {
    //% block="red"
    Red = 0x51,
    //% block="green"
    Green = 0x52,
    //% block="blue"
    Blue = 0x53,
    //% block="yellow"
    Yellow = 0x54
}

namespace LogosSmart {
    // ==================== 状态常量 ====================
    const FLAG_IDLE = 0
    const FLAG_RUN = 4
    const FLAG_DONE = 11
    const FLAG_STALL = 10

    // ==================== 双电机地址 ====================
    let leftMotorAddr = 0x51
    let rightMotorAddr = 0x52

    // ==================== 辅助函数 ====================
    function getMotorLocation(buffer: Buffer): number {
        let location_Buff = (buffer.getNumber(NumberFormat.Int8BE, 1) << 8) + buffer.getNumber(NumberFormat.Int8BE, 2)
        if (location_Buff & 0x0080) {
            return location_Buff + 0x0100
        }
        return location_Buff
    }

    function getMotorSpeed(buffer: Buffer): number {
        let v = (buffer.getNumber(NumberFormat.Int8BE, 0) << 8) + buffer.getNumber(NumberFormat.Int8BE, 1)
        if (v & 0x0080) {
            return v + 0x0100
        }
        return v
    }

    function readFlag(addr: number): number {
        return pins.i2cReadBuffer(addr, 6).getNumber(NumberFormat.Int8BE, 5)
    }

    function waitAnyRun(addr: number): void {
        while (true) {
            if (readFlag(addr) === FLAG_RUN) break
        }
    }

    function waitDone(addr: number): void {
        while (true) {
            let f = readFlag(addr)
            if (f === FLAG_DONE || f === FLAG_STALL) break
        }
    }

    function waitDualDone(a1: number, a2: number): void {
        while (true) {
            let f1 = readFlag(a1)
            let f2 = readFlag(a2)
            if ((f1 === FLAG_DONE || f1 === FLAG_STALL) &&
                (f2 === FLAG_DONE || f2 === FLAG_STALL)) break
        }
    }

    // ==================== 单电机 ====================

    //速度模式
    //% blockId=Motor_Run
    //% block="Motor %motoraddress rotate at %speed "
    //% speed.min=-100 speed.max=100
    //% group="Servo Motor" 
    //% weight=89
    export function run(motoraddress: MotorAddr, speed: number): void {
        speed = speed / 2
        let speed_Buff: number
        if (speed < 0) {
            speed = -speed
            speed_Buff = (~speed) + 1
            speed_Buff = speed_Buff | 0x80
        } else {
            speed_Buff = speed
        }

        let SetBuff = pins.createBuffer(4)
        SetBuff.setNumber(NumberFormat.UInt8BE, 0, 0x11)
        SetBuff.setNumber(NumberFormat.UInt8BE, 1, speed_Buff)
        SetBuff.setNumber(NumberFormat.UInt8BE, 2, 0)
        SetBuff.setNumber(NumberFormat.UInt8BE, 3, 0)
        pins.i2cWriteBuffer(motoraddress, SetBuff)
    }

    // 绝对位置
    //% blockId=Motor_Goto
    //% block="Motor %motoraddress rotate at %speed to %location|°"
    //% speed.min=0 speed.max=100
    //% location.min=-360 location.max=360
    //% group="Servo Motor" 
    //% weight=88
    export function goto(motoraddress: MotorAddr, speed: number, location: number): void {
        if (speed == 0) return

        speed = speed / 2
        let speed_Buff2: number
        if (speed < 0) {
            speed = -speed
            speed_Buff2 = (~speed) + 1
            speed_Buff2 = speed_Buff2 | 0x80
        } else {
            speed_Buff2 = speed
        }

        let location_Buff2: number
        if (location < 0) {
            location = -location
            location_Buff2 = (~location) + 1
            location_Buff2 = location_Buff2 | 0x8000
        } else {
            location_Buff2 = location
        }

        // 读当前位置做死区判断
        let GetBuff3 = pins.i2cReadBuffer(motoraddress, 6)
        if (((location - 5) <= getMotorLocation(GetBuff3)) && (getMotorLocation(GetBuff3) <= (location + 5))) {
            return
        }

        let SetBuff2 = pins.createBuffer(4)
        SetBuff2.setNumber(NumberFormat.UInt8BE, 0, 0x3)
        SetBuff2.setNumber(NumberFormat.UInt8BE, 1, speed_Buff2)
        SetBuff2.setNumber(NumberFormat.UInt8BE, 2, location_Buff2 >> 8)
        SetBuff2.setNumber(NumberFormat.UInt8BE, 3, location_Buff2)
        pins.i2cWriteBuffer(motoraddress, SetBuff2)

        // 先等"有电机转起来"
        let flag2 = 0
        while (true) {
            GetBuff3 = pins.i2cReadBuffer(motoraddress, 6)
            flag2 = GetBuff3.getNumber(NumberFormat.Int8BE, 5)
            if (flag2 == 3) break
        }
        //再等"结束或堵转"（
        while (true) {
            GetBuff3 = pins.i2cReadBuffer(motoraddress, 6)
            flag2 = GetBuff3.getNumber(NumberFormat.Int8BE, 5)
            if (flag2 == 11 || flag2 == 10) break
        }
    }

    // 相对位置
    //% blockId=Motor_MoveRel
    //% block="Motor %motoraddress rotate at %speed by %location|°"
    //% speed.min=-100 speed.max=100
    //% location.min=0
    //% group="Servo Motor" 
    //% weight=87
    export function moveRel(motoraddress: MotorAddr, speed: number, location: number): void {
        // ±5度内忽略
        if (((location <= 5) && (location >= 0)) || ((location >= -5) && (location <= 0))) return

        speed = speed / 2
        let location_Buff22: number
        if (speed < 0) {
            speed = -speed
            location_Buff22 = (~location) + 1
            location_Buff22 = location_Buff22 | 0x8000
        } else {
            location_Buff22 = location
        }

        let SetBuff22 = pins.createBuffer(4)
        SetBuff22.setNumber(NumberFormat.UInt8BE, 0, 0x4)
        SetBuff22.setNumber(NumberFormat.UInt8BE, 1, speed)
        SetBuff22.setNumber(NumberFormat.UInt8BE, 2, location_Buff22 >> 8)
        SetBuff22.setNumber(NumberFormat.UInt8BE, 3, location_Buff22)

        let GetBuff4 = pins.createBuffer(6)
        let flag3 = 0

        if (speed != 0) {
            pins.i2cWriteBuffer(motoraddress, SetBuff22)
        } else {
            location = 0
        }

        if (location != 0) {
            while (true) {
                GetBuff4 = pins.i2cReadBuffer(motoraddress, 6)
                flag3 = GetBuff4.getNumber(NumberFormat.Int8BE, 5)
                if (flag3 == 4) break
            }
            while (true) {
                GetBuff4 = pins.i2cReadBuffer(motoraddress, 6)
                flag3 = GetBuff4.getNumber(NumberFormat.Int8BE, 5)
                if (flag3 == 11 || flag3 == 10) break
            }
        }
    }

    // 定时运行
    //% blockId=Motor_RunTime
    //% block="Motor %motoraddress rotate at %speed for %time seconds"
    //% speed.min=-100 speed.max=100
    //% group="Servo Motor" 
    //% weight=86
    export function runTime(motoraddress: MotorAddr, speed: number, time: number): void {
        speed = speed / 2
        if (time > 0 && time < 0.1) time = 0.1
        time = time * 10

        let speed_Buff: number
        if (speed < 0) {
            speed = -speed
            speed_Buff = (~speed) + 1
            speed_Buff = speed_Buff | 0x80
        } else {
            speed_Buff = speed
        }

        let SetBuff = pins.createBuffer(4)
        SetBuff.setNumber(NumberFormat.UInt8BE, 0, 0x12)
        SetBuff.setNumber(NumberFormat.UInt8BE, 1, speed_Buff)
        SetBuff.setNumber(NumberFormat.UInt8BE, 2, time >> 8)
        SetBuff.setNumber(NumberFormat.UInt8BE, 3, time)

        let flag4 = 0
        pins.i2cWriteBuffer(motoraddress, SetBuff)

        if (time != 0) {
            if (speed <= 0) {
                // 负速度用 millis 延时等待
                let waitFalg = control.millis() + (time * 100)
                while (control.millis() <= waitFalg) { }
            } else {
                let GetBuff = pins.createBuffer(6)
                while (true) {
                    GetBuff = pins.i2cReadBuffer(motoraddress, 6)
                    flag4 = GetBuff.getNumber(NumberFormat.Int8BE, 5)
                    if (flag4 == 0x7) break
                }
                while (true) {
                    GetBuff = pins.i2cReadBuffer(motoraddress, 6)
                    flag4 = GetBuff.getNumber(NumberFormat.Int8BE, 5)
                    if (flag4 == 11) break
                }
            }
        }
    }



    // ==================== 双电机 ====================

    // 双电机地址设置
    //% blockId=Motor_SetDual
    //% block="set left motor to %motoraddress1 and right motor to %motoraddress2"
    //% group="Servo Motor" 
    //% weight=79
    export function setDual(motoraddress1: MotorAddr, motoraddress2: MotorAddr): void {
        leftMotorAddr = motoraddress1
        rightMotorAddr = motoraddress2
    }

    //速度模式
    //% blockId=Motor_RunDual
    //% block="Dual motors rotate at %speed1 and %speed2"
    //% speed1.min=-100 speed1.max=100
    //% speed2.min=-100 speed2.max=100
    //% group="Servo Motor" 
    //% weight=78
    export function runDual(speed1: number, speed2: number): void {
        speed1 = -speed1 / 2
        speed2 = speed2 / 2

        let speed_Buff1: number
        if (speed1 < 0) {
            speed1 = -speed1
            speed_Buff1 = (~speed1) + 1
            speed_Buff1 = speed_Buff1 | 0x80
        } else {
            speed_Buff1 = speed1
        }

        let speed_Buff23: number
        if (speed2 < 0) {
            speed2 = -speed2
            speed_Buff23 = (~speed2) + 1
            speed_Buff23 = speed_Buff23 | 0x80
        } else {
            speed_Buff23 = speed2
        }

        let SetBuff3 = pins.createBuffer(4)
        let SetBuffc = pins.createBuffer(4)

        SetBuff3.setNumber(NumberFormat.UInt8BE, 0, 0x11)
        SetBuff3.setNumber(NumberFormat.UInt8BE, 1, speed_Buff1)
        SetBuff3.setNumber(NumberFormat.UInt8BE, 2, 0)
        SetBuff3.setNumber(NumberFormat.UInt8BE, 3, 0)

        SetBuffc.setNumber(NumberFormat.UInt8BE, 0, 0x11)
        SetBuffc.setNumber(NumberFormat.UInt8BE, 1, speed_Buff23)
        SetBuffc.setNumber(NumberFormat.UInt8BE, 2, 0)
        SetBuffc.setNumber(NumberFormat.UInt8BE, 3, 0)

        pins.i2cWriteBuffer(leftMotorAddr, SetBuff3)
        pins.i2cWriteBuffer(rightMotorAddr, SetBuffc)
    }

    // ==================== 双电机：绝对位置 ====================

    //% blockId=Motor_GotoDual
    //% block="双电机 左速 %speed1 右速 %speed2 转 %location|°"
    //% speed1.min=-100 speed1.max=100
    //% speed2.min=-100 speed2.max=100
    //% location.min=0
    //% group="Servo Motor" weight=90
    export function gotoDual(speed1: number, speed2: number, location: number): void {
        if (((location <= 5) && (location >= 0)) || ((location >= -5) && (location <= 0))) return

        speed1 = -speed1 / 2
        speed2 = speed2 / 2

        let location_Buff1: number
        let location_Buff23: number

        if (speed2 < 0) {
            speed2 = -speed2
            location_Buff23 = (~location) + 1
        } else {
            location_Buff23 = location
        }

        if (speed1 < 0) {
            speed1 = -speed1
            location_Buff1 = (~location) + 1
        } else {
            location_Buff1 = location
        }

        if (speed1 == 0) location_Buff1 = 0
        if (speed2 == 0) location_Buff23 = 0

        let SetBuff23 = pins.createBuffer(4)
        let SetBuff2c = pins.createBuffer(4)

        SetBuff2c.setNumber(NumberFormat.UInt8BE, 0, 0x4)
        SetBuff2c.setNumber(NumberFormat.UInt8BE, 1, speed2)
        SetBuff2c.setNumber(NumberFormat.UInt8BE, 2, location_Buff23 >> 8)
        SetBuff2c.setNumber(NumberFormat.UInt8BE, 3, location_Buff23)

        SetBuff23.setNumber(NumberFormat.UInt8BE, 0, 0x4)
        SetBuff23.setNumber(NumberFormat.UInt8BE, 1, speed1)
        SetBuff23.setNumber(NumberFormat.UInt8BE, 2, location_Buff1 >> 8)
        SetBuff23.setNumber(NumberFormat.UInt8BE, 3, location_Buff1)

        if ((location != 0) && ((speed1 != 0) || (speed2 != 0))) {
            let GetBuff6 = pins.createBuffer(6)
            let GetBuff1 = pins.createBuffer(6)

            pins.i2cWriteBuffer(leftMotorAddr, SetBuff23)
            GetBuff1 = pins.i2cReadBuffer(leftMotorAddr, 6)
            pins.i2cWriteBuffer(rightMotorAddr, SetBuff2c)
            GetBuff6 = pins.i2cReadBuffer(rightMotorAddr, 6)

            let flag5 = GetBuff6.getNumber(NumberFormat.Int8BE, 5)
            let flag1 = GetBuff1.getNumber(NumberFormat.Int8BE, 5)

            while (true) {
                GetBuff6 = pins.i2cReadBuffer(rightMotorAddr, 6)
                GetBuff1 = pins.i2cReadBuffer(leftMotorAddr, 6)
                flag5 = GetBuff6.getNumber(NumberFormat.Int8BE, 5)
                flag1 = GetBuff1.getNumber(NumberFormat.Int8BE, 5)
                if (flag1 == 4 || flag5 == 4) break
            }
            while (true) {
                GetBuff6 = pins.i2cReadBuffer(rightMotorAddr, 6)
                GetBuff1 = pins.i2cReadBuffer(leftMotorAddr, 6)
                flag5 = GetBuff6.getNumber(NumberFormat.Int8BE, 5)
                flag1 = GetBuff1.getNumber(NumberFormat.Int8BE, 5)
                if ((flag1 == 11 || flag1 == 10) && (flag5 == 11 || flag5 == 10)) break
            }
        }
    }

    // ==================== 双电机：定时运行 ====================

    //% blockId=Motor_TimeDual
    //% block="双电机 左速 %speed1 右速 %speed2 运行 %time|秒"
    //% speed1.min=-100 speed1.max=100
    //% speed2.min=-100 speed2.max=100
    //% time.min=0
    //% group="Servo Motor" weight=88
    export function timeDual(speed1: number, speed2: number, time: number): void {
        speed1 = -speed1 / 2
        speed2 = speed2 / 2
        if (time > 0 && time < 0.1) time = 0.1
        time = time * 10

        let speed_Buff32: number
        if (speed1 < 0) {
            speed1 = -speed1
            speed_Buff32 = (~speed1) + 1
            speed_Buff32 = speed_Buff32 | 0x80
        } else {
            speed_Buff32 = speed1
        }

        let speed_Buff4: number
        if (speed2 < 0) {
            speed2 = -speed2
            speed_Buff4 = (~speed2) + 1
            speed_Buff4 = speed_Buff4 | 0x80
        } else {
            speed_Buff4 = speed2
        }

        let SetBuff32 = pins.createBuffer(4)
        let SetBuff4 = pins.createBuffer(4)

        SetBuff32.setNumber(NumberFormat.UInt8BE, 0, 0x12)
        SetBuff32.setNumber(NumberFormat.UInt8BE, 1, speed_Buff32)
        SetBuff32.setNumber(NumberFormat.UInt8BE, 2, time >> 8)
        SetBuff32.setNumber(NumberFormat.UInt8BE, 3, time)

        SetBuff4.setNumber(NumberFormat.UInt8BE, 0, 0x12)
        SetBuff4.setNumber(NumberFormat.UInt8BE, 1, speed_Buff4)
        SetBuff4.setNumber(NumberFormat.UInt8BE, 2, time >> 8)
        SetBuff4.setNumber(NumberFormat.UInt8BE, 3, time)

        if (speed1 != 0) pins.i2cWriteBuffer(leftMotorAddr, SetBuff32)
        if (speed2 != 0) pins.i2cWriteBuffer(rightMotorAddr, SetBuff4)

        if ((time !== 0) && ((speed1 !== 0) || (speed2 !== 0))) {
            let GetBuff7 = pins.createBuffer(6)
            let GetBuff12 = pins.createBuffer(6)

            GetBuff7 = pins.i2cReadBuffer(rightMotorAddr, 6)
            GetBuff12 = pins.i2cReadBuffer(leftMotorAddr, 6)

            let flag6 = GetBuff7.getNumber(NumberFormat.Int8BE, 5)
            let flag12 = GetBuff12.getNumber(NumberFormat.Int8BE, 5)

            while (true) {
                GetBuff7 = pins.i2cReadBuffer(rightMotorAddr, 6)
                GetBuff12 = pins.i2cReadBuffer(leftMotorAddr, 6)
                flag6 = GetBuff7.getNumber(NumberFormat.Int8BE, 5)
                flag12 = GetBuff12.getNumber(NumberFormat.Int8BE, 5)
                if (flag12 == 0x7 || flag6 == 0x7) break
            }
            while (true) {
                GetBuff7 = pins.i2cReadBuffer(rightMotorAddr, 6)
                GetBuff12 = pins.i2cReadBuffer(leftMotorAddr, 6)
                flag6 = GetBuff7.getNumber(NumberFormat.Int8BE, 5)
                flag12 = GetBuff12.getNumber(NumberFormat.Int8BE, 5)
                if ((flag12 == 11) && (flag6 == 11)) break
            }
        }
    }

    

    // ==================== 读取 ====================

    //% blockId=Motor_ReadSpeed
    //% block="读取电机 %motoraddress 速度"
    //% group="Servo Motor" weight=84
    export function readSpeed(motoraddress: MotorAddr): number {
        return pins.i2cReadBuffer(motoraddress, 6).getNumber(NumberFormat.Int8BE, 0)
    }

    //% blockId=Motor_ReadPos
    //% block="读取电机 %motoraddress 位置"
    //% group="Servo Motor" weight=82
    export function readPos(motoraddress: MotorAddr): number {
        return getMotorLocation(pins.i2cReadBuffer(motoraddress, 6))
    }
}