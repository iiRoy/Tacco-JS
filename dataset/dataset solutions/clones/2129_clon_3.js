"use strict"; // Enforces stricter parsing and error handling in the code.

/**
 * Executes the primary data processing logic for the application.
 * This function is responsible for parsing raw input, applying a conditional
 * calculation, and then presenting the final computed value.
 *
 * @param {string} rawApplicationInput - The raw string data received from the environment,
 *                                       typically expected to contain space-separated numeric values.
 * @returns {void} This function does not return a value but outputs to the console.
 */
function ProcessApplicationData(rawApplicationInput) {
    // --- Input Validation and Pre-processing ---
    // A quick check to ensure the input isn't null, undefined, or an empty string.
    if (!rawApplicationInput || typeof rawApplicationInput !== 'string' || rawApplicationInput.trim().length === 0) {
        console.error("Error: Received invalid or empty input string. Cannot proceed with computation.");
        return; // Terminate execution if input is critically flawed.
    }

    // Define some named constants for clarity, replacing magic numbers.
    const OPERAND_LIMIT_THRESHOLD = 10;
    const PENALTY_FACTOR_MULTIPLIER = 100;
    const MINIMUM_EXPECTED_PARTS = 2; // We anticipate at least two numeric components.

    // Clean the input string and split it into an array of string tokens.
    // This step prepares the data for numerical conversion.
    const stringComponents = rawApplicationInput.trim().split(' ');

    // Verify that we have enough components to perform the intended operations.
    if (stringComponents.length < MINIMUM_EXPECTED_PARTS) {
        console.error("Error: Input string does not contain the expected number of components. At least two are required.");
        return;
    }

    // --- Data Extraction and Type Conversion ---
    // Explicitly parse the first two string components into integer numbers.
    // Using parseInt with a radix (10) ensures base-10 conversion.
    const primaryOperand = parseInt(stringComponents[0], 10);
    const secondaryValue = parseInt(stringComponents[1], 10);

    // Validate that the parsing operations resulted in actual numbers.
    // NaN (Not-a-Number) indicates a failed conversion.
    if (isNaN(primaryOperand) || isNaN(secondaryValue)) {
        console.error("Error: Failed to parse one or both input components into valid numbers.");
        return;
    }

    // --- Core Logic and Conditional Calculation ---
    let finalOutputValue; // Declare a mutable variable to store the final result.

    // Determine if the primary operand meets the specified condition.
    // This boolean flag makes the conditional logic more readable.
    const isPrimaryOperandWithinThreshold = (primaryOperand <= OPERAND_LIMIT_THRESHOLD);

    if (isPrimaryOperandWithinThreshold) {
        // Calculate the difference from the threshold, which determines the magnitude of the adjustment.
        const thresholdDifference = OPERAND_LIMIT_THRESHOLD - primaryOperand;

        // Compute the total adjustment amount using the defined multiplier.
        const calculatedAdjustmentAmount = thresholdDifference * PENALTY_FACTOR_MULTIPLIER;

        // The final value is the secondary value augmented by the calculated adjustment.
        finalOutputValue = secondaryValue + calculatedAdjustmentAmount;
    } else {
        // If the primary operand exceeds the threshold, no adjustment is applied.
        // The final value defaults to the secondary value directly.
        finalOutputValue = secondaryValue;
    }

    // --- Output Result ---
    // Display the computed result to the standard output.
    console.log(finalOutputValue);
}

// --- Application Entry Point ---
// This block handles reading the input from the system's standard input stream
// and then delegates it to the main processing function.
try {
    const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");
    ProcessApplicationData(rawSystemInput);
} catch (ioError) {
    // Catch any potential errors that might occur during file reading (e.g., file not found, permissions).
    console.error("An error occurred while attempting to read input from /dev/stdin:", ioError.message);
    // For debugging, consider logging ioError.stack;
}