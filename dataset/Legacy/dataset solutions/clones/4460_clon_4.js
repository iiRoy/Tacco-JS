'use strict';

const calculatePowerOfTwoFactor = (val) => {
    return Math.log2(val & -val);
};

const processInputAndFindMax = (inputString) => {
    const upperLimit = parseInt(inputString.trim(), 10);

    const result = Array.from({ length: upperLimit }, (_, index) => index + 1)
        .reduce((accumulator, currentNumber) => {
            const currentCount = calculatePowerOfTwoFactor(currentNumber);

            if (currentCount > accumulator.highestCount) {
                return {
                    highestNumber: currentNumber,
                    highestCount: currentCount,
                };
            } else {
                return accumulator;
            }
        }, { highestNumber: 0, highestCount: -1 });

    return result.highestNumber;
};

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processInputAndFindMax(inputData));
