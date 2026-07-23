//-------光敏-------
const lightI2cAddress = 0x20;
const LIGHT_BASE = 0x0A;

namespace LogosScratchJr {
    //% blockId=lightRaw
    //% block="light raw value"
    //% group="Photosensitive"
    //% weight=100
    export function lightRaw(): number {
        let buf = pins.createBuffer(1);
        buf[0] = LIGHT_BASE + 0x00;

        pins.i2cWriteBuffer(lightI2cAddress, buf, true);

        let r = pins.i2cReadBuffer(lightI2cAddress, 2);

        return (r[0] << 8) | r[1];
    }
}