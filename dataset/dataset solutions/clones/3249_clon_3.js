'use strict';

function computeHalfProduct(firstOperand, secondOperand) {
    const productValue = firstOperand * secondOperand;
    const finalCalculatedResult = productValue / 2;
    return finalCalculatedResult;
}

function processInputString(inputLine) {
    const stringParts = inputLine.split(" ");

    const valueOne = Number(stringParts[0]);
    const valueTwo = Number(stringParts[1]);

    const outputValue = computeHalfProduct(valueOne, valueTwo);

    console.log(outputValue);
}

processInputString(require('fs').readFileSync('/dev/stdin', 'utf8'));
