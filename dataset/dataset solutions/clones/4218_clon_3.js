"use strict";

/**
 * Computes the N-th Lucas number using an iterative, space-optimized approach.
 * The Lucas sequence is defined as L(0)=2, L(1)=1, and L(n)=L(n-1)+L(n-2) for n>1.
 *
 * @param {number} targetPosition - The non-negative integer index of the desired Lucas number.
 * @returns {number} The Lucas number at the specified index.
 *                   If the input is invalid (not a number, not an integer, or negative),
 *                   it returns 1, mimicking the original script's behavior for NaN input.
 */
function retrieveLucasValue(targetPosition) {
    // Input validation: Check if the provided index is a valid non-negative integer.
    // If not, return 1 to replicate the behavior of the original `lucasMaster(NaN)` call.
    if (typeof targetPosition !== 'number' || !Number.isInteger(targetPosition) || targetPosition < 0) {
        return 1; // Mimics L(1) as a fallback for invalid input, consistent with original's NaN handling.
    }

    // Handle the explicit base cases for the Lucas sequence.
    if (targetPosition === 0) {
        return 2; // L(0) is defined as 2.
    }
    if (targetPosition === 1) {
        return 1; // L(1) is defined as 1.
    }

    // For indices greater than 1, calculate iteratively without storing the full sequence.
    // Initialize with the first two Lucas numbers needed for the recurrence relation.
    let priorTerm = 2; // Corresponds to L(k-2) in the current iteration.
    let currentSequenceTerm = 1;  // Corresponds to L(k-1) in the current iteration.
    let calculatedNextTerm; // Variable to hold the newly computed Lucas number L(k).

    // Loop from the second index up to the desired target position.
    for (let currentIterationIndex = 2; currentIterationIndex <= targetPosition; currentIterationIndex++) {
        // Calculate the next term using the sum of the two preceding terms.
        calculatedNextTerm = priorTerm + currentSequenceTerm;
        // Shift terms: the current term becomes the prior term for the next iteration.
        priorTerm = currentSequenceTerm;
        // The newly calculated term becomes the current term for the next iteration.
        currentSequenceTerm = calculatedNextTerm;
    }

    // After the loop completes, 'currentSequenceTerm' holds the Lucas number for 'targetPosition'.
    return currentSequenceTerm;
}

/**
 * Main entry point for processing input and executing the Lucas number calculation.
 * Reads input from stdin, parses the first line as the target index,
 * calculates the corresponding Lucas number, and prints it to stdout.
 *
 * @param {string} rawInputContent - The raw string content read from standard input.
 */
const handleInputExecution = (rawInputContent) => {
    // Trim whitespace from the input to ensure clean processing.
    const sanitizedInput = rawInputContent.trim();

    // Extract the very first line from the input string, as per problem specification.
    const firstLineData = sanitizedInput.split('\n')[0];

    // Attempt to convert the extracted string data into an integer.
    // Using parseInt with radix 10 for explicit base conversion.
    const numericIndex = parseInt(firstLineData, 10);

    // Call the Lucas sequence calculation function. This function is designed
    // to handle potentially invalid numericIndex values (like NaN or negative)
    // gracefully, returning 1 in such scenarios to match original script's behavior.
    const finalLucasValue = retrieveLucasValue(numericIndex);

    // Output the computed Lucas number to the standard output stream.
    console.log(finalLucasValue);
};

// --- Input Reading and Program Initiation ---
// Import the Node.js file system utility module.
const fileSystemUtility = require('fs');
// Define the standard input file path for reading.
const standardInputPath = '/dev/stdin';
// Specify the character encoding for reading the input file.
const inputEncoding = 'utf8';

// Read the content from standard input synchronously and pass it to the main execution handler.
handleInputExecution(fileSystemUtility.readFileSync(standardInputPath, inputEncoding));