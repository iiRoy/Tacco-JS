'use strict';
// This script is designed to solve a variation of the 0/1 Knapsack Problem.
// It reads item weights and values from standard input, along with a maximum
// allowed total weight (knapsack capacity). The objective is to determine
// the highest possible total value of items that can be placed in the knapsack
// without exceeding its weight limit.

// Keep the Node.js process alive to asynchronously receive input data.
process.stdin.resume();
// Configure the standard input stream to interpret incoming data as UTF-8 encoded text.
process.stdin.setEncoding('utf-8'); // Using hyphenated 'utf-8' for consistency

/**
 * Solves the 0/1 Knapsack Problem to find the maximum value achievable
 * within a given weight constraint. This implementation uses dynamic programming
 * to track the minimum weight required for each possible total value.
 *
 * @param {string} rawInputContent - The entire input provided as a single string.
 *                                   The first line should contain two integers:
 *                                   'numItems maxWeightCapacity'.
 *                                   Subsequent lines (numItems of them) should each contain:
 *                                   'itemWeight itemValue'.
 * @throws {Error} If the input format is invalid or contains non-numeric data.
 */
const determineMaximumKnapsackValue = (rawInputContent) => { // Renamed Main to determineMaximumKnapsackValue, 'p' to 'rawInputContent'
    // Pre-validation: Check if the input is a valid string.
    if (typeof rawInputContent !== 'string' || rawInputContent.length === 0) {
        throw new Error('Input payload must be a non-empty string.');
    }

    const contentLines = rawInputContent.trim().split('\n'); // Renamed 'p' to 'contentLines', added trim

    // Guard clause for insufficient input lines.
    if (contentLines.length === 0) {
        console.log(0); // No items, no value.
        return;
    }

    // Parse the initial configuration (number of items and knapsack capacity).
    const configurationTokens = contentLines[0].trim().split(/\s+/); // Robust split for whitespace
    if (configurationTokens.length !== 2) {
        throw new Error(`First line malformed: Expected "N W", received "${contentLines[0]}".`);
    }

    const numberOfItems = parseInt(configurationTokens[0], 10); // Renamed 'N' to 'numberOfItems', added radix
    const knapsackMaxWeight = parseInt(configurationTokens[1], 10); // Renamed 'W' to 'knapsackMaxWeight', added radix

    // Validate parsed configuration values.
    if (isNaN(numberOfItems) || numberOfItems < 0) {
        throw new Error(`Invalid number of items (N): "${configurationTokens[0]}". Must be a non-negative integer.`);
    }
    if (isNaN(knapsackMaxWeight) || knapsackMaxWeight < 0) {
        throw new Error(`Invalid knapsack capacity (W): "${configurationTokens[1]}". Must be a non-negative integer.`);
    }

    // Handle trivial case where there are no items to consider.
    if (numberOfItems === 0) {
        console.log(0);
        return;
    }

    // Arrays to store the properties of each item.
    const itemWeightList = []; // Renamed 'w', using dynamic array (push)
    const itemValueList = []; // Renamed 'v', using dynamic array (push)

    // Iterate through the input lines to populate item data.
    // The loop starts from index 1 as index 0 contains N and W.
    for (let currentItemIndex = 0; currentItemIndex < numberOfItems; ++currentItemIndex) { // Renamed 'i' to 'currentItemIndex', 'N' to 'numberOfItems'
        const itemDataLine = contentLines[currentItemIndex + 1];
        if (!itemDataLine) { // Ensure line exists before splitting
             throw new Error(`Missing item data for item ${currentItemIndex + 1}. Expected ${numberOfItems} items.`);
        }
        const itemProperties = itemDataLine.trim().split(/\s+/); // Renamed 'h', robust split
        if (itemProperties.length !== 2) {
            throw new Error(`Item data malformed on line ${currentItemIndex + 2}: Expected "weight value", received "${itemDataLine}".`);
        }

        const currentItemWeight = parseInt(itemProperties[0], 10);
        const currentItemValue = parseInt(itemProperties[1], 10);

        // Validate individual item properties.
        if (isNaN(currentItemWeight) || currentItemWeight < 0) {
            throw new Error(`Invalid weight for item ${currentItemIndex + 1}: "${itemProperties[0]}".`);
        }
        if (isNaN(currentItemValue) || currentItemValue < 0) {
            throw new Error(`Invalid value for item ${currentItemIndex + 1}: "${itemProperties[1]}".`);
        }

        itemWeightList.push(currentItemWeight);
        itemValueList.push(currentItemValue);
    }

    // Define the maximum possible total value based on problem constraints.
    // This value is used to size the DP table appropriately.
    const MAXIMUM_TOTAL_VALUE_CONSTRAINT = 100000; // Renamed 'maxv'

    // Initialize the Dynamic Programming table.
    // `dpMatrix[i][j]` will store the minimum weight required to achieve a total value of 'j'
    // considering the first 'i' items. We need `numberOfItems + 1` rows.
    const dpMatrix = Array(numberOfItems + 1); // Renamed 'm' to 'dpMatrix'

    // Base case for the DP table:
    // With 0 items (row 0), a value of 0 requires 0 weight.
    // Any other positive value is impossible to achieve, so it requires infinite weight.
    dpMatrix[0] = Array(MAXIMUM_TOTAL_VALUE_CONSTRAINT + 1).fill(Number.POSITIVE_INFINITY);
    dpMatrix[0][0] = 0;

    // Populate the DP table iteratively.
    // Each iteration processes one additional item.
    for (let currentItemIteration = 0; currentItemIteration < numberOfItems; ++currentItemIteration) { // Renamed 'i' to 'currentItemIteration'
        // The current item being considered is at `itemWeightList[currentItemIteration]` and `itemValueList[currentItemIteration]`.
        const weightOfCurrentItem = itemWeightList[currentItemIteration];
        const valueOfCurrentItem = itemValueList[currentItemIteration];

        // Initialize the current row (representing the state after considering `currentItemIteration + 1` items)
        // by copying the previous row's values. This implicitly covers the case where the current item is NOT taken.
        dpMatrix[currentItemIteration + 1] = [...dpMatrix[currentItemIteration]]; // Using spread syntax for array copy

        // Iterate through all possible target total values.
        for (let currentTargetValue = 0; currentTargetValue <= MAXIMUM_TOTAL_VALUE_CONSTRAINT; ++currentTargetValue) { // Renamed 'j' to 'currentTargetValue'
            // Calculate the value that would have been needed from previous items if the current item is taken.
            const requiredPreviousValue = currentTargetValue - valueOfCurrentItem;

            // Check if taking the current item is a viable option:
            // 1. The `requiredPreviousValue` must be non-negative.
            // 2. It must have been possible to achieve `requiredPreviousValue` with prior items
            //    (i.e., `dpMatrix[currentItemIteration][requiredPreviousValue]` is not infinity).
            if (requiredPreviousValue >= 0 && dpMatrix[currentItemIteration][requiredPreviousValue] !== Number.POSITIVE_INFINITY) {
                // If the current item is taken, the total weight for `currentTargetValue` would be
                // the weight needed for `requiredPreviousValue` (from previous items) plus the weight of the current item.
                const weightIfCurrentItemIsIncluded = dpMatrix[currentItemIteration][requiredPreviousValue] + weightOfCurrentItem;

                // Update the DP table entry for `currentTargetValue` in the current row.
                // We take the minimum weight: either by NOT including the current item (value already copied)
                // or by INCLUDING the current item.
                dpMatrix[currentItemIteration + 1][currentTargetValue] = Math.min(
                    dpMatrix[currentItemIteration + 1][currentTargetValue], // Weight if current item is skipped
                    weightIfCurrentItemIsIncluded                     // Weight if current item is included
                );
            }
        }
    }

    // After the DP table is fully populated, we need to find the maximum value 'V'
    // such that the minimum weight required to achieve 'V' (stored in `dpMatrix[numberOfItems][V]`)
    // does not exceed the `knapsackMaxWeight`.
    let highestAttainableValue = MAXIMUM_TOTAL_VALUE_CONSTRAINT; // Renamed 'i' to 'highestAttainableValue'

    // Iterate backwards from the maximum possible value down to 0.
    // The first value `highestAttainableValue` encountered whose required weight is
    // less than or equal to `knapsackMaxWeight` is our answer.
    while (highestAttainableValue >= 0 && dpMatrix[numberOfItems][highestAttainableValue] > knapsackMaxWeight) {
        highestAttainableValue--; // Decrement to check a smaller value.
    }

    // Output the result. If no items fit, the loop will decrement `highestAttainableValue`
    // until it reaches 0, which always has a weight of 0 (and thus fits).
    console.log(highestAttainableValue);
};

// --- Execution Entry Point ---
// This block reads the input from '/dev/stdin', trims any leading/trailing whitespace,
// and then invokes the core knapsack solver function. Error handling is included
// to gracefully manage potential issues during file reading or processing.
try {
    const fileSystemModule = require('node:fs'); // Explicitly using 'node:' prefix
    const rawDataFromStdin = fileSystemModule.readFileSync('/dev/stdin', { encoding: 'utf8' }).trim();
    determineMaximumKnapsackValue(rawDataFromStdin);
} catch (operationError) {
    // Report any errors encountered during the execution process.
    console.error('An unhandled error occurred:', operationError.message);
    // Exit the process with a non-zero status code to indicate failure.
    process.exit(1);
}