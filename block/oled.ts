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

let font: number[] = [];
font[0] = 0x0022d422;
font[1] = 0x0022d422;
font[2] = 0x0022d422;
font[3] = 0x0022d422;
font[4] = 0x0022d422;
font[5] = 0x0022d422;
font[6] = 0x0022d422;
font[7] = 0x0022d422;
font[8] = 0x0022d422;
font[9] = 0x0022d422;
font[10] = 0x0022d422;
font[11] = 0x0022d422;
font[12] = 0x0022d422;
font[13] = 0x0022d422;
font[14] = 0x0022d422;
font[15] = 0x0022d422;
font[16] = 0x0022d422;
font[17] = 0x0022d422;
font[18] = 0x0022d422;
font[19] = 0x0022d422;
font[20] = 0x0022d422;
font[21] = 0x0022d422;
font[22] = 0x0022d422;
font[23] = 0x0022d422;
font[24] = 0x0022d422;
font[25] = 0x0022d422;
font[26] = 0x0022d422;
font[27] = 0x0022d422;
font[28] = 0x0022d422;
font[29] = 0x0022d422;
font[30] = 0x0022d422;
font[31] = 0x0022d422;
font[32] = 0x00000000;
font[33] = 0x000002e0;
font[34] = 0x00018060;
font[35] = 0x00afabea;
font[36] = 0x00aed6ea;
font[37] = 0x01991133;
font[38] = 0x010556aa;
font[39] = 0x00000060;
font[40] = 0x000045c0;
font[41] = 0x00003a20;
font[42] = 0x00051140;
font[43] = 0x00023880;
font[44] = 0x00002200;
font[45] = 0x00021080;
font[46] = 0x00000100;
font[47] = 0x00111110;
font[48] = 0x0007462e;
font[49] = 0x00087e40;
font[50] = 0x000956b9;
font[51] = 0x0005d629;
font[52] = 0x008fa54c;
font[53] = 0x009ad6b7;
font[54] = 0x008ada88;
font[55] = 0x00119531;
font[56] = 0x00aad6aa;
font[57] = 0x0022b6a2;
font[58] = 0x00000140;
font[59] = 0x00002a00;
font[60] = 0x0008a880;
font[61] = 0x00052940;
font[62] = 0x00022a20;
font[63] = 0x0022d422;
font[64] = 0x00e4d62e;
font[65] = 0x000f14be;
font[66] = 0x000556bf;
font[67] = 0x0008c62e;
font[68] = 0x0007463f;
font[69] = 0x0008d6bf;
font[70] = 0x000094bf;
font[71] = 0x00cac62e;
font[72] = 0x000f909f;
font[73] = 0x000047f1;
font[74] = 0x0017c629;
font[75] = 0x0008a89f;
font[76] = 0x0008421f;
font[77] = 0x01f1105f;
font[78] = 0x01f4105f;
font[79] = 0x0007462e;
font[80] = 0x000114bf;
font[81] = 0x000b6526;
font[82] = 0x010514bf;
font[83] = 0x0004d6b2;
font[84] = 0x0010fc21;
font[85] = 0x0007c20f;
font[86] = 0x00744107;
font[87] = 0x01f4111f;
font[88] = 0x000d909b;
font[89] = 0x00117041;
font[90] = 0x0008ceb9;
font[91] = 0x0008c7e0;
font[92] = 0x01041041;
font[93] = 0x000fc620;
font[94] = 0x00010440;
font[95] = 0x01084210;
font[96] = 0x00000820;
font[97] = 0x010f4a4c;
font[98] = 0x0004529f;
font[99] = 0x00094a4c;
font[100] = 0x000fd288;
font[101] = 0x000956ae;
font[102] = 0x000097c4;
font[103] = 0x0007d6a2;
font[104] = 0x000c109f;
font[105] = 0x000003a0;
font[106] = 0x0006c200;
font[107] = 0x0008289f;
font[108] = 0x000841e0;
font[109] = 0x01e1105e;
font[110] = 0x000e085e;
font[111] = 0x00064a4c;
font[112] = 0x0002295e;
font[113] = 0x000f2944;
font[114] = 0x0001085c;
font[115] = 0x00012a90;
font[116] = 0x010a51e0;
font[117] = 0x010f420e;
font[118] = 0x00644106;
font[119] = 0x01e8221e;
font[120] = 0x00093192;
font[121] = 0x00222292;
font[122] = 0x00095b52;
font[123] = 0x0008fc80;
font[124] = 0x000003e0;
font[125] = 0x000013f1;
font[126] = 0x00841080;
font[127] = 0x0022d422;

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
function oledWriteCommand3(cmd: number,data1: number,data2: number): void {
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
function oledSetColumn(x: number,page: number,data: number): void {
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
            pageBuffer[x + 1] = oledScreen[page * OLED_WIDTH + x];
        }

        pins.i2cWriteBuffer(OLED_I2C_ADDRESS, pageBuffer);
    }
}

//==================================================
// OLED 显示字符
//==================================================
// 在指定字符坐标显示字符串
function oledDrawString(x: number,y: number,text: string,color: number): void {
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

        let glyph = font[code];

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


namespace LogosSmart {

    /**
     * 初始化 OLED
     */
    //% blockId=logosSmartOledInit
    //% block="init OLED"
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
    //% color.min=0 color.max=1 color.defl=1
    //% group="OLED"
    //% weight=89
    //% inlineInputMode=inline
    export function oledShowString(x: number,y: number,text: string,color: number = 1): void {
        oledDrawString(x, y, text, color);
    }

    /**
     * 显示数字
     */
    //% blockId=logosSmartOledShowNumber
    //% block="OLED show number at X %x Y %y number %num color %color"
    //% color.min=0 color.max=1 color.defl=1
    //% group="OLED"
    //% weight=88
    //% inlineInputMode=inline
    export function oledShowNumber(x: number,y: number,num: number,color: number = 1): void {
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
