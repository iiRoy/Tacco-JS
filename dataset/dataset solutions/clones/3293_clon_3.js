/**
 * This module provides functionality to calculate the minimum energy cost
 * for a frog to jump across a series of stones.
 * The problem is a classic dynamic programming exercise where the frog
 * aims to reach the final stone with the least accumulated energy expenditure.
 * Energy cost for a jump is the absolute difference in heights between stones.
 */

/**
 * Parses the raw input string into structured data required for the frog jumping problem.
 * This includes validating the number of stones, maximum jump distance, and stone heights.
 *
 * @param {string} rawInputString - The complete input received, typically from a standard input stream.
 *                                  Expected format:
 *                                  Line 1: N K (N = total stones, K = max jump distance)
 *                                  Line 2: h1 h2 ... hN (Heights of N stones)
 * @returns {{totalStones: number, maxReach: number, stoneHeights: number[]}} An object containing the parsed data.
 * @throws {Error} If the input format is invalid, incomplete, or contains non-positive values where positive are expected.
 */
function parseProblemInput(rawInputString) {
    const inputLines = rawInputString.trim().split('\n');

    // Ensure there are at least two lines for N K and the heights array.
    if (inputLines.length < 2) {
        throw new Error("Insufficient input lines provided. Expected at least 2 lines for N, K, and stone heights.");
    }

    // Process the first line to extract the total number of stones (N) and the maximum jump distance (K).
    // Using `Number` constructor for type conversion and `filter(n => !isNaN(n))` for robustness.
    const firstLineTokens = inputLines[0].split(' ').map(Number).filter(n => !isNaN(n));
    if (firstLineTokens.length < 2) {
        throw new Error("Invalid format for N and K. Expected two valid numbers on the first line.");
    }

    const totalStones = firstLineTokens[0];
    const maxReach = firstLineTokens[1];

    // Validate that N and K are positive integers.
    if (!Number.isInteger(totalStones) || totalStones <= 0) {
        throw new Error(`Invalid value for total stones (N): ${totalStones}. Must be a positive integer.`);
    }
    if (!Number.isInteger(maxReach) || maxReach <= 0) {
        throw new Error(`Invalid value for maximum reach (K): ${maxReach}. Must be a positive integer.`);
    }

    // Process the second line to get the heights of all stones.
    const stoneHeights = inputLines[1].split(' ').map(Number).filter(n => !isNaN(n));
    if (stoneHeights.length !== totalStones) {
        throw new Error(`Mismatched stone heights data. Expected ${totalStones} height values, but found ${stoneHeights.length}.`);
    }

    return { totalStones, maxReach, stoneHeights };
}

/**
 * Calculates the absolute difference between two numeric values.
 * This helper function enhances readability and could be extended for more complex
 * difference calculations or validations if needed in the future.
 *
 * @param {number} heightA - The height of the first stone.
 * @param {number} heightB - The height of the second stone.
 * @returns {number} The non-negative difference between the two heights.
 */
const calculateAbsoluteHeightDifference = (heightA, heightB) => {
    // Basic type check for robust behavior, although `map(Number)` should ensure numbers.
    if (typeof heightA !== 'number' || typeof heightB !== 'number') {
        console.warn("Non-numeric values detected when calculating height difference. Attempting conversion.");
        return Math.abs(Number(heightA) - Number(heightB));
    }
    return Math.abs(heightA - heightB);
};

/**
 * Determines the minimum energy required for a frog to reach the last stone
 * from the first stone, considering a maximum jump distance.
 * This function utilizes a dynamic programming approach to solve the problem efficiently.
 *
 * @param {string} problemInputData - The raw string input containing stone counts, max jump distance, and height values.
 * @returns {number} The minimum energy cost to reach the final stone, or -1 if an issue occurs.
 */
function determineOptimalFrogPath(problemInputData) {
    // Step 1: Parse the input data into a structured format.
    const { totalStones, maxReach, stoneHeights } = parseProblemInput(problemInputData);

    // Step 2: Handle edge cases for very small numbers of stones.
    // If there's only one stone, the frog is already there, so no energy is expended.
    if (totalStones === 1) {
        return 0;
    }

    // Step 3: Initialize the dynamic programming array (memoization table).
    // `minCostToStone[i]` will store the minimum energy required to reach stone `i`.
    // All elements are initialized to `Number.POSITIVE_INFINITY` as we are looking for a minimum cost.
    const minCostToStone = Array.from({ length: totalStones }, () => Number.POSITIVE_INFINITY);

    // The cost to reach the first stone (index 0) is 0, as it's the starting point.
    minCostToStone[0] = 0;

    // Step 4: Iterate through the stones to fill the DP table.
    // We start from the second stone (index 1) up to the very last stone.
    for (let currentStoneIdx = 1; currentStoneIdx < totalStones; currentStoneIdx++) {
        // For each `currentStoneIdx`, we consider all possible previous stones (`prevStoneIdx`)
        // from which the frog could have jumped.
        // A jump is possible if `prevStoneIdx` is within `maxReach` distance of `currentStoneIdx`,
        // and `prevStoneIdx` is not less than 0.
        const earliestPossibleJumpOrigin = Math.max(0, currentStoneIdx - maxReach);

        for (let prevStoneIdx = currentStoneIdx - 1; prevStoneIdx >= earliestPossibleJumpOrigin; prevStoneIdx--) {
            // Calculate the energy cost incurred for this specific jump.
            // This is the absolute height difference between the previous and current stone.
            const jumpEnergyCost = calculateAbsoluteHeightDifference(
                stoneHeights[prevStoneIdx],
                stoneHeights[currentStoneIdx]
            );

            // Calculate the total energy cost to reach `currentStoneIdx` via `prevStoneIdx`.
            // This is the accumulated cost to `prevStoneIdx` plus the cost of this jump.
            const candidateTotalCost = minCostToStone[prevStoneIdx] + jumpEnergyCost;

            // Update the minimum cost to reach `currentStoneIdx` if the `candidateTotalCost`
            // represents a cheaper path than what was previously recorded.
            minCostToStone[currentStoneIdx] = Math.min(minCostToStone[currentStoneIdx], candidateTotalCost);
        }
    }

    // Step 5: Retrieve and validate the final result.
    // The minimum energy to reach the last stone is stored at the last index of our DP array.
    const finalMinimumEnergy = minCostToStone[totalStones - 1];

    // A check to ensure the last stone was actually reachable.
    // In typical problem constraints, it should always be reachable.
    if (finalMinimumEnergy === Number.POSITIVE_INFINITY) {
        console.warn("Warning: The final stone appears to be unreachable. This might indicate an issue with input data or logic.");
        return -1; // Return an error indicator or throw an exception.
    }

    return finalMinimumEnergy;
}

// This immediately invoked function expression (IIFE) serves as the main entry point
// for the program when executed in a Node.js environment.
(function mainExecutionBlock() {
    const fileSystemModule = require("fs"); // Import Node.js File System module.
    const standardInputPath = "/dev/stdin"; // Standard path for input in competitive programming environments.

    try {
        // Read the entire content of the standard input file synchronously.
        // It's assumed the input file is relatively small.
        const rawInputContent = fileSystemModule.readFileSync(standardInputPath, "utf8");

        // Execute the core logic to compute the optimal path cost.
        const finalResult = determineOptimalFrogPath(rawInputContent);

        // Output the computed result to standard output.
        // `process.stdout.write` is used for direct output control, ensuring a newline is added explicitly.
        process.stdout.write(String(finalResult) + '\n');

    } catch (executionError) {
        // Catch and report any errors that occur during file reading, parsing, or computation.
        console.error(`An unexpected error occurred during program execution: ${executionError.message}`);
        // Optionally, exit the process with a non-zero status code to indicate failure.
        // process.exit(1);
    }
})();