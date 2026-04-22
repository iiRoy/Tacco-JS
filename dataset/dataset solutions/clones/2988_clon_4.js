'use strict';

function ComputeResult(dataInput) {
    const targetValue = parseInt(dataInput.trim(), 10);

    if (targetValue === 1) {
        console.log(0);
        return;
    }

    let accumulatedSum = 0;
    const upperLimit = Math.floor(Math.sqrt(targetValue));

    for (let currentCandidate = 1; currentCandidate <= upperLimit; ++currentCandidate) {
        if (targetValue % currentCandidate === 0) {
            const firstFactor = currentCandidate;
            const secondFactor = targetValue / currentCandidate;

            if (secondFactor - 1 > firstFactor) {
                accumulatedSum += (secondFactor - 1);
            }

            if (firstFactor !== secondFactor) {
                if (firstFactor - 1 > secondFactor) {
                    accumulatedSum += (firstFactor - 1);
                }
            }
        }
    }
    console.log(accumulatedSum);
}

ComputeResult(require('fs').readFileSync('/dev/stdin', 'utf8'));