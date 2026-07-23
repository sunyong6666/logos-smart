//------伺服电机模块-----------

enum smart_enMotorColor {
    //% block="红色"
    Red = 0x51,
    //% block="绿色"
    Green = 0x52,
    //% block="蓝色"
    Blue = 0x53,
    //% block="黄色"
    Yellow = 0x54
}

namespace LogosSmart {

    // ==================== 私有变量 ====================

    let leftMotorAddr = smart_enMotorColor.Red;
    let rightMotorAddr = smart_enMotorColor.Green;

    // ==================== 协议常量 ====================

    const CMD_SPEED = 0x11;       // 速度模式
    const CMD_POS_ABS = 0x03;     // 绝对位置模式
    const CMD_POS_REL = 0x04;     // 相对位置模式
    const CMD_TIME = 0x12;        // 时间模式

    const STATUS_RUNNING = 0x04;  // 电机运行中
    const STATUS_DONE = 0x0B;     // 运行完成
    const STATUS_STALL = 0x0A;    // 堵转停止

    // ==================== 私有工具函数 ====================

    /**
     * 将用户速度(-100~100)转换为协议值
     * 规则：除以2，负数最高位(0x80)置1表示方向
     */
    function encodeSpeed(userSpeed: number): number {
        userSpeed = Math.floor(userSpeed / 2);
        if (userSpeed < 0) {
            userSpeed = -userSpeed;
            return (~userSpeed + 1) | 0x80;
        }
        return userSpeed;
    }

    /**
     * 将用户角度转换为协议值（用于相对位置）
     * 负数最高位(0x8000)置1表示反向
     */
    function encodeRelPosition(pos: number): number {
        if (pos < 0) {
            pos = -pos;
            return (~pos + 1) | 0x8000;
        }
        return pos;
    }

    /**
     * 将用户角度转换为协议值（用于绝对位置）
     * 负数最高位(0x8000)置1表示反向
     */
    function encodeAbsPosition(pos: number): number {
        if (pos < 0) {
            pos = -pos;
            return (~pos + 1) | 0x8000;
        }
        return pos;
    }

    /**
     * 从6字节缓冲区解析当前位置
     * 字节1(高位)+字节2(低位)，最高位为符号位
     */
    function parsePosition(buf: Buffer): number {
        let raw = (buf.getNumber(NumberFormat.Int8BE, 1) << 8)
            | buf.getNumber(NumberFormat.Int8BE, 2);
        if (raw & 0x8000) {
            return raw | 0xFFFF0000;  // 符号扩展到32位
        }
        return raw;
    }

    /**
     * 从6字节缓冲区解析当前速度
     * 字节0(高位)+字节1(低位)，最高位为符号位
     */
    function parseSpeed(buf: Buffer): number {
        let raw = (buf.getNumber(NumberFormat.Int8BE, 0) << 8)
            | buf.getNumber(NumberFormat.Int8BE, 1);
        if (raw & 0x8000) {
            return raw | 0xFFFF0000;
        }
        return raw;
    }

    /**
     * 读取电机状态字节(第6字节)
     */
    function readStatus(addr: number): number {
        const buf = pins.i2cReadBuffer(addr, 6);
        return buf.getNumber(NumberFormat.Int8BE, 5);
    }

    /**
     * 等待电机启动（状态变为 RUNNING）
     */
    function waitMotorStart(addr: number): void {
        while (true) {
            if ((readStatus(addr) & 0x0F) === STATUS_RUNNING) {
                break;
            }
        }
    }

    /**
     * 等待电机停止（状态变为 DONE 或 STALL）
     */
    function waitMotorStop(addr: number): void {
        while (true) {
            const status = readStatus(addr) & 0x0F;
            if (status === STATUS_DONE || status === STATUS_STALL) {
                break;
            }
        }
    }

    /**
     * 等待双电机全部停止
     */
    function waitDualMotorStop(addr1: number, addr2: number): void {
        while (true) {
            const s1 = readStatus(addr1) & 0x0F;
            const s2 = readStatus(addr2) & 0x0F;
            if ((s1 === STATUS_DONE || s1 === STATUS_STALL) &&
                (s2 === STATUS_DONE || s2 === STATUS_STALL)) {
                break;
            }
        }
    }

    /**
     * 等待任意一台电机启动（用于双电机同步）
     */
    function waitAnyMotorStart(addr1: number, addr2: number): void {
        while (true) {
            const s1 = readStatus(addr1) & 0x0F;
            const s2 = readStatus(addr2) & 0x0F;
            if (s1 === STATUS_RUNNING || s2 === STATUS_RUNNING) {
                break;
            }
        }
    }

    /**
     * 检查位置是否在目标范围内（±5度死区）
     */
    function isPositionReached(current: number, target: number): boolean {
        return (current >= target - 5) && (current <= target + 5);
    }

    // ==================== 单电机 ====================

    //% blockId=SuperBit_runMotor
    //% block="|%motoraddress|电机以|%speed|的速度旋转"
    //% speed.min=-100 speed.max=100
    //% parts="SuperBit_runMotor" subcategory=Movement group="伺服电机"
    export function runMotor(motoraddress: smart_enMotorColor, speed: number): void {
        const encodedSpeed = encodeSpeed(speed);
        const buf = pins.createBuffer(4);
        buf.setNumber(NumberFormat.UInt8BE, 0, CMD_SPEED);
        buf.setNumber(NumberFormat.UInt8BE, 1, encodedSpeed);
        buf.setNumber(NumberFormat.UInt8BE, 2, 0);
        buf.setNumber(NumberFormat.UInt8BE, 3, 0);
        pins.i2cWriteBuffer(motoraddress, buf);
    }

    //% blockId=writemotorlocation
    //% block="|%motoraddress|电机以|%speed|的速度转到|%location|度"
    //% speed.min=0 speed.max=100
    //% location.min=-360 location.max=360
    //% parts="writemotorlocation" subcategory=Movement group="伺服电机"
    export function writeMotorLocation(
        motoraddress: smart_enMotorColor,
        speed: number,
        location: number
    ): void {
        if (speed === 0) return;

        const encodedSpeed = encodeSpeed(speed);
        const encodedPos = encodeAbsPosition(location);

        // 检查是否已到达目标位置（±5度死区）
        const statusBuf = pins.i2cReadBuffer(motoraddress, 6);
        if (isPositionReached(parsePosition(statusBuf), location)) {
            return;
        }

        const buf = pins.createBuffer(4);
        buf.setNumber(NumberFormat.UInt8BE, 0, CMD_POS_ABS);
        buf.setNumber(NumberFormat.UInt8BE, 1, encodedSpeed);
        buf.setNumber(NumberFormat.UInt8BE, 2, encodedPos >> 8);
        buf.setNumber(NumberFormat.UInt8BE, 3, encodedPos);
        pins.i2cWriteBuffer(motoraddress, buf);

        waitMotorStart(motoraddress);
        waitMotorStop(motoraddress);
    }

    //% blockId=writemotorrelativelocation
    //% block="|%motoraddress|电机以|%speed|的速度相对旋转|%location|度"
    //% speed.min=-100 speed.max=100
    //% location.min=0
    //% parts="writemotorrelativelocation" subcategory=Movement group="伺服电机"
    export function writeMotorRelativeLocation(
        motoraddress: smart_enMotorColor,
        speed: number,
        location: number
    ): void {
        // ±5度以内直接忽略
        if (location >= -5 && location <= 5) return;

        const encodedSpeed = encodeSpeed(speed);
        const encodedPos = encodeRelPosition(location);

        const buf = pins.createBuffer(4);
        buf.setNumber(NumberFormat.UInt8BE, 0, CMD_POS_REL);
        buf.setNumber(NumberFormat.UInt8BE, 1, encodedSpeed);
        buf.setNumber(NumberFormat.UInt8BE, 2, encodedPos >> 8);
        buf.setNumber(NumberFormat.UInt8BE, 3, encodedPos);
        pins.i2cWriteBuffer(motoraddress, buf);

        waitMotorStart(motoraddress);
        waitMotorStop(motoraddress);
    }

    //% blockId=writemotorrelativetime
    //% block="|%motoraddress|电机以|%speed|的速度运行|%time|秒"
    //% speed.min=-100 speed.max=100
    //% parts="writemotorrelativetime" subcategory=Movement group="伺服电机"
    export function writeMotorRelativeTime(
        motoraddress: smart_enMotorColor,
        speed: number,
        time: number
    ): void {
        const encodedSpeed = encodeSpeed(speed);

        // 最小运行时间限制为0.1秒
        if (time > 0 && time < 0.1) time = 0.1;
        const encodedTime = Math.floor(time * 10);

        const buf = pins.createBuffer(4);
        buf.setNumber(NumberFormat.UInt8BE, 0, CMD_TIME);
        buf.setNumber(NumberFormat.UInt8BE, 1, encodedSpeed);
        buf.setNumber(NumberFormat.UInt8BE, 2, encodedTime >> 8);
        buf.setNumber(NumberFormat.UInt8BE, 3, encodedTime);
        pins.i2cWriteBuffer(motoraddress, buf);

        if (encodedTime === 0) return;

        if (encodedSpeed & 0x80) {
            // 负速度：用延时等待
            const endTime = control.millis() + encodedTime * 100;
            while (control.millis() <= endTime) {}
        } else {
            // 正速度：等待状态机
            waitMotorStart(motoraddress);
            waitMotorStop(motoraddress);
        }
    }

    // ==================== 双电机  ====================

    //% blockId=SuperBit_runDMotor
    //% block="左电机以|%speed1|的速度、右电机以|%speed2|的速度旋转"
    //% speed1.min=-100 speed1.max=100
    //% speed2.min=-100 speed2.max=100
    //% parts="SuperBit_runDMotor" subcategory=Movement group="伺服电机"
    export function runDMotor(speed1: number, speed2: number): void {
        const buf1 = pins.createBuffer(4);
        const buf2 = pins.createBuffer(4);

        buf1.setNumber(NumberFormat.UInt8BE, 0, CMD_SPEED);
        buf1.setNumber(NumberFormat.UInt8BE, 1, encodeSpeed(-speed1)); // 左电机方向反转
        buf1.setNumber(NumberFormat.UInt8BE, 2, 0);
        buf1.setNumber(NumberFormat.UInt8BE, 3, 0);

        buf2.setNumber(NumberFormat.UInt8BE, 0, CMD_SPEED);
        buf2.setNumber(NumberFormat.UInt8BE, 1, encodeSpeed(speed2));
        buf2.setNumber(NumberFormat.UInt8BE, 2, 0);
        buf2.setNumber(NumberFormat.UInt8BE, 3, 0);

        pins.i2cWriteBuffer(leftMotorAddr, buf1);
        pins.i2cWriteBuffer(rightMotorAddr, buf2);
    }

    //% blockId=writeDmotorlocation
    //% block="双电机以|%speed1|和|%speed2|的速度转到|%location|度"
    //% speed1.min=-100 speed1.max=100
    //% speed2.min=-100 speed2.max=100
    //% location.min=0
    //% parts="writeDmotorlocation" subcategory=Movement group="伺服电机"
    export function writeDMotorLocation(
        speed1: number,
        speed2: number,
        location: number
    ): void {
        if (location >= -5 && location <= 5) return;

        const buf1 = pins.createBuffer(4);
        const buf2 = pins.createBuffer(4);

        buf1.setNumber(NumberFormat.UInt8BE, 0, CMD_POS_REL);
        buf1.setNumber(NumberFormat.UInt8BE, 1, encodeSpeed(-speed1));
        buf1.setNumber(NumberFormat.UInt8BE, 2, encodeRelPosition(location) >> 8);
        buf1.setNumber(NumberFormat.UInt8BE, 3, encodeRelPosition(location));

        buf2.setNumber(NumberFormat.UInt8BE, 0, CMD_POS_REL);
        buf2.setNumber(NumberFormat.UInt8BE, 1, encodeSpeed(speed2));
        buf2.setNumber(NumberFormat.UInt8BE, 2, encodeRelPosition(location) >> 8);
        buf2.setNumber(NumberFormat.UInt8BE, 3, encodeRelPosition(location));

        pins.i2cWriteBuffer(leftMotorAddr, buf1);
        pins.i2cWriteBuffer(rightMotorAddr, buf2);

        waitAnyMotorStart(leftMotorAddr, rightMotorAddr);
        waitDualMotorStop(leftMotorAddr, rightMotorAddr);
    }

    //% blockId=writeDmotortime
    //% block="双电机以|%speed1|和|%speed2|的速度运行|%time|秒"
    //% speed1.min=-100 speed1.max=100
    //% speed2.min=-100 speed2.max=100
    //% time.min=0
    //% parts="writeDmotortime" subcategory=Movement group="伺服电机"
    export function writeDMotorTime(
        speed1: number,
        speed2: number,
        time: number
    ): void {
        if (time > 0 && time < 0.1) time = 0.1;
        const encodedTime = Math.floor(time * 10);

        const buf1 = pins.createBuffer(4);
        const buf2 = pins.createBuffer(4);

        buf1.setNumber(NumberFormat.UInt8BE, 0, CMD_TIME);
        buf1.setNumber(NumberFormat.UInt8BE, 1, encodeSpeed(-speed1));
        buf1.setNumber(NumberFormat.UInt8BE, 2, encodedTime >> 8);
        buf1.setNumber(NumberFormat.UInt8BE, 3, encodedTime);

        buf2.setNumber(NumberFormat.UInt8BE, 0, CMD_TIME);
        buf2.setNumber(NumberFormat.UInt8BE, 1, encodeSpeed(speed2));
        buf2.setNumber(NumberFormat.UInt8BE, 2, encodedTime >> 8);
        buf2.setNumber(NumberFormat.UInt8BE, 3, encodedTime);

        if (speed1 !== 0) pins.i2cWriteBuffer(leftMotorAddr, buf1);
        if (speed2 !== 0) pins.i2cWriteBuffer(rightMotorAddr, buf2);

        if (encodedTime !== 0 && (speed1 !== 0 || speed2 !== 0)) {
            waitAnyMotorStart(leftMotorAddr, rightMotorAddr);
            waitDualMotorStop(leftMotorAddr, rightMotorAddr);
        }
    }

    //% blockId=SuperBit_DMotor
    //% block="设置左电机地址为|%motoraddress1|，右电机地址为|%motoraddress2|"
    //% parts="SuperBit_DMotor" subcategory=Movement group="伺服电机"
    export function setDMotor(
        motoraddress1: smart_enMotorColor,
        motoraddress2: smart_enMotorColor
    ): void {
        leftMotorAddr = motoraddress1;
        rightMotorAddr = motoraddress2;
    }

    // ==================== 读取  ====================

    //% blockId=readmotorspeed
    //% block="读取|%motoraddress|电机的转速"
    //% parts="readmotorspeed" subcategory=Movement group="伺服电机"
    export function readMotorSpeed(motoraddress: smart_enMotorColor): number {
        const buf = pins.i2cReadBuffer(motoraddress, 6);
        return parseSpeed(buf);
    }

    //% blockId=readmotorlocation
    //% block="读取|%motoraddress|电机的位置"
    //% parts="readmotorlocation" subcategory=Movement group="伺服电机"
    export function readMotorLocation(motoraddress: smart_enMotorColor): number {
        const buf = pins.i2cReadBuffer(motoraddress, 6);
        return parsePosition(buf);
    }
}