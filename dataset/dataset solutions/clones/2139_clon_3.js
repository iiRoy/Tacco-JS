'use strict';

/**
 * Handles the application's main execution flow.
 * Reads input, processes data, and outputs the final result.
 */
function executeOptimizationTask() {
    // Read the entire standard input as a UTF-8 string.
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // Parse the raw input string into a structured data object.
    const problemParameters = parseInputContent(rawInputContent);

    // Compute the minimum sum of squared deviations based on the parsed parameters.
    const optimalDeviationValue = calculateMinimumDeviation(problemParameters);

    // Print the computed result to standard output.
    console.log(optimalDeviationValue);
}

/**
 * Parses the raw string input into a structured object containing
 * the count of elements and the array of numeric values.
 * Includes basic validation for input integrity.
 * @param {string} inputString - The raw string read from standard input.
 * @returns {{elementCount: number, numericData: number[]}} An object with parsed data.
 */
function parseInputContent(inputString) {
    // Clean up whitespace and split the input into individual lines.
    const contentLines = inputString.trim().split('\n');

    // Ensure there are at least two lines for N and the array X.
    if (contentLines.length < 2) {
        console.error("Error: Input content is malformed or incomplete. Expected at least two lines.");
        // Return a default empty structure to prevent further errors.
        return { elementCount: 0, numericData: [] };
    }

    // Parse the first line to get the total number of elements.
    const countOfElements = parseInt(contentLines[0], 10);
    // Validate if the parsed count is a valid non-negative number.
    if (isNaN(countOfElements) || countOfElements < 0) {
        console.error(`Error: Invalid number of elements specified: '${contentLines[0]}'.`);
        return { elementCount: 0, numericData: [] };
    }

    // Parse the second line, splitting by spaces and converting each part to an integer.
    // Filters out any non-numeric results from parseInt to ensure data integrity.
    const parsedNumericValues = contentLines[1].split(' ').map(strVal => parseInt(strVal, 10)).filter(num => !isNaN(num));

    // Optionally, compare the declared count with the actual number of parsed values.
    // if (countOfElements !== parsedNumericValues.length) {
    //     console.warn(`Warning: Declared element count (${countOfElements}) does not match actual parsed values (${parsedNumericValues.length}).`);
    // }

    return {
        elementCount: countOfElements,
        numericData: parsedNumericValues
    };
}

/**
 * Calculates the minimum sum of squared differences.
 * The target point for difference calculation must be an integer between 1 and 100 (inclusive)
 * and must NOT be present in the input `numericData` array.
 * @param {{elementCount: number, numericData: number[]}} dataParameters - Object containing input numbers.
 * @returns {number} The minimum sum of squared differences found.
 */
function calculateMinimumDeviation(dataParameters) {
    const inputValues = dataParameters.numericData;
    // The problem constraints typically define this range.
    const MAXIMUM_SEARCH_CANDIDATE = 100;

    // Utilize a Set for efficient O(1) average time complexity lookups
    // to check if a number is already present in the input values.
    const valuesAlreadyPresent = new Set(inputValues);

    // Initialize the minimum sum with a very large number,
    // ensuring any valid calculated sum will be smaller.
    let overallSmallestSquaredSum = Number.POSITIVE_INFINITY;

    // Iterate through all possible integer candidate values from 1 to MAXIMUM_SEARCH_CANDIDATE.
    for (let currentCandidatePoint = 1; currentCandidatePoint <= MAXIMUM_SEARCH_CANDIDATE; ++currentCandidatePoint) {
        // Only consider this candidate point if it is NOT one of the original input values.
        if (!valuesAlreadyPresent.has(currentCandidatePoint)) {
            let currentCandidateSquaredSum = 0; // Accumulator for the current candidate point.

            // Calculate the sum of squared differences for the current candidate point.
            for (const valueFromInput of inputValues) {
                const differenceFromCandidate = valueFromInput - currentCandidatePoint;
                // Explicitly calculate and store the squared term.
                const squaredTerm = differenceFromCandidate * differenceFromCandidate;
                currentCandidateSquaredSum += squaredTerm;
            }

            // Update the overall minimum if the sum for the current candidate is lower.
            overallSmallestSquaredSum = Math.min(overallSmallestSquaredSum, currentCandidateSquaredSum);
        }
    }

    // Return the final minimum sum of squared differences.
    // If no valid candidate was found (e.g., all numbers from 1-100 were in inputValues),
    // this would remain Number.POSITIVE_INFINITY, which indicates no solution under constraints.
    return overallSmallestSquaredSum;
}

// Initiate the application's execution process.
executeOptimizationTask();