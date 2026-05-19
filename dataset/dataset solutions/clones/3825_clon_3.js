'use strict';

function isPerfectSquare(valueToCheck) {
    if (valueToCheck < 0) {
        return false;
    }
    const squareRootResult = Math.sqrt(valueToCheck);
    return Number.isInteger(squareRootResult);
}

function processInput(rawInputString) {
    const cleanedInput = rawInputString.trim();
    const numericValue = parseInt(cleanedInput, 10);

    if (isNaN(numericValue) || numericValue < 1) {
        return;
    }

    let currentNumber = numericValue;
    while (currentNumber >= 1) {
        if (isPerfectSquare(currentNumber)) {
            console.log(String(currentNumber));
            return;
        }
        currentNumber--;
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
