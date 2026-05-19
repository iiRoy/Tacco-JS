"use strict";
function processData(rawInputString) {
    let dataReader = new InputProcessor(rawInputString);
    let elementCount = dataReader.getInteger();
    let numericArray = dataReader.getIntegerArray(elementCount);
    const maxBitLength = 20;
    const convertToPaddedBinary = (value) => {
        return value.toString(2).padStart(maxBitLength, '0');
    };
    let prefixBitSumMatrix = [];
    for (let i = 0; i <= elementCount; i++) {
        prefixBitSumMatrix.push(new Array(maxBitLength).fill(0));
    }
    for (let currentOuterIdx = 1; currentOuterIdx <= elementCount; currentOuterIdx++) {
        let currentNumber = numericArray[currentOuterIdx - 1];
        let binaryRepresentation = convertToPaddedBinary(currentNumber);
        for (let bitPositionIdx = 0; bitPositionIdx < maxBitLength; bitPositionIdx++) {
            prefixBitSumMatrix[currentOuterIdx][bitPositionIdx] = prefixBitSumMatrix[currentOuterIdx - 1][bitPositionIdx] + Number(binaryRepresentation[bitPositionIdx]);
        }
    }
    let validSubarrayCount = 0;
    const checkSubarrayBitCondition = (startIdx, endIdx, bitPos) => {
        let bitCountInSubarray = prefixBitSumMatrix[endIdx][bitPos] - prefixBitSumMatrix[startIdx - 1][bitPos];
        return bitCountInSubarray <= 1;
    };
    for (let currentOuterIdx = 1; currentOuterIdx <= elementCount; currentOuterIdx++) {
        let isCurrentSubarrayRangeValid = true;
        for (let currentInnerIdx = currentOuterIdx; currentInnerIdx <= elementCount && isCurrentSubarrayRangeValid; currentInnerIdx++) {
            let allBitsValidForCurrentSubarray = true;
            for (let bitPositionIdx = 0; bitPositionIdx < maxBitLength; bitPositionIdx++) {
                if (!checkSubarrayBitCondition(currentOuterIdx, currentInnerIdx, bitPositionIdx)) {
                    allBitsValidForCurrentSubarray = false;
                    break;
                }
            }
            if (allBitsValidForCurrentSubarray) {
                validSubarrayCount++;
            } else {
                isCurrentSubarrayRangeValid = false;
                break;
            }
        }
    }
    console.log(validSubarrayCount);
}
class InputProcessor {
    constructor(sourceContent) {
        if (typeof sourceContent === 'undefined' || sourceContent === null) {
            throw new Error('Input source content cannot be undefined or null!');
        }
        this.readIndex = 0;
        this.tokenList = sourceContent.split(/\n|\s/);
    }
    _validatePositiveIntegerArg(arg, argName) {
        if (typeof arg === 'undefined' || arg === null || !Number.isInteger(arg) || arg < 1) {
            throw new Error(`Argument '${argName}' must be a positive integer.`);
        }
    }
    getInteger() {
        return Number.parseInt(this.tokenList[this.readIndex++], 10);
    }
    getIntegerArray(count) {
        this._validatePositiveIntegerArg(count, 'count');
        let resultArray = new Array(count);
        for (let loopIdx = 0; loopIdx < count; loopIdx++) {
            resultArray[loopIdx] = this.getInteger();
        }
        return resultArray;
    }
    getString() {
        return this.tokenList[this.readIndex++];
    }
    getStringArray(count) {
        this._validatePositiveIntegerArg(count, 'count');
        let resultArray = new Array(count);
        for (let loopIdx = 0; loopIdx < count; loopIdx++) {
            resultArray[loopIdx] = this.getString();
        }
        return resultArray;
    }
}
if (typeof window === "undefined") {
    processData(require("fs").readFileSync("/dev/stdin", "utf8"));
}
