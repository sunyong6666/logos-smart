//---------------------------------- 底盘模块 -------------------------------
const Board_i2cAddress = 0x09;  // I2C设备地址

const Board_group_I2cAddress = 0x8C//电机组

const Board_led_I2cAddress = 0x0A//led

// 选择控制的电机
enum motorID {
    //% block="1"
    motor0 = 0x50,
    //% block="2"
    motor1 = 0x6E
}

// 运动类型
enum motionType {
    //% block="forward"
    type1 = 1,
    //% block="backward"
    type2 = 2,
    //% block="left"
    type3 = 3,
    //% block="right"
    type4 = 4
}
// 运动类型(前后)
enum motionType1 {
    //% block="forward"
    type1 = 5,
    //% block="backward"
    type2 = 6
}
// 运动类型(左右)
enum motionType2 {
    //% block="left"
    type1 = 9,
    //% block="right"
    type2 = 10
}

// 单电机运动方向
enum motorDirection {
    //% block="forward"
    clockwise = 1,
    //% block="reverse"
    counterclockwise = 2
}
namespace LogosSmart {
    //#########################################################################
    //################################## 运动（双电机）#########################
    //#########################################################################
    //% blockId=motionSpeed
    //% block="move %mtype at speed %mspeed"
    //% group="Board" weight=99
    //% mspeed.min=-100 mspeed.max=100 mspeed.defl=50
    export function motionSpeed(mtype: motionType, mspeed: number): void {
        if (mspeed > 100) mspeed = 100;
        if (mspeed < -100) mspeed = -100;

        // 根据速度正负决定是否反转方向
        let finalType = mtype;
        if (mspeed < 0) {
            switch (mtype) {
                case motionType.type1:
                    finalType = motionType.type2;
                    break;
                case motionType.type2:
                    finalType = motionType.type1;
                    break;
                case motionType.type3:
                    finalType = motionType.type4;
                    break;
                case motionType.type4:
                    finalType = motionType.type3;
                    break;
            }
        }

        const spAddr = Board_group_I2cAddress + 0x01;//设置速度
        mspeed = Math.abs(mspeed);//绝对值
        let spBuff = pins.createBuffer(5);
        spBuff.setNumber(NumberFormat.UInt8BE, 0, spAddr);
        spBuff.setNumber(NumberFormat.UInt8BE, 1, (mspeed >> 8) & 0xFF);
        spBuff.setNumber(NumberFormat.UInt8BE, 2, mspeed & 0xFF);
        spBuff.setNumber(NumberFormat.UInt8BE, 3, (mspeed >> 8) & 0xFF);
        spBuff.setNumber(NumberFormat.UInt8BE, 4, mspeed & 0xFF);
        pins.i2cWriteBuffer(Board_i2cAddress, spBuff);
        const regAddr = Board_group_I2cAddress + 0x00;//执行
        let cmdBuff = pins.createBuffer(2);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, regAddr);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, finalType);
        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);
    }
    //% blockId=motionDistance
    //% block="move %mtype at speed %mspeed for %distance cm"
    //% group="Board" weight=98
    //% mspeed.min=-100 mspeed.max=100 mspeed.defl=50
    //% distance.min=0 distance.max=1000 distance.defl=10
    export function motionDistance(mtype: motionType1, mspeed: number, distance: number): void {
        if (distance < 0) distance = 0;
        if (distance > 1000) distance = 1000;

        if (mspeed > 100) mspeed = 100;
        if (mspeed < -100) mspeed = -100;

        // 根据速度正负决定是否反转方向
        let finalType = mtype;
        if (mspeed < 0) {
            switch (mtype) {
                case motionType1.type1:
                    finalType = motionType1.type2;
                    break;
                case motionType1.type2:
                    finalType = motionType1.type1;
                    break;
            }
        }

        const spAddr = Board_group_I2cAddress + 0x01;//设置速度
        mspeed = Math.abs(mspeed);//绝对值
        let spBuff = pins.createBuffer(5);
        spBuff.setNumber(NumberFormat.UInt8BE, 0, spAddr);
        spBuff.setNumber(NumberFormat.UInt8BE, 1, (mspeed >> 8) & 0xFF);
        spBuff.setNumber(NumberFormat.UInt8BE, 2, mspeed & 0xFF);
        spBuff.setNumber(NumberFormat.UInt8BE, 3, (mspeed >> 8) & 0xFF);
        spBuff.setNumber(NumberFormat.UInt8BE, 4, mspeed & 0xFF);
        pins.i2cWriteBuffer(Board_i2cAddress, spBuff);
        const disAddr = Board_group_I2cAddress + 0x02;//设置距离
        let disBuff = pins.createBuffer(3);
        disBuff.setNumber(NumberFormat.UInt8BE, 0, disAddr);
        disBuff.setNumber(NumberFormat.UInt8BE, 1, (distance >> 8) & 0xFF);
        disBuff.setNumber(NumberFormat.UInt8BE, 2, distance & 0xFF);
        pins.i2cWriteBuffer(Board_i2cAddress, disBuff);
        const regAddr = Board_group_I2cAddress + 0x00;//执行
        let cmdBuff = pins.createBuffer(2);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, regAddr);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, finalType);
        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);

        // 轮询状态（阻塞）
        basic.pause(100);
        while (true) {
            pins.i2cWriteNumber(Board_i2cAddress, Board_group_I2cAddress + 0x05, NumberFormat.UInt8BE);
            let state = pins.i2cReadNumber(Board_i2cAddress, NumberFormat.UInt8BE);
            if (state == 0) {
                break;
            }
            basic.pause(20);
        }
    }
    //% blockId=motionAngle
    //% block="move %mtype at speed %mspeed for %angle °"
    //% group="Board" weight=97
    //% mspeed.min=-100 mspeed.max=100 mspeed.defl=50
    //% angle.min=0 angle.max=1000 angle.defl=90
    export function motionAngle(mtype: motionType2, mspeed: number, angle: number): void {
        if (angle < 0) angle = 0;
        if (angle > 1000) angle = 1000;

        if (mspeed > 100) mspeed = 100;
        if (mspeed < -100) mspeed = -100;
        // 根据速度正负决定是否反转方向
        let finalType = mtype;
        if (mspeed < 0) {
            switch (mtype) {
                case motionType2.type1:
                    finalType = motionType2.type2;
                    break;
                case motionType2.type2:
                    finalType = motionType2.type1;
                    break;
            }
        }

        const spAddr = Board_group_I2cAddress + 0x01;//设置速度
        mspeed = Math.abs(mspeed);//绝对值
        let spBuff = pins.createBuffer(5);
        spBuff.setNumber(NumberFormat.UInt8BE, 0, spAddr);
        spBuff.setNumber(NumberFormat.UInt8BE, 1, (mspeed >> 8) & 0xFF);
        spBuff.setNumber(NumberFormat.UInt8BE, 2, mspeed & 0xFF);
        spBuff.setNumber(NumberFormat.UInt8BE, 3, (mspeed >> 8) & 0xFF);
        spBuff.setNumber(NumberFormat.UInt8BE, 4, mspeed & 0xFF);
        pins.i2cWriteBuffer(Board_i2cAddress, spBuff);
        const disAddr = Board_group_I2cAddress + 0x04;//设置角度
        let disBuff = pins.createBuffer(3);
        disBuff.setNumber(NumberFormat.UInt8BE, 0, disAddr);
        disBuff.setNumber(NumberFormat.UInt8BE, 1, (angle >> 8) & 0xFF);
        disBuff.setNumber(NumberFormat.UInt8BE, 2, angle & 0xFF);
        pins.i2cWriteBuffer(Board_i2cAddress, disBuff);
        const regAddr = Board_group_I2cAddress + 0x00;//执行
        let cmdBuff = pins.createBuffer(2);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, regAddr);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, finalType);
        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);

        // 轮询状态（阻塞）
        basic.pause(100);
        while (true) {
            pins.i2cWriteNumber(Board_i2cAddress, Board_group_I2cAddress + 0x05, NumberFormat.UInt8BE);
            let state = pins.i2cReadNumber(Board_i2cAddress, NumberFormat.UInt8BE);
            if (state == 0) {
                break;
            }
            basic.pause(20);
        }
    }
    //% blockId=motionStop
    //% block="stop motion"
    //% group="Board" weight=96
    export function motionStop(): void {
        const regAddr = Board_group_I2cAddress + 0x00;//执行
        let cmdBuff = pins.createBuffer(2);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, regAddr);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, 0);
        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);
    }
    //% blockId=motionSetWheel
    //% block="set rotation angle compensation %num \\%"
    //% num.min=-50 num.max=50 num.defl=0
    //% group="Board" weight=95
    export function motionSetWheel(num: number): void {
        if (num < -50) num = -50;
        if (num > 50) num = 50;

        const regAddr = Board_group_I2cAddress + 0x06;
        let cmdBuff = pins.createBuffer(2);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, regAddr);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, num);

        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);
        basic.pause(50);
    }


    //#########################################################################
    //##################################单电机#################################
    //#########################################################################
    //% blockId=motorGetSpeed
    //% block="get motor %mID speed"
    //% group="Board" weight=89
    export function motorGetSpeed(mID: motorID): number {
        // 发送指令
        const cmdAddr = mID + 0x01;
        let cmdBuff = pins.createBuffer(1);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, cmdAddr);
        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);

        // 读取2字节数据
        let readBuff = pins.createBuffer(2);
        readBuff = pins.i2cReadBuffer(Board_i2cAddress, 2);
        // 将2个字节作为有符号16位整数解析
        let speed = readBuff.getNumber(NumberFormat.Int16BE, 0);
        return speed;
    }

    //% blockId=motorGetAngle
    //% block="get motor %mID encoder value"
    //% group="Board" weight=88
    export function motorGetAngle(mID: motorID): number {
        // 发送指令
        const cmdAddr = mID + 0x00;
        let cmdBuff = pins.createBuffer(1);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, cmdAddr);
        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);

        // 读取4字节数据（32位有符号整数）
        let readBuff = pins.createBuffer(4);
        readBuff = pins.i2cReadBuffer(Board_i2cAddress, 4);

        // 将4个字节作为有符号32位整数解析
        let angle = readBuff.getNumber(NumberFormat.Int32BE, 0);
        return angle;
    }

    //% blockId=motorRun
    //% block="run motor %mID at speed %mspeed"
    //% mspeed.min=-100 mspeed.max=100 mspeed.defl=50
    //% group="Board" weight=87
    export function motorRun(mID: motorID, mspeed: number): void {
        if (mspeed > 100) mspeed = 100;
        if (mspeed < -100) mspeed = -100;
        // 根据速度正负决定是否反转方向
        let finalType = 1;
        if (mspeed < 0) {
            finalType = 2;
        }
        // 设置速度
        const spAddr = mID + 0x04;
        mspeed = Math.abs(mspeed);//绝对值
        let spBuff = pins.createBuffer(3);
        spBuff.setNumber(NumberFormat.UInt8BE, 0, spAddr);
        spBuff.setNumber(NumberFormat.UInt8BE, 1, (mspeed >> 8) & 0xFF);
        spBuff.setNumber(NumberFormat.UInt8BE, 2, mspeed & 0xFF);
        pins.i2cWriteBuffer(Board_i2cAddress, spBuff);

        // 发送运动指令
        const cmdAddr = mID + 0x03;
        let cmdBuff = pins.createBuffer(2);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, cmdAddr);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, finalType);
        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);
    }

    //% blockId=motorRunDistance
    //% block="run motor %mID at speed %mspeed for %distance cm"
    //% group="Board" weight=86
    //% distance.min=0 distance.max=1000 distance.defl=10
    //% mspeed.min=-100 mspeed.max=100 mspeed.defl=50
    //% inlineInputMode = inline
    export function motorRunDistance(mID: motorID, mspeed: number, distance: number): void {
        if (distance < 0) distance = 0;
        if (distance > 1000) distance = 1000;

        if (mspeed > 100) mspeed = 100;
        if (mspeed < -100) mspeed = -100;
        // 根据速度正负决定是否反转方向
        let finalType = 1;
        if (mspeed < 0) {
            finalType = 2;
        }
        // 设置速度
        const spAddr = mID + 0x04;
        mspeed = Math.abs(mspeed);//绝对值
        let spBuff = pins.createBuffer(3);
        spBuff.setNumber(NumberFormat.UInt8BE, 0, spAddr);
        spBuff.setNumber(NumberFormat.UInt8BE, 1, (mspeed >> 8) & 0xFF);
        spBuff.setNumber(NumberFormat.UInt8BE, 2, mspeed & 0xFF);
        pins.i2cWriteBuffer(Board_i2cAddress, spBuff);

        //设置距离
        const disAddr = mID + 0x07;
        let disBuff = pins.createBuffer(3);
        disBuff.setNumber(NumberFormat.UInt8BE, 0, disAddr);
        disBuff.setNumber(NumberFormat.UInt8BE, 1, (distance >> 8) & 0xFF);
        disBuff.setNumber(NumberFormat.UInt8BE, 2, distance & 0xFF);
        pins.i2cWriteBuffer(Board_i2cAddress, disBuff);
        // 发送运动指令
        const cmdAddr = mID + 0x03;
        let cmdBuff = pins.createBuffer(2);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, cmdAddr);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, finalType + 6);
        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);

        // 轮询状态（阻塞）
        basic.pause(100);
        while (true) {
            pins.i2cWriteNumber(Board_i2cAddress, mID + 0x09, NumberFormat.UInt8BE);
            let state = pins.i2cReadNumber(Board_i2cAddress, NumberFormat.UInt8BE);
            if (state == 0) {
                break;
            }
            basic.pause(20);
        }
    }

    //% blockId=motorRunAngle
    //% block="run motor %mID at speed %mspeed %angle °"
    //% group="Board" weight=85
    //% angle.min=0 angle.max=3600 angle.defl=90
    //% mspeed.min=-100 mspeed.max=100 mspeed.defl=50
    //% inlineInputMode = inline
    export function motorRunAngle(mID: motorID, mspeed: number, angle: number): void {
        if (angle < 0) angle = 0;
        if (angle > 3600) angle = 3600;

        if (mspeed > 100) mspeed = 100;
        if (mspeed < -100) mspeed = -100;
        // 根据速度正负决定是否反转方向
        let finalType = 1;
        if (mspeed < 0) {
            finalType = 2;
        }
        // 设置速度
        const spAddr = mID + 0x04;
        mspeed = Math.abs(mspeed);//绝对值
        let spBuff = pins.createBuffer(3);
        spBuff.setNumber(NumberFormat.UInt8BE, 0, spAddr);
        spBuff.setNumber(NumberFormat.UInt8BE, 1, (mspeed >> 8) & 0xFF);
        spBuff.setNumber(NumberFormat.UInt8BE, 2, mspeed & 0xFF);
        pins.i2cWriteBuffer(Board_i2cAddress, spBuff);

        //设置偏移角度
        const disAddr = mID + 0x06;
        let disBuff = pins.createBuffer(3);
        disBuff.setNumber(NumberFormat.UInt8BE, 0, disAddr);
        disBuff.setNumber(NumberFormat.UInt8BE, 1, (angle >> 8) & 0xFF);
        disBuff.setNumber(NumberFormat.UInt8BE, 2, angle & 0xFF);
        pins.i2cWriteBuffer(Board_i2cAddress, disBuff);
        // 发送运动指令
        const cmdAddr = mID + 0x03;
        let cmdBuff = pins.createBuffer(2);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, cmdAddr);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, finalType + 4);
        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);

        // 轮询状态（阻塞）
        basic.pause(100);
        while (true) {
            pins.i2cWriteNumber(Board_i2cAddress, mID + 0x09, NumberFormat.UInt8BE);
            let state = pins.i2cReadNumber(Board_i2cAddress, NumberFormat.UInt8BE);
            if (state == 0) {
                break;
            }
            basic.pause(20);
        }
    }

    //% blockId=motorStop
    //% block="stop motor %mID"
    //% group="Board" weight=84
    export function motorStop(mID: motorID): void {
        // 发送停止运动指令
        const cmdAddr = mID + 0x03;
        let cmdBuff = pins.createBuffer(2);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, cmdAddr);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, 0);
        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);
    }

    //% blockId=motorSetPerimeter
    //% block="set motor %mID compensation %num \\%"
    //% num.min=-50 num.max=50 num.defl=0
    //% group="Board" weight=83
    export function motorSetPerimeter(mID: motorID, num: number): void {
        if (num < -50) num = -50;
        if (num > 50) num = 50;
        // 发送设置周长偏移量指令
        const cmdAddr = mID + 0x0B;
        let cmdBuff = pins.createBuffer(2);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, cmdAddr);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, num);
        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);
        basic.pause(50);
    }


    //#########################################################################
    //##################################氛围灯#################################
    //#########################################################################

    //% blockId=ambientLightSetBrightness
    //% block="set ambient light brightness %brightness"
    //% brightness.min=0 brightness.max=255 brightness.defl=128
    //% group="Board" weight=79
    export function ambientLightSetBrightness(brightness: number): void {
        // 限制亮度范围
        if (brightness < 0) brightness = 0;
        if (brightness > 255) brightness = 255;

        const cmdAddr = Board_led_I2cAddress + 0x00;
        let cmdBuff = pins.createBuffer(2);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, cmdAddr);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, brightness);
        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);
        basic.pause(20);
    }

    //% blockId=ambientLightSetColor
    //% block="set ambient light color R %red G %green B %blue"
    //% red.min=0 red.max=255 red.defl=255
    //% green.min=0 green.max=255 green.defl=0
    //% blue.min=0 blue.max=255 blue.defl=0
    //% group="Board" weight=77
    //% inlineInputMode=inline
    export function ambientLightSetColor(red: number,green: number,blue: number): void {
        // 限制 RGB 范围
        if (red < 0) red = 0;
        if (red > 255) red = 255;

        if (green < 0) green = 0;
        if (green > 255) green = 255;

        if (blue < 0) blue = 0;
        if (blue > 255) blue = 255;

        const cmdAddr = Board_led_I2cAddress + 0x01;
        let cmdBuff = pins.createBuffer(4);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, cmdAddr);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, red);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 2, green);
        cmdBuff.setNumber(NumberFormat.UInt8BE, 3, blue);
        pins.i2cWriteBuffer(Board_i2cAddress, cmdBuff);
    }
}