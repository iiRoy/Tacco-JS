'use strict';

const processInput = (inputString) => {
    const [limitStr, divisorStr] = inputString.split(' ');
    const upperLimit = parseInt(limitStr, 10);
    const modulus = parseInt(divisorStr, 10);

    const remainderValueCounts = Array.from({ length: modulus }, (_, currentRemainder) => {
        if (currentRemainder === 0) {
            return Math.floor(upperLimit / modulus);
        } else {
            return Math.floor((upperLimit - currentRemainder) / modulus) + 1;
        }
    });

    const totalCombinations = remainderValueCounts.reduce((accumulatedSum, countForA, remainderA) => {
        if (countForA === 0) {
            return accumulatedSum;
        }

        const requiredRemainderForBC = (modulus - remainderA) % modulus;

        if ((requiredRemainderForBC * 2) % modulus === 0) {
            const countForBC = remainderValueCounts[requiredRemainderForBC];
            return accumulatedSum + countForA * countForBC * countForBC;
        } else {
            return accumulatedSum;
        }
    }, 0);

    console.log(totalCombinations);
};

const executionMode = false;

if (executionMode) {
    processInput('3 2');
    processInput('5 3');
    processInput('31415 9265');
    processInput('35897 932');
} else {
    processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
