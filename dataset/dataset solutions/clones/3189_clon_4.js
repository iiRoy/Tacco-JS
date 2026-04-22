'use strict';

function parseNumericString(sourceText) {
    return sourceText.trim().split(/\s+/).filter(Boolean).map(Number);
}

function arrangeNumbersAscending(targetCollection) {
    return [...targetCollection].sort((valA, valB) => valA - valB);
}

function calculateDivisor(val1, val2) {
    if (val2 === 0) {
        return val1;
    }
    return calculateDivisor(val2, val1 % val2);
}

function processInputData(rawDataString) {
    let numericSequence = parseNumericString(rawDataString);
    let elementCount = numericSequence.shift();
    let dataValues = numericSequence;

    if (elementCount === 1) {
        console.log(dataValues[0]);
        return;
    }

    let orderedValues = arrangeNumbersAscending(dataValues);

    let finalDivisor = orderedValues.reduce((accumulator, currentValue) =>
        calculateDivisor(accumulator, currentValue)
    );

    console.log(finalDivisor);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));