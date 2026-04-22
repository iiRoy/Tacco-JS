// Define constants for item properties and maximum limits to enhance readability and maintainability.
const MAX_ALPHA_ITEMS = 25;
const MAX_BETA_ITEMS = 16;
const MAX_GAMMA_ITEMS = 10;

// Unit weights for each item type.
const UNIT_WEIGHT_ALPHA = 200;
const UNIT_WEIGHT_BETA = 300;
const UNIT_WEIGHT_GAMMA = 500;

// The maximum allowed total weight for any combination of items.
const MAX_AGGREGATE_WEIGHT = 5000;

// Pricing and discount structure for Item Alpha.
const ALPHA_UNIT_PRICE = 380;
const ALPHA_BATCH_SIZE = 5;
const ALPHA_BATCH_DISCOUNT_FACTOR = 0.8; // 20% discount on batches

// Pricing and discount structure for Item Beta.
const BETA_UNIT_PRICE = 550;
const BETA_BATCH_SIZE = 4;
const BETA_BATCH_DISCOUNT_FACTOR = 0.85; // 15% discount on batches

// Pricing and discount structure for Item Gamma.
const GAMMA_UNIT_PRICE = 850;
const GAMMA_BATCH_SIZE = 3;
const GAMMA_BATCH_DISCOUNT_FACTOR = 0.88; // 12% discount on batches

/**
 * Helper function to compute the cost for a specific item type,
 * taking into account potential batch discounts. This encapsulates
 * the logic for calculating price based on quantity and discount rules.
 *
 * @param {number} itemCount - The total number of items of this particular type.
 * @param {number} unitPrice - The base price for a single item of this type.
 * @param {number} batchSize - The quantity of items that form a discount batch.
 * @param {number} discountFactor - The multiplier applied to the batch price (e.g., 0.8 for a 20% discount).
 * @returns {number} The total calculated monetary cost for this item type.
 */
const calculateItemComponentCost = (itemCount, unitPrice, batchSize, discountFactor) => {
    // Determine the number of full batches that can be assembled.
    const numberOfFullBatches = Math.floor(itemCount / batchSize);
    // Calculate the number of items remaining after forming all full batches.
    const itemsRemaining = itemCount % batchSize;

    // Compute the cost derived from the discounted batches.
    const costFromBatches = unitPrice * batchSize * discountFactor * numberOfFullBatches;
    // Compute the cost for the individual remaining items (these do not receive a discount).
    const costFromRemainders = unitPrice * itemsRemaining;

    // Return the sum of costs from both batches and remaining items.
    return costFromBatches + costFromRemainders;
};

// Initialize a JavaScript object to serve as a registry.
// This registry will map a `totalMass` value to its `optimalCost`.
// We use 'var' to align with the original code's variable declaration style for global-like scope.
var optimalCostRegistry = {};

// Begin the first of three nested loops to iterate through all possible quantities of Item Alpha.
// 'countAlpha' represents the number of items of type A.
for (let countAlpha = 0; countAlpha <= MAX_ALPHA_ITEMS; countAlpha++) {
    // Begin the second loop for Item Beta quantities.
    // 'countBeta' represents the number of items of type B.
    for (let countBeta = 0; countBeta <= MAX_BETA_ITEMS; countBeta++) {
        // Begin the third and innermost loop for Item Gamma quantities.
        // 'countGamma' represents the number of items of type C.
        for (let countGamma = 0; countGamma <= MAX_GAMMA_ITEMS; countGamma++) {

            // Calculate the cumulative physical mass for the current combination of items (Alpha, Beta, Gamma).
            let currentTotalMass =
                UNIT_WEIGHT_ALPHA * countAlpha +
                UNIT_WEIGHT_BETA * countBeta +
                UNIT_WEIGHT_GAMMA * countGamma;

            // Implement a guard clause: If the current combination's total mass exceeds the predefined maximum,
            // there's no need to calculate its cost, so skip to the next combination.
            if (currentTotalMass > MAX_AGGREGATE_WEIGHT) {
                continue; // Skip the rest of this iteration and proceed to the next 'countGamma'.
            }

            // Initialize a variable to accumulate the monetary cost for this specific item combination.
            let currentMonetaryCost = 0;

            // Calculate and add the cost component for Item Alpha using the helper function.
            currentMonetaryCost += calculateItemComponentCost(
                countAlpha,
                ALPHA_UNIT_PRICE,
                ALPHA_BATCH_SIZE,
                ALPHA_BATCH_DISCOUNT_FACTOR
            );

            // Calculate and add the cost component for Item Beta.
            currentMonetaryCost += calculateItemComponentCost(
                countBeta,
                BETA_UNIT_PRICE,
                BETA_BATCH_SIZE,
                BETA_BATCH_DISCOUNT_FACTOR
            );

            // Calculate and add the cost component for Item Gamma.
            currentMonetaryCost += calculateItemComponentCost(
                countGamma,
                GAMMA_UNIT_PRICE,
                GAMMA_BATCH_SIZE,
                GAMMA_BATCH_DISCOUNT_FACTOR
            );

            // Store or update the minimum monetary cost found for the 'currentTotalMass'.
            // If an entry for 'currentTotalMass' already exists in 'optimalCostRegistry',
            // update it only if 'currentMonetaryCost' is lower. Otherwise, create a new entry.
            // Using 'Infinity' as a default for non-existent keys ensures 'Math.min' works correctly.
            optimalCostRegistry[currentTotalMass] = Math.min(
                optimalCostRegistry[currentTotalMass] || Infinity,
                currentMonetaryCost
            );
        }
    }
}

// --- Section for Input Processing and Query Handling ---

// Import the Node.js 'fs' (file system) module.
// Using 'var' for consistency with original code's top-level variable declarations.
var fileSystem = require('fs');

// Read all input data synchronously from the standard input ('/dev/stdin').
// The input is expected to be UTF-8 encoded text.
var rawInputLines = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the raw input string:
// 1. Trim leading/trailing whitespace.
// 2. Split the string into an array of individual lines based on newline characters.
// 3. Filter out any lines that might be empty after trimming or splitting, ensuring valid query data.
var weightQueryRequests = rawInputLines
    .trim()
    .split('\n')
    .filter(line => line.length > 0);

// Enter a loop to process each weight query request.
// The loop continues as long as there are requests remaining in the 'weightQueryRequests' array.
while (weightQueryRequests.length > 0) {
    // Extract the first query from the array and convert it to an integer.
    // 'parseInt' with radix 10 is used for explicit and safe number conversion.
    const requestedWeight = parseInt(weightQueryRequests.shift(), 10);

    // Check for termination conditions: if the requested weight is 0 or is not a valid number (NaN).
    // This signals the end of input queries.
    if (requestedWeight === 0 || isNaN(requestedWeight)) {
        break; // Exit the loop when termination condition is met.
    }

    // Look up the pre-computed optimal cost for the 'requestedWeight' in our registry.
    // The result (either the cost or 'undefined' if not found) is printed to the console.
    console.log(optimalCostRegistry[requestedWeight]);
}