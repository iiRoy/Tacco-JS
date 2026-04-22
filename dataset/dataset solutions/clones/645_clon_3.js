// This JavaScript module is engineered to ascertain the optimal purchasing strategy
// for a specified quantity of items, comparing two distinct procurement options.
// It processes command-line arguments to perform its calculations.

/**
 * Safely parses a string into a positive integer.
 * This function includes robust validation to ensure the input is a valid,
 * non-negative whole number, suitable for quantities or costs.
 *
 * @param {string} valueString - The string representation of the number to parse.
 * @param {string} parameterLabel - A descriptive name for the parameter being parsed, used in error messages.
 * @returns {number} The successfully parsed positive integer.
 * @throws {Error} If the input string cannot be converted into a positive integer.
 */
const convertToValidatedPositiveInteger = (valueString, parameterLabel) => {
    const numericValue = parseInt(valueString, 10); // Attempt to parse the string into an integer.

    // Comprehensive validation checks:
    // 1. Is it a valid number (not NaN)?
    // 2. Is it an integer (no fractional parts)?
    // 3. Is it greater than zero (as per common problem constraints for quantities/sizes)?
    if (isNaN(numericValue) || !Number.isInteger(numericValue) || numericValue <= 0) {
        throw new Error(`Input validation failed for '${parameterLabel}': Received "${valueString}". Expected a positive integer.`);
    }
    return numericValue;
};

/**
 * Computes the minimum whole number of batches required to cover a total quantity.
 * This is functionally equivalent to the ceiling division (Math.ceil(total / size)).
 * It also incorporates a guard clause for invalid batch sizes.
 *
 * @param {number} totalQuantityNeeded - The cumulative number of items required.
 * @param {number} individualBatchSize - The capacity of a single batch.
 * @returns {number} The calculated count of batches.
 * @throws {Error} If the individualBatchSize is not a positive number, preventing division by zero or illogical scenarios.
 */
const determineMinimumBatches = (totalQuantityNeeded, individualBatchSize) => {
    // Essential guard clause: Ensure batch size is valid to avoid mathematical errors or nonsensical results.
    if (individualBatchSize <= 0) {
        throw new Error(`Batch size must be a positive number for calculation. Encountered: ${individualBatchSize}`);
    }

    // Using Math.ceil provides a clear and concise way to perform ceiling division,
    // which is the intent of the original Java code's conditional logic (N % A == 0 ? N/A : N/A + 1).
    return Math.ceil(totalQuantityNeeded / individualBatchSize);
};

// The primary execution function which orchestrates the logic.
// It takes an array of string arguments, typically from the command line.
const executeCostOptimizationAnalysis = (argumentList) => {
    const EXPECTED_ARGUMENT_COUNT = 5; // Define the fixed number of required input parameters.

    // Initial check for the correct number of arguments. This is a crucial guard clause.
    if (argumentList.length !== EXPECTED_ARGUMENT_COUNT) {
        // Construct a detailed error message to guide the user on correct usage.
        const usageExplanation = `Incorrect number of input arguments provided.
Expected ${EXPECTED_ARGUMENT_COUNT} arguments, but received ${argumentList.length}.
Usage Example: node ${process.argv[1]} <total_items_to_buy> <option1_batch_capacity> <option1_cost_per_batch> <option2_batch_capacity> <option2_cost_per_batch>`;
        throw new Error(usageExplanation);
    }

    // Declare variables to hold the parsed and validated input values.
    let requiredUnits; // Represents N from the original problem.
    let optionAlpha = {}; // Stores details for the first purchasing strategy (A, B).
    let optionBeta = {};  // Stores details for the second purchasing strategy (C, D).

    try {
        // Attempt to parse and validate each command-line argument using the helper function.
        requiredUnits = convertToValidatedPositiveInteger(argumentList[0], "Total Units Required (N)");

        optionAlpha.batchSize = convertToValidatedPositivePositiveInteger(argumentList[1], "Option Alpha Batch Size (A)");
        optionAlpha.pricePerBatch = convertToValidatedPositiveInteger(argumentList[2], "Option Alpha Price Per Batch (B)");

        optionBeta.batchSize = convertToValidatedPositiveInteger(argumentList[3], "Option Beta Batch Size (C)");
        optionBeta.pricePerBatch = convertToValidatedPositiveInteger(argumentList[4], "Option Beta Price Per Batch (D)");

    } catch (parsingException) {
        // If any parsing or validation fails, catch the error and re-throw with additional context.
        throw new Error(`Failed to process input parameters: ${parsingException.message}`);
    }

    // --- Calculation for Purchasing Option Alpha ---
    let batchesForAlpha; // Intermediate variable for storing the batch count.
    try {
        batchesForAlpha = determineMinimumBatches(requiredUnits, optionAlpha.batchSize);
    } catch (calculationErrorAlpha) {
        throw new Error(`Error in calculating batches for Option Alpha: ${calculationErrorAlpha.message}`);
    }

    // Calculate the total cost for Option Alpha.
    // This uses an explicit intermediate variable `rawCostAlpha` for clarity and potential future extensions (e.g., discounts).
    const rawCostAlpha = optionAlpha.pricePerBatch * batchesForAlpha;
    const finalCalculatedCostAlpha = rawCostAlpha; // Placeholder for additional cost adjustments if needed.

    // --- Calculation for Purchasing Option Beta ---
    let batchesForBeta; // Intermediate variable for storing the batch count.
    try {
        batchesForBeta = determineMinimumBatches(requiredUnits, optionBeta.batchSize);
    } catch (calculationErrorBeta) {
        throw new Error(`Error in calculating batches for Option Beta: ${calculationErrorBeta.message}`);
    }

    // Calculate the total cost for Option Beta.
    const rawCostBeta = optionBeta.pricePerBatch * batchesForBeta;
    const finalCalculatedCostBeta = rawCostBeta; // Placeholder for additional cost adjustments.

    // Compare the final costs of both options and identify the lesser value.
    // Using Math.min() for a clear and idiomatic JavaScript approach to finding the minimum.
    const overallOptimalExpenditure = Math.min(finalCalculatedCostAlpha, finalCalculatedCostBeta);

    // Return the final result of the analysis.
    return overallOptimalExpenditure;
};

// --- Main script execution block ---
// Node.js command-line arguments are accessed via `process.argv`.
// The first two elements are 'node' and the script file path, so we slice to get user inputs.
const commandLineInputs = process.argv.slice(2);

try {
    // Invoke the core logic function with the collected command-line arguments.
    const computedOptimalCost = executeCostOptimizationAnalysis(commandLineInputs);
    // Output the final result to standard output.
    console.log(computedOptimalCost);
} catch (operationalError) {
    // If any error occurs during execution (parsing, validation, calculation),
    // catch it and print a user-friendly error message to standard error.
    console.error(`Operation encountered an error: ${operationalError.message}`);
    // Exit the process with a non-zero status code to signal an error condition to the operating system.
    process.exit(1);
}