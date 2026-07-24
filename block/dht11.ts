//-------DHT11-------
const DHT11_ADDR = 0x27

enum DHTType {
    //% block="temperature"
    Temperature = 0,
    //% block="humidity"
    Humidity = 1
}

namespace LogosSmart {
    //% blockId=DHT11_Read 
    //% block="DHT11 read %type"
    //% group="DHT11 Sensor"
    export function dht11Read(type: DHTType): number {
        let trigger = pins.createBuffer(1)
        trigger[0] = 0xAC
        pins.i2cWriteBuffer(DHT11_ADDR, trigger)
        basic.pause(80)  // 等待转换完成

        // 读6字节数据
        let buf = pins.i2cReadBuffer(DHT11_ADDR, 6)

        // 数据格式：状态 + 湿度高8位 + 湿度低8位 + 温度高8位 + 温度低8位 + 校验
        let humRaw = ((buf[1] << 8) | buf[2]) & 0x0FFF
        let tempRaw = ((buf[3] << 8) | buf[4]) & 0x0FFF

        // 校验
        let checksum = (buf[1] + buf[2] + buf[3] + buf[4]) & 0xFF
        if (buf[5] != checksum) {
            return -999
        }

        if (type == DHTType.Humidity) {
            return Math.round((humRaw / 4096) * 100)
        } else {
            return Math.round(((tempRaw / 4096) * 200) - 50)
        }
    }
}