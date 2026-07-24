//-------摇杆-------

const rockerI2cAddress = 0x61;

enum rocket {
    //% block="X"
    X = 1,

    //% block="Y"
    Y = 2,

}

enum rock {
    //% block="up"
    up = 2,

    //% block="down"
    down = 1,

    //% block="left"
    left = 4,

    //% block="right"
    right = 3
}

namespace LogosSmart {

    //获取值
    //% blockId=rockerGetValue
    //% block="joystick %direction moved"
    //% group="Joystick Module"
    //% weight=99
    export function rockerGetValue(direction: rocket): number {
        let buf = pins.createBuffer(3)

        buf = pins.i2cReadBuffer(rockerI2cAddress, 3)

        let value = buf.getNumber(NumberFormat.Int8BE, direction)

        if(direction == 2){
            return -value
        }else{
            return value
        }
    }


    //方向判断
    //% blockId=rockerDetect
    //% block="joystick detected %orientation"
    //% group="Joystick Module"
    //% weight=98
    export function rockerDetect(orientation: rock): boolean {
        let buf = pins.createBuffer(3)

        buf = pins.i2cReadBuffer(rockerI2cAddress, 3)

        let ud = buf.getNumber(NumberFormat.Int8BE, 2)
        let lr = buf.getNumber(NumberFormat.Int8BE, 1)

        let flag = false

        if(orientation == 1){
            flag = ud > 50
        }

        if(orientation == 2){
            flag = ud < -50
        }

        if(orientation == 4){
            flag = lr < -50
        }

        if(orientation == 3){
            flag = lr > 50
        }

        return flag
    }

}