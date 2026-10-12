'use strict';

const calculateSumCombinations = (limitValue, targetSumValue) => {
    const countRecursive = (currentTermIndex, currentAccumulatedSum) => {
        if (currentTermIndex === 3) {
            return currentAccumulatedSum === targetSumValue ? 1 : 0;
        }

        let totalValidWays = 0;
        for (let termValue = 0; termValue <= limitValue; termValue++) {
            if (currentAccumulatedSum + termValue > targetSumValue) {
                break;
            }
            totalValidWays += countRecursive(currentTermIndex + 1, currentAccumulatedSum + termValue);
        }
        return totalValidWays;
    };

    return countRecursive(0, 0);
};

const processInput = (inputString) => {
    const inputParts = inputString.split(' ');
    const upperLimit = parseInt(inputParts[0]);
    const desiredTotal = parseInt(inputParts[1]);

    const finalCount = calculateSumCombinations(upperLimit, desiredTotal);
    console.log(finalCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
