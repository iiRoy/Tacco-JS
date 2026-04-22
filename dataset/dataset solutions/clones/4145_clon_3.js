const DOUBLING_MULTIPLIER = 2; // A constant representing the factor for each doubling operation.

/**
 * Orchestrates the process of reading numerical input from standard input,
 * validating it, and calculating the number of doubling steps required
 * for an initial value to reach or exceed a target threshold.
 *
 * @returns {number} The total count of doubling operations performed.
 * @throws {Error} If input is invalid (e.g., non-numeric, incorrect count, or non-positive values).
 */
function determineDoublingIterations() {
    // Acquire the file system module for reading standard input.
    const fileSystemHandler = require('fs');

    // Read the raw byte stream from standard input and decode it as UTF-8.
    const rawDataBuffer = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

    // Process the raw string: remove leading/trailing whitespace,
    // split into individual string tokens, and then convert each token to a number.
    const processedNumericInputs = rawDataBuffer
                                     .trim() // Eliminate any extraneous whitespace.
                                     .split(' ') // Break the string into an array of substrings.
                                     .map(strValue => {
                                         const convertedNumber = Number(strValue); // Explicitly convert to number.
                                         // Validate that the conversion resulted in a valid number.
                                         if (Number.isNaN(convertedNumber)) {
                                             throw new Error(`Input parsing failed: "${strValue}" is not a valid number.`);
                                         }
                                         return convertedNumber;
                                     });

    // Ensure that exactly two numerical values were provided in the input.
    if (processedNumericInputs.length !== DOUBLING_MULTIPLIER) {
        throw new Error(`Expected precisely two numerical inputs, but received ${processedNumericInputs.length}.`);
    }

    // Extract the initial value and the target value from the parsed array.
    const initialQuantity = processedNumericInputs[0];
    const targetBoundary = processedNumericInputs[1];

    // Implement robust validation for the input values.
    if (initialQuantity <= 0) {
        throw new Error("The starting quantity must be a positive number for this calculation.");
    }
    if (targetBoundary <= 0) {
        throw new Error("The target boundary must be a positive number for this calculation.");
    }

    // If the initial quantity already meets or exceeds the target, no doublings are needed.
    if (initialQuantity >= targetBoundary) {
        return 0;
    }

    let currentCalculatedProduct = initialQuantity; // This variable tracks the value after each doubling.
    let totalDoublingOperations = 0; // This counter stores the number of doublings.

    // Continuously double the current product until it reaches or surpasses the target boundary.
    // This loop models exponential growth.
    while (currentCalculatedProduct < targetBoundary) {
        currentCalculatedProduct *= DOUBLING_MULTIPLIER; // Multiply the current value by the doubling factor.
        totalDoublingOperations++; // Increment the counter for each completed doubling step.
    }

    // Return the final count of how many times the initial quantity was doubled.
    return totalDoublingOperations;
}

// Execute the main logic and handle potential errors gracefully.
try {
    const finalOutcome = determineDoublingIterations(); // Invoke the core calculation function.
    console.log(finalOutcome); // Display the computed result to standard output.
} catch (executionError) {
    // If an error occurs during execution, print an informative message to standard error.
    console.error("An unhandled error prevented the calculation from completing:", executionError.message);
    // Terminate the process with a non-zero exit code to signal failure.
    process.exit(1);
}