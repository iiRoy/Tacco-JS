'use strict';

/**
 * Orchestrates the primary calculation process.
 * Takes a raw input string, parses it, and then computes a specific reciprocal sum.
 * @param {string} inputDataStream - The entire input as a single string.
 */
function processInputAndComputeValue(inputDataStream) {

    const numericElements = inputDataStream
        .split('\n')
        [1]
        .split(' ')
        .map(val => {
            return Number(val);
        });

    let cumulativeReciprocalSum = 0.0;

    for (const currentOperand of numericElements) {
        cumulativeReciprocalSum += (1 / currentOperand);
    }

    console.log(1 / cumulativeReciprocalSum);
}

processInputAndComputeValue(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
        .trim()
);