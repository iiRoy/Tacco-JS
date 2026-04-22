"use strict";

// Constant for the standard input file path, making it explicit.
const inputSourcePath = '/dev/stdin';

/**
 * Orchestrates the process of receiving input, performing a cubic calculation,
 * and presenting the final result. This function handles the core logic.
 *
 * @param {string} rawInputContent - The entire textual content obtained from the input source.
 */
const performCubicCalculation = (rawInputContent) => {
    // Divide the raw input into an array of individual lines.
    // This approach processes lines individually rather than trimming the whole buffer first.
    const splitInputLines = rawInputContent.split('\n');

    // Extract the very first line of data, ensuring it's free of leading/trailing whitespace.
    // If no lines exist, default to an empty string to prevent errors.
    const initialDataLine = splitInputLines.length > 0 ? splitInputLines[0].trim() : '';

    // --- Input Validation ---
    // Implement a guard clause to check for valid numeric input.
    // This is an added robustness feature, not present in the original.
    if (!initialDataLine || !/^-?\d+$/.test(initialDataLine)) {
        console.error("Error: The provided input is not a valid integer or is empty. Please check the input source.");
        return; // Exit early if validation fails.
    }

    // Convert the validated string segment into an integer.
    // Using `Number.parseInt` with radix 10 for explicit conversion.
    const baseNumericalValue = Number.parseInt(initialDataLine, 10);

    // --- Core Calculation ---
    // Compute the cube of the parsed number.
    // Using Math.pow() demonstrates an alternative method to N*N*N.
    const computedCubicValue = Math.pow(baseNumericalValue, 3);

    // --- Result Output ---
    // Display the final computed value to the standard output.
    console.log(computedCubicValue);
};

// --- Main Execution Block ---
// This section handles reading the input file and invoking the primary calculation function.
try {
    // Utilize Node.js's file system module to synchronously read the content.
    // The 'utf8' encoding ensures proper character interpretation.
    const fileContentsBuffer = require('fs').readFileSync(inputSourcePath, 'utf8');
    
    // Pass the retrieved file content to our primary processing function.
    performCubicCalculation(fileContentsBuffer);
} catch (fileReadError) {
    // Catch and report any issues that occur during the file reading process.
    // This error handling is an added Type III modification for robustness.
    console.error(`An error occurred while attempting to read from ${inputSourcePath}:`, fileReadError.message);
}