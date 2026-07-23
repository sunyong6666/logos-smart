//-------按键-------
const buttonI2cAddress = 0x22;  // I2C设备地址
const BUTTON_BASE = 0x0A;

namespace LogosScratchJr {
    //% blockId=buttonPressed
    //% block="button pressed?"
    //% group="Button"
    //% weight=100
    export function buttonPressed(): boolean {
        let buf = pins.createBuffer(1);
        buf[0] = BUTTON_BASE + 0x00;

        pins.i2cWriteBuffer(buttonI2cAddress, buf);

        let r = pins.i2cReadBuffer(buttonI2cAddress, 1);
        return r[0] == 1;
    }

    //% blockId=buttonLongPressed
    //% block="button long pressed?"
    //% group="Button"
    //% weight=99
    export function buttonLongPressed(): boolean {
        let buf = pins.createBuffer(1);
        buf[0] = BUTTON_BASE + 0x01;

        pins.i2cWriteBuffer(buttonI2cAddress, buf, true);

        let r = pins.i2cReadBuffer(buttonI2cAddress, 1);
        return r[0] == 2;
    }

    //% blockId=buttonClickCount
    //% block="click count"
    //% group="Button"
    //% weight=98
    export function buttonClickCount(): number {
        let buf = pins.createBuffer(1);
        buf[0] = BUTTON_BASE + 0x02;

        pins.i2cWriteBuffer(buttonI2cAddress, buf, true);

        let r = pins.i2cReadBuffer(buttonI2cAddress, 1);

        return r[0];
    }

}