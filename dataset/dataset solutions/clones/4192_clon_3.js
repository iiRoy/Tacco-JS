'use strict'

function convertCharToDigit(charVal) {
    return parseInt(charVal, 10);
}

function processInputAndDetermineResult(inputString) {
    const characterArray = inputString.split('');
    const numericDigits = characterArray.map(convertCharToDigit);
    
    const initialSumValue = 0;
    const digitSum = numericDigits.reduce((currentSum, nextDigit) => currentSum + nextDigit, initialSumValue);

    const originalNumber = parseInt(inputString, 10);
    const remainderResult = originalNumber % digitSum;

    const YES_OUTPUT_STRING = 'Yes';
    const NO_OUTPUT_STRING = 'No';

    let finalResultString;
    if (remainderResult === 0) {
        finalResultString = YES_OUTPUT_STRING;
    } else {
        finalResultString = NO_OUTPUT_STRING;
    }

    return finalResultString;
}

function executeProgram() {
    const fileSystemModule = require('fs');
    const inputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    const outputValue = processInputAndDetermineResult(inputData);
    console.log(outputValue);
}

executeProgram();
