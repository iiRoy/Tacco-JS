'use strict';

// Ensure standard input/output streams are prepared for receiving data.
process.stdin.resume();
process.stdin.setEncoding('utf8');

/**
 * Computes the absolute difference between two numerical inputs.
 * This utility function enhances readability by abstracting the Math.abs call.
 * @param {number} valueA - The first numerical operand.
 * @param {number} valueB - The second numerical operand.
 * @returns {number} The non-negative difference between valueA and valueB.
 */
const calculateAbsoluteDifference = (valueA, valueB) => {
    // A quick type check to prevent unexpected behavior with non-numeric inputs.
    if (typeof valueA !== 'number' || typeof valueB !== 'number') {
        // In a production scenario, one might throw an error or return a specific error code.
        console.error('Warning: Non-numeric arguments provided to calculateAbsoluteDifference.');
        return 0; // Returning 0 as a fallback, though often an error is preferred.
    }
    return Math.abs(valueA - valueB);
};

/**
 * Identifies and returns the largest numeric item within an array.
 * This function serves as a general utility, though not directly central to the primary algorithm.
 * @param {Array<number>} numericCollection - An array expected to contain numbers.
 * @returns {number} The maximum value found, or Number.MIN_SAFE_INTEGER if the array is empty or invalid.
 */
const retrieveLargestValue = (numericCollection) => {
    // Guard clause for invalid or empty input arrays.
    if (!Array.isArray(numericCollection) || numericCollection.length === 0) {
        return Number.MIN_SAFE_INTEGER; // A very small number to signify no valid maximum was found.
    }

    let maximumFound = Number.MIN_SAFE_INTEGER;
    // Iterate using a `for...of` loop for conciseness.
    for (const currentElement of numericCollection) {
        // Ensure the element is a number before comparison.
        if (typeof currentElement === 'number' && currentElement > maximumFound) {
            maximumFound = currentElement;
        }
    }
    return maximumFound;
};

/**
 * Identifies and returns the smallest numeric item within an array.
 * Another general utility function, complementing `retrieveLargestValue`.
 * @param {Array<number>} numericCollection - An array expected to contain numbers.
 * @returns {number} The minimum value found, or Number.MAX_SAFE_INTEGER if the array is empty or invalid.
 */
const retrieveSmallestValue = (numericCollection) => {
    // Initial check for array validity.
    if (!Array.isArray(numericCollection) || numericCollection.length === 0) {
        return Number.MAX_SAFE_INTEGER; // A very large number to signify no valid minimum was found.
    }

    let minimumFound = Number.MAX_SAFE_INTEGER;
    // Standard `for` loop iteration.
    for (let currentIdx = 0; currentIdx < numericCollection.length; currentIdx++) {
        const item = numericCollection[currentIdx];
        // Validate element type before comparison.
        if (typeof item === 'number' && item < minimumFound) {
            minimumFound = item;
        }
    }
    return minimumFound;
};

/**
 * Main application logic: processes raw input string to calculate minimum traversal costs.
 * This function implements a dynamic programming approach for a problem similar to the "frog jump" challenge.
 * @param {string} rawDataInput - The full string content read from standard input.
 */
const processInputAndDetermineCosts = (rawDataInput) => {
    try {
        // Step 1: Parse the input data into manageable rows.
        const inputLines = rawDataInput.trim().split('\n');

        // Input validation: Ensure there are at least two lines for N and the height data.
        if (inputLines.length < 2) {
            throw new Error("Input error: Not enough data lines provided. Expected at least two lines.");
        }

        // Step 2: Extract and validate the total number of points (N) from the first line.
        const totalPointsCount = Number(inputLines[0].trim());
        if (isNaN(totalPointsCount) || totalPointsCount <= 0 || !Number.isInteger(totalPointsCount)) {
            throw new Error(`Input error: Invalid 'N' value '${inputLines[0].trim()}'. N must be a positive integer.`);
        }

        // Step 3: Parse and validate the elevation values from the second line.
        const heightMeasurements = inputLines[1].trim().split(' ').map(Number);

        // Input validation: Check if the number of heights matches the declared 'N'.
        if (heightMeasurements.length !== totalPointsCount) {
            throw new Error(`Input error: Declared 'N' (${totalPointsCount}) does not match actual number of heights (${heightMeasurements.length}).`);
        }
        // Input validation: Ensure all parsed height values are indeed numbers.
        if (heightMeasurements.some(isNaN)) {
            throw new Error("Input error: One or more provided height measurements are not valid numbers.");
        }

        // Step 4: Initialize the dynamic programming array for minimum costs.
        // Each element will store the minimum cost to reach that specific index.
        const minimumPathCosts = new Array(totalPointsCount).fill(Number.POSITIVE_INFINITY);

        // Base case 1: The cost to reach the very first point (index 0) is always zero.
        minimumPathCosts[0] = 0;

        // Base case 2: If there's at least a second point, calculate the cost to reach it.
        // This involves a single jump from index 0 to index 1.
        if (totalPointsCount > 1) {
            const costToSecondPoint = calculateAbsoluteDifference(heightMeasurements[0], heightMeasurements[1]);
            minimumPathCosts[1] = costToSecondPoint;
        }

        // Step 5: Iterate from the third point onwards, applying the DP recurrence relation.
        // For each point, determine the minimum cost to reach it from either the previous point
        // or the point two steps back.
        for (let currentIdx = 2; currentIdx < totalPointsCount; currentIdx++) {
            // Option A: Jump from the immediately preceding point (currentIdx - 1).
            const costFromPrevStep = minimumPathCosts[currentIdx - 1] +
                                     calculateAbsoluteDifference(heightMeasurements[currentIdx], heightMeasurements[currentIdx - 1]);

            // Option B: Jump from the point two steps back (currentIdx - 2).
            const costFromTwoStepsBack = minimumPathCosts[currentIdx - 2] +
                                          calculateAbsoluteDifference(heightMeasurements[currentIdx], heightMeasurements[currentIdx - 2]);

            // Store the minimum of these two options as the cost to reach currentIdx.
            minimumPathCosts[currentIdx] = Math.min(costFromPrevStep, costFromTwoStepsBack);
        }

        // Step 6: Output the final result – the minimum cost to reach the last point.
        // This is typically the answer to such dynamic programming problems.
        console.log(`The calculated minimum cost to reach the final destination is: ${minimumPathCosts[totalPointsCount - 1]}`);

    } catch (operationError) {
        // Centralized error handling for issues encountered during input processing or calculation.
        console.error(`An error occurred during program execution: ${operationError.message}`);
        // For debugging, uncomment the following line to see the full stack trace:
        // console.error(operationError.stack);
    }
};

// This section handles the initial input acquisition and triggers the main processing function.
try {
    // Attempt to read all data from standard input, decode it, and clean up whitespace.
    const acquiredInputText = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    // Pass the prepared input string to the core processing function.
    processInputAndDetermineCosts(acquiredInputText);
} catch (fileReadError) {
    // Catch specific errors related to reading from /dev/stdin (e.g., file not found or permissions).
    console.error(`Failed to read input from the standard stream: ${fileReadError.message}`);
}