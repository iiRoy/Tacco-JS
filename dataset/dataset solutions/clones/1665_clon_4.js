"use strict";

function calculateMultiplesInInterval(inputString) {
    const [lowerBound, upperBound, divisorValue] = inputString
        .trim()
        .split('\n')[0]
        .split(' ')
        .map(Number);

    const countUpToMaximum = Math.floor(upperBound / divisorValue);
    const countBeforeMinimum = Math.floor((lowerBound - 1) / divisorValue);

    const totalMultiples = countUpToMaximum - countBeforeMinimum;

    console.log(totalMultiples);
}

calculateMultiplesInInterval(require('fs').readFileSync('/dev/stdin', 'utf8'));
