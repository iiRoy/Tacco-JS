'use strict';
// This script utilizes standard input/output streams for data processing.
process.stdin.resume();
// Sets the encoding for input data to UTF-8.
process.stdin.setEncoding('utf8');

/**
 * Ascertains the largest numeric element within a given array.
 * Includes a preliminary check for an empty input collection.
 * @param {Array<number>} numericCollection - An array of numerical values.
 * @returns {number} The maximum value found, or -Infinity if the collection is empty.
 */
const findMaximumElement = (numericCollection) => {
    if (!Array.isArray(numericCollection) || numericCollection.length === 0) {
        // Handle empty or invalid input collection, returning a safe default.
        return Number.NEGATIVE_INFINITY;
    }
    let currentMaximum = Number.NEGATIVE_INFINITY;
    // Iterates through each item to find the highest value.
    for (const itemValue of numericCollection) {
        if (itemValue > currentMaximum) {
            currentMaximum = itemValue;
        }
    }
    return currentMaximum;
};

/**
 * Determines the smallest numeric element present in an array.
 * Performs an initial validation for an empty input collection.
 * @param {Array<number>} numericCollection - An array of numerical values.
 * @returns {number} The minimum value found, or Infinity if the collection is empty.
 */
const findMinimumElement = (numericCollection) => {
    if (!Array.isArray(numericCollection) || numericCollection.length === 0) {
        // Handle empty or invalid input collection, returning a safe default.
        return Number.POSITIVE_INFINITY;
    }
    let currentMinimum = Number.POSITIVE_INFINITY;
    // Iterates through each item to find the lowest value.
    for (let indexPosition = 0; indexPosition < numericCollection.length; indexPosition++) {
        const valueAtIndex = numericCollection[indexPosition];
        if (valueAtIndex < currentMinimum) {
            currentMinimum = valueAtIndex;
        }
    }
    return currentMinimum;
};

/**
 * Core processing function for calculating minimum costs in a sequence.
 * Parses raw input data, initializes dynamic programming structures,
 * and computes the optimal path cost.
 * @param {string} rawInputContent - The entire input content as a string.
 */
const processSequenceCosts = (rawInputContent) => {
    // Break down the input string into individual lines.
    const inputLines = rawInputContent.split('\n');

    // Validate if enough input lines are provided.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input data provided.");
        return;
    }

    // Extract the total number of stones from the first line.
    // Ensure it's a valid positive integer.
    const numberOfStones = parseInt(inputLines[0].trim(), 10);
    if (isNaN(numberOfStones) || numberOfStones <= 0) {
        console.error("Error: Invalid number of stones specified.");
        return;
    }

    // Parse the heights of the stones from the second line.
    // Convert string elements to numbers.
    const stoneElevations = inputLines[1].trim().split(' ').map(Number);

    // Basic validation for stone elevations array length.
    if (stoneElevations.length !== numberOfStones) {
        console.error("Error: Mismatch between declared stone count and provided elevations.");
        return;
    }

    // Initialize an array to store the minimum cost to reach each stone.
    // Pad the array with a reasonable buffer to avoid out-of-bounds errors
    // when calculating costs for future steps.
    const minimumPathCosts = Array.from({ length: numberOfStones + 25 }, () => Number.POSITIVE_INFINITY);

    // The cost to reach the first stone (index 0) is always zero.
    minimumPathCosts[0] = 0;

    // Perform iterative dynamic programming to fill the minimumPathCosts array.
    // We iterate from the first stone up to, but not including, the last stone.
    for (let currentPos = 0; currentPos < numberOfStones; currentPos++) {
        const costToCurrentPos = minimumPathCosts[currentPos];

        // Skip if the current position is unreachable (cost is still Infinity).
        if (costToCurrentPos === Number.POSITIVE_INFINITY) {
            continue;
        }

        // Calculate cost to jump to the next stone (currentPos + 1).
        // Ensure the target stone is within the valid range.
        const nextPos = currentPos + 1;
        if (nextPos < numberOfStones) {
            const heightDiffNext = Math.abs(stoneElevations[currentPos] - stoneElevations[nextPos]);
            const potentialCostNext = costToCurrentPos + heightDiffNext;
            minimumPathCosts[nextPos] = Math.min(minimumPathCosts[nextPos], potentialCostNext);
        }

        // Calculate cost to jump two stones ahead (currentPos + 2).
        // Ensure the target stone is within the valid range.
        const twoStepsAheadPos = currentPos + 2;
        if (twoStepsAheadPos < numberOfStones) {
            const heightDiffTwoSteps = Math.abs(stoneElevations[currentPos] - stoneElevations[twoStepsAheadPos]);
            const potentialCostTwoSteps = costToCurrentPos + heightDiffTwoSteps;
            minimumPathCosts[twoStepsAheadPos] = Math.min(minimumPathCosts[twoStepsAheadPos], potentialCostTwoSteps);
        }
    }

    // The final result is the minimum cost to reach the last stone (index N-1).
    console.log(minimumPathCosts[numberOfStones - 1]);
};

// This line handles reading input from standard input and invoking the main processing function.
// It should not be modified.
processSequenceCosts(require("fs").readFileSync("/dev/stdin", "utf8"));