"use strict";
const fileSystem = require("fs");
const stdinContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const tokenArray = stdinContent.split(/ |\n/).filter(token => token !== '');
let currentTokenIndex = 0;

function getNextNumber() {
    return +tokenArray[currentTokenIndex++];
}

function getNextString() {
    return tokenArray[currentTokenIndex++];
}

function getNextBigInt() {
    return BigInt(tokenArray[currentTokenIndex++]);
}

function getNextSlice(count, returnStrings) {
    const slicedElements = tokenArray.slice(currentTokenIndex, currentTokenIndex + count);
    currentTokenIndex += count;
    if (returnStrings) {
        return slicedElements;
    } else {
        return slicedElements.map(element => +element);
    }
}

function getNextMatrix(height, width, returnStrings) {
    const resultMatrix = [];
    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
        const rowElements = tokenArray.slice(currentTokenIndex, currentTokenIndex + width);
        currentTokenIndex += width;
        if (returnStrings) {
            resultMatrix.push(rowElements);
        } else {
            resultMatrix.push(rowElements.map(element => +element));
        }
    }
    return resultMatrix;
}

function createMultiDimArray(initialValue) {
    const args = arguments;
    let argCount = args.length;
    let arrayCreationString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        arrayCreationString = "Array(args[" + argCount + "]).fill().map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

function calculateNextMultiple(value, base) {
    const divisionResult = value / base;
    const roundedUp = Math.ceil(divisionResult);
    return roundedUp * base;
}

function executeProgram() {
    const inputValue = getNextNumber();
    const targetBase = 111;
    return calculateNextMultiple(inputValue, targetBase);
}

const programResult = executeProgram();
if (programResult !== undefined) {
    console.log(programResult);
}
