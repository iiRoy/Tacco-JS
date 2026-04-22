"use strict";

/**
 * Core function to convert a decimal integer to its negabase (-2) representation.
 * This implementation follows a specific algorithm where intermediate values are always even
 * before division by -2, ensuring integer arithmetic throughout.
 * @param {number} decimalValue - The integer value to convert.
 * @returns {string} The negabase (-2) string representation of the input decimal value.
 */
function convertToNegabase(decimalValue) {
    // Define the target base as a constant for clarity and potential future modification.
    const TARGET_BASE = -2;

    // Handle the special case where the input value is zero.
    // Zero in any base is typically represented as '0'.
    if (decimalValue === 0) {
        return '0';
    }

    // Initialize an empty string to accumulate the negabase digits.
    // Digits are prepended to build the string in the correct order (least significant first).
    let negabaseOutput = "";

    // Loop until the working decimal value becomes zero.
    // Each iteration extracts one negabase digit.
    while (decimalValue !== 0) {
        // Determine if the current decimal value is odd or even.
        // The modulo operator (%) in JavaScript can return a negative result
        // if the dividend is negative, but the parity check (non-zero) remains valid.
        const isCurrentValueOdd = (decimalValue % 2 !== 0);

        let currentDigitChar; // Variable to hold the character '0' or '1' for the current digit.

        if (isCurrentValueOdd) {
            // If the value is odd, the negabase digit (remainder) is '1'.
            // To prepare for the next division by -2, we decrement the value by 1.
            // This makes 'decimalValue' an even number, ensuring integer division in the next step.
            decimalValue -= 1;
            currentDigitChar = '1';
        } else {
            // If the value is even, the negabase digit (remainder) is '0'.
            currentDigitChar = '0';
        }

        // Prepend the determined digit character to our output string.
        // This builds the negabase string in reverse order of calculation, which is correct.
        negabaseOutput = currentDigitChar + negabaseOutput;

        // Divide the current value by the target base.
        // Since `decimalValue` is guaranteed to be an even integer at this point
        // (either it was initially even, or it was decremented to become even),
        // this division will always result in an integer.
        // Therefore, explicit floor/truncation functions (like Math.trunc) are not strictly necessary
        // for this specific negabase algorithm implementation in JavaScript.
        decimalValue /= TARGET_BASE;
    }

    // Return the final computed negabase representation string.
    return negabaseOutput;
}

/**
 * Orchestrates the reading of input data, parsing the numeric value,
 * performing the negabase conversion, and outputting the result.
 * This function serves as the primary entry point for the script's logic.
 * @param {string} sourceTextPayload - The raw string content read from the input source (e.g., stdin).
 */
function ExecuteNegabaseConversion(sourceTextPayload) {
    // Defensive check to ensure a valid input payload string is provided.
    if (!sourceTextPayload || typeof sourceTextPayload !== 'string' || sourceTextPayload.trim().length === 0) {
        console.error("Error: No valid input text provided for processing. Please check the source data.");
        return; // Terminate execution gracefully if input is invalid.
    }

    // Split the entire input payload into an array of individual lines.
    const inputDataLines = sourceTextPayload.split('\n');

    // Iterate through the lines to find the first non-empty line
    // and extract the numeric string from it.
    let initialNumericString = '';
    for (let lineIndex = 0; lineIndex < inputDataLines.length; lineIndex++) {
        const trimmedLineCandidate = inputDataLines[lineIndex].trim();
        if (trimmedLineCandidate.length > 0) {
            // If a non-empty line is found, take the first space-separated token
            // as the potential numeric input.
            initialNumericString = trimmedLineCandidate.split(/\s+/)[0];
            break; // Stop searching after finding the first relevant line.
        }
    }

    // Validate if a numeric string was successfully extracted from the input.
    if (initialNumericString === '') {
        console.error("Error: Could not locate a numeric value in the provided input lines. Ensure the input contains a number.");
        return;
    }

    // Parse the extracted string into an integer.
    // Using Number.parseInt with radix 10 for explicit decimal conversion.
    const parsedNumericValue = Number.parseInt(initialNumericString, 10);

    // Perform validation on the parsed number:
    // 1. Check if the parsing resulted in NaN (Not-a-Number).
    // 2. Check if the parsed value is indeed an integer (e.g., "3.14" would be parsed as 3, but not an integer from Number.isInteger's perspective on the original).
    if (Number.isNaN(parsedNumericValue) || !Number.isInteger(parsedNumericValue)) {
        console.error(`Error: Input value '${initialNumericString}' is not a valid integer. Aborting conversion process.`);
        return;
    }

    // Call the core conversion logic function with the validated numeric input.
    const finalNegabaseRepresentation = convertToNegabase(parsedNumericValue);

    // Output the computed negabase result to the console.
    console.log(finalNegabaseRepresentation);
}

// This immediately invoked function expression (IIFE) serves as the application's entry point.
// It handles environment-specific tasks like reading from standard input in a Node.js environment.
(function initializeApplication() {
    try {
        // Dynamically require the Node.js 'fs' (file system) module.
        const fileSystemModule = require("fs");
        // Define the standard input path for typical competitive programming environments.
        const standardInputPath = "/dev/stdin";
        // Specify the encoding format for reading the input file.
        const encodingFormat = "utf8";

        // Read the entire content of the standard input file synchronously.
        const rawInputContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);

        // Pass the raw content to our main processing function.
        ExecuteNegabaseConversion(rawInputContent);
    } catch (e) {
        // Catch and log any errors that occur during file reading or initial setup.
        console.error("An error occurred while attempting to read input from /dev/stdin:", e.message);
        // Exit the process with a non-zero status code to indicate an error.
        process.exit(1);
    }
})();