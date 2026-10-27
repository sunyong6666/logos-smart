//==================================================
// OLED 模块
//==================================================

const OLED_I2C_ADDRESS = 0x3C;
const OLED_WIDTH = 128;
const OLED_HEIGHT = 64;
const OLED_PAGE_COUNT = 8;
const OLED_CHAR_WIDTH = 5;

// OLED 显存：128 × 64 / 8 = 1024 字节
let oledScreen = pins.createBuffer(OLED_WIDTH * OLED_PAGE_COUNT);

// OLED 初始化状态
let oledInitialized = false;

//==================================================
// OLED 底层 I2C 操作
//==================================================

// 发送单条命令
function oledWriteCommand(cmd: number): void {
    let buf = pins.createBuffer(2);
    buf[0] = 0x00;
    buf[1] = cmd;
    pins.i2cWriteBuffer(OLED_I2C_ADDRESS, buf);
}

// 发送一条带参数的命令
function oledWriteCommand2(cmd: number, data: number): void {
    let buf = pins.createBuffer(3);
    buf[0] = 0x00;
    buf[1] = cmd;
    buf[2] = data;
    pins.i2cWriteBuffer(OLED_I2C_ADDRESS, buf);
}

// 发送三字节命令参数
function oledWriteCommand3(
    cmd: number,
    data1: number,
    data2: number
): void {
    let buf = pins.createBuffer(4);
    buf[0] = 0x00;
    buf[1] = cmd;
    buf[2] = data1;
    buf[3] = data2;
    pins.i2cWriteBuffer(OLED_I2C_ADDRESS, buf);
}

// 设置 OLED 页地址和列地址
function oledSetPosition(col: number, page: number): void {
    oledWriteCommand(0xB0 | page);
    oledWriteCommand(0x00 | (col & 0x0F));
    oledWriteCommand(0x10 | ((col >> 4) & 0x0F));
}

//==================================================
// OLED 显存操作
//==================================================

// 清空显存
function oledClearBuffer(): void {
    oledScreen.fill(0);
}

// 设置一个像素列数据
function oledSetColumn(
    x: number,
    page: number,
    data: number
): void {
    if (x < 0 || x >= OLED_WIDTH) return;
    if (page < 0 || page >= OLED_PAGE_COUNT) return;

    oledScreen[page * OLED_WIDTH + x] = data & 0xFF;
}

//==================================================
// OLED 刷新屏幕
//==================================================

function oledDraw(): void {
    let pageBuffer = pins.createBuffer(OLED_WIDTH + 1);

    // 第一个字节 0x40 表示后续数据为显示数据
    pageBuffer[0] = 0x40;

    for (let page = 0; page < OLED_PAGE_COUNT; page++) {
        oledSetPosition(0, page);

        for (let x = 0; x < OLED_WIDTH; x++) {
            pageBuffer[x + 1] =
                oledScreen[page * OLED_WIDTH + x];
        }

        pins.i2cWriteBuffer(OLED_I2C_ADDRESS, pageBuffer);
    }
}

//==================================================
// OLED 显示字符
//==================================================

// 在指定字符坐标显示字符串
function oledDrawString(
    x: number,
    y: number,
    text: string,
    color: number
): void {
    if (!oledInitialized) return;

    // 限制坐标
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (y >= OLED_PAGE_COUNT) return;

    let startX = x * OLED_CHAR_WIDTH;

    for (let i = 0; i < text.length; i++) {
        let code = text.charCodeAt(i);

        // 当前字库仅包含 ASCII 字符
        if (code < 0 || code > 127) {
            code = 63; // 不支持的字符显示为 ?
        }

        let glyph = oledFont[code];

        for (let col = 0; col < OLED_CHAR_WIDTH; col++) {
            let columnData = 0;

            for (let row = 0; row < 5; row++) {
                if (glyph & (1 << (5 * col + row))) {
                    columnData |= (1 << (row + 1));
                }
            }

            if (color == 0) {
                columnData = 255 - columnData;
            }

            let px = startX + i * OLED_CHAR_WIDTH + col;

            if (px >= OLED_WIDTH) {
                return;
            }

            oledSetColumn(px, y, columnData);
        }
    }

    oledDraw();
}

//==================================================
// LogosSmart OLED 积木接口
//==================================================

namespace LogosSmart {

    /**
     * 初始化 OLED
     */
    //% blockId=logosSmartOledInit
    //% block="Initialize OLED"
    //% group="OLED"
    //% weight=90
    export function oledInit(): void {
        oledInitialized = false;

        oledWriteCommand(0xAE);
        oledWriteCommand(0xA4);
        oledWriteCommand2(0xD5, 0xF0);
        oledWriteCommand2(0xA8, 0x3F);
        oledWriteCommand2(0xD3, 0x00);
        oledWriteCommand(0x40);
        oledWriteCommand2(0x8D, 0x14);
        oledWriteCommand2(0x20, 0x00);
        oledWriteCommand3(0x21, 0, 127);
        oledWriteCommand3(0x22, 0, 63);
        oledWriteCommand(0xA1);
        oledWriteCommand(0xC8);
        oledWriteCommand2(0xDA, 0x12);
        oledWriteCommand2(0x81, 0xCF);
        oledWriteCommand2(0xD9, 0xF1);
        oledWriteCommand2(0xDB, 0x40);
        oledWriteCommand(0xA6);
        oledWriteCommand2(0xD6, 1);
        oledWriteCommand(0xAF);

        oledClearBuffer();
        oledInitialized = true;
        oledDraw();
    }

    /**
     * 显示字符串
     */
    //% blockId=logosSmartOledShowString
    //% block="OLED show text at X %x Y %y text %text color %color"
    //% x.min=0 x.max=25 x.defl=0
    //% y.min=0 y.max=7 y.defl=0
    //% color.min=0 color.max=1 color.defl=1
    //% group="OLED"
    //% weight=89
    //% inlineInputMode=inline
    export function oledShowString(
        x: number,
        y: number,
        text: string,
        color: number = 1
    ): void {
        oledDrawString(x, y, text, color);
    }

    /**
     * 显示数字
     */
    //% blockId=logosSmartOledShowNumber
    //% block="OLED show number at X %x Y %y number %num color %color"
    //% x.min=0 x.max=25 x.defl=0
    //% y.min=0 y.max=7 y.defl=0
    //% color.min=0 color.max=1 color.defl=1
    //% group="OLED"
    //% weight=88
    //% inlineInputMode=inline
    export function oledShowNumber(
        x: number,
        y: number,
        num: number,
        color: number = 1
    ): void {
        oledDrawString(x, y, num.toString(), color);
    }

    /**
     * 清屏
     */
    //% blockId=logosSmartOledClear
    //% block="OLED clear screen"
    //% group="OLED"
    //% weight=87
    export function oledClear(): void {
        if (!oledInitialized) return;

        oledClearBuffer();
        oledDraw();
    }
}
