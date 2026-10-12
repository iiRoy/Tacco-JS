"use strict";
const STANDARD_INPUT_PATH = "/dev/stdin";
let rawData = require("fs").readFileSync(STANDARD_INPUT_PATH, "utf8");
let tokenStream = rawData.split(/ |\n/);
let currentTokenIndex = 0;

function getNextNumber() {
    const currentToken = tokenStream[currentTokenIndex];
    currentTokenIndex++;
    return Number(currentToken);
}

function getNextString() {
    const currentToken = tokenStream[currentTokenIndex];
    currentTokenIndex++;
    return currentToken;
}

function getNextBigInt() {
    const currentToken = tokenStream[currentTokenIndex];
    currentTokenIndex++;
    return BigInt(currentToken);
}

function getTokensAsArray(count, isStringFlag) {
    const segment = tokenStream.slice(currentTokenIndex, currentTokenIndex + count);
    currentTokenIndex += count;
    if (isStringFlag) {
        return segment;
    } else {
        return segment.map(val => Number(val));
    }
}

function getBigIntsArray(count) {
    const segment = tokenStream.slice(currentTokenIndex, currentTokenIndex + count);
    currentTokenIndex += count;
    return segment.map(val => BigInt(val));
}

function get2DArray(height, width, isStringFlag) {
    const resultMatrix = [];
    let currentRowIndex = 0;
    while (currentRowIndex < height) {
        const rowSegment = tokenStream.slice(currentTokenIndex, currentTokenIndex + width);
        currentTokenIndex += width;
        if (isStringFlag) {
            resultMatrix.push(rowSegment);
        } else {
            resultMatrix.push(rowSegment.map(val => Number(val)));
        }
        currentRowIndex++;
    }
    return resultMatrix;
}

function createDynamicArray(initialValue) {
    const args = arguments;
    let argCount = args.length;
    let evalString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        evalString = "Array(args[" + argCount + "]).fill().map(x=>" + evalString + ")";
    }
    return eval(evalString);
}

console.log(executeMainLogic().toString());

function executeMainLogic() {
    let inputString = getNextString();
    const desiredLength = 3;
    const extractedPart = inputString.substring(0, desiredLength);
    return extractedPart;
}
