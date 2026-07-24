//-------摇杆-------

const rockerI2cAddress = 0x61;

enum rocket {
    //% block="X"
    X = 0,

    //% block="Y"
    Y = 1,

    //% block="Z"
    Z = 2
}

enum rock {
    //% block="up"
    up = 1,

    //% block="down"
    down = 2,

    //% block="left"
    left = 4,

    //% block="right"
    right = 3
}

namespace LogosSmart {

    //% blockId=rockerGetValue
    //% block="Joystick %direction moved"
    //% direction.fieldEditor="gridpicker"
    //% direction.fieldOptions.width=220
    //% direction.fieldOptions.columns=2
    //% group="Joystick Module"
    //% weight=27
    export function rocker(direction: rocket): number {
        let buf = pins.createBuffer(3)

        buf = pins.i2cReadBuffer(rockerI2cAddress, 3)

        let value = buf.getNumber(NumberFormat.Int8BE, direction)

        if(direction == 2){
            return -value
        }else{
            return value
        }
    }


    //% blockId=rockerDetect
    //% block="Joystick detected %orientation"
    //% orientation.fieldEditor="gridpicker"
    //% orientation.fieldOptions.width=220
    //% orientation.fieldOptions.columns=2
    //% group="Joystick Module"
    //% weight=26
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