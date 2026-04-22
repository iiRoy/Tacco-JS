/**
 * This script is designed to perform a specific mathematical computation
 * based on a numerical value acquired from a standard input stream.
 * It reads an integer, validates it, and then calculates a product
 * similar to a factorial, outputting the final result.
 */

// --- Configuration and Initialization ---

// Define constants for the input source and encoding.
// These improve readability and maintainability.
const SYSTEM_INPUT_FILE_PATH = "/dev/stdin";
const TEXT_ENCODING_STANDARD = "utf8";

// Acquire the native Node.js file system module for I/O operations.
const fileSystemUtility = require("fs");

// Declare a variable to hold the raw content read from the file.
let receivedContentString = '';

// --- Input Acquisition and Initial Processing ---

try {
    // Attempt to synchronously read the entire content of the specified input file.
    // The content is expected to be a string representing a number.
    receivedContentString = fileSystemUtility.readFileSync(SYSTEM_INPUT_FILE_PATH, TEXT_ENCODING_STANDARD);
} catch (ioOperationError) {
    // If any error occurs during file reading, log it and terminate the process.
    console.error("An error occurred while attempting to read the input stream:", ioOperationError.message);
    process.exit(1); // Indicate failure
}

// Remove any leading or trailing whitespace from the raw string content.
// Explicitly convert to string just in case readFileSync returns a Buffer (though with 'utf8' it should be string).
const trimmedInputString = receivedContentString.toString().trim();

// Convert the cleaned string into an integer.
// Using radix 10 ensures decimal conversion.
const parsedNumericValue = parseInt(trimmedInputString, 10);

// --- Input Validation ---

// Validate if the parsed value is a legitimate number.
if (isNaN(parsedNumericValue)) {
    console.error("Validation Error: The provided input is not a valid numerical representation.");
    process.exit(1);
}

// Validate if the number is non-negative, as the subsequent calculation
// (effectively (N-1)!) is typically defined for non-negative integers.
if (parsedNumericValue < 0) {
    console.error("Validation Error: Input value must be non-negative for this operation.");
    process.exit(1);
}

// --- Core Calculation Logic ---

// Initialize the accumulator for the product.
// For inputs 0 or 1, the result of (input-1)! (i.e., -1! or 0!) is 1 as per original code behavior.
let resultantProductAccumulator = 1;

// The original code calculates (input - 1)!.
// If parsedNumericValue is 0 or 1, the loop condition `iterationStep < parsedNumericValue` will be false,
// and `resultantProductAccumulator` will remain 1, matching the original output for these cases.
// This block serves as an explicit guard for these base cases without needing to run the loop.
if (parsedNumericValue < 2) {
    // No action needed here, `resultantProductAccumulator` is already 1.
    // This handles input 0 (gives 1), and input 1 (gives 1), and input 2 (gives 1).
} else {
    // Initialize a counter for the multiplication loop.
    let iterationStep = 1;

    // Loop from 1 up to (parsedNumericValue - 1).
    // This computes the factorial of (parsedNumericValue - 1).
    while (iterationStep < parsedNumericValue) {
        // Multiply the current accumulator value by the current iteration step.
        resultantProductAccumulator = resultantProductAccumulator * iterationStep;
        // Increment the iteration step for the next cycle.
        iterationStep = iterationStep + 1; // Explicit increment
    }
}

// --- Output Result ---

// Print the final calculated product to the console.
console.log(resultantProductAccumulator);