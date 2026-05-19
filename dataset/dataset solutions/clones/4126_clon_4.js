"use strict";

function ProcessInput(inputData) {
    const inputLines = inputData.split("\n");

    const UPPER_LIMIT = 101010;
    const primeStatusTracker = new Uint8Array(UPPER_LIMIT).fill(1);
    primeStatusTracker[0] = primeStatusTracker[1] = 0;

    for (let currentCandidate = 2; currentCandidate * currentCandidate < UPPER_LIMIT; ++currentCandidate) {
        if (primeStatusTracker[currentCandidate]) {
            for (let multipleIndex = currentCandidate * currentCandidate; multipleIndex < UPPER_LIMIT; multipleIndex += currentCandidate) {
                primeStatusTracker[multipleIndex] = 0;
            }
        }
    }

    const primeNumberSet = new Set();
    for (let numberValue = 2; numberValue < UPPER_LIMIT; ++numberValue) {
        if (primeStatusTracker[numberValue]) {
            primeNumberSet.add(numberValue);
        }
    }

    const isTargetLike = Array.from({ length: UPPER_LIMIT }, (_, indexPosition) => {
        if (indexPosition % 2 === 0) return 0;
        const halfPlusOneValue = (indexPosition + 1) / 2;
        return (primeNumberSet.has(indexPosition) && primeNumberSet.has(halfPlusOneValue)) ? 1 : 0;
    });

    const cumulativeSummation = isTargetLike.reduce((accumulatorArray, currentValue, currentIdx) => {
        accumulatorArray[currentIdx + 1] = accumulatorArray[currentIdx] + currentValue;
        return accumulatorArray;
    }, new Array(UPPER_LIMIT + 1).fill(0));

    const queryCountString = inputLines[0].trim().split(/\s/)[0];
    const totalQueryOperations = Number(queryCountString);

    inputLines.slice(1, 1 + totalQueryOperations).forEach((singleQueryLine) => {
        const [lowerBound, upperBound] = singleQueryLine.split(/\s/).map(Number);
        const queryResult = cumulativeSummation[upperBound + 1] - cumulativeSummation[lowerBound];
        console.log(queryResult);
    });
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
