"use strict";

const determineOperationCount = (valueRemainder) => {
    if (valueRemainder === 0) {
        return 0;
    }
    return Number(valueRemainder % 5 !== 0) + 1;
};

const executeCalculation = (inputSource) => {
    const rawNumericString = inputSource.trim().split("\n")[0];
    const inputNumber = Number(rawNumericString);

    if (inputNumber < 100) {
        console.log(0);
        return;
    }

    const lastTwoDigitsValue = inputNumber % 100;

    const calculatedSteps = determineOperationCount(lastTwoDigitsValue);

    if (100 * calculatedSteps < inputNumber) {
        console.log(1);
    } else {
        console.log(0);
    }
};

executeCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));
