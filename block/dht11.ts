//-------DHT11-------

const DHT11_ADDR = 0x27
const DHT11_BASE = 0x0A

namespace LogosSmart {
    //% blockId=DHT11_Temperature 
    //% block="DHT11 read temperature" 
    //% group="DHT11 Sensor" 
    //% weight=100 
    export function dht11Temperature(): number { 
        const register = DHT11_BASE + 0x00 
        pins.i2cWriteNumber( DHT11_ADDR, register, NumberFormat.UInt8BE, false ) 
        const buf = pins.i2cReadBuffer( DHT11_ADDR, 1, false ) 
        let temperature = buf[0]
        if (temperature > 127) {
            temperature -= 256
        }

        return temperature
    } 
    
    //% blockId=DHT11_Humidity 
    //% block="DHT11 read humidity" 
    //% group="DHT11 Sensor" 
    //% weight=99
    export function dht11Humidity(): number { 
        const register = DHT11_BASE + 0x01 
        pins.i2cWriteNumber( DHT11_ADDR, register, NumberFormat.UInt8BE, false ) 
        const buf = pins.i2cReadBuffer( DHT11_ADDR, 1, false ) 
        return buf[0] 
    } 

}




//-------Light Sensor-------

const LIGHT_ADDR = 0x20
const LIGHT_BASE = 0x0A
const LIGHT_REG_ANALOG = LIGHT_BASE + 0x00   // 偏移 0x00，模拟值，2字节 0-4095

namespace LogosSmart {
    //% blockId=Light_AnalogValue
    //% block="light sensor read analog value"
    //% group="Light Sensor"
    //% weight=98
    export function lightAnalogValue(): number {
        pins.i2cWriteNumber(
            LIGHT_ADDR,
            LIGHT_REG_ANALOG,
            NumberFormat.UInt8BE,
            false
        )
        const buf = pins.i2cReadBuffer(LIGHT_ADDR, 2, false)
        return buf.getNumber(NumberFormat.UInt16BE, 0)
    }
}