//-------灯环-------
const ledRingI2cAddress = 0x24;
const LED_BASE = 0x0A;

enum LedRing {
    //% block="1"
    Ring1 = 0x24,

    //% block="2"
    Ring2 = 0x26
}

enum LedIndex {
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
    LED6 = 5,

    //% block="7"
    LED7 = 6
}

// 缓存7个灯的RGB状态
let ledColors = [
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
    0, 0, 0
];

namespace LogosScratchJr {

    //点亮
    function refreshLedRing(ring: LedRing): void {
        let buf = pins.createBuffer(22);

        buf[0] = LED_BASE + 0x01;

        for (let i = 0; i < 21; i++) {
            buf[i + 1] = ledColors[i];
        }

        pins.i2cWriteBuffer(ring, buf);
    }
    
    //% blockId=ledRingSetColor
    //% block="LED ring %ring set color r %r g %g b %b"
    //% group="LED Ring"
    //% weight=100
    //% r.min=0 r.max=255 r.defl=0 
    //% g.min=0 g.max=255 g.defl=0 
    //% b.min=0 b.max=255 b.defl=0
    export function ledRingSetColor(
        ring: LedRing,
        r: number,
        g: number,
        b: number
    ): void {

        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        for (let i = 0; i < 7; i++) {
            ledColors[i * 3 + 0] = r;
            ledColors[i * 3 + 1] = g;
            ledColors[i * 3 + 2] = b;
        }

        refreshLedRing(ring);
    }

    //% blockId=ledRingSetPixel
    //% block="LED ring %ring set LED %index color r %r g %g b %b"
    //% group="LED Ring"
    //% weight=98
    //% r.min=0 r.max=255 r.defl=0 
    //% g.min=0 g.max=255 g.defl=0 
    //% b.min=0 b.max=255 b.defl=0
    export function ledRingSetPixel(
        ring: LedRing,
        index: LedIndex,
        r: number,
        g: number,
        b: number
    ): void {

        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        ledColors[index * 3 + 0] = r;
        ledColors[index * 3 + 1] = g;
        ledColors[index * 3 + 2] = b;

        refreshLedRing(ring);
    }

    //% blockId=ledRingOffPixel
    //% block="LED ring %ring turn off LED %index"
    //% group="LED Ring"
    //% weight=97
    //% r.min=0 r.max=255 r.defl=0 
    //% g.min=0 g.max=255 g.defl=0 
    //% b.min=0 b.max=255 b.defl=0
    export function ledRingOffPixel(
        ring: LedRing,
        index: LedIndex
    ): void {

        ledColors[index * 3 + 0] = 0;
        ledColors[index * 3 + 1] = 0;
        ledColors[index * 3 + 2] = 0;

        refreshLedRing(ring);
    }
    
    //% blockId=ledRingOffAll
    //% block="LED ring %ring turn off all LEDs"
    //% group="LED Ring"
    //% weight=96
    //% r.min=0 r.max=255 r.defl=0 
    //% g.min=0 g.max=255 g.defl=0 
    //% b.min=0 b.max=255 b.defl=0
    export function ledRingOffAll(ring: LedRing): void {

        for (let i = 0; i < 21; i++) {
            ledColors[i] = 0;
        }

        refreshLedRing(ring);
    }

}