"use strict";

// Helper function to parse the initial configuration line
/**
 * Parses the first line of input to extract the number of items and the maximum knapsack capacity.
 * @param {string} configLine - The first line of input (e.g., "3 10").
 * @returns {{numItems: number, capacityLimit: number}} An object containing the parsed values.
 * @throws {Error} If parsing fails or values are invalid.
 */
function extractProblemParameters(configLine) {
    const parts = configLine.split(' ');
    if (parts.length !== 2) {
        throw new Error("Invalid format for problem parameters. Expected 'N W'.");
    }
    const parsedNumItems = Number.parseInt(parts[0], 10);
    const parsedCapacityLimit = Number.parseInt(parts[1], 10);

    if (Number.isNaN(parsedNumItems) || Number.isNaN(parsedCapacityLimit) || parsedNumItems < 0 || parsedCapacityLimit < 0) {
        throw new Error("Invalid numeric values for problem parameters. N and W must be non-negative integers.");
    }
    return {
        numItems: parsedNumItems,
        capacityLimit: parsedCapacityLimit
    };
}

// Helper function to parse individual item lines
/**
 * Parses a single line representing an item's weight and value.
 * @param {string} itemLine - A line from input (e.g., "2 3").
 * @returns {{itemWeight: number, itemValue: number}} An object containing the item's weight and value.
 * @throws {Error} If parsing fails or values are invalid.
 */
function parseItemSpecification(itemLine) {
    const components = itemLine.split(' ');
    if (components.length !== 2) {
        throw new Error("Invalid format for item specification. Expected 'weight value'.");
    }
    const weightVal = Number.parseInt(components[0], 10);
    const valueVal = Number.parseInt(components[1], 10);

    if (Number.isNaN(weightVal) || Number.isNaN(valueVal) || weightVal < 0 || valueVal < 0) {
        throw new Error("Invalid numeric values for item specification. Weight and value must be non-negative integers.");
    }
    return {
        itemWeight: weightVal,
        itemValue: valueVal
    };
}

/**
 * Solves the 0/1 Knapsack problem using dynamic programming.
 * This implementation computes the maximum total value of items that can be
 * placed into a knapsack with a fixed capacity, where each item can either
 * be taken or left.
 * @param {string} rawInputContent - The entire input string, typically from stdin.
 * @returns {void} Prints the maximum value that can be carried in the knapsack to stdout.
 */
const solveKnapsackProblem = (rawInputContent) => {
    // Process and validate the raw input data.
    const inputLines = rawInputContent.trim().split('\n');
    if (inputLines.length === 0) {
        console.log(0); // No input means no items, so max value is 0.
        return;
    }

    // Extract global problem parameters (number of items and knapsack capacity).
    const { numItems, capacityLimit } = extractProblemParameters(inputLines[0]);

    // Perform an early exit if there are no items or no capacity.
    if (numItems === 0 || capacityLimit === 0) {
        console.log(0);
        return;
    }

    // Parse details for each item.
    const collectionOfItems = inputLines.slice(1, numItems + 1).map(parseItemSpecification);

    // Ensure we have the correct number of items parsed.
    if (collectionOfItems.length !== numItems) {
        throw new Error(`Expected ${numItems} items but parsed ${collectionOfItems.length}. This indicates malformed input.`);
    }

    // Initialize the dynamic programming table.
    // valueLookupTable[i][j] will store the maximum value obtainable with the first 'i' items
    // and a knapsack capacity of 'j'.
    // All cells are initialized to 0, representing no value if no items are taken or no capacity.
    const valueLookupTable = Array.from({ length: numItems + 1 }, () =>
        new Array(capacityLimit + 1).fill(0)
    );

    // Iterate through each item, from the first (index 1) to the 'numItems'-th.
    for (let currentItemIdx = 1; currentItemIdx <= numItems; currentItemIdx++) {
        // Retrieve the current item's data, adjusting for 0-based array indexing.
        const itemData = collectionOfItems[currentItemIdx - 1];
        const currentItemWeight = itemData.itemWeight;
        const currentItemValue = itemData.itemValue;

        // Iterate through each possible capacity, from 0 up to 'capacityLimit'.
        for (let currentCapacityLimit = 0; currentCapacityLimit <= capacityLimit; currentCapacityLimit++) {
            // Option A: Do not include the current item.
            // The maximum value remains the same as that achieved with the previous items
            // at the identical capacity.
            const valueIfSkipped = valueLookupTable[currentItemIdx - 1][currentCapacityLimit];
            let valueIfTaken = Number.MIN_SAFE_INTEGER; // Initialize to a very small number, implying it's not possible

            // Check if the current item can actually fit into the knapsack at this capacity.
            if (currentItemWeight <= currentCapacityLimit) {
                // Option B: Include the current item.
                // The value would be the current item's value plus the maximum value
                // achievable with previous items and the remaining capacity.
                valueIfTaken = currentItemValue + valueLookupTable[currentItemIdx - 1][currentCapacityLimit - currentItemWeight];
            }
            
            // The maximum value for the current state (currentItemIdx, currentCapacityLimit)
            // is the greater of the two options: skipping or taking the item.
            valueLookupTable[currentItemIdx][currentCapacityLimit] = Math.max(valueIfSkipped, valueIfTaken);
        }
    }

    // After filling the entire DP table, the final answer is stored at the cell
    // representing all 'numItems' and the total 'capacityLimit'.
    const finalOptimalValue = valueLookupTable[numItems][capacityLimit];
    console.log(finalOptimalValue);
};

// Entry point for execution.
// This block reads input from standard input and invokes the knapsack solver.
const standardInputFilePath = '/dev/stdin';
try {
    const fileContents = require('fs').readFileSync(standardInputFilePath, 'utf8');
    solveKnapsackProblem(fileContents);
} catch (errorParsingInput) {
    // Basic error reporting for input issues or unexpected errors during execution.
    console.error(`An error occurred while reading or processing input: ${errorParsingInput.message}`);
    // Exit with a non-zero code to indicate that the program terminated with an error.
    process.exit(1);
}