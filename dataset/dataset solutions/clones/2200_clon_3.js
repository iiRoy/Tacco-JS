/**
 * This JavaScript module processes a numeric input to calculate a specific sequence value.
 * It's a Type III clone, featuring extensive renaming, structural changes,
 * and added validations compared to an original recursive implementation.
 */

/**
 * Computes a specific numeric sequence value based on an iterative transformation.
 * The original logic for `fx(x)` was recursive: `fx(1)=1`, `fx(x) = fx(x/2)*2+1`.
 * This iterative function replicates that behavior, yielding `2*N - 1` for an input `N`
 * that is a power of 2 (e.g., fx(8) = 15).
 *
 * @param {number} inputNumberForCalculation The positive integer input for which to calculate the sequence value.
 *                                          It is typically expected to be a power of 2 for consistent behavior
 *                                          mirroring the original recursive function's implicit assumptions.
 * @returns {number} The calculated sequence value, or `NaN` if the input is invalid or leads to an unhandled state.
 */
function calculateIterativeSequence(inputNumberForCalculation) {
    // Extensive input validation and type checking to ensure robust operation.
    // Checks if the input is a valid number, an integer, and strictly positive.
    if (typeof inputNumberForCalculation !== 'number' || !Number.isInteger(inputNumberForCalculation) || inputNumberForCalculation < 1) {
        console.error("Error in calculateIterativeSequence: Input must be a positive integer. Received:", inputNumberForCalculation);
        // Returning NaN as an error indicator, allowing the calling context to handle it gracefully.
        return Number.NaN;
    }

    // Introducing a helper constant for the core multiplier, enhancing readability and maintainability.
    const multiplicationFactor = 2;

    // Explicitly handling the base case of the sequence.
    // This is equivalent to the `if(x==1) return 1;` condition in the original.
    if (inputNumberForCalculation === 1) {
        return 1;
    }

    // The core iterative calculation replaces the original recursive structure.
    // This loop effectively unwinds the recursion, accumulating the result from the base up.
    let currentAccumulatedResult = 1; // Represents the result for the base case (input = 1).
    let tempValueForIteration = inputNumberForCalculation; // A mutable copy of the input for loop control.

    // Loop continues until the temporary value is reduced to the base case (1).
    while (tempValueForIteration > 1) {
        // Added validation: warns if the intermediate value is not perfectly divisible by the factor.
        // This diagnostic helps identify inputs that might not be powers of two,
        // which could lead to unexpected behavior in the original recursive function
        // if it were to continue dividing non-integer values.
        if (tempValueForIteration % multiplicationFactor !== 0) {
            console.warn(`Warning in calculateIterativeSequence: Intermediate value ${tempValueForIteration} is not perfectly divisible by ${multiplicationFactor}. This suggests the initial input (${inputNumberForCalculation}) might not be a power of two, potentially leading to non-integer divisions in the original recursive approach.`);
            // For Type III, we can choose to stop, correct, or continue with a warning.
            // Here, we continue, mirroring the original's potential behavior but with added diagnostics.
        }

        // Apply the transformation logic: result = (previous_result * 2) + 1.
        // This step directly corresponds to `fx(x/2)*2+1`.
        currentAccumulatedResult = (currentAccumulatedResult * multiplicationFactor) + 1;

        // Reduce the temporary value by division, mirroring the `x/2` step in the recursion.
        tempValueForIteration /= multiplicationFactor;
    }

    // The final accumulated result after all iterations are complete.
    return currentAccumulatedResult;
}


/**
 * Orchestrates the program's primary execution flow:
 * reads raw input, performs necessary pre-processing and validation,
 * invokes the core calculation function, and outputs the final result.
 * This function serves as the main entry point for the script's logic.
 *
 * @param {string} rawProgramInput The raw string data obtained from the input source (e.g., standard input).
 * @returns {void} This function does not return a value; it outputs directly to the console.
 */
function executePrimaryProgramFlow(rawProgramInput) {
    // Initial defensive coding: ensures the received input is indeed a string.
    if (typeof rawProgramInput !== 'string') {
        console.error("Critical Error in executePrimaryProgramFlow: Program input must be a string type.");
        return; // Terminate execution if the input is fundamentally incorrect.
    }

    // Pre-processing the raw input string.
    // Replaced original `trim()` with a regex-based `replace()` for Type III alteration,
    // achieving the same effect of removing leading/trailing whitespace.
    const cleanedStringInput = rawProgramInput.replace(/^\s+|\s+$/g, '');

    // Convert the cleaned string input to an integer.
    // Using `Number.parseInt` with an explicit radix (10) for robust and clear conversion.
    let processedNumericValue = Number.parseInt(cleanedStringInput, 10);

    // Validation step: checks if the string-to-number conversion was successful.
    if (Number.isNaN(processedNumericValue)) {
        console.error("Input processing error in executePrimaryProgramFlow: Could not convert provided string '" + cleanedStringInput + "' to a valid number.");
        return; // Terminate execution if conversion fails.
    }

    // Additional guard clause: ensures the numeric input is positive, as expected by the calculation logic.
    if (processedNumericValue <= 0) {
        console.error("Input validation error in executePrimaryProgramFlow: Numeric input must be a positive value. Received:", processedNumericValue);
        return; // Terminate for invalid numeric range.
    }

    // Perform the core calculation using the modified iterative function.
    let finalComputedOutcome = calculateIterativeSequence(processedNumericValue);

    // Final output to the standard console, with an added descriptive prefix for clarity.
    console.log("Calculated Result: " + finalComputedOutcome);
}


// --- Program Entry Point and Global Execution Context ---

// Define constants for standard input file descriptor and encoding,
// enhancing configurability and readability.
const STANDARD_INPUT_FILE_DESCRIPTOR = 0; // File descriptor for stdin (common in Unix-like systems).
const UTF8_ENCODING = "utf8";             // Standard encoding for text input.

// Wrap the entire input reading and main program execution in a try-catch block.
// This provides robust error handling for file system operations and
// unexpected issues during the primary program flow.
try {
    // Dynamically load the 'node:fs' module, using its explicit namespace for clarity
    // and as a Type III alteration (renaming 'fs' to 'fsModule').
    const fsModule = require('node:fs');

    // Read the entire content of standard input synchronously.
    // This is suitable for competitive programming environments where input is typically small and provided all at once.
    const inputContent = fsModule.readFileSync(STANDARD_INPUT_FILE_DESCRIPTOR, UTF8_ENCODING);

    // Execute the main program logic with the input content obtained from stdin.
    executePrimaryProgramFlow(inputContent);

} catch (errorOccurred) {
    // Generic error handling for any exceptions that occur during input reading or program execution.
    console.error("An unexpected error occurred during program execution:", errorOccurred.message);
    // Optionally, log the full stack trace for detailed debugging in development/testing environments.
    // console.error(errorOccurred.stack);
}