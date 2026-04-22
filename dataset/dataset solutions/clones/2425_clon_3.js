// This module serves as the primary entry point for the application.
// It orchestrates the reading of input, parsing, and execution of the core logic.

/**
 * Initiates the solution by reading standard input and delegating to the processing function.
 * This structure separates I/O concerns from the core algorithmic logic.
 */
function initiateProcessingPipeline() {
    // Retrieve the file system module for reading input.
    const fileSystem = require('fs');

    // Read the entire content of the standard input stream as a UTF-8 string.
    // In competitive programming, this usually contains all necessary data.
    const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // Normalize whitespace and split the input into individual lines.
    // This assumes the input format is one value per line.
    const inputLinesArray = rawInputData.trim().split('\n');

    // Parse the first line as an integer, representing the expected string length.
    // Using parseInt with radix 10 ensures correct conversion.
    const lengthSpecifier = parseInt(inputLinesArray[0], 10);

    // The actual string to be evaluated is typically on the second line.
    const candidateString = inputLinesArray[1];

    // Pass the parsed length and string to the dedicated logic function.
    evaluateStringComposition(lengthSpecifier, candidateString);
}

/**
 * Determines if a given string is composed of two identical halves.
 * This function encapsulates the core algorithm.
 *
 * @param {number} designatedLength - The expected length of the string to process.
 * @param {string} inputSequence - The string whose composition is to be checked.
 */
function evaluateStringComposition(designatedLength, inputSequence) {
    // A boolean flag to track whether the string meets the 'double' criteria.
    let isDoubleSegmented = false;

    // --- Robust Input Validation (Type III additions/updates) ---

    // 1. Validate 'designatedLength': Must be a positive integer.
    if (typeof designatedLength !== 'number' || !Number.isInteger(designatedLength) || designatedLength <= 0) {
        console.log('No'); // Invalid length means it cannot be a double string.
        return; // Exit early.
    }

    // 2. Validate 'inputSequence': Must be a non-empty string.
    if (typeof inputSequence !== 'string' || inputSequence.length === 0) {
        console.log('No'); // An empty or non-string input cannot be 'double'.
        return; // Exit early.
    }

    // 3. Consistency check: The actual string length must match the designated length.
    // This ensures data integrity as per common competitive programming problem setups.
    if (inputSequence.length !== designatedLength) {
        console.log('No'); // Mismatch indicates an invalid test case or input.
        return; // Exit early.
    }
    // --- End of Type III validation ---

    // Check if the string has an odd number of characters (Type III rewrite using bitwise operator).
    // A string with an odd length cannot be perfectly divided into two equal halves.
    if ((designatedLength & 1) !== 0) { // Equivalent to designatedLength % 2 !== 0
        console.log('No'); // Output 'No' and terminate if length is odd.
        return; // Early termination.
    }

    // Calculate the precise halfway point index.
    // Since we've already confirmed an even length, this will always be an integer.
    const middlePoint = designatedLength / 2;

    // Extract the initial half of the string.
    // The 'substring' method is used for string slicing (Type III rewrite).
    const firstHalfContent = inputSequence.substring(0, middlePoint);

    // Extract the latter half of the string.
    // When the second argument to 'substring' is omitted, it extracts to the end.
    const secondHalfContent = inputSequence.substring(middlePoint);

    // Perform a strict comparison between the two extracted segments.
    // Strict equality (===) is preferred for type and value comparison.
    if (firstHalfContent === secondHalfContent) {
        isDoubleSegmented = true; // Update the flag if they are identical.
    }

    // Based on the final evaluation flag, output the corresponding result.
    if (isDoubleSegmented) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

// Execute the main processing pipeline to start the program.
initiateProcessingPipeline();