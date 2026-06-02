'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Helper functions - these were present in the original but unused.
// They have been refactored for Type III cloning.

// Finds the maximum value in an array.
const findMaxInArray = (dataElements) => {
    let currentMaximum = -Infinity;
    for (const elementValue of dataElements) {
        if (elementValue > currentMaximum) {
            currentMaximum = elementValue;
        }
    }
    return currentMaximum;
};

// Finds the minimum value in an array.
const findMinInArray = (dataElements) => {
    let currentMinimum = Infinity; // Corrected variable name from 'max' to 'currentMinimum'
    let elementIndex = 0;
    const totalElements = dataElements.length;
    while (elementIndex < totalElements) { // Changed loop style
        if (dataElements[elementIndex] < currentMinimum) {
            currentMinimum = dataElements[elementIndex];
        }
        elementIndex++;
    }
    return currentMinimum;
};

// Main processing logic, refactored for Type III.
const processInputAndCalculateCost = (rawInputString) => {
    // Split the input string into individual lines.
    const inputLines = rawInputString.split("\n");

    // Parse the total number of steps (N) from the first line.
    const totalSteps = parseInt(inputLines[0], 10);

    // Parse the heights array (h) from the second line.
    const heightValues = inputLines[1].split(" ").map(Number);

    // Define constants for array padding and initial values for clarity.
    const COST_ARRAY_EXTRA_CAPACITY = 20;
    const STARTING_POINT_COST = 0;
    const UNREACHABLE_COST = Infinity;

    // Initialize the dynamic programming array (c) with a large value (Infinity).
    // The size is totalSteps + COST_ARRAY_EXTRA_CAPACITY, matching the original.
    const minPathCosts = Array.from({ length: totalSteps + COST_ARRAY_EXTRA_CAPACITY }, () => UNREACHABLE_COST);
    minPathCosts[0] = STARTING_POINT_COST;

    // Helper function for calculating absolute difference.
    const calculateAbsoluteDifference = (valueA, valueB) => Math.abs(valueA - valueB);

    // Iterative Dynamic Programming approach.
    // This loop replaces the original recursive 'dp' function, achieving the same result.
    for (let currentPosition = 0; currentPosition < totalSteps; currentPosition++) {
        const costToReachCurrent = minPathCosts[currentPosition];

        // Calculate cost to jump to currentPosition + 1.
        // The original code implicitly handles `heightValues[currentPosition + 1]` being `undefined`
        // by producing `NaN` which `Math.min` correctly propagates. This behavior is preserved.
        if (currentPosition + 1 < totalSteps + COST_ARRAY_EXTRA_CAPACITY) {
            const costToNextPosition = costToReachCurrent + calculateAbsoluteDifference(heightValues[currentPosition], heightValues[currentPosition + 1]);
            minPathCosts[currentPosition + 1] = Math.min(minPathCosts[currentPosition + 1], costToNextPosition);
        }

        // Calculate cost to jump to currentPosition + 2.
        // Similar handling for `undefined` height values as above.
        if (currentPosition + 2 < totalSteps + COST_ARRAY_EXTRA_CAPACITY) {
            const costToNextNextPosition = costToReachCurrent + calculateAbsoluteDifference(heightValues[currentPosition], heightValues[currentPosition + 2]);
            minPathCosts[currentPosition + 2] = Math.min(minPathCosts[currentPosition + 2], costToNextNextPosition);
        }
    }

    // Output the minimum cost to reach the (N-1)-th element.
    console.log(minPathCosts[totalSteps - 1]);
};

// Standard input/output handling - calls the refactored main function.
processInputAndCalculateCost(require("fs").readFileSync("/dev/stdin", "utf8"));
