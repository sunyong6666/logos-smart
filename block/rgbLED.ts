//-------RGB LED-------
const RGB_LED_BASE = 0x0A

enum RGBLedRing {
    //% block="1"
    Ring1 = 0x24,

    //% block="2"
    Ring2 = 0x26
}


enum RGBLedIndex {
    //% block="1"
    LED1 = 0,

    //% block="2"
    LED2 = 1,

    //% block="3"
    LED3 = 2,

    //% block="4"
    LED4 = 3,

    //% block="5"
    LED5 = 4,

    //% block="6"
    LED6 = 5
}

// 6个RGB灯缓存
let rgbLedColors = [
    0,0,0,
    0,0,0,
    0,0,0,
    0,0,0,
    0,0,0,
    0,0,0
]


namespace LogosSmart {

    // ==================== RGB LED底层 ====================

    function refreshRGBLed(ring: RGBLedRing): void {
        // 1个地址 + 18个RGB数据 + 控制位
        let buf = pins.createBuffer(19)
        buf[0] = RGB_LED_BASE + 0x01
        for(let i = 0; i < 18; i++){
            buf[i + 1] = rgbLedColors[i]
        }

        pins.i2cWriteBuffer(ring,buf)
    }

    function limitRGB(value:number):number{
        return Math.max( 0,Math.min(255,value))
    }


    // ==================== 功能模块 ====================

    // 设置全部RGB LED颜色
    //% blockId=LogosSmart_RGBLed_SetColor
    //% block="RGB LED ring %ring set color r %r g %g b %b"
    //% group="RGB LED"
    //% weight=100
    //% r.min=0 r.max=255 r.defl=0
    //% g.min=0 g.max=255 g.defl=0
    //% b.min=0 b.max=255 b.defl=0
    export function RGBLedSetColor( ring: RGBLedRing,r:number, g:number,b:number):void{
        r = limitRGB(r)
        g = limitRGB(g)
        b = limitRGB(b)

        for(let i = 0; i < 6; i++){
            rgbLedColors[i*3] = r
            rgbLedColors[i*3+1] = g
            rgbLedColors[i*3+2] = b
        }
        refreshRGBLed(ring)
    }

    // 设置单个RGB LED颜色
    //% blockId=LogosSmart_RGBLed_SetPixel
    //% block="RGB LED ring %ring LED %index color r %r g %g b %b"
    //% group="RGB LED"
    //% weight=98
    //% r.min=0 r.max=255 r.defl=0
    //% g.min=0 g.max=255 g.defl=0
    //% b.min=0 b.max=255 b.defl=0
    export function RGBLedSetPixel(ring: RGBLedRing,index: RGBLedIndex,r:number,g:number,b:number):void{
        r = limitRGB(r)
        g = limitRGB(g)
        b = limitRGB(b)

        rgbLedColors[index*3] = r
        rgbLedColors[index*3+1] = g
        rgbLedColors[index*3+2] = b

        refreshRGBLed(ring)
    }

    // 关闭单个RGB LED
    //% blockId=LogosSmart_RGBLed_OffPixel
    //% block="RGB LED ring %ring turn off LED %index"
    //% group="RGB LED"
    //% weight=97
    export function RGBLedOffPixel(ring:RGBLedRing,index:RGBLedIndex):void{
        rgbLedColors[index*3] = 0
        rgbLedColors[index*3+1] = 0
        rgbLedColors[index*3+2] = 0

        refreshRGBLed(ring)
    }

    // 关闭全部RGB LED
    //% blockId=LogosSmart_RGBLed_OffAll
    //% block="RGB LED ring %ring turn off all LEDs"
    //% group="RGB LED"
    //% weight=96
    export function RGBLedOffAll(ring:RGBLedRing ):void{
        for(let i = 0; i < 18; i++){
            rgbLedColors[i] = 0
        }

        refreshRGBLed(ring)
    }
}