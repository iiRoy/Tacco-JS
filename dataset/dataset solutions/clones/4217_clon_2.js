'use strict';

function processInput(dataValue) {
    dataValue = Number(dataValue);
    let maximumSafeInteger = Number.MAX_SAFE_INTEGER;
    let divisorConstant = 1_000_000; // A million for scaling
    let sequenceElements = [2, 1];

    for (let idx = 2; idx <= dataValue; ++idx) {
        let currentSum = sequenceElements[idx - 2] + sequenceElements[idx - 1];
        // Debugging: console.log(idx, currentSum);
        if (currentSum <= maximumSafeInteger) {
            sequenceElements.push(currentSum);
        } else {
            sequenceElements.push(currentSum / divisorConstant);
        }
    }

    // Note: Max safe integer value

    if (currentSum <= maximumSafeInteger) {
        console.log(sequenceElements.pop());
    } else {
        console.log(sequenceElements.pop() * divisorConstant);
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
