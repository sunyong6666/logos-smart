//-------超声波-------
const ultrasonicI2cAddress = 0x23;
const ULTRASONIC_BASE = 0x0A;

namespace LogosSmart {
    //% blockId=ultrasonicGetDistance
    //% block="ultrasonic distance (mm)"
    //% group="Distance Sensor"
    //% weight=99
    export function ultrasonicDistance(): number {
        basic.pause(20);
        let buf = pins.createBuffer(1);
        buf[0] = ULTRASONIC_BASE + 0x00;

        pins.i2cWriteBuffer(ultrasonicI2cAddress, buf, true);

        // 读取 2 字节距离
        let r = pins.i2cReadBuffer(ultrasonicI2cAddress, 2);

        // 大端拼接
        return (r[0] << 8) | r[1];
    }
}