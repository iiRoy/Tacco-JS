'use strict'

const parseDecimalInteger = (inputStringValue) => {
    return parseInt(inputStringValue, 10);
};

const processInputData = (rawDataContent) => {
    const TARGET_MAGIC_NUMBER = 15;

    const inputLines = rawDataContent.split('\n');

    const firstLineParts = inputLines[0].split(' ');

    const numberOne = parseDecimalInteger(firstLineParts[0]);
    const numberTwo = parseDecimalInteger(firstLineParts[1]);

    let outputSymbolResult;

    const sumOfNumbers = numberOne + numberTwo;
    const productOfNumbers = numberOne * numberTwo;

    if (sumOfNumbers === TARGET_MAGIC_NUMBER) {
        outputSymbolResult = '+';
    } else if (productOfNumbers === TARGET_MAGIC_NUMBER) {
        outputSymbolResult = '*';
    } else {
        outputSymbolResult = 'x';
    }

    console.log(outputSymbolResult);
};

const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const fileEncoding = 'utf8';

const inputBufferContent = fileSystemModule.readFileSync(standardInputFilePath, fileEncoding);
processInputData(inputBufferContent);
