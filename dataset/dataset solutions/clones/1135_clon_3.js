const displayOutput = console.log;

// Detect execution environment and manage input acquisition
if (typeof process !== "undefined" && typeof require === "function") {
    try {
        // Using Node.js file system to read standard input synchronously
        const fileSystemModule = require('fs');
        const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
        const separatedInputLines = rawInputData.trim().split('\n'); // Trim to handle potential trailing newline

        // Execute the primary logic with the acquired input, ensuring validity
        if (separatedInputLines.length > 0 && separatedInputLines[0] !== '') {
            processProgramEntry(separatedInputLines);
        } else {
            displayOutput("Error: No input data received for processing.");
        }
    } catch (ioError) {
        displayOutput(`An error occurred during input acquisition: ${ioError.message}`);
        // In a production scenario, one might exit the process here: process.exit(1);
    }
} else {
    // This branch handles environments where Node.js process and fs are unavailable
    displayOutput("Warning: This script is primarily designed for a Node.js environment with access to /dev/stdin.");
}

/**
 * Transforms a single string line from input into its numerical representation(s).
 * Handles both single-number lines and space-separated number sequences.
 * @param {string} lineString - The raw string line to be parsed.
 * @returns {number | number[]} - A single numeric value or an array of numeric values.
 */
function parseInputLine(lineString) {
    const stringTokens = lineString.trim().split(" ");
    if (stringTokens.length >= 2) {
        return stringTokens.map(str => Number(str));
    } else {
        return Number(stringTokens[0]); // Assumes a single valid number token
    }
}

/**
 * Serves as the main entry point for the application's logic.
 * It orchestrates input parsing, parameter extraction, and algorithm execution.
 * @param {string[]} rawLineStrings - An array of raw string lines obtained from input.
 */
function processProgramEntry(rawLineStrings) {
    // Convert all raw input strings into their corresponding numerical forms
    const numericalDataLines = rawLineStrings.map(parseInputLine);

    // The first line contains global configuration parameters (N and W)
    const configurationParameters = numericalDataLines.shift();

    // Basic validation for the configuration parameters structure
    if (!Array.isArray(configurationParameters) || configurationParameters.length < 2) {
        displayOutput("Error: Initial configuration parameters are malformed or insufficient.");
        return;
    }

    const totalItemCount = configurationParameters.shift(); // Corresponds to original 'N'
    const knapsackCapacity = configurationParameters.shift(); // Corresponds to original 'W'

    // The remaining lines represent the individual items, each with a value and weight
    const availableItemsList = numericalDataLines; // Corresponds to original 'goods'

    // Further validation for the numerical values of key parameters
    if (isNaN(totalItemCount) || totalItemCount < 0 || isNaN(knapsackCapacity) || knapsackCapacity <= 0) {
        displayOutput("Error: Invalid or non-positive item count or knapsack capacity detected.");
        return;
    }

    // Initiate the core algorithm to compute and display the optimal value
    determineOptimalKnapsackValue(availableItemsList, knapsackCapacity);
}

/**
 * Solves the 0/1 Knapsack problem using a dynamic programming approach.
 * It calculates the maximum total value of items that can be placed into a knapsack
 * without exceeding its weight capacity.
 * @param {Array<Array<number>>} itemSpecs - An array where each sub-array is [itemValue, itemWeight].
 * @param {number} maxWeightLimit - The maximum permissible weight for the knapsack.
 */
function determineOptimalKnapsackValue(itemSpecs, maxWeightLimit) {
    // Pre-check for invalid or empty input scenarios
    if (!itemSpecs || itemSpecs.length === 0 || maxWeightLimit <= 0) {
        displayOutput("Warning: Knapsack calculation skipped due to missing items or invalid capacity.");
        return;
    }

    // Helper function to safely retrieve a value from a DP state map, defaulting to 0 if not found
    const getSafeValue = (stateMap, weightKey) => stateMap[weightKey] || 0;

    // Initialize DP tables. 'currentIterationState' holds results for the current item set,
    // 'previousIterationState' holds results from the item set before.
    // { 0: 0 } signifies that a weight of 0 always yields a value of 0.
    let currentIterationState = { 0: 0 };
    let previousIterationState = {};

    // Iterate through each item available
    for (let itemIdx = 0; itemIdx < itemSpecs.length; itemIdx++) {
        const currentItemValue = itemSpecs[itemIdx][0];
        const currentItemWeight = itemSpecs[itemIdx][1];

        // Swap DP states: the 'current' state becomes 'previous' for the next iteration.
        // A new 'current' state is initialized for the new item's calculations.
        previousIterationState = currentIterationState;
        currentIterationState = {};

        // --- Step 1: Handle scenarios where the current item is NOT included ---
        // For each weight 'w' in the previous state, if we don't take the current item,
        // the value for 'w' remains the same as 'previousIterationState[w]'.
        for (const existingWeightStr in previousIterationState) {
            const existingWeightNum = Number(existingWeightStr);
            const existingValue = previousIterationState[existingWeightStr];

            // Update 'currentIterationState' ensuring we store the maximum value found so far for this weight.
            currentIterationState[existingWeightNum] = Math.max(
                getSafeValue(currentIterationState, existingWeightNum),
                existingValue
            );
        }

        // --- Step 2: Handle scenarios where the current item IS included ---
        // Consider adding the current item to various combinations from the 'previousIterationState'.
        for (const prevWeightStr in previousIterationState) {
            const prevWeightNum = Number(prevWeightStr);
            const prevValue = previousIterationState[prevWeightStr];

            const newTotalWeight = prevWeightNum + currentItemWeight;
            const newTotalValue = prevValue + currentItemValue;

            // If the new combination's weight does not exceed the knapsack capacity
            if (newTotalWeight <= maxWeightLimit) {
                // Update 'currentIterationState' if this new combination yields a higher value
                // for 'newTotalWeight' than what's currently stored.
                currentIterationState[newTotalWeight] = Math.max(
                    getSafeValue(currentIterationState, newTotalWeight),
                    newTotalValue
                );
            }
        }
        
        // --- Step 3: Handle the case of taking ONLY the current item ---
        // Ensure that the current item alone is considered if it fits and provides value.
        if (currentItemWeight <= maxWeightLimit) {
            currentIterationState[currentItemWeight] = Math.max(
                getSafeValue(currentIterationState, currentItemWeight),
                currentItemValue
            );
        }
    }

    let maximumAchievedValue = 0;
    // After processing all items, iterate through the final DP state to find
    // the highest value achieved within the allowed 'maxWeightLimit'.
    for (const finalWeightStr in currentIterationState) {
        const finalWeightNum = Number(finalWeightStr);
        if (finalWeightNum <= maxWeightLimit) {
            maximumAchievedValue = Math.max(maximumAchievedValue, currentIterationState[finalWeightStr]);
        }
    }

    // Output the computed maximum value.
    displayOutput(maximumAchievedValue);
}