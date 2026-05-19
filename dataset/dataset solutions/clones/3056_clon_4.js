'use strict';

function processInputString(rawInputText) {
    return rawInputText.trim().split('').map(Number);
}

function determineMinimumTransformations(numericSequence) {
    const sequenceLength = numericSequence.length;

    let alterationsForZeroFirst = 0;
    let alterationsForOneFirst = 0;

    for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
        const digitValue = numericSequence[currentIdx];

        // Scenario 1: Target pattern is 010101...
        // If current index is even, target is 0. If digit is 1, increment cost.
        // If current index is odd, target is 1. If digit is 0, increment cost.
        if (currentIdx % 2 === 0) { // Even index
            if (digitValue === 1) {
                alterationsForZeroFirst++;
            }
        } else { // Odd index
            if (digitValue === 0) {
                alterationsForZeroFirst++;
            }
        }

        // Scenario 2: Target pattern is 101010...
        // If current index is even, target is 1. If digit is 0, increment cost.
        // If current index is odd, target is 0. If digit is 1, increment cost.
        if (currentIdx % 2 === 0) { // Even index
            if (digitValue === 0) {
                alterationsForOneFirst++;
            }
        } else { // Odd index
            if (digitValue === 1) {
                alterationsForOneFirst++;
            }
        }
    }

    return Math.min(alterationsForZeroFirst, alterationsForOneFirst);
}

function executeMainLogic(inputContent) {
    const processedDigits = processInputString(inputContent);
    const finalCount = determineMinimumTransformations(processedDigits);
    console.log(finalCount);
}

executeMainLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
