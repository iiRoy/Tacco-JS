'use strict'

const HUGE_NEG_VAL = -900719925474099; // Represents a very small number for impossible states

let calculationCache;
let inputNumbers;

function determineMaxPathSum(currentPosition, currentParityIndicator) {
    if (currentPosition === 0) {
        // Base case: at the start, sum is 0 if parity is even (0 flips)
        // Otherwise, it's an impossible state if parity is odd (cannot have 1 flip with 0 elements)
        return currentParityIndicator === 0 ? 0 : HUGE_NEG_VAL;
    }

    // Check if result is already computed (memoization)
    if (calculationCache[currentPosition][currentParityIndicator] !== undefined) {
        return calculationCache[currentPosition][currentParityIndicator];
    }

    const numAtCurrentPos = inputNumbers[currentPosition];

    let outcome;
    if (currentParityIndicator === 0) { // We want an even number of total sign changes up to currentPosition
        // Option 1: Previous state had an even number of flips, and current number is added positively (0 flips for current)
        const scenarioA = determineMaxPathSum(currentPosition - 1, 0) + numAtCurrentPos;
        // Option 2: Previous state had an odd number of flips, and current number is added negatively (1 flip for current)
        const scenarioB = determineMaxPathSum(currentPosition - 1, 1) - numAtCurrentPos;
        outcome = Math.max(scenarioA, scenarioB);
    } else { // We want an odd number of total sign changes up to currentPosition
        // Option 1: Previous state had an even number of flips, and current number is added negatively (1 flip for current)
        const scenarioC = determineMaxPathSum(currentPosition - 1, 0) - numAtCurrentPos;
        // Option 2: Previous state had an odd number of flips, and current number is added positively (0 flips for current)
        const scenarioD = determineMaxPathSum(currentPosition - 1, 1) + numAtCurrentPos;
        outcome = Math.max(scenarioC, scenarioD);
    }

    // Store the computed result in the cache
    calculationCache[currentPosition][currentParityIndicator] = outcome;
    return outcome;
}

function processInputData(rawData) {
    const dataLines = rawData.trim().split('\n');
    const totalElements = parseInt(dataLines[0]);
    // Prepend '0 ' to align 1-based indexing for the recursive function
    inputNumbers = ('0 ' + dataLines[1]).split(' ').map(Number);

    // Initialize memoization cache with 'undefined' to signify uncomputed states
    calculationCache = Array(totalElements + 1).fill(null).map(() => Array(2).fill(undefined));

    // The final answer requires an even number of sign changes for all 'totalElements'
    const finalOptimalSum = determineMaxPathSum(totalElements, 0);
    console.log(finalOptimalSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));