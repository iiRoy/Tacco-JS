// This script processes item specifications and a knapsack capacity from standard input
// to determine the maximum possible value of items that can be stored without
// exceeding the knapsack's weight limit. This challenge is a classic
// example of the 0/1 Knapsack problem solved using dynamic programming.

// Import the file system module for reading input.
const fileSystemModule = require('fs');

// Retrieve all raw data as a string from the standard input stream.
const rawInputDataString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// --- Advanced Input Parsing and Initial Configuration Setup ---

// Implement robust input validation for the raw data.
if (!rawInputDataString || rawInputDataString.trim().length === 0) {
    // If no data is supplied, log an error and terminate the process.
    console.error("Execution Aborted: No input data detected from stdin.");
    process.exit(1);
}

// Split the full input string into an array of individual line strings.
// Each line is trimmed to remove leading/trailing whitespace, and empty lines are filtered out.
const processedInputLines = rawInputDataString
    .split('\n')
    .map(singleLine => singleLine.trim())
    .filter(trimmedLine => trimmedLine.length > 0);

// Parse the very first line to extract global configuration parameters.
// These parameters typically define the total number of items and the knapsack's maximum weight.
const generalSettings = processedInputLines[0].split(' ').map(numericString => parseInt(numericString, 10));

// Validate the integrity of the parsed general settings.
if (generalSettings.length < 2 || isNaN(generalSettings[0]) || isNaN(generalSettings[1])) {
    console.error("Critical Error: Malformed or insufficient configuration parameters on the first line.");
    process.exit(1);
}

// Assign the extracted configuration values to descriptive constants.
const totalItemCount = generalSettings[0]; // Represents 'N' in the original problem.
const maximumKnapsackWeight = generalSettings[1]; // Represents 'W' in the original problem.

// Perform additional semantic validation on the configuration values.
if (totalItemCount < 0 || maximumKnapsackWeight < 0) {
    console.error("Validation Failure: Item count or knapsack capacity cannot be negative values.");
    process.exit(1);
}

// Process the remaining lines to build an array of individual item specifications.
// Each item specification is an array containing [itemWeight, itemValue].
const itemSpecificationsList = processedInputLines.slice(1).map(itemDescriptionLine =>
    itemDescriptionLine.split(' ').map(valueStr => parseInt(valueStr, 10))
);

// Optional: Provide a warning if the number of parsed item specifications
// does not match the 'totalItemCount' declared in the first line.
if (itemSpecificationsList.length !== totalItemCount) {
    console.warn(`Input Discrepancy: Declared ${totalItemCount} items, but found ${itemSpecificationsList.length} specifications.`);
}

// --- Dynamic Programming Table Initialization ---

// Initialize a 2D array (matrix) to store computed optimal values.
// This matrix, often called a memoization table or DP table, helps avoid redundant calculations.
// `optimalValueMatrix[i][j]` will store the maximum value achievable considering
// the first 'i' items (up to index i-1) with a maximum capacity of 'j'.
// The dimensions are (totalItemCount + 1) rows by (maximumKnapsackWeight + 1) columns.
const optimalValueMatrix = Array.from({ length: totalItemCount + 1 }, () => {
    // Each inner array represents the state for a particular item subset.
    return new Array(maximumKnapsackWeight + 1).fill(0);
});

// --- Core Knapsack Value Calculation Function ---

/**
 * Executes the dynamic programming algorithm to compute the maximum value
 * of items that can be placed into the knapsack.
 * This implementation solves the 0/1 Knapsack problem.
 * @returns {number} The highest possible total value without exceeding capacity.
 */
function determineMaximumAttainableValue() {
    // Iterate through each item available for consideration.
    // 'currentItemIndex' ranges from 0 to totalItemCount - 1.
    for (let currentItemIndex = 0; currentItemIndex < totalItemCount; ++currentItemIndex) {
        // Extract the weight and value for the item currently being processed.
        const observedItemWeight = itemSpecificationsList[currentItemIndex][0];
        const observedItemValue = itemSpecificationsList[currentItemIndex][1];

        // Iterate through all possible knapsack capacities, from 0 up to the maximum capacity.
        // 'currentCapacityLimit' ranges from 0 to maximumKnapsackWeight.
        for (let currentCapacityLimit = 0; currentCapacityLimit <= maximumKnapsackWeight; ++currentCapacityLimit) {
            // 'valueIfChosen' will hold the potential value if the current item is included.
            // Initialize to a value that ensures it won't be chosen if it doesn't fit.
            let valueIfChosen = -Infinity;

            // 'valueIfOmitted' holds the value obtained if the current item is NOT included.
            // This value is simply carried over from the previous item's optimal state.
            const valueIfOmitted = optimalValueMatrix[currentItemIndex][currentCapacityLimit];

            // Check if the current item's weight can be accommodated within the current capacity limit.
            if (observedItemWeight <= currentCapacityLimit) {
                // If the item fits, calculate the total value if we include it.
                // This involves looking up the optimal value for the previous set of items
                // with the remaining capacity (currentCapacityLimit - observedItemWeight),
                // and adding the current item's value.
                valueIfChosen = optimalValueMatrix[currentItemIndex][currentCapacityLimit - observedItemWeight] + observedItemValue;
            }

            // Update the DP table for the current state (after considering 'currentItemIndex').
            // The optimal value for this state is the maximum of either
            // including the item (if possible) or omitting it.
            optimalValueMatrix[currentItemIndex + 1][currentCapacityLimit] = Math.max(valueIfChosen, valueIfOmitted);
        }
    }

    // After iterating through all items and all capacities, the final optimal solution
    // for all items and the full knapsack capacity is found at the last cell of the matrix.
    return optimalValueMatrix[totalItemCount][maximumKnapsackWeight];
}

// Execute the primary function to calculate the result and display it to standard output.
console.log(determineMaximumAttainableValue());