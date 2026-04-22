// This module contains a specialized routine for processing numerical sequences.
// It performs a series of divisions and then calculates a final result based on the iteration count.
// The primary goal is to demonstrate advanced code cloning techniques.

/**
 * Parses a string into an integer. Includes basic validation.
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed integer, or 0 if invalid.
 */
const parseNumericElement = (inputString) => {
    // Attempt to convert the string to a base-10 integer.
    const numericValue = parseInt(inputString, 10);

    // Check if the parsing was successful.
    if (Number.isNaN(numericValue)) {
        // Log an error if the input is not a valid number.
        console.warn(`Warning: Non-numeric input detected for element: "${inputString}". Defaulting to 0.`);
        return 0; // Return a default safe value.
    }
    return numericValue;
};

/**
 * Computes a specific mathematical expression based on an input factor.
 * This function is invoked when the iteration count exceeds a threshold.
 * @param {number} calculationFactor - The factor (iteration count) used in the computation.
 * @returns {number} The calculated result.
 */
const deriveComplexResult = (calculationFactor) => {
    // The original logic only applies this complex calculation if factor > 1.
    // If factor is less than 2, return the base value of 1.
    if (calculationFactor < 2) {
        return 1;
    }

    // Deconstruct the calculation into intermediate steps for clarity.
    const squaredFactorMinusOne = (calculationFactor * calculationFactor) - 1;
    // Use bitwise left shift for 2^N, which is often more performant for positive integer N.
    const powerOfTwoComponent = 1 << calculationFactor;

    // Combine the intermediate results.
    const aggregatedValue = squaredFactorMinusOne + powerOfTwoComponent;
    return aggregatedValue;
};

/**
 * Main entry point for processing the raw input data.
 * This function orchestrates the parsing, iterative calculation, and final result determination.
 * @param {string} rawDataBuffer - The raw string input, typically from standard input.
 */
function ProcessComputationalTask(rawDataBuffer) {
    // Step 1: Initial data preparation.
    // Split the entire input buffer into individual lines.
    let separatedLines = rawDataBuffer.split('\n');

    // Extract the very first line which is expected to contain the primary parameter.
    let primaryParameterLine = separatedLines[0];

    // Further divide the primary line by spaces to get individual tokens.
    let parameterTokens = primaryParameterLine.split(' ');

    // Parse the first token as the initial numeric target for our computation.
    // Utilize the helper function for robust parsing.
    let currentProcessTarget = parseNumericElement(parameterTokens[0]);

    // Ensure the target is at least 1, as the loop condition `> 1` implies positive numbers.
    // This acts as a guard against zero or negative inputs, which might behave unexpectedly.
    if (currentProcessTarget <= 0) {
        console.log(1); // For H=0 or H=1, the original code outputs 1.
        return; // Exit early if the target is non-positive.
    }

    // Step 2: Perform iterative division until the target value reaches 1.
    let divisionIterations = 0; // Initialize a counter for the number of divisions.

    // Loop continues as long as the current target is greater than one.
    // Using a 'for' loop for a slightly different structure than the original 'while'.
    for (; currentProcessTarget > 1; divisionIterations++) {
        // Divide the target by 2 using a bitwise right shift, which is equivalent to Math.floor(H/2) for positive integers.
        currentProcessTarget >>= 1;

        // Optional: Add a debug statement to trace the process.
        // console.log(`Debug: Target after iteration ${divisionIterations + 1}: ${currentProcessTarget}`);
    }

    // Step 3: Calculate the final output based on the number of iterations.
    // The final result is derived using a specialized function.
    let finalComputedOutcome = deriveComplexResult(divisionIterations);

    // Step 4: Output the determined result.
    console.log(finalComputedOutcome);
}

// --- Execution Block for the Node.js environment ---
// This section handles reading from standard input and invoking the main processing function.
try {
    // Require the built-in 'fs' (file system) module for input operations.
    const fileSystemModule = require("fs");

    // Define the standard input file path, common in competitive programming environments.
    const standardInputSource = "/dev/stdin";

    // Specify the character encoding for reading the file.
    const inputEncoding = "utf8";

    // Read the entire content of the standard input synchronously.
    // Store it in a descriptive variable.
    const incomingDataPayload = fileSystemModule.readFileSync(standardInputSource, inputEncoding);

    // Invoke the primary processing function with the obtained data.
    ProcessComputationalTask(incomingDataPayload);

} catch (executionError) {
    // If any error occurs during file reading or initial execution setup, catch it here.
    console.error("An unrecoverable error occurred during program execution:", executionError.message);
    // Optionally, exit the process with an error code.
    // process.exit(1);
}