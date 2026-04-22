/**
 * Core function to compute the maximum achievable profit from a series of asset values and their corresponding costs.
 * This function processes raw string input, performs validations, and calculates the total profit
 * by only considering positive gains for each item.
 *
 * @param {string} rawInputString - The complete input data received as a single string.
 *                                  Expected format:
 *                                  Line 1: A single integer representing the total number of items (N).
 *                                  Line 2: Space-separated integers, representing the values of assets.
 *                                  Line 3: Space-separated integers, representing the costs associated with each asset.
 */
function calculateOptimalGain(rawInputString) {
    // Step 1: Prepare the input data.
    // Trim any leading/trailing whitespace and split the string into an array of lines.
    const inputLines = rawInputString.trim().split('\n');

    // --- Input Validation: Initial Structure Check ---
    // Ensure that we have at least three lines of input as expected (N, values, costs).
    if (inputLines.length < 3) {
        console.error("ERROR: Insufficient input lines detected. Expected at least 3 lines.");
        // A Type III addition: provide an early exit and informative message for critical errors.
        reportFinalOutcome(0, "Input structure invalid: Not enough data lines.");
        return; // Terminate execution if input is malformed.
    }

    // Step 2: Parse the declared number of items.
    // The first line should contain an integer indicating the count of items.
    const declaredItemCount = Number(inputLines[0]);

    // --- Input Validation: Declared Item Count ---
    // Verify that the declared item count is a valid positive integer.
    if (isNaN(declaredItemCount) || !Number.isInteger(declaredItemCount) || declaredItemCount <= 0) {
        console.error("ERROR: The declared item count (first line) is either not a number, not an integer, or not positive.");
        reportFinalOutcome(0, "Input validation failed: Invalid item count specified.");
        return;
    }

    /**
     * Helper function to parse a single line of space-separated numbers.
     * This function encapsulates the parsing logic and includes basic validation for numeric content.
     * @param {string} lineContent - The string content of the line to parse.
     * @param {string} lineDescription - A descriptive name for the line (e.g., "asset values").
     * @returns {number[] | null} An array of parsed numbers, or null if parsing fails.
     */
    const safelyParseNumericLine = (lineContent, lineDescription) => {
        const parsedNumbers = lineContent.split(' ').map(val => Number(val.trim())); // Use Number() for parsing, trim individual values

        // Check if any element failed to parse into a valid number.
        if (parsedNumbers.some(isNaN)) {
            console.error(`ERROR: Data corruption detected in '${lineDescription}'. Some values are not valid numbers.`);
            return null; // Indicate failure to parse correctly.
        }
        return parsedNumbers;
    };

    // Step 3: Parse the asset values and expense costs using the helper function.
    const assetValues = safelyParseNumericLine(inputLines[1], "asset values collection");
    const expenseCosts = safelyParseNumericLine(inputLines[2], "expense costs collection");

    // --- Input Validation: Parsed Data Integrity ---
    // Ensure both asset values and expense costs were parsed successfully.
    if (assetValues === null || expenseCosts === null) {
        reportFinalOutcome(0, "Input validation failed: Numeric data parsing issues.");
        return;
    }

    // --- Input Validation: Array Length Consistency ---
    // Verify that the actual number of parsed items matches the declared count and that
    // both collections (values and costs) have the same number of elements.
    if (assetValues.length !== declaredItemCount ||
        expenseCosts.length !== declaredItemCount ||
        assetValues.length !== expenseCosts.length) {
        console.error(`ERROR: Item count mismatch! Declared: ${declaredItemCount}, Actual Assets: ${assetValues.length}, Actual Costs: ${expenseCosts.length}.`);
        reportFinalOutcome(0, "Input validation failed: Mismatched item counts or array lengths.");
        return;
    }

    // Step 4: Initialize the accumulator for the total profit.
    // Using `let` as this variable will be reassigned within the loop.
    let totalPotentialProfit = 0;

    // Step 5: Iterate through the items to calculate the cumulative profit.
    // The loop runs for the actual number of items successfully parsed.
    for (let itemIndex = 0; itemIndex < assetValues.length; itemIndex++) {
        // Fetch the current item's value and cost for clarity and reusability within the loop.
        const currentAssetValue = assetValues[itemIndex];
        const currentExpenseCost = expenseCosts[itemIndex];

        // Calculate the difference for the current item, which can be a gain or a loss.
        const gainOrLossForItem = currentAssetValue - currentExpenseCost;

        // Only add positive differences (profits) to the total.
        // `Math.max(0, ...)` concisely ensures that any negative difference (loss) is treated as zero.
        totalPotentialProfit += Math.max(0, gainOrLossForItem);
    }

    // Step 6: Report the final calculated profit.
    reportFinalOutcome(totalPotentialProfit, "Profit calculation completed successfully.");
}

/**
 * A utility function to standardize and display the final result or any error messages.
 * This helps in maintaining consistent output formatting.
 * @param {number} finalProfitValue - The numerical value of the calculated profit.
 * @param {string} statusMessage - A descriptive message regarding the outcome of the calculation.
 */
function reportFinalOutcome(finalProfitValue, statusMessage = "Processing finished.") {
    console.log(`\n--- Execution Summary ---`);
    console.log(`Status: ${statusMessage}`);
    console.log(`Maximum Achievable Profit: ${finalProfitValue}`);
    console.log(`-------------------------\n`);
}

// --- Main Execution Block ---
// This block is responsible for reading the input from the environment
// and initiating the profit calculation process.
// A `try-catch` block is added for robustness, to handle potential
// errors during file system operations or other unexpected runtime issues.
try {
    // Node.js specific: Read the entire content of standard input synchronously.
    // Specifying 'utf8' encoding is crucial for correct string interpretation.
    const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Invoke the primary function with the collected input.
    calculateOptimalGain(standardInputContent);

} catch (executionError) {
    // Catch and report any unhandled exceptions that occur during the script's execution.
    console.error("\nCRITICAL ERROR: An unhandled exception occurred during script execution.");
    console.error(`Error Type: ${executionError.name}`);
    console.error(`Error Message: ${executionError.message}`);
    // Provide a default error outcome to the user.
    reportFinalOutcome(0, "Execution terminated due to an unhandled runtime error.");
}