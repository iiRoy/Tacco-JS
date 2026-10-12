"use strict";

var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = rawData.split(/ |\n/);
var tokenIndex = 0;

function getNextToken() {
    return tokenStream[tokenIndex++];
}

function readInt() {
    return +getNextToken();
}

function readString() {
    return getNextToken();
}

function readBigInt() {
    return BigInt(getNextToken());
}

function readIntArray(count, asStrings) {
    const segment = tokenStream.slice(tokenIndex, tokenIndex + count);
    tokenIndex += count;
    return asStrings ? segment : segment.map(val => +val);
}

function readMatrix(height, width, asStrings) {
    const matrixRows = [];
    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
        const rowSegment = tokenStream.slice(tokenIndex, tokenIndex + width);
        tokenIndex += width;
        matrixRows.push(asStrings ? rowSegment : rowSegment.map(item => +item));
    }
    return matrixRows;
}

function createMultiDimArray(initialValue) {
    const args = arguments;
    let dimCount = args.length;
    let arrayCreationExpression = `Array(args[${--dimCount}]).fill().map(x => { return ${initialValue}; })`;
    while (--dimCount) {
        arrayCreationExpression = `Array(args[${dimCount}]).fill().map(x => ${arrayCreationExpression})`;
    }
    return eval(arrayCreationExpression);
}

function calculateInitialSum(val) {
    return val * (val + 1) * (val + 2) / 6;
}

function executeProgram() {
    const inputN = readInt();
    let finalAnswer = calculateInitialSum(inputN);

    for (let loopCounter = 1; loopCounter < inputN; loopCounter++) {
        let nodeU = readInt();
        let nodeV = readInt();

        if (nodeU > nodeV) {
            const swapTemp = nodeU;
            nodeU = nodeV;
            nodeV = swapTemp;
        }

        const subtractionTerm = nodeU * (inputN - nodeV + 1);
        finalAnswer -= subtractionTerm;
    }
    return finalAnswer;
}

var programResult = executeProgram();
if (programResult !== undefined) {
    console.log(String(programResult));
}
