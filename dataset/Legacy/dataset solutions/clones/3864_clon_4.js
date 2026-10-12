"use strict";

const processInputAndSolve = (rawInput) => {
    const lines = rawInput.trim().split("\n");
    const numericElements = lines[1].split(" ").map(val => Number(val));

    let currentAccumulation = 0;
    let zeroSumPairings = 0;
    const cumulativeSumFrequencies = new Map();

    cumulativeSumFrequencies.set(0, 1);

    for (const element of numericElements) {
        currentAccumulation += element;
        const previousCount = cumulativeSumFrequencies.get(currentAccumulation);

        if (previousCount !== undefined) {
            zeroSumPairings += previousCount;
            cumulativeSumFrequencies.set(currentAccumulation, previousCount + 1);
        } else {
            cumulativeSumFrequencies.set(currentAccumulation, 1);
        }
    }

    console.log(zeroSumPairings);
};

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
