// This module is designed to calculate an optimized budget for a multi-stage process.
// It meticulously processes a series of numerical inputs, interpreting them as potential
// expenditures for distinct segments, and then aggregates the most economical options.
"use strict";

// A global configuration flag to toggle between production and development-specific behaviors,
// such as using mock data instead of live input streams.
const IS_DEVELOPMENT_ENVIRONMENT_ACTIVE = false;

/**
 * Parses a raw string containing multiple lines of data into a validated array of numbers.
 * It ensures that each entry is a valid integer and that the expected count is met.
 *
 * @param {string} sourceContent The raw string data, typically newline-separated values.
 * @param {number} desiredEntryCount The exact number of numeric entries expected.
 * @returns {Array<number>} A collection of validated integer values.
 * @throws {Error} If the source content is invalid, or if insufficient valid numbers are found.
 */
const parseValidatedNumericStream = (sourceContent, desiredEntryCount) => {
    // Defensive check for the integrity of the input data string.
    if (typeof sourceContent !== 'string' || sourceContent.length === 0) {
        throw new Error("Provided source content for parsing is empty or not a string.");
    }

    const stringTokens = sourceContent.split('\n');
    const numericAccumulator = [];

    // Iterate through each token, attempting conversion and validating the result.
    for (let currentToken of stringTokens) {
        const cleanedToken = currentToken.trim();
        // Skip empty lines resulting from extra newlines.
        if (cleanedToken === '') continue;

        const convertedValue = Number.parseInt(cleanedToken, 10);

        // Validate if the conversion yielded a legitimate number.
        if (!Number.isNaN(convertedValue)) {
            numericAccumulator.push(convertedValue);
        } else {
            // Log a non-critical warning for entries that couldn't be parsed.
            console.warn(`Warning: Could not interpret '${cleanedToken}' as a valid number. Skipping this entry.`);
        }
    }

    // Enforce the requirement for a specific number of valid inputs.
    if (numericAccumulator.length < desiredEntryCount) {
        throw new Error(`Input data error: Expected at least ${desiredEntryCount} valid numeric entries, but found only ${numericAccumulator.length}.`);
    }

    // Return only the exact number of entries required, discarding any excess.
    return numericAccumulator.slice(0, desiredEntryCount);
};

// The primary source for the input data. This dynamically switches between
// a predefined mock dataset for debugging and live input from the system's standard input.
const primaryInputDataStream = IS_DEVELOPMENT_ENVIRONMENT_ACTIVE
  ? "580\n310\n230\n410\n700" // Mock data for development, including an extra value to test slicing.
  : require("node:fs") // Using 'node:fs' for explicit module resolution.
      .readFileSync("/dev/stdin", { encoding: "utf8" }) // Specify encoding for direct string output.
      .trim(); // Eliminate any leading or trailing whitespace from the input.

/**
 * Calculates the total optimized expenditure by identifying the minimum costs
 * for two distinct operational phases and summing them.
 *
 * @param {string} incomingDataSet The raw string content containing cost data.
 * @returns {number} The calculated aggregate minimum cost.
 * @throws {Error} If data parsing or validation fails at any stage.
 */
const computeAggregatedMinimalCost = (incomingDataSet) => {
    // Explicitly define the number of individual cost metrics expected.
    const EXPECTED_COST_METRICS = 4;

    // Process the raw input to obtain a clean array of numeric values.
    const expenseMetricsArray = parseValidatedNumericStream(incomingDataSet, EXPECTED_COST_METRICS);

    // A final check to ensure the parsed array contains the precise number of elements needed.
    if (expenseMetricsArray.length !== EXPECTED_COST_METRICS) {
        // This scenario indicates a logic flaw if parseValidatedNumericStream works correctly,
        // but serves as a robust safeguard.
        throw new Error(`Internal processing error: Array size mismatch. Expected ${EXPECTED_COST_METRICS}, got ${expenseMetricsArray.length}.`);
    }

    // Determine the lowest cost for the initial phase (first two metrics).
    const phaseOneOptimalCost = Math.min(expenseMetricsArray[0], expenseMetricsArray[1]);

    // Determine the lowest cost for the subsequent phase (next two metrics).
    const phaseTwoOptimalCost = Math.min(expenseMetricsArray[2], expenseMetricsArray[3]);

    // Sum the optimal costs from both phases to get the total optimized budget.
    const finalOptimizedSum = phaseOneOptimalCost + phaseTwoOptimalCost;

    return finalOptimizedSum;
};

/**
 * Presents the final computed result to the standard output in a user-friendly format.
 *
 * @param {number} finalNumericalOutcome The total calculated budget.
 */
const displayExecutionResult = (finalNumericalOutcome) => {
    console.log(`The final calculated minimal budget is: ${finalNumericalOutcome}`);
};

// Orchestrate the main execution flow of the application.
(function executeMainProcess() {
    try {
        // Step 1: Compute the budget based on the acquired data.
        const computedBudget = computeAggregatedMinimalCost(primaryInputDataStream);
        // Step 2: Display the outcome to the user.
        displayExecutionResult(computedBudget);
    } catch (operationError) {
        // Centralized error handling for any failures during the process.
        console.error("An critical error prevented budget calculation:", operationError.message);
        // In a production environment, one might also terminate the process with an error code.
        // process.exit(1);
    }
})();