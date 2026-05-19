"use strict";
const U32_MAX_VAL = 0xFFFFFFFF;
const U32_BASE_VAL = 0x100000000;

class LargeNumber {
    constructor(lowPart, highPart, isNegativeFlag = false) {
        this.lowPart = lowPart >>> 0;
        this.highPart = highPart >>> 0;
        this.isNegativeFlag = isNegativeFlag;
    }

    static fromStandardNumber(val) {
        if (val === 0) return LargeNumber.zeroValue;
        const isNeg = val < 0;
        const absVal = Math.abs(val);
        const low = absVal % U32_BASE_VAL;
        const high = Math.floor(absVal / U32_BASE_VAL);
        return new LargeNumber(low, high, isNeg);
    }

    static fromProductOfNumbers(valA, valB) {
        if (valA === 0 || valB === 0) return LargeNumber.zeroValue;
        const productBigInt = BigInt(valA) * BigInt(valB);
        const isNeg = productBigInt < 0n;
        const absProductBigInt = isNeg ? -productBigInt : productBigInt;
        const low = Number(absProductBigInt & 0xFFFFFFFFn);
        const high = Number(absProductBigInt >> 32n);
        return new LargeNumber(low, high, isNeg);
    }

    static get zeroValue() { return new LargeNumber(0, 0, false); }
    static get unitValue() { return new LargeNumber(1, 0, false); }
    static get maxPositiveValue() { return new LargeNumber(U32_MAX_VAL, U32_MAX_VAL, false); }
    static get minNegativeValue() { return new LargeNumber(U32_MAX_VAL, U32_MAX_VAL, true); }

    static _absoluteAdd(numA, numB) {
        let newLow = numA.lowPart + numB.lowPart;
        let carry = 0;
        if (newLow >= U32_BASE_VAL) {
            newLow -= U32_BASE_VAL;
            carry = 1;
        }
        let newHigh = numA.highPart + numB.highPart + carry;
        return new LargeNumber(newLow, newHigh, false);
    }

    static _absoluteSubtract(numA, numB) {
        let newLow = numA.lowPart - numB.lowPart;
        let borrow = 0;
        if (newLow < 0) {
            newLow += U32_BASE_VAL;
            borrow = 1;
        }
        let newHigh = numA.highPart - numB.highPart - borrow;
        return new LargeNumber(newLow, newHigh, false);
    }

    static sum(numA, numB) {
        if (numA.isNegativeFlag === numB.isNegativeFlag) {
            const result = LargeNumber._absoluteAdd(numA, numB);
            result.isNegativeFlag = numA.isNegativeFlag;
            return result;
        } else {
            const cmpAbs = LargeNumber._compareAbsolute(numA, numB);
            if (cmpAbs === 0) return LargeNumber.zeroValue;
            const result = (cmpAbs > 0) ? LargeNumber._absoluteSubtract(numA, numB) : LargeNumber._absoluteSubtract(numB, numA);
            result.isNegativeFlag = (cmpAbs > 0) ? numA.isNegativeFlag : numB.isNegativeFlag;
            return result;
        }
    }

    static difference(numA, numB) {
        const bNegated = new LargeNumber(numB.lowPart, numB.highPart, !numB.isNegativeFlag);
        return LargeNumber.sum(numA, bNegated);
    }

    static halve(numA) {
        if (LargeNumber.compare(numA, LargeNumber.zeroValue) === 0) return LargeNumber.zeroValue;
        let newLow = (numA.lowPart >>> 1) | ((numA.highPart & 1) << 31);
        let newHigh = numA.highPart >>> 1;
        return new LargeNumber(newLow, newHigh, numA.isNegativeFlag);
    }

    static _compareAbsolute(numA, numB) {
        if (numA.highPart > numB.highPart) return 1;
        if (numA.highPart < numB.highPart) return -1;
        if (numA.lowPart > numB.lowPart) return 1;
        if (numA.lowPart < numB.lowPart) return -1;
        return 0;
    }

    static compare(numA, numB) {
        if (numA.isNegativeFlag && !numB.isNegativeFlag) return -1;
        if (!numA.isNegativeFlag && numB.isNegativeFlag) return 1;
        if (numA.isNegativeFlag && numB.isNegativeFlag) {
            return -LargeNumber._compareAbsolute(numA, numB);
        } else {
            return LargeNumber._compareAbsolute(numA, numB);
        }
    }

    toDecimalString() {
        if (LargeNumber.compare(this, LargeNumber.zeroValue) === 0) return "0";

        let currentAbs = new LargeNumber(this.lowPart, this.highPart, false);
        let digitStack = [];

        while (LargeNumber.compare(currentAbs, LargeNumber.zeroValue) > 0) {
            let highVal = currentAbs.highPart;
            let lowVal = currentAbs.lowPart;

            let remainder = 0;
            let newHigh = Math.floor(highVal / 10);
            remainder = highVal % 10;

            let tempLow = remainder * U32_BASE_VAL + lowVal;
            let newLow = Math.floor(tempLow / 10);
            remainder = tempLow % 10;

            digitStack.push(remainder);
            currentAbs = new LargeNumber(newLow, newHigh, false);
        }

        const resultStr = digitStack.reverse().join('');
        return this.isNegativeFlag ? "-" + resultStr : resultStr;
    }
}

class InputProcessor {
    constructor(rawInput) {
        this.tokens = rawInput.split(/ |\n/);
        this.tokenIndex = 0;
    }

    getNextNumber() {
        return +this.tokens[this.tokenIndex++];
    }
}

var inputData = require("fs").readFileSync("/dev/stdin", "utf8");
var inputProcessor = new InputProcessor(inputData);

var totalZeroCount = 0;
var negativeNumberList = [];
var positiveNumberList = [];

var finalResult = solveProductProblem();
if (finalResult !== undefined) console.log(finalResult);

function solveProductProblem() {
    const totalElements = inputProcessor.getNextNumber();
    const targetRank = inputProcessor.getNextNumber();

    for (let i = 0; i < totalElements; i++) {
        const currentElement = inputProcessor.getNextNumber();
        if (currentElement === 0) {
            totalZeroCount++;
        } else if (currentElement < 0) {
            negativeNumberList.push(currentElement);
        } else {
            positiveNumberList.push(currentElement);
        }
    }

    negativeNumberList.sort((a, b) => a - b);
    positiveNumberList.sort((a, b) => a - b);

    const negCount = negativeNumberList.length;
    const posCount = positiveNumberList.length;

    const countOfNegativeProducts = negCount * posCount;

    if (targetRank <= countOfNegativeProducts) {
        return determineNegativeKthProduct(targetRank);
    }

    const countOfZeroProducts = (2 * totalElements - totalZeroCount - 1) * totalZeroCount / 2;
    let currentCumulativeRank = countOfNegativeProducts + countOfZeroProducts;

    if (targetRank <= currentCumulativeRank) {
        return "0";
    }

    return determinePositiveKthProduct(targetRank - currentCumulativeRank);
}

function determineNegativeKthProduct(rankToFind) {
    let lowerBoundVal = LargeNumber.minNegativeValue;
    let upperBoundVal = LargeNumber.zeroValue;

    while (LargeNumber.compare(LargeNumber.difference(upperBoundVal, lowerBoundVal), LargeNumber.unitValue) === 1) {
        let midPoint = LargeNumber.halve(LargeNumber.sum(lowerBoundVal, upperBoundVal));
        let currentProductCount = 0;
        let negListPointer = 0;

        for (let i = 0; i < positiveNumberList.length; i++) {
            const currentPos = positiveNumberList[i];
            while (negListPointer < negativeNumberList.length &&
                   LargeNumber.compare(LargeNumber.fromProductOfNumbers(negativeNumberList[negListPointer], currentPos), midPoint) <= 0) {
                negListPointer++;
            }
            currentProductCount += negListPointer;
        }

        if (rankToFind <= currentProductCount) {
            upperBoundVal = midPoint;
        } else {
            lowerBoundVal = midPoint;
        }
    }
    return upperBoundVal.toDecimalString();
}

function determinePositiveKthProduct(rankToFind) {
    negativeNumberList.reverse();

    let lowerBoundVal = LargeNumber.zeroValue;
    let upperBoundVal = LargeNumber.maxPositiveValue;

    while (LargeNumber.compare(LargeNumber.difference(upperBoundVal, lowerBoundVal), LargeNumber.unitValue) === 1) {
        let midPoint = LargeNumber.halve(LargeNumber.sum(lowerBoundVal, upperBoundVal));
        let currentProductCount = 0;

        let posRightIdx = positiveNumberList.length - 1;
        for (let i = 0; i < positiveNumberList.length; i++) {
            const currentPosA = positiveNumberList[i];
            while (posRightIdx > i &&
                   LargeNumber.compare(LargeNumber.fromProductOfNumbers(currentPosA, positiveNumberList[posRightIdx]), midPoint) > 0) {
                posRightIdx--;
            }
            if (posRightIdx <= i) break;
            currentProductCount += (posRightIdx - i);
        }

        let negRightIdx = negativeNumberList.length - 1;
        for (let i = 0; i < negativeNumberList.length; i++) {
            const currentNegA = negativeNumberList[i];
            while (negRightIdx > i &&
                   LargeNumber.compare(LargeNumber.fromProductOfNumbers(currentNegA, negativeNumberList[negRightIdx]), midPoint) > 0) {
                negRightIdx--;
            }
            if (negRightIdx <= i) break;
            currentProductCount += (negRightIdx - i);
        }

        if (rankToFind <= currentProductCount) {
            upperBoundVal = midPoint;
        } else {
            lowerBoundVal = midPoint;
        }
    }
    return upperBoundVal.toDecimalString();
}
