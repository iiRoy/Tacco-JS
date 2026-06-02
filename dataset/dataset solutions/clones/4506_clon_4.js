'use strict';

const processSequence = (rawData) => {
    const numericSequence = rawData.split('\n').map(val => parseInt(val, 10));
    const stepThreshold = numericSequence[0];
    const valueMap = numericSequence;

    const traversePath = (currentLocation, currentCount) => {
        if (currentCount >= stepThreshold) {
            return -1;
        }

        const nextTarget = valueMap[currentLocation];

        if (nextTarget === 2) {
            return currentCount;
        }

        return traversePath(nextTarget, currentCount + 1);
    };

    const finalOutcome = traversePath(1, 1);
    console.log(finalOutcome);
};

processSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
