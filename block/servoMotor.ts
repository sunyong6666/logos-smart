//====================电机模块====================

enum enMotorcolor {
    //% block="red"
    red = 81,

    //% block="green"
    blue = 82,

    //% block="blue"
    green = 83,

    //% block="yellow"
    yellow = 84
}

namespace LogosSmart {
    let caraddress1 = 81
    let caraddress2 = 82


    
    //% blockId=LogosSmart_runMotor
    //% block="Motor %motoraddress rotate at %speed"
    //% speed.min=-100 speed.max=100
    //% group="Motor"
    export function runMotor(motoraddress: enMotorcolor, speed: number): void {
        speed = speed / 2
        let speed_Buff
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


    //绝对位移
    //% blockId=LogosSmart_writeMotorLocation
    //% block="Motor %motoraddress rotate speed %speed to %location degrees"
    //% speed.min=0 speed.max=100
    //% location.min=-360 location.max=360
    //% group="Motor"
    export function writeMotorLocation(motoraddress: enMotorcolor, speed: number, location: number): void {
        if (speed == 0) {
            return
        }
        speed = speed / 2

        let speed_Buff2
        if (speed < 0) {
            speed = -speed
            speed_Buff2 = (~speed) + 1
            speed_Buff2 = speed_Buff2 | 0x80
        } else {
            speed_Buff2 = speed
        }

        let location_Buff2
        if (location < 0) {
            location = -location
            location_Buff2 = (~location) + 1
            location_Buff2 = location_Buff2 | 0x8000
        } else {
            location_Buff2 = location
        }

        let GetBuff3 = pins.createBuffer(6)
        GetBuff3 = pins.i2cReadBuffer(motoraddress, 6)

        // if (((location - 5) <= getMotorLocation(GetBuff3)) && (getMotorLocation(GetBuff3) <= (location + 5))) {
        //     return
        // }

        let SetBuff2 = pins.createBuffer(4)

        SetBuff2.setNumber(NumberFormat.UInt8BE, 0, 0x3)
        SetBuff2.setNumber(NumberFormat.UInt8BE, 1, speed_Buff2)
        SetBuff2.setNumber(NumberFormat.UInt8BE, 2, location_Buff2 >> 8)
        SetBuff2.setNumber(NumberFormat.UInt8BE, 3, location_Buff2)

        pins.i2cWriteBuffer(motoraddress, SetBuff2)

        let flag2 = GetBuff3.getNumber(NumberFormat.Int8BE, 5)

        while (true) {
            GetBuff3 = pins.i2cReadBuffer(motoraddress, 6)
            flag2 = GetBuff3.getNumber(NumberFormat.Int8BE, 5)
            if (flag2 == 3) break
        }

        while (true) {
            GetBuff3 = pins.i2cReadBuffer(motoraddress, 6)
            flag2 = GetBuff3.getNumber(NumberFormat.Int8BE, 5)
            if (flag2 == 11 || flag2 == 10) break
        }
    }

    //相对位移
    //% blockId=LogosSmart_writeMotorRelativeLocation
    //% block="Motor %motoraddress rotate speed %speed relative %location degrees"
    //% speed.min=-100 speed.max=100
    //% location.min=0
    //% group="Motor"
    export function writeMotorRelativeLocation(motoraddress: enMotorcolor, speed: number, location: number): void {
        if (((location <= 5) && (location >= 0)) || ((location >= -5) && (location <= 0))) {
            return
        }

        speed = speed / 2
        let location_Buff22

        if (speed < 0) {
            speed = -speed
            location_Buff22 = (~location) + 1
            location_Buff22 = location_Buff22 | 0x8000
        } else {
            location_Buff22 = location
        }

        let SetBuff = pins.createBuffer(4)

        SetBuff.setNumber(NumberFormat.UInt8BE, 0, 0x4)
        SetBuff.setNumber(NumberFormat.UInt8BE, 1, speed)
        SetBuff.setNumber(NumberFormat.UInt8BE, 2, location_Buff22 >> 8)
        SetBuff.setNumber(NumberFormat.UInt8BE, 3, location_Buff22)


        let GetBuff = pins.createBuffer(6)
        let flag3 = 0

        if (speed != 0) {
            pins.i2cWriteBuffer(motoraddress, SetBuff)
        } else {
            location = 0
        }

        if (location != 0) {
            while (true) {
                GetBuff = pins.i2cReadBuffer(motoraddress, 6)
                flag3 = GetBuff.getNumber(NumberFormat.Int8BE, 5)
                if (flag3 == 4) break
            }

            while (true) {
                GetBuff = pins.i2cReadBuffer(motoraddress, 6)
                flag3 = GetBuff.getNumber(NumberFormat.Int8BE, 5)
                if (flag3 == 11 || flag3 == 10) break
            }
        }
    }




    
}

    