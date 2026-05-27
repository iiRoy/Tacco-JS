"use strict";

function processAndSortNumericStrings(inputLineSegment) {
    const stringTokens = inputLineSegment.split(" ");
    const numericValues = stringTokens.map(Number);
    numericValues.sort((valueA, valueB) => valueA - valueB);
    return numericValues;
}

function computeDifferenceOfExtremes(fullInputString) {
    const allInputLines = fullInputString.split("\n");
    const dataLine = allInputLines[1];

    const sortedNumbers = processAndSortNumericStrings(dataLine);

    const highestValue = sortedNumbers[sortedNumbers.length - 1];
    const lowestValue = sortedNumbers[0];

    const calculatedDifference = highestValue - lowestValue;
    return calculatedDifference;
}

function executeMainLogic(programArgument) {
    const finalResult = computeDifferenceOfExtremes(programArgument);
    console.log(finalResult);
}

const fileSystemHandler = require('fs');
const standardInputFilePath = '/dev/stdin';
const fileEncoding = 'utf8';

const rawInputContent = fileSystemHandler.readFileSync(standardInputFilePath, fileEncoding);
executeMainLogic(rawInputContent);
