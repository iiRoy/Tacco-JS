'use strict'
const processMainInput = rawInputData => {
    const trimmedInput = rawInputData.trim();
    const processedLines = trimmedInput.split("\n");

    const firstLineContent = processedLines[0];
    const stringNumbers = firstLineContent.split(' ');

    let numericValues = [];
    for (let i = 0; i < stringNumbers.length; i++) {
        const currentNumStr = stringNumbers[i];
        const parsedNumber = Number(currentNumStr);
        numericValues.push(parsedNumber);
    }

    const sortedNumericValues = numericValues.sort((valA, valB) => valA - valB);

    console.log(sortedNumericValues);

    const firstValue = sortedNumericValues[0];
    const secondValue = sortedNumericValues[1];
    const thirdValue = sortedNumericValues[2];

    const sumOfFirstTwo = firstValue + secondValue;
    const isThirdValueSumOfFirstTwo = thirdValue === sumOfFirstTwo;

    console.log(isThirdValueSumOfFirstTwo ? 'Yes' : 'No');
}
processMainInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
