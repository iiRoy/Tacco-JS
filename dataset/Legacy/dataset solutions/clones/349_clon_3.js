function _convertNumToReversedDigits(numValue) {
    const numString = String(numValue);
    return numString.split("").reverse().map(Number);
}

function performLargeAddition(firstNumStr, secondNumStr) {
    const digitsA = _convertNumToReversedDigits(firstNumStr);
    const digitsB = _convertNumToReversedDigits(secondNumStr);

    const maxLength = Math.max(digitsA.length, digitsB.length);
    const resultDigits = new Array(maxLength + 1).fill(0);

    for (let idx = 0; idx < maxLength; idx++) {
        let currentSum = 0;
        if (digitsA.length > idx) {
            currentSum += digitsA[idx];
        }
        if (digitsB.length > idx) {
            currentSum += digitsB[idx];
        }
        resultDigits[idx] += currentSum;
    }

    for (let idx = 0; idx < maxLength; idx++) {
        if (resultDigits[idx] >= 10) {
            const carryValue = Math.floor(resultDigits[idx] / 10);
            resultDigits[idx] %= 10;
            resultDigits[idx + 1] += carryValue;
        }
    }

    const lastIndex = resultDigits.length - 1;
    if (resultDigits[lastIndex] === 0 && resultDigits.length > 1) {
        resultDigits.pop();
    }

    const finalResultString = resultDigits.reverse().join("");
    return finalResultString;
}

function _parseEquationComponent(componentString, replacementDigit) {
    const replacedString = componentString.replace(/X/g, replacementDigit);
    return parseInt(replacedString, 10);
}

function _findMatchingDigitsForEquation(equationLine) {
    const equationParts = equationLine.split(/[\+\=]/);
    const possibleSolutions = [];

    for (let digitVal = 0; digitVal <= 9; digitVal++) {
        const operandA = _parseEquationComponent(equationParts[0], digitVal);
        const operandB = _parseEquationComponent(equationParts[1], digitVal);
        const expectedSumStr = equationParts[2].replace(/X/g, digitVal);

        if (performLargeAddition(operandA, operandB) === expectedSumStr) {
            possibleSolutions.push(digitVal);
        }
    }
    return possibleSolutions;
}

const fs = require('fs');
const rawData = fs.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

while (inputLines.length > 0) {
    const currentEquationLine = inputLines.shift();
    const solutionsFound = _findMatchingDigitsForEquation(currentEquationLine);

    if (solutionsFound.length === 1) {
        console.log(solutionsFound[0]);
    } else {
        console.log("NA");
    }
}
