// This module defines a function to analyze an input string
// to determine a specific mathematical property.
// The primary goal is to concatenate the first two numeric-like
// components of the string and verify if the resulting integer
// is a perfect square.

/**
 * Analyzes an input string, concatenates its initial two parts,
 * and checks if the resulting number is a perfect square.
 *
 * @param {string} sourceLineData - The raw input string, expected
 *                                  to contain at least two space-separated
 *                                  numeric components.
 * @returns {void} Outputs "Yes" if the combined number is a perfect square,
 *                  "No" otherwise, or if input is invalid.
 */
function verifyCombinedNumberIsPerfectSquare(sourceLineData) {
    // Constants for consistent output messages.
    const RESULT_YES = "Yes";
    const RESULT_NO = "No";
    // Define the radix for integer parsing, ensuring base-10 interpretation.
    const DECIMAL_RADIX = 10;

    // A flag to store the outcome of the square root check.
    let isRootAnInteger = false;

    // --- Comprehensive Input Validation ---

    // Initial check for valid string input.
    // An empty or non-string input is considered invalid for this process.
    if (typeof sourceLineData !== 'string' || sourceLineData.trim().length === 0) {
        console.error("Input processing error: Provided data is not a valid non-empty string.");
        console.log(RESULT_NO); // Indicate failure for invalid input type.
        return; // Terminate execution for invalid input.
    }

    // Split the input string using a regular expression to handle
    // multiple spaces between components robustly.
    // .trim() ensures leading/trailing whitespace doesn't create empty components.
    let parsedStringComponents = sourceLineData.trim().split(/\s+/);

    // Ensure that there are at least two components available for concatenation.
    if (parsedStringComponents.length < 2) {
        console.error("Input processing error: Insufficient numeric components found in the string.");
        console.log(RESULT_NO); // Indicate failure due to malformed input.
        return;
    }

    // --- Core Logic: Number Construction and Square Root Evaluation ---

    // Concatenate the first two identified string parts.
    // This forms the full string representation of the number to be tested.
    let concatenatedNumericString = parsedStringComponents[0] + parsedStringComponents[1];

    // Convert the concatenated string into an integer using the specified radix.
    let numericalValueUnderTest = parseInt(concatenatedNumericString, DECIMAL_RADIX);

    // Validate that the parsing operation yielded a legitimate number.
    // If not a number (NaN), it implies invalid numeric input.
    if (isNaN(numericalValueUnderTest)) {
        console.error("Conversion error: Could not parse concatenated string into a valid integer.");
        console.log(RESULT_NO); // Indicate failure if parsing fails.
        return;
    }

    // A perfect square must be non-negative. Handle negative inputs explicitly.
    if (numericalValueUnderTest < 0) {
        // Negative numbers cannot have real integer square roots.
        console.log(RESULT_NO);
        return;
    }

    // Compute the square root of the target numerical value.
    let calculatedSquareRoot = Math.sqrt(numericalValueUnderTest);

    // --- Perfect Square Determination ---

    // To check if the number is a perfect square, we verify if its square root
    // is an integer. Comparing a number to its floor value is a reliable
    // method for this check in JavaScript, avoiding potential floating-point
    // precision issues that might arise from `x * x === N` for non-integers.
    isRootAnInteger = (Math.floor(calculatedSquareRoot) === calculatedSquareRoot);

    // --- Output Result ---

    // Based on the flag, print the appropriate message to standard output.
    if (isRootAnInteger) {
        console.log(RESULT_YES);
    } else {
        console.log(RESULT_NO);
    }
}

// --- Program Execution Entry Point ---

// Load the 'fs' module for file system operations, specifically for reading standard input.
const fileSystemModule = require('fs');
// Define the standard input stream path for POSIX systems.
const standardInputDevicePath = '/dev/stdin';

try {
    // Synchronously read all data from the standard input file.
    // The 'utf8' encoding ensures correct character interpretation.
    const rawInputContent = fileSystemModule.readFileSync(standardInputDevicePath, 'utf8');

    // Invoke the main processing function with the obtained input.
    verifyCombinedNumberIsPerfectSquare(rawInputContent);

} catch (ioError) {
    // Catch and handle any errors that occur during the file reading process.
    // This could include file not found, permission issues, etc.
    console.error(`Execution error: Failed to read from standard input. Details: ${ioError.message}`);
    // In case of an I/O error, the operation cannot proceed, so output 'No'.
    console.log("No");
}