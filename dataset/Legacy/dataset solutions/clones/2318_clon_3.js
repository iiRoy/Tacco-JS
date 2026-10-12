"use strict";

const processInput = (rawInputString) => {
    const trimmedInputContent = rawInputString.trim();
    const linesAsStrings = trimmedInputContent.split('\n');
    const numericValues = linesAsStrings.map(Number);

    const ascendingNumericSort = (valA, valB) => {
        return valA - valB;
    };

    numericValues.sort(ascendingNumericSort);

    const determineOutputValue = (firstSortedNum, secondSortedNum) => {
        if (firstSortedNum === 1 && secondSortedNum === 2) {
            return 3;
        } else if (firstSortedNum === 2 && secondSortedNum === 3) {
            return 1;
        } else {
            return 2;
        }
    };

    const firstElementAfterSort = numericValues[0];
    const secondElementAfterSort = numericValues[1];

    const finalCalculatedResult = determineOutputValue(firstElementAfterSort, secondElementAfterSort);
    console.log(finalCalculatedResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
