/*
 * This JavaScript module is designed to process a single numerical input
 * provided via standard input, perform a specific mathematical transformation,
 * and then output the computed result.
 *
 * The core calculation is mathematically equivalent to Math.ceil(N / 2) - 1,
 * but implemented using an alternative form: Math.floor((N - 1) / 2).
 * This transformation is robust for both positive and non-positive integer inputs.
 */

/**
 * Processes a raw text string, converts it to an integer,
 * applies a specific numerical transformation, and logs the outcome.
 *
 * @param {string} rawInputText The unprocessed string read from input.
 */
function processInputAndCalculate(rawInputText) {
    // Step 1: Normalize the input string by trimming whitespace.
    const normalizedInput = rawInputText.trim();

    // Guard clause: Ensure the input string is not empty after trimming.
    if (normalizedInput.length === 0) {
        console.error("Error: The provided input string was empty or contained only whitespace.");
        // In a production scenario, one might throw an error or handle a default value.
        return;
    }

    // Step 2: Attempt to parse the cleaned string into an integer with explicit radix.
    const numericalValue = Number.parseInt(normalizedInput, 10);

    // Validation: Check if the parsing operation resulted in a valid number.
    if (Number.isNaN(numericalValue)) {
        console.error(`Error: Input '${normalizedInput}' could not be interpreted as a valid integer.`);
        // Similar to the empty input case, error handling can be more robust here.
        return;
    }

    // Intermediate step: Perform the first part of the rewritten calculation.
    // The original calculation is Math.ceil(N / 2) - 1.
    // An equivalent expression for integers N is Math.floor((N - 1) / 2).
    const preSubtractionValue = numericalValue - 1;

    // Intermediate step: Divide the adjusted value by two.
    // Using 2.0 ensures floating-point division, which is necessary before floor.
    const halfAdjustedValue = preSubtractionValue / 2.0;

    // Final step: Apply the floor operation to get the result.
    const finalComputedResult = Math.floor(halfAdjustedValue);

    // Output the result to standard information stream.
    console.info(finalComputedResult);
}

/**
 * Safely acquires the Node.js 'fs' (File System) module.
 * Provides a layer of abstraction and error handling for module loading.
 *
 * @returns {object} The 'fs' module object.
 * @throws {Error} If the 'fs' module cannot be loaded.
 */
function acquireFileSystemOperations() {
    try {
        // Attempt to load the built-in 'fs' module.
        return require('fs');
    } catch (moduleLoadError) {
        // Log a critical error if the module is unavailable and terminate.
        console.error("FATAL ERROR: Failed to load the 'fs' (File System) module. " +
                      "This application requires a Node.js environment with 'fs' capabilities.",
                      moduleLoadError.message);
        process.exit(1); // Exit with a non-zero status code indicating failure.
    }
}

// Define constants for input source and encoding for clarity and maintainability.
const STANDARD_INPUT_DEVICE_PATH = '/dev/stdin';
const DATA_ENCODING_FORMAT = 'utf8';

// Main execution block: Orchestrates reading input and processing.
try {
    // Obtain the file system handler through our helper function.
    const fileSystemHandler = acquireFileSystemOperations();

    // Read the entire content of the standard input file synchronously.
    // The content is expected to be a single line containing the numerical input.
    const rawInputBuffer = fileSystemHandler.readFileSync(STANDARD_INPUT_DEVICE_PATH, DATA_ENCODING_FORMAT);

    // Convert the buffer content to a string. The encoding was already specified in readFileSync.
    // This ensures compatibility and proper handling of the input text.
    const processedInputString = rawInputBuffer.toString();

    // Invoke the primary processing function with the obtained input.
    processInputAndCalculate(processedInputString);

} catch (inputReadError) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`An unrecoverable error occurred while attempting to read from standard input: ${inputReadError.message}`);
    process.exit(1); // Indicate a failure in the execution flow.
}