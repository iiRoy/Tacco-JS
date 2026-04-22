/**
 * This module provides a function to calculate the minimum "path cost" for a sequence of three numerical points.
 * The path cost for a given sequence is defined as the sum of absolute differences between adjacent points.
 * For example, for points A, B, C, the path cost for sequence A -> B -> C is |A-B| + |B-C|.
 * The function determines the lowest such cost across all possible permutations of the three input points.
 */

/**
 * Calculates the smallest possible sum of absolute differences between sequentially visited points
 * for three given numerical values.
 *
 * @param {string} inputDataString - A string containing three space-separated numeric values.
 *                                   e.g., "10 20 5"
 * @returns {number} The minimum total path cost. Returns `Infinity` if the input is invalid
 *                   (e.g., not a string, incorrect number of values, non-numeric values).
 */
function determineOptimalTraversalCost(inputDataString) {
    // --- Input Validation and Pre-processing ---

    // Ensure the input is a valid string and not empty.
    if (typeof inputDataString !== 'string' || inputDataString.trim().length === 0) {
        console.error("Error: The input for traversal cost computation must be a non-empty string.");
        return Infinity;
    }

    // Split the string into individual value tokens.
    const rawValueTokens = inputDataString.trim().split(" ");

    // Verify that exactly three numerical values are provided.
    if (rawValueTokens.length !== 3) {
        console.error(`Error: Expected exactly 3 numerical values, but received ${rawValueTokens.length}.`);
        return Infinity;
    }

    // Parse each token into a number and validate.
    const parsedNumericValues = rawValueTokens.map(token => {
        const num = Number(token);
        // Check if the parsed value is a valid number.
        if (isNaN(num)) {
            console.error(`Error: Non-numeric value detected in input: "${token}".`);
            return NaN; // Mark as invalid
        }
        return num;
    });

    // If any value failed to parse correctly, return an error state.
    if (parsedNumericValues.some(val => isNaN(val))) {
        return Infinity;
    }

    // --- Core Logic: Defining Permutations and Calculating Costs ---

    // Define all 3! (6) possible sequences for traversing three points (indexed 0, 1, 2).
    // These sequences represent the order in which points from `parsedNumericValues` will be accessed.
    const traversalSequences = Object.freeze([
        [0, 1, 2], // e.g., Value[0] -> Value[1] -> Value[2]
        [0, 2, 1],
        [1, 0, 2],
        [1, 2, 0],
        [2, 0, 1],
        [2, 1, 0]
    ]);

    // Initialize the variable to store the lowest cost found so far.
    let currentMinimumOverallCost = Infinity;

    // A small helper function for calculating absolute difference for readability.
    const calculateAbsoluteDifference = (firstNum, secondNum) => Math.abs(firstNum - secondNum);

    // Iterate through each predefined traversal sequence.
    for (const sequence of traversalSequences) {
        // Extract the actual numeric values based on the current sequence of indices.
        const firstPointValue = parsedNumericValues[sequence[0]];
        const secondPointValue = parsedNumericValues[sequence[1]];
        const thirdPointValue = parsedNumericValues[sequence[2]];

        // Calculate the cost for the first leg of the journey (first to second point).
        const costSegmentOne = calculateAbsoluteDifference(firstPointValue, secondPointValue);

        // Calculate the cost for the second leg of the journey (second to third point).
        const costSegmentTwo = calculateAbsoluteDifference(secondPointValue, thirdPointValue);

        // Sum the costs for both segments to get the total cost for this specific sequence.
        const totalCostForCurrentSequence = costSegmentOne + costSegmentTwo;

        // Update the overall minimum cost if the current sequence's cost is lower.
        if (totalCostForCurrentSequence < currentMinimumOverallCost) {
            currentMinimumOverallCost = totalCostForCurrentSequence;
        }
    }

    // Return the smallest total path cost found across all permutations.
    return currentMinimumOverallCost;
}