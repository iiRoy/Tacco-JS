// This JavaScript module provides a utility function designed to process a raw numerical string input.
// The core logic involves reducing an input number to a value within the range [0, 999]
// if the original number is equal to or exceeds a predefined threshold.
// Numbers below this threshold (including negative values) remain unaltered.

/**
 * Transforms a given raw input string by reducing its numerical value
 * based on a specific boundary.
 *
 * @param {string} rawInputString - The input data, expected to be a string
 *                                  that can be parsed into a number.
 */
function transformNumericalInput(rawInputString) {
    // Define a constant for the upper limit of the target range.
    // This value acts as the divisor in the modulus-like reduction process.
    const REDUCTION_BOUNDARY_VALUE = 1000;

    // --- Type III: Input sanitization and validation ---
    // Ensure the input is treated as a string and remove leading/trailing whitespace.
    const sanitizedInput = String(rawInputString).trim();

    // Attempt to parse the cleaned string into a floating-point number.
    let parsedValue = parseFloat(sanitizedInput);

    // --- Type III: Implement robust error handling/guard clause for invalid inputs ---
    // If parsing results in NaN (Not-a-Number) or an infinite value,
    // log a warning and default the value to 0 to prevent downstream errors.
    if (isNaN(parsedValue) || !isFinite(parsedValue)) {
        console.warn(`Input Error: Encountered invalid or non-finite data ('${rawInputString}'). Defaulting to 0 for processing.`);
        parsedValue = 0; // Fallback to a safe default.
    }

    // --- Type II: Rename the primary working variable ---
    // This variable will hold the number as it undergoes transformation.
    let currentCalculatedValue = parsedValue;

    // --- Type III: Rewrite the core reduction logic using an alternative approach ---
    // The original code used a `while (N >= 1000) { N %= 1000 }` loop.
    // We will achieve the same functional outcome by repeatedly subtracting the boundary value.
    // This maintains the original behavior: only numbers >= REDUCTION_BOUNDARY_VALUE are modified.
    if (currentCalculatedValue >= REDUCTION_BOUNDARY_VALUE) {
        // --- Type III: Introduce an auxiliary variable to track iterations (non-essential) ---
        let deductionCycles = 0;

        // Perform repeated subtraction until the value falls below the boundary.
        // This is functionally equivalent to the modulo operation for positive numbers
        // but uses a different iterative structure.
        while (currentCalculatedValue >= REDUCTION_BOUNDARY_VALUE) {
            currentCalculatedValue -= REDUCTION_BOUNDARY_VALUE;
            deductionCycles++; // Increment the counter for demonstration purposes.

            // --- Type III: Add a non-essential, conditional debug/trace statement ---
            // This fragment demonstrates adding new code that doesn't alter core logic.
            // It might be used for performance monitoring or debugging in a real scenario.
            // if (deductionCycles % 50000 === 0) {
            //     console.debug(`Intermediate processing: ${currentCalculatedValue} after ${deductionCycles} cycles.`);
            // }
        }
    }
    // If `currentCalculatedValue` was initially less than `REDUCTION_BOUNDARY_VALUE` (including negative numbers),
    // it will pass through this block untouched, preserving the original behavior.

    // --- Type III: Use an intermediate constant for the final result before output ---
    // This adds a step for clarity or potential further processing before display.
    const finalProcessedResult = currentCalculatedValue;

    // --- Type II: Modify the output mechanism slightly ---
    // Output the final computed value to the console.
    console.log(finalProcessedResult);
}

// --- Type III: Encapsulate the program's execution startup logic in a dedicated function ---
// This improves modularity and separates the runtime setup from the core transformation.
function initializeAndExecuteProgram() {
    let inputSourceData;

    try {
        // --- Type III: Implement robust file system interaction with try-catch ---
        // Read the entire content from standard input (`/dev/stdin`).
        // Specify 'utf8' encoding to correctly interpret text data.
        inputSourceData = require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (ioError) {
        // If there's an error during file reading (e.g., file not found, permission issues),
        // log the error details and provide a safe default value to continue execution.
        console.error("Critical: Failed to read input from /dev/stdin. Program will proceed with default '0'. Error details:", ioError.message);
        inputSourceData = "0"; // Fallback default.
    }

    // --- Type III: Add a pre-processing step for multi-line inputs ---
    // In case the standard input contains multiple lines, this ensures
    // only the first line is considered for numerical processing, matching the context
    // where a single number is expected.
    const primaryInputLine = inputSourceData.split('\n')[0];

    // Invoke the main transformation function with the prepared input.
    transformNumericalInput(primaryInputLine);
}

// Execute the program's initialization sequence.
initializeAndExecuteProgram();