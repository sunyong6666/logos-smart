//---------------------------------- LCD1602 模块 -------------------------------

let lcdLastUpdateTime = 0
const LCD_INTERVAL = 150

enum LcdBacklight {
    //% block="on"
    On = 1,

    //% block="off"
    Off = 0
}


namespace LogosSmart {
    const LCD1602_ADDR = 0x20
    let lcdBacklight = 0x08

    // ==================== 辅助函数 ====================

    function write4Bits(value: number) {
        let buf = pins.createBuffer(3)
        buf[0] = value | lcdBacklight
        buf[1] = value | lcdBacklight | 0x04
        buf[2] = value | lcdBacklight
        pins.i2cWriteBuffer(LCD1602_ADDR, buf)
    }

    function send(value: number, mode: number) {
        let rs = mode ? 0x01 : 0x00
        let high = (value & 0xF0) | lcdBacklight | rs
        let low = ((value << 4) & 0xF0) | lcdBacklight | rs
        write4Bits(high)
        write4Bits(low)
    }

    function command(cmd: number) {
        send(cmd, 0)
    }

    function data(value: number) {
        send(value, 1)
    }

    function setCursor(col: number, row: number) {
        let rowOffsets = [0x00, 0x40]
        command(0x80 | (col + rowOffsets[row]))
    }


    // ==================== 功能模块 ====================

    //% blockId=LogosSmart_LCD1602_Init
    //% block="init LCD1602"
    //% group="LCD1602"
    //% weight=100
    export function LCD1602Init() {
        basic.pause(50)

        write4Bits(0x30)
        basic.pause(5)

        write4Bits(0x30)
        basic.pause(1)

        write4Bits(0x30)
        write4Bits(0x20)

        command(0x28) // 4bit 2行
        command(0x0C) // 开显示
        command(0x06) // 光标移动
        command(0x01) // 清屏

        basic.pause(5)
    }

    // 清屏
    //% blockId=LogosSmart_LCD1602_Clear
    //% block="LCD1602 clear"
    //% group="LCD1602"
    //% weight=99
    export function LCD1602Clear() {
        command(0x01)
        basic.pause(2)
    }

    // 显示文字
    //% blockId=LogosSmart_LCD1602_Show
    //% block="LCD1602 show %text row %row col %col"
    //% text.defl="hello"
    //% row.min=0 row.max=1 row.defl=0
    //% col.min=0 col.max=15 col.defl=0
    //% group="LCD1602"
    //% weight=98
    export function LCD1602Show(text: string, row: number,col: number) {
        let now = control.millis()
        if (now - lcdLastUpdateTime < LCD_INTERVAL)
            return

        lcdLastUpdateTime = now
        setCursor(col, row)
        for (let i = 0; i < text.length; i++) {
            data(text.charCodeAt(i))
        }
    }

    // 显示数字
    //% blockId=LogosSmart_LCD1602_Number
    //% block="LCD1602 show number %num row %row col %col"
    //% num.defl=0
    //% row.min=0 row.max=1 row.defl=0
    //% col.min=0 col.max=15 col.defl=0
    //% group="LCD1602"
    //% weight=97
    export function LCD1602Number(num: number,row: number,col: number) {
        LCD1602Show(num.toString(),row,col)
    }


    // 背光控制
    //% blockId=LogosSmart_LCD1602_Backlight
    //% block="LCD1602 backlight %state"
    //% group="LCD1602"
    //% weight=96
    export function LCD1602Backlight(state: LcdBacklight) {
        lcdBacklight =state == LcdBacklight.On? 0x08: 0x00
        command(0)
    }

}