"use strict";

const calculateDigitSum = (digitArray) => {
    const currentSum = digitArray.reduce((accumulator, currentDigit) => {
        return accumulator + currentDigit;
    }, 0);
    return currentSum;
};

const ProcessInput = (rawData) => {
    const inputLines = rawData.trim().split('\n');

    const firstNumberDigits = inputLines[0].trim().split('').map(charValue => parseInt(charValue, 10));
    const secondNumberDigits = inputLines[1].trim().split('').map(charValue => parseInt(charValue, 10));

    const sumOfFirstNumberDigits = calculateDigitSum(firstNumberDigits);
    const sumOfSecondNumberDigits = calculateDigitSum(secondNumberDigits);

    if (sumOfFirstNumberDigits > sumOfSecondNumberDigits) {
        console.log('GREATER');
    } else {
        console.log('LESS');
    }
};

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
