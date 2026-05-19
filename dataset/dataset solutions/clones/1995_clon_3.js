"use strict";

const recursiveEuclideanGCD = (valA, valB) => {
    if (valB === 0) {
        return valA;
    }
    return recursiveEuclideanGCD(valB, valA % valB);
};

function computeGreatestCommonDivisor(...numbers) {
    if (numbers.length === 0) {
        return 0;
    }

    let currentGCDValue = numbers[0];

    for (let numIndex = 1; numIndex < numbers.length; numIndex++) {
        currentGCDValue = recursiveEuclideanGCD(currentGCDValue, numbers[numIndex]);
    }

    return currentGCDValue;
}

const processInputData = inputString => {
    let cumulativeSum = 0;

    const inputLines = inputString.trim().split("\n");
    const firstLineParts = inputLines[0].split(" ");

    const exponentValue = parseInt(firstLineParts[0], 10);
    const baseValue = parseInt(firstLineParts[1], 10);

    const powerResult = Math.pow(baseValue, exponentValue + 1);

    console.log(powerResult);

    const MAGIC_DIVISOR_CONSTANT = 10000000007;

    const loopUpperBound = powerResult;

    for (let outerLoopIdx = 1; outerLoopIdx <= loopUpperBound; outerLoopIdx++) {
        for (let middleLoopIdx = 1; middleLoopIdx <= loopUpperBound; middleLoopIdx++) {
            for (let innerLoopIdx = 1; innerLoopIdx <= loopUpperBound; innerLoopIdx++) {
                cumulativeSum += computeGreatestCommonDivisor(outerLoopIdx, middleLoopIdx, innerLoopIdx);
            }
        }
    }

    console.log(cumulativeSum / MAGIC_DIVISOR_CONSTANT);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
