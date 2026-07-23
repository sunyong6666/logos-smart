//-------土壤湿度-------
const soilI2cAddress = 0x21;
const SOIL_BASE = 0x0A;

namespace LogosScratchJr {
    //% blockId=soilRaw
    //% block="soil raw value"
    //% group="Soil Moisture"
    //% weight=100
    export function soilRaw(): number {
        let buf = pins.createBuffer(1);
        buf[0] = SOIL_BASE + 0x00;

        pins.i2cWriteBuffer(soilI2cAddress, buf, true);

        let r = pins.i2cReadBuffer(soilI2cAddress, 2);

        return (r[0] << 8) | r[1];
    }
}