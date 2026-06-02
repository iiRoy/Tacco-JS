'use strict'

const calculateCombinations = (inputString) => {
    const inputValues = inputString.split(' ');
    const upperBound = parseInt(inputValues[0]);
    const desiredSum = parseInt(inputValues[1]);

    let validCount = 0;

    for (let firstNum = 0; firstNum <= upperBound; firstNum++) {
        for (let secondNum = 0; secondNum <= upperBound; secondNum++) {
            const currentSumOfTwo = firstNum + secondNum;
            const requiredThirdNum = desiredSum - currentSumOfTwo;

            const isThirdNumWithinBounds = requiredThirdNum >= 0 && requiredThirdNum <= upperBound;

            if (isThirdNumWithinBounds) {
                validCount++;
            }
        }
    }
    console.log(validCount);
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf-8');
calculateCombinations(fileContent);
