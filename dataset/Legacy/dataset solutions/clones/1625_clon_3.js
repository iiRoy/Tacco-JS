'use strict';

function checkForbiddenUnitDigit(digitValue, forbiddenSet) {
    return forbiddenSet.has(digitValue);
}

function processInputData(rawInputContent) {
    const cleanedInput = rawInputContent.trim();
    const inputLines = cleanedInput.split('\n');
    const primaryLine = inputLines[0];
    const numericValue = Number(primaryLine);

    console.log(numericValue);

    const forbiddenUnitDigits = new Set([0, 2, 4, 5, 6, 8]);

    const currentUnitDigit = numericValue % 10;

    if (checkForbiddenUnitDigit(currentUnitDigit, forbiddenUnitDigits)) {
        console.log('-1');
        return;
    }

    return;
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
