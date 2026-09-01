//-------DHT11-------

const DHT11_ADDR = 0x27
const DHT11_BASE = 0x0A


namespace LogosSmart {

    // //% blockId=DHT11_Read
    // //% block="DHT11 read %type"
    // //% group="DHT11 Sensor"
    // //% weight=100
    // export function dht11Read(type: DHTType): number {
    //     let trigger = pins.createBuffer(1)
    //     trigger[0] = 0xAC

    //     pins.i2cWriteBuffer(DHT11_ADDR, trigger)
    //     basic.pause(80)

    //     let buf = pins.i2cReadBuffer(DHT11_ADDR, 5)
    //     return buf[type]
    // }

    //% blockId=DHT11_Temperature 
    //% block="DHT11 read temperature" 
    //% group="DHT11 Sensor" 
    //% weight=100 
    export function dht11Temperature(): number { 
        // DHT11 基地址 + 温度寄存器偏移 0x00 
        const register = DHT11_BASE + 0x00 
        pins.i2cWriteNumber( DHT11_ADDR, register, NumberFormat.UInt8BE, false ) 
        const buf = pins.i2cReadBuffer( DHT11_ADDR, 1, false ) 
        return buf[0] 
    } 
    

    //% blockId=DHT11_Humidity 
    //% block="DHT11 read humidity" 
    //% group="DHT11 Sensor" 
    //% weight=99
    export function dht11Humidity(): number { 
        // DHT11 基地址 + 湿度寄存器偏移 0x01 
        const register = DHT11_BASE + 0x01 
        pins.i2cWriteNumber( DHT11_ADDR, register, NumberFormat.UInt8BE, false ) 
        const buf = pins.i2cReadBuffer( DHT11_ADDR, 1, false ) 
        return buf[0] 
    } 

}