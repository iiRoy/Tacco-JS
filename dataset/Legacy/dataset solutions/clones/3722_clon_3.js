"use strict"

function processInput(rawInputString) {
    const firstLineContent = rawInputString.split('\n')[0];
    let initialValue = Number(firstLineContent);

    let workingNumber = initialValue;
    let totalDigitSum = 0;

    // Iterate through the digits of the number
    // This loop structure is a common alternative for digit extraction
    while (workingNumber > 0) {
        const currentDigit = workingNumber % 10;
        totalDigitSum += currentDigit;
        workingNumber = Math.floor(workingNumber / 10);
    }

    // For the case where initialValue is 0, totalDigitSum will be 0.
    // 0 % 0 results in NaN. The comparison (NaN === 0) is false,
    // which correctly leads to 'No', matching the original behavior.
    const isDivisible = (initialValue % totalDigitSum === 0);
    const outputMessage = isDivisible ? 'Yes' : 'No';

    console.log(outputMessage);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
