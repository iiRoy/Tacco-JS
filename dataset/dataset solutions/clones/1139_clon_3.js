/**
 * @fileoverview This script implements a solution for a variation of the Knapsack problem.
 * It reads item definitions and knapsack capacity from standard input,
 * generates item instances (bundles) based on specific rules,
 * and then computes the maximum value that can be carried within the knapsack's capacity
 * using dynamic programming.
 */

/**
 * Calculates the maximum value that can be placed in a knapsack
 * given a set of items and a maximum capacity.
 * This function uses a dynamic programming approach (0/1 Knapsack).
 *
 * @param {Array<Object>} availableObjects An array of item objects.
 *                                         The first element (index 0) is a placeholder (null).
 *                                         Each item object has properties: { itemWorth: number, itemMass: number }.
 * @param {number} numObjects The total count of actual items available in `availableObjects` (from index 1 to numObjects).
 * @param {number} maxCapacity The maximum weight the knapsack can hold.
 * @returns {number} The maximum total value that can be achieved.
 */
function determineMaxPayload(availableObjects, numObjects, maxCapacity) {
    // Input validation for robustness
    if (numObjects < 0 || maxCapacity < 0) {
        console.error("Error: Number of objects and capacity must be non-negative.");
        return 0; // Or throw an error, depending on desired error handling
    }
    if (numObjects === 0 || maxCapacity === 0) {
        return 0; // If no items or no capacity, max value is 0
    }

    // Initialize a 2D array (DP table) to store the maximum value for each
    // combination of item count and current capacity.
    // Dimensions: (numObjects + 1) rows x (maxCapacity + 1) columns.
    // All cells are initialized to 0, representing the base case
    // where no items are taken or no capacity is available.
    let memoizationGrid = Array(numObjects + 1).fill(null).map(() => Array(maxCapacity + 1).fill(0));

    // Fill the DP table using a bottom-up approach.
    // Iterate through each item, starting from the first actual item (index 1).
    for (let itemIndex = 1; itemIndex <= numObjects; itemIndex++) {
        const currentObject = availableObjects[itemIndex];
        const objectWeight = currentObject.itemMass;
        const objectValue = currentObject.itemWorth;

        // For each item, iterate through all possible capacities from 1 up to maxCapacity.
        for (let currentCapacity = 1; currentCapacity <= maxCapacity; currentCapacity++) {
            // Option 1: Do not include the current item.
            // The value remains the same as the value achieved with the previous (itemIndex - 1) items
            // at the same currentCapacity.
            const valueWithoutCurrent = memoizationGrid[itemIndex - 1][currentCapacity];

            // Option 2: Include the current item, if it fits within the current capacity.
            let valueIfIncluded = 0;
            if (objectWeight <= currentCapacity) {
                // If the item fits, its value is added to the maximum value
                // achieved with previous items and the *remaining* capacity.
                valueIfIncluded = objectValue + memoizationGrid[itemIndex - 1][currentCapacity - objectWeight];
            }

            // The cell [itemIndex][currentCapacity] stores the maximum value
            // obtained by either including or excluding the current item.
            memoizationGrid[itemIndex][currentCapacity] = Math.max(valueWithoutCurrent, valueIfIncluded);
        }
    }

    // The final result is stored in the bottom-right cell of the DP table,
    // representing the maximum value with all available items and full capacity.
    return memoizationGrid[numObjects][maxCapacity];
}

// --- Main script execution starts here ---

let rawInputData;
try {
    // Attempt to read all input data from standard input.
    rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
} catch (dataReadError) {
    // Log an error and exit if input reading fails.
    console.error("Error reading input data:", dataReadError.message);
    process.exit(1);
}

// Process the raw input data: trim whitespace and split into individual lines.
let inputLinesArray = rawInputData.trim().split("\n");

// Validate if any input lines were provided.
if (inputLinesArray.length === 0) {
    console.error("No input data lines were provided.");
    process.exit(1);
}

// Extract the first line which contains the total number of distinct item types (N)
// and the knapsack's maximum weight capacity (W).
const initialConfigLine = inputLinesArray.shift();
const initialConfig = initialConfigLine.split(" ").map(Number);

// Assign parsed configuration values.
let distinctItemTypes = initialConfig[0];
let knapsackCapacity = initialConfig[1];

// Perform basic validation on the initial configuration parameters.
if (isNaN(distinctItemTypes) || isNaN(knapsackCapacity) || distinctItemTypes < 0 || knapsackCapacity < 0) {
    console.error(`Invalid initial configuration: distinct item types='${initialConfig[0]}' or knapsack capacity='${initialConfig[1]}' is invalid.`);
    process.exit(1);
}

// Initialize variables to store generated item instances and their total count.
// `generatedItemInstances` uses 1-based indexing for convenience, matching the DP table's item indexing.
let generatedItemInstances = [null]; // Placeholder at index 0
let totalItemsGenerated = 0;

// Iterate through the remaining input lines to define and generate item instances.
// Each line represents a distinct item type with a base value and base weight.
for (let i = 0; i < distinctItemTypes; i++) {
    // Ensure there are enough lines for all distinct item types.
    if (inputLinesArray.length === 0) {
        console.warn(`Warning: Expected ${distinctItemTypes} item definitions, but only found ${i}. Continuing with available data.`);
        break;
    }

    const currentTypeDefinitionLine = inputLinesArray.shift();
    const currentTypeDefinition = currentTypeDefinitionLine.split(" ").map(Number);

    const baseValue = currentTypeDefinition[0];
    const baseWeight = currentTypeDefinition[1];

    // Validate the current item definition.
    if (isNaN(baseValue) || isNaN(baseWeight) || baseValue < 0 || baseWeight < 0) {
        console.warn(`Warning: Skipping invalid item definition (value: ${currentTypeDefinition[0]}, weight: ${currentTypeDefinition[1]}).`);
        continue; // Skip to the next distinct item type
    }

    // Generate multiple "bundles" of the current item type.
    // For an item with base value 'v' and base weight 'w', it can be taken as:
    // {v, w}, {2v, 2w}, {3v, 3w}, ..., as long as the bundle's weight does not exceed knapsackCapacity.
    let bundleQuantity = 1;
    // Using a while loop instead of do-while for structural variation
    while (baseWeight * bundleQuantity <= knapsackCapacity) {
        generatedItemInstances.push({
            itemWorth: baseValue * bundleQuantity,
            itemMass: baseWeight * bundleQuantity
        });
        totalItemsGenerated++;
        bundleQuantity++;
    }
}

// Before calling the DP function, check if any items were actually generated
// or if the knapsack capacity itself is zero.
if (totalItemsGenerated === 0 || knapsackCapacity === 0) {
    // If no items or no capacity, the maximum value is trivially 0.
    console.log(0);
    process.exit(0);
}

// Call the dynamic programming function to compute the optimal value.
const finalCalculatedValue = determineMaxPayload(generatedItemInstances, totalItemsGenerated, knapsackCapacity);

// Output the final result to standard output.
console.log(finalCalculatedValue);