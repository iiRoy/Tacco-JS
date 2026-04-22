/**
 * @file This script calculates the minimum cost to acquire a target quantity
 *       of items by combining two different item types, each with its own
 *       cost contribution and purchase price.
 *       It reads input from standard input, processes it, and outputs the
 *       lowest possible expenditure.
 */

// Import the Node.js file system module for input operations.
const fileSystemInterface = require('fs');

/**
 * Parses raw input text, validates its structure, and extracts
 * the necessary numeric parameters for the cost calculation.
 *
 * @param {string} inputText The raw string content read from the input source.
 * @returns {object} An object containing the parsed numeric parameters.
 * @throws {Error} If the input format is invalid or incomplete.
 */
function processInputParameters(inputText) {
    // Clean and split the input into individual lines.
    const relevantInputLines = inputText.trim().split('\n');

    // Ensure there's at least one line of data.
    if (relevantInputLines.length === 0 || relevantInputLines[0].length === 0) {
        console.error("Input Error: No data lines found or first line is empty.");
        process.exit(1); // Exit with an error code.
    }

    // Extract and convert the first line's space-separated values to numbers.
    const initialNumericData = relevantInputLines[0].split(' ').map(Number);

    // Validate that exactly five numeric parameters were provided.
    const EXPECTED_PARAM_COUNT = 5;
    if (initialNumericData.length < EXPECTED_PARAM_COUNT) {
        console.error(`Input Error: Expected ${EXPECTED_PARAM_COUNT} parameters, but received ${initialNumericData.length}.`);
        process.exit(1); // Exit with an error code.
    }

    // Destructure the parameters for clarity and assign descriptive names.
    const [
        overallQuantityRequired, // The target total quantity to achieve.
        itemAlphaCostContribution, // Contribution of one unit of item Alpha to the total quantity.
        itemAlphaPurchasePrice,    // Price of one unit of item Alpha.
        itemBetaCostContribution,  // Contribution of one unit of item Beta to the total quantity.
        itemBetaPurchasePrice      // Price of one unit of item Beta.
    ] = initialNumericData;

    // Return the parameters as a structured object.
    return {
        overallQuantityRequired,
        itemAlphaCostContribution,
        itemAlphaPurchasePrice,
        itemBetaCostContribution,
        itemBetaPurchasePrice
    };
}

// --- Main Execution Logic ---

// Read all raw content from the standard input stream.
const rawDataString = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

// Parse and validate the input, extracting the necessary numeric values.
const {
    overallQuantityRequired,
    itemAlphaCostContribution,
    itemAlphaPurchasePrice,
    itemBetaCostContribution,
    itemBetaPurchasePrice
} = processInputParameters(rawDataString);

// Initialize the lowest expense found so far to a very large number (positive infinity).
let minimumAchievableExpense = Number.POSITIVE_INFINITY;

// Define the maximum number of iterations for each item type.
// This upper bound is typically derived from problem constraints.
const MAXIMUM_ITEM_COUNT_PER_TYPE = 1000;

// Iterate through all possible quantities for item Alpha.
for (let currentAlphaCount = 0; currentAlphaCount <= MAXIMUM_ITEM_COUNT_PER_TYPE; currentAlphaCount++) {
    // Iterate through all possible quantities for item Beta.
    for (let currentBetaCount = 0; currentBetaCount <= MAXIMUM_ITEM_COUNT_PER_TYPE; currentBetaCount++) {

        // Calculate the total quantity contributed by the current combination of Alpha and Beta items.
        const totalUnitsContributed = (itemAlphaCostContribution * currentAlphaCount) +
                                      (itemBetaCostContribution * currentBetaCount);

        // Check if the combined units meet or exceed the required overall quantity.
        if (totalUnitsContributed >= overallQuantityRequired) {
            // If the requirement is met, calculate the total purchase price for this combination.
            const currentCombinationTotalPrice = (itemAlphaPurchasePrice * currentAlphaCount) +
                                                 (itemBetaPurchasePrice * currentBetaCount);

            // Update the minimum achievable expense if the current combination is cheaper.
            minimumAchievableExpense = Math.min(minimumAchievableExpense, currentCombinationTotalPrice);
        }
    }
}

// Output the final calculated minimum expense to the console.
console.log(minimumAchievableExpense);