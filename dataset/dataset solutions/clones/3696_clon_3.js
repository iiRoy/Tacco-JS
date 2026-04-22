'use strict';

/**
 * @file This script processes a single numeric input from standard input.
 * It determines if the number is even or odd and performs a specific calculation.
 * If the number is even, it outputs the number itself.
 * If the number is odd, it outputs double the number.
 */

// A utility function to determine the multiplier based on parity.
// This encapsulates the core logic for transformation.
const determineParityMultiplier = (valueToExamine) => {
    // Check if the provided value is a valid number.
    if (typeof valueToExamine !== 'number' || isNaN(valueToExamine)) {
        console.error('Error: Input for parity check must be a valid number.');
        // For robust error handling, one might throw an error or return a default/sentinel value.
        // For this specific problem, we assume valid numeric input after initial parsing.
        return null; // Or throw new Error(...)
    }

    // Calculate the remainder when divided by 2.
    const modulusResult = valueToExamine % 2;

    // Based on the remainder, decide the multiplier.
    // If modulusResult is 0, the number is even, multiplier is 1.
    // If modulusResult is 1 (or -1 for negative odd numbers), the number is odd, multiplier is 2.
    // The original expression `n % 2 + 1` handles both positive and negative integers correctly
    // for this specific logic (0+1=1 for even, 1+1=2 for odd).
    // Let's rewrite it explicitly for demonstration of Type III.
    let multiplierFactor;
    if (modulusResult === 0) {
        multiplierFactor = 1; // Even number
    } else {
        multiplierFactor = 2; // Odd number
    }
    return multiplierFactor;
};

/**
 * Main entry point for processing raw string data.
 * It parses the input, extracts the relevant number, and performs a calculation.
 * @param {string} rawDataString - The complete string content read from the input source.
 */
const processInputData = (rawDataString) => {
    // Ensure the input string is not null or empty after trimming whitespace.
    if (!rawDataString || rawDataString.trim().length === 0) {
        console.error('No input data provided. Exiting.');
        return; // Terminate execution gracefully.
    }

    // Split the entire input string into individual lines.
    // Trim to remove leading/trailing whitespace from the whole input.
    const separatedInputLines = rawDataString.trim().split('\n');

    // Check if there's at least one line of input to process.
    if (separatedInputLines.length === 0) {
        console.error('Input data is empty after splitting into lines. Exiting.');
        return;
    }

    // Take the very first line from the input.
    const firstRelevantLine = separatedInputLines[0];

    // Split the first line by spaces to get individual tokens.
    const lineTokens = firstRelevantLine.split(' ');

    // Ensure there's at least one token on the first line.
    if (lineTokens.length === 0) {
        console.error('First input line contains no discernible tokens. Exiting.');
        return;
    }

    // Attempt to convert the first token of the first line into a numeric value.
    // Using `Number()` is a concise way for type conversion.
    const extractedNumericValue = Number(lineTokens[0]);

    // Validate if the conversion resulted in a valid number.
    if (isNaN(extractedNumericValue)) {
        console.error(`Error: The first token "${lineTokens[0]}" is not a valid number. Cannot proceed.`);
        return; // Stop processing if input is invalid.
    }

    // Determine the multiplier based on the parity of the extracted number.
    const calculatedMultiplier = determineParityMultiplier(extractedNumericValue);

    // If for some reason the multiplier couldn't be determined (e.g., error in helper function),
    // although our current helper function is robust, it's good practice to check.
    if (calculatedMultiplier === null) {
        console.error('Failed to determine parity multiplier. Aborting calculation.');
        return;
    }

    // Perform the final computation using the extracted value and the determined multiplier.
    const finalComputedResult = extractedNumericValue * calculatedMultiplier;

    // Output the final result to the console.
    console.log(finalComputedResult);
};

// --- Execution Block ---
// This part handles reading the input from the system's standard input stream
// and then delegates it to the main processing function.
try {
    const fileSystemModule = require('fs'); // Dynamically load the 'fs' module.
    const standardInputPath = '/dev/stdin'; // Standard path for input on Unix-like systems.
    const encodingFormat = 'utf8'; // Specify the character encoding.

    // Read the entire content of the standard input file synchronously.
    const rawInputContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);

    // Call the main processing function with the obtained input.
    processInputData(rawInputContent);
} catch (error) {
    // Catch any potential errors during file reading or subsequent processing.
    console.error(`An unexpected error occurred during script execution: ${error.message}`);
    // Optionally, log the full stack trace for debugging.
    // console.error(error.stack);
    process.exit(1); // Exit with a non-zero code to indicate an error.
}