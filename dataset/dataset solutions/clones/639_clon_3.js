// This module is designed to solve a minimum cost allocation problem using dynamic programming.
// It processes a set of demand values and associated cost factors to find the lowest possible total cost.

// Define a constant for representing an unachievable or infinitely high cost.
// Using Number.MAX_SAFE_INTEGER for robust numerical comparisons, although Infinity also works.
const POSITIVE_INFINITY_VALUE = Number.MAX_SAFE_INTEGER;

/**
 * Reads input from a specified source, typically standard input, and prepares it for processing.
 * Handles potential file system errors gracefully.
 * @returns {string} The raw input data as a string.
 */
function acquireRawInput() {
    let sourceData;
    try {
        // Attempt to read synchronously from '/dev/stdin'.
        // This path is standard for competitive programming environments.
        sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (error) {
        // If an error occurs (e.g., file not found, permission issues), log it.
        console.error("Failed to read input from /dev/stdin:", error.message);
        // For robustness, provide a minimal default or exit if input is critical.
        // In a real application, more sophisticated error handling or fallback mechanisms might be used.
        sourceData = "0 0\n"; // Fallback: empty problem
        // Consider `process.exit(1);` for unrecoverable errors.
    }
    return sourceData;
}

/**
 * Parses the raw input string into structured data arrays.
 * Extracts problem dimensions, demand values, and cost factors.
 * @param {string} rawInputString - The complete input data as a single string.
 * @returns {{numDemands: number, numCosts: number, demandValues: number[], costFactors: number[]}}
 *          An object containing parsed problem parameters.
 */
function parseProblemData(rawInputString) {
    // Clean and split the input string into an array of lines.
    const inputLines = rawInputString.trim().split("\n");

    // Validate if any input was provided.
    if (inputLines.length === 0 || (inputLines.length === 1 && inputLines[0] === '')) {
        console.error("Input data is empty or malformed. Cannot parse.");
        process.exit(1); // Terminate if no valid input to process.
    }

    // The first line contains the dimensions (N M).
    const dimensionsLine = inputLines.shift();
    if (!dimensionsLine) {
        console.error("Dimension line (N M) is missing from input.");
        process.exit(1);
    }

    const parsedDimensions = dimensionsLine.split(" ").map(val => parseInt(val, 10));

    // Basic validation for dimension parsing.
    if (parsedDimensions.length !== 2 || isNaN(parsedDimensions[0]) || isNaN(parsedDimensions[1])) {
        console.error(`Invalid format for dimensions: '${dimensionsLine}'. Expected two integers.`);
        process.exit(1);
    }

    const nDemands = parsedDimensions[0]; // Corresponds to 'n' in the original problem
    const mCosts = parsedDimensions[1];     // Corresponds to 'm' in the original problem

    // Ensure dimensions are non-negative.
    if (nDemands < 0 || mCosts < 0) {
        console.error(`Invalid problem size: N (${nDemands}) and M (${mCosts}) must be non-negative.`);
        process.exit(1);
    }

    // Extract demand values.
    const extractedDemandValues = [];
    if (inputLines.length < nDemands) {
        console.error(`Not enough lines for ${nDemands} demand values. Found ${inputLines.length} lines after dimensions.`);
        process.exit(1);
    }
    for (let i = 0; i < nDemands; i++) {
        const value = parseInt(inputLines[i], 10);
        if (isNaN(value)) {
            console.error(`Invalid demand value '${inputLines[i]}' at line ${i + 2}.`);
            process.exit(1);
        }
        extractedDemandValues.push(value);
    }
    // Remove processed demand lines from the inputLines array.
    inputLines.splice(0, nDemands);

    // Extract cost factors.
    const extractedCostFactors = [];
    if (inputLines.length < mCosts) {
        console.error(`Not enough lines for ${mCosts} cost factors. Found ${inputLines.length} lines remaining.`);
        process.exit(1);
    }
    for (let i = 0; i < mCosts; i++) {
        const value = parseInt(inputLines[i], 10);
        if (isNaN(value)) {
            console.error(`Invalid cost factor '${inputLines[i]}' at line ${nDemands + i + 2}.`);
            process.exit(1);
        }
        extractedCostFactors.push(value);
    }

    return {
        numDemands: nDemands,
        numCosts: mCosts,
        demandValues: extractedDemandValues,
        costFactors: extractedCostFactors
    };
}

/**
 * Computes the minimum cost using dynamic programming.
 * The DP state `memoizationTable[i][j]` represents the minimum cost to satisfy
 * `j` demands using a subset of the first `i` available cost factors.
 * @param {number} totalDemands - Total number of demands to satisfy.
 * @param {number} totalCosts - Total number of cost factors available.
 * @param {number[]} demands - Array of demand values.
 * @param {number[]} costs - Array of cost factors.
 * @returns {number} The calculated minimum cost, or POSITIVE_INFINITY_VALUE if impossible.
 */
function calculateMinimumCost(totalDemands, totalCosts, demands, costs) {
    // Initialize the DP table. `memoizationTable[i][j]` will store the min cost for `j` demands using `i` cost factors.
    // Table dimensions are (totalCosts + 1) x (totalDemands + 1) to accommodate zero-indexed items and base cases.
    const memoizationTable = Array.from({ length: totalCosts + 1 }, () =>
        Array.from({ length: totalDemands + 1 }, () => POSITIVE_INFINITY_VALUE)
    );

    // Base case: Zero demands can be satisfied with zero cost factors at zero cost.
    memoizationTable[0][0] = 0;

    // Iterate through each cost factor available.
    // `currentCostIdx` represents the index of the cost factor being considered (c[currentCostIdx]).
    for (let currentCostIdx = 0; currentCostIdx < totalCosts; currentCostIdx++) {
        const currentCostValue = costs[currentCostIdx];

        // Iterate through each demand value.
        // `currentDemandIdx` represents the index of the demand being considered (d[currentDemandIdx]).
        for (let currentDemandIdx = 0; currentDemandIdx < totalDemands; currentDemandIdx++) {
            const currentDemandValue = demands[currentDemandIdx];

            // Optimization: If the current DP state is unreachable (infinite cost), skip it.
            // No valid path leads to this state, so no further transitions from it are possible.
            if (memoizationTable[currentCostIdx][currentDemandIdx] === POSITIVE_INFINITY_VALUE) {
                continue;
            }

            // This inner loop explores transitions by skipping 'kOffset' cost factors.
            // 'kOffset' starts from 1, meaning at least one cost factor is considered in the jump.
            // The loop condition `(currentCostIdx + kOffset) + (totalDemands - currentDemandIdx) + 1 <= totalCosts`
            // ensures that:
            // 1. `nextCostFactorIdx = currentCostIdx + kOffset` does not exceed `totalCosts`.
            // 2. There are enough remaining cost factors to satisfy all subsequent demands.
            //    Specifically, `totalCosts - nextCostFactorIdx` must be at least `(totalDemands - (currentDemandIdx + 1))`
            //    plus some buffer (the `+1` in the condition).
            for (let kOffset = 1; (currentCostIdx + kOffset) + (totalDemands - currentDemandIdx) + 1 <= totalCosts; kOffset++) {
                const nextCostFactorIdx = currentCostIdx + kOffset; // New cost factor index after this transition.

                // Transition Option 1: Skip 'kOffset' cost factors without satisfying a new demand.
                // The cost to satisfy `currentDemandIdx` demands using `nextCostFactorIdx` cost factors
                // can be the same as satisfying them using `currentCostIdx` factors, effectively ignoring
                // the `kOffset` cost factors (from `costs[currentCostIdx]` to `costs[nextCostFactorIdx-1]`).
                memoizationTable[nextCostFactorIdx][currentDemandIdx] = Math.min(
                    memoizationTable[nextCostFactorIdx][currentDemandIdx],
                    memoizationTable[currentCostIdx][currentDemandIdx]
                );

                // Transition Option 2: Use `currentCostValue` for `currentDemandValue` and effectively skip `kOffset - 1` additional costs.
                // This satisfies `currentDemandIdx + 1` demands using `nextCostFactorIdx` total cost factors.
                // The cost is accumulated from the previous state plus the product of the current cost and demand.
                // We must ensure that `currentDemandIdx + 1` is a valid demand index.
                if (currentDemandIdx + 1 <= totalDemands) {
                    memoizationTable[nextCostFactorIdx][currentDemandIdx + 1] = Math.min(
                        memoizationTable[nextCostFactorIdx][currentDemandIdx + 1],
                        memoizationTable[currentCostIdx][currentDemandIdx] + (currentCostValue * currentDemandValue)
                    );
                }
            }
        }
    }

    // The final result is the minimum cost to satisfy all `totalDemands` using all `totalCosts` factors.
    return memoizationTable[totalCosts][totalDemands];
}

// Main execution flow:
const inputContent = acquireRawInput();
const problemParameters = parseProblemData(inputContent);

const finalResult = calculateMinimumCost(
    problemParameters.numDemands,
    problemParameters.numCosts,
    problemParameters.demandValues,
    problemParameters.costFactors
);

// Output the final computed minimum cost.
// If the result is still POSITIVE_INFINITY_VALUE, it implies that it's impossible to
// satisfy all demands with the given cost factors under the problem constraints.
// In such cases, problems often specify a special output like -1.
if (finalResult === POSITIVE_INFINITY_VALUE) {
    console.log(-1);
} else {
    console.log(finalResult);
}