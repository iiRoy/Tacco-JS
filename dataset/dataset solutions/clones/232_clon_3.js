// This script reads numerical data from standard input, processes each number,
// and outputs a derived sequence value. It includes error handling and
// clear separation of concerns for robust operation.

// Utilize the Node.js file system module for synchronous input reading.
const fileSystemModule = require('fs');

// --- Input Data Acquisition ---

let incomingFileContents = ''; // Storage for the raw text read from the input source.
const standardInputPath = '/dev/stdin'; // Standard POSIX path for input stream.

try {
    // Attempt to read the entire content from the standard input.
    // 'utf8' encoding ensures the data is correctly interpreted as a string.
    incomingFileContents = fileSystemModule.readFileSync(standardInputPath, 'utf8');
} catch (readError) {
    // If an error occurs during file reading (e.g., file not found, permissions),
    // log the error details and terminate the process gracefully.
    console.error(`FATAL ERROR: Could not retrieve data from '${standardInputPath}'. Details: ${readError.message}`);
    process.exit(1); // Exit with a non-zero code to signify an error state.
}

// --- Data Preparation and Transformation ---

// Clean up the raw input: remove any leading/trailing whitespace
// and then split the content into individual lines.
// An empty string for a line will be skipped later.
const processedInputLines = incomingFileContents.trim().split('\n');

/**
 * Calculates a specific sequence value based on a given positive integer.
 * The formula is (N * (N + 1) / 2) + 1, where N is the input 'baseNumber'.
 * This is equivalent to the (N-th triangular number + 1).
 *
 * @param {number} baseNumber - The positive integer for which to compute the value.
 * @returns {number} The calculated sequence value.
 * @throws {Error} If the input 'baseNumber' is not a valid non-negative number.
 */
const deriveSequenceValue = (baseNumber) => {
    // Comprehensive validation for the input parameter.
    if (typeof baseNumber !== 'number' || isNaN(baseNumber) || baseNumber < 0) {
        throw new Error(`Invalid or negative base number provided: ${baseNumber}. Expected a non-negative number.`);
    }

    // The core calculation: First, compute the triangular number T_N = N * (N + 1) / 2.
    // This is structurally equivalent to the original's (n * (n-1) / 2) where n = baseNumber + 1.
    const triangularComponent = (baseNumber * (baseNumber + 1)) / 2;

    // Then, add one to the triangular component as per the problem's specification.
    const finalComputedResult = triangularComponent + 1;
    return finalComputedResult;
};

// --- Iterative Processing and Output ---

// Iterate over each line that was parsed from the input.
processedInputLines.forEach((currentLineContent, lineIndex) => {
    // Skip any lines that are empty or consist only of whitespace.
    if (currentLineContent.trim() === '') {
        // A silent skip is often preferred for empty lines unless debugging.
        // console.debug(`Skipping empty line at internal index ${lineIndex}.`);
        return; // Move to the next line in the array.
    }

    // Attempt to convert the string content of the line into an integer.
    // Using parseInt with radix 10 is crucial for reliable number parsing.
    const numericalBase = parseInt(currentLineContent, 10);

    // Validate if the parsing was successful and resulted in a valid number.
    if (isNaN(numericalBase)) {
        console.warn(`WARNING: Input on line ${lineIndex + 1} ('${currentLineContent}') is not a valid number and will be skipped.`);
        return; // Proceed to the next line if parsing failed.
    }

    // Further validation: ensure the number is non-negative, as is typical for this type of sequence.
    if (numericalBase < 0) {
        console.warn(`WARNING: Negative input value detected on line ${lineIndex + 1} ('${currentLineContent}'). Only non-negative inputs are typically processed.`);
        return; // Skip negative numbers.
    }

    let derivedOutputValue;
    try {
        // Execute the core calculation using the helper function.
        derivedOutputValue = deriveSequenceValue(numericalBase);
        // Print the final result to standard output.
        console.log(derivedOutputValue);
    } catch (calculationError) {
        // Catch and report any errors that might occur during the calculation itself.
        console.error(`ERROR: Calculation failed for line ${lineIndex + 1} ('${currentLineContent}'). Reason: ${calculationError.message}`);
    }
});

// Script execution concludes here.