//-------DHT11-------

const DHT11_ADDR = 0x27

enum DHTType {
    //% block="temperature"
    Temperature = 0,

    //% block="humidity"
    Humidity = 2
}

namespace LogosSmart {

    //% blockId=DHT11_Read
    //% block="DHT11 read %type"
    //% group="DHT11 Sensor"
    //% weight=100
    export function dht11Read(type: DHTType): number {
        let trigger = pins.createBuffer(1)
        trigger[0] = 0xAC

        pins.i2cWriteBuffer(DHT11_ADDR, trigger)
        basic.pause(80)

        let buf = pins.i2cReadBuffer(DHT11_ADDR, 5)
        return buf[type]
    }

}