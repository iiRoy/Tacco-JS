'use strict';

function ProcessInputData(rawDataString) {
    const numericSequence = rawDataString.trim().split(/\s+/).map(Number);

    const initialCount = numericSequence.shift();

    const valuePairs = [];
    for (let i = 0; i < numericSequence.length; i += 2) {
        valuePairs.push({ primary: numericSequence[i], secondary: numericSequence[i + 1] });
    }

    let finalResult;
    if (valuePairs.length === 0) {
        finalResult = NaN;
    } else {
        const optimalPair = valuePairs.reduce((currentBest, candidatePair) => {
            return (candidatePair.primary > currentBest.primary) ? candidatePair : currentBest;
        });

        finalResult = optimalPair.primary + optimalPair.secondary;
    }

    console.log(finalResult);
}

ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
