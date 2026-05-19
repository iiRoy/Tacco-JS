"use strict";

const processInputData = (inputDataString) => {
    const numericalValue = Number(inputDataString.trim().split(/\s+/)[0]);

    // The original logic determines a result based on whether the input is even or odd.
    // If even, it's N / 2.
    // If odd, it's Math.floor(N / 2) + 1.
    // This combined behavior is mathematically equivalent to Math.ceil(N / 2)
    // for positive integers N.

    const computedOutcome = Math.ceil(numericalValue / 2);
    console.log(computedOutcome);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
