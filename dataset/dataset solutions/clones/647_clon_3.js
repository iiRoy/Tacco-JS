// This script determines the minimum expenditure required to acquire a specific
// target quantity of items, considering two distinct purchasing strategies or item types.

// --- Section 1: Input Acquisition and Setup ---
// Import the Node.js 'fs' (file system) module for reading input.
const fileSystemModule = require('fs');

// Read the entire content from the standard input stream (/dev/stdin).
// The input is expected to be encoded as UTF-8.
const rawFileContents = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// --- Section 2: Main Program Logic Encapsulation ---
/**
 * Orchestrates the process of reading input, parsing parameters,
 * calculating the minimum procurement cost, and displaying the result.
 */
function executeCostOptimizationAnalysis() {
    // Remove any leading or trailing whitespace from the raw input string
    // to ensure clean parsing.
    const cleanInputString = rawFileContents.trim();

    // Divide the cleaned input string into an array of lines based on newline characters.
    const inputLinesArray = cleanInputString.split('\n');

    // --- Input Validation: Check for presence of input lines ---
    // If no lines are found or the first line is empty, it's an invalid input scenario.
    if (inputLinesArray.length === 0 || inputLinesArray[0].length === 0) {
        console.error('Error: Insufficient input data. Expected at least one non-empty line.');
        return; // Terminate execution if input is missing.
    }

    // Retrieve the first line of input, which contains all the numerical parameters.
    // .shift() removes the line from the array, processing it.
    const firstDataLine = inputLinesArray.shift();

    // Parse the space-separated values in the first line into an array of numbers.
    // The `Number` constructor is used as the mapping function.
    const numericalParameters = firstDataLine.split(' ').map(Number);

    // --- Input Validation: Parameter Count ---
    // Define the expected number of parameters for this problem.
    const EXPECTED_NUM_PARAMS = 5;
    if (numericalParameters.length !== EXPECTED_NUM_PARAMS) {
        console.error(`Error: Mismatched parameter count. Expected ${EXPECTED_NUM_PARAMS}, but received ${numericalParameters.length}.`);
        return; // Terminate if the number of parameters is incorrect.
    }

    // Destructure the parsed numerical values into clearly named constants.
    // N: The ultimate quantity of items that must be acquired.
    // A: The quantity of items contained within a single unit/batch of "Alpha" type.
    // B: The monetary cost associated with purchasing one unit/batch of "Alpha" type.
    // C: The quantity of items contained within a single unit/batch of "Charlie" type.
    // D: The monetary cost associated with purchasing one unit/batch of "Charlie" type.
    const [
        targetRequiredQuantity,
        batchSizeItemAlpha,
        costPerBatchAlpha,
        batchSizeItemCharlie,
        costPerBatchCharlie
    ] = numericalParameters;

    // --- Input Validation: Parameter Values (Type III addition) ---
    // Ensure all critical input parameters are positive. A non-positive value
    // would make the problem ill-defined or unsolvable in a practical sense.
    if (targetRequiredQuantity <= 0 || batchSizeItemAlpha <= 0 || costPerBatchAlpha <= 0 ||
        batchSizeItemCharlie <= 0 || costPerBatchCharlie <= 0) {
        console.error('Error: All input parameters (target quantity, batch sizes, and their respective costs) must be strictly positive numbers.');
        return;
    }

    // --- Section 3: Helper Function for Strategy Cost Calculation (Type III addition) ---
    /**
     * Determines the minimum financial outlay to reach or exceed a specified goal amount
     * using a single purchasing strategy (i.e., one type of item batch).
     *
     * @param {number} goalAmount - The total quantity of items that needs to be met or surpassed.
     * @param {number} itemBatchSize - The fixed quantity of items provided by one batch.
     * @param {number} batchPrice - The monetary cost for acquiring one batch.
     * @returns {number} The lowest possible cost for this strategy, or Number.MAX_SAFE_INTEGER
     *                   if, for some reason, no solution could be found (highly unlikely with positive inputs).
     */
    const calculateSingleStrategyMinCost = (goalAmount, itemBatchSize, batchPrice) => {
        // Initialize the minimum cost for this specific strategy to the largest safe integer.
        // This ensures any valid calculated cost will be smaller.
        let currentStrategyLowestCost = Number.MAX_SAFE_INTEGER;

        // Determine an efficient upper bound for the loop. We need at least `goalAmount / itemBatchSize` batches.
        // Adding a small buffer (e.g., +2) to the ceiling ensures we cover all necessary scenarios,
        // including cases where exact division might lead to off-by-one issues or edge cases
        // where `0` batches are considered (though not useful for positive `goalAmount`).
        const maximumBatchMultiplier = Math.ceil(goalAmount / itemBatchSize) + 2;

        // Iterate through potential multipliers (number of batches to purchase).
        // The loop starts from 0, representing purchasing zero batches.
        for (let batchMultiplier = 0; batchMultiplier <= maximumBatchMultiplier; ++batchMultiplier) {
            // Calculate the total number of units obtained with the current batch multiplier.
            const totalUnitsAcquired = itemBatchSize * batchMultiplier;

            // Calculate the total expense incurred for the current number of batches.
            const currentTotalExpense = batchPrice * batchMultiplier;

            // If the total units acquired meet or exceed the required goal amount,
            // update our minimum cost for this strategy if the current expense is lower.
            if (totalUnitsAcquired >= goalAmount) {
                currentStrategyLowestCost = Math.min(currentStrategyLowestCost, currentTotalExpense);
            }
        }
        return currentStrategyLowestCost;
    };

    // --- Section 4: Overall Minimum Cost Determination ---
    // Calculate the minimum cost using the "Alpha" item strategy.
    const minimumExpenseForAlphaItems = calculateSingleStrategyMinCost(
        targetRequiredQuantity,
        batchSizeItemAlpha,
        costPerBatchAlpha
    );

    // Calculate the minimum cost using the "Charlie" item strategy.
    const minimumExpenseForCharlieItems = calculateSingleStrategyMinCost(
        targetRequiredQuantity,
        batchSizeItemCharlie,
        costPerBatchCharlie
    );

    // The ultimate minimum cost is the lesser of the two individual strategy minimums.
    let overallLowestExpenditure = Math.min(minimumExpenseForAlphaItems, minimumExpenseForCharlieItems);

    // --- Post-Calculation Validation (Type III addition) ---
    // If the overall lowest expenditure remains at MAX_SAFE_INTEGER, it implies
    // that no viable solution was found, which should ideally not happen
    // given the positive input validations. This serves as a safety check.
    if (overallLowestExpenditure === Number.MAX_SAFE_INTEGER) {
        console.error('Warning: No feasible solution found to meet the target quantity with the given parameters.');
        // In a more robust application, an error or specific status might be returned here.
    }

    // --- Section 5: Output the Final Result ---
    // Print the computed overall minimum expenditure to the standard output.
    console.log(overallLowestExpenditure);
}

// --- Section 6: Program Execution ---
// Call the main function to begin the cost optimization process.
executeCostOptimizationAnalysis();