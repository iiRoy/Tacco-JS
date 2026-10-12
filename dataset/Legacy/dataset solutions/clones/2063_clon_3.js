"use strict";
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenBuffer = fileContent.split(/ |\n/);
let tokenIndex = 0;

function readNextNumber() {
    return Number(tokenBuffer[tokenIndex++]);
}

function readNextString() {
    return tokenBuffer[tokenIndex++];
}

function readTokensAsArray(count, asStrings) {
    const segmentStart = tokenIndex;
    tokenIndex += count;
    const segment = tokenBuffer.slice(segmentStart, tokenIndex);
    return asStrings ? segment : segment.map(Number);
}

function readMatrix(height, width, asStrings) {
    const resultMatrix = [];
    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
        const rowData = readTokensAsArray(width, asStrings);
        resultMatrix.push(rowData);
    }
    return resultMatrix;
}

function createMultiDimArray(initialValue) {
    const dimensionArguments = arguments;
    let currentDimensionIndex = dimensionArguments.length;
    let arrayConstructionString = "Array(dimensionArguments[" + --currentDimensionIndex + "]).fill().map(element => {return " + initialValue + ";})";
    while (--currentDimensionIndex) {
        arrayConstructionString = "Array(dimensionArguments[" + currentDimensionIndex + "]).fill().map(element => " + arrayConstructionString + ")";
    }
    return eval(arrayConstructionString);
}

function determineComparisonValue(valueA, valueB) {
    if (valueA === valueB) {
        return 0;
    } else if (Math.abs(valueA - valueB) === 1) {
        return 1;
    } else {
        return 2;
    }
}

function executeProcessingLogic() {
    const inputLength = readNextNumber();
    const inputString = readNextString();

    const initialDifferences = Array.from({ length: inputLength - 1 }, (_, idx) => {
        const char1 = inputString[idx];
        const char2 = inputString[idx + 1];
        return Math.abs(Number(char1) - Number(char2));
    });

    let currentProcessedArray = initialDifferences;

    while (currentProcessedArray.length > 1) {
        const currentArrayLength = currentProcessedArray.length;
        const halfArrayLength = currentArrayLength >> 1;

        const nextIterationArray = Array.from({ length: halfArrayLength }, (_, idx) => {
            const leftElement = currentProcessedArray[idx];
            const rightElement = currentProcessedArray[currentArrayLength - 1 - idx];
            return determineComparisonValue(leftElement, rightElement);
        });

        currentProcessedArray = nextIterationArray;
    }

    return currentProcessedArray[0];
}

const finalResult = executeProcessingLogic();
if (finalResult !== undefined) {
    console.log(finalResult);
}
