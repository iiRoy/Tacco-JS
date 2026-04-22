'use strict'; // Enforce strict JavaScript parsing and execution rules

// Define a constant for the standard input file path, enhancing readability.
const STANDARD_INPUT_FILE_LOCATION = '/dev/stdin';

/**
 * This function processes a given raw string input to derive two numerical parameters,
 * and subsequently generates a sequence of integers based on these parameters.
 * The sequence is centered around one value and extends a certain 'span' in both directions.
 *
 * @param {string} rawDataStream - The initial string data, expected to contain two space-separated integers.
 */
function generateCenteredIntegerSequence(rawDataStream) {
    // First, preprocess the input string:
    // 1. Remove any leading or trailing whitespace.
    // 2. Split the string into an array of substrings using space as a delimiter.
    // 3. Convert each substring (token) into an integer using Number.parseInt with a radix of 10.
    const numericalParameters = rawDataStream
        .trim()
        .split(' ')
        .map(currentStringToken => Number.parseInt(currentStringToken, 10));

    // --- Start of Type III: Guard Clauses and Input Validation ---
    // Ensure that exactly two numerical parameters were provided.
    if (numericalParameters.length !== 2) {
        console.error('Input Error: Expected exactly two numerical values separated by a space.');
        return; // Terminate execution gracefully if input format is incorrect.
    }
    // Verify that both parsed parameters are indeed valid numbers (not NaN).
    if (numericalParameters.some(val => isNaN(val))) {
        console.error('Input Error: Both provided values must be valid integers.');
        return; // Terminate if any value is not a number.
    }
    // --- End of Type III: Guard Clauses ---

    // Assign the parsed numerical values to descriptive constant variables.
    // 'k' from the original problem is now 'sequenceSpanMagnitude'.
    const sequenceSpanMagnitude = numericalParameters[0];
    // 'x' from the original problem is now 'centralAnchorPoint'.
    const centralAnchorPoint = numericalParameters[1];

    // --- Type III: Deletion of redundant logic ---
    // The original `if (k === 1)` block has been removed.
    // The generalized sequence generation logic correctly handles the case where `sequenceSpanMagnitude` is 1,
    // making the explicit check unnecessary and simplifying the code structure.

    // Calculate the effective range adjustment for sequence generation.
    // This is equivalent to `k - 1` from the original problem's logic.
    const rangeAdjustment = sequenceSpanMagnitude - 1;

    // Determine the inclusive lower and upper bounds of the number sequence.
    // The sequence starts at `x - (k - 1)` and ends at `x + (k - 1)`.
    const inclusiveLowerBound = centralAnchorPoint - rangeAdjustment;
    const inclusiveUpperBound = centralAnchorPoint + rangeAdjustment;

    // Calculate the total number of elements that will be in the sequence.
    // This is `(upper bound - lower bound) + 1`.
    const totalElementsCount = inclusiveUpperBound - inclusiveLowerBound + 1;

    // --- Type III: Structural Rewrite using Array.from instead of a traditional for-loop ---
    // Generate the array of numbers. Array.from is used to create a new array
    // with a specified length, mapping each index to its corresponding value in the sequence.
    const resultantNumericalSequence = Array.from({ length: totalElementsCount }, (unused, index) => {
        // Each element is calculated by adding the current index to the lower bound.
        return inclusiveLowerBound + index;
    });

    // Output the generated sequence to the console.
    // The array elements are joined together with a single space as a separator.
    console.log(resultantNumericalSequence.join(' '));
}

// --- Type III: Encapsulation of I/O operations and error handling ---
try {
    // Read the entire content of the standard input file synchronously.
    // Specify 'utf8' encoding to correctly interpret the characters.
    const fileContents = require('fs').readFileSync(STANDARD_INPUT_FILE_LOCATION, 'utf8');

    // Call the main processing function with the content read from the file.
    generateCenteredIntegerSequence(fileContents);
} catch (fileReadError) {
    // If an error occurs during file reading (e.g., file not found, permission denied),
    // log an informative error message to the console.
    console.error(`An error occurred while attempting to read from ${STANDARD_INPUT_FILE_LOCATION}:`, fileReadError.message);
    // Exit the process with a non-zero status code to indicate an error.
    process.exit(1);
}