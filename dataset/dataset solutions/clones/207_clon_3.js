// This script processes numerical strings obtained from standard input.
// For each valid numeric string encountered, it calculates the difference
// between the largest possible number and the smallest possible number
// that can be formed using the original string's digits.

// Import the Node.js file system module for reading input.
const FILE_SYSTEM_MODULE = require('fs');

// Define constants for configuration, making the code more readable and maintainable.
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';
const INPUT_CHARACTER_ENCODING = 'utf8';
// Regular expression to split input by one or more whitespace characters.
const WHITESPACE_SEPARATOR_PATTERN = /\s+/;

/**
 * Compares two digits for descending order sorting.
 * Used to arrange digits from largest to smallest.
 * @param {string} digitA - The first digit character.
 * @param {string} digitB - The second digit character.
 * @returns {number} A negative value if digitA should come before digitB,
 *                   a positive value if digitB should come before digitA,
 *                   or zero if they are equal.
 */
const compareDigitsForDescendingSort = (digitA, digitB) => parseInt(digitB, 10) - parseInt(digitA, 10);

/**
 * Compares two digits for ascending order sorting.
 * Used to arrange digits from smallest to largest.
 * @param {string} digitA - The first digit character.
 * @param {string} digitB - The second digit character.
 * @returns {number} A negative value if digitA should come before digitB,
 *                   a positive value if digitB should come before digitA,
 *                   or zero if they are equal.
 */
const compareDigitsForAscendingSort = (digitA, digitB) => parseInt(digitA, 10) - parseInt(digitB, 10);

/**
 * Processes a single string of digits to find the difference between
 * the largest and smallest numbers formable from its digits.
 * @param {string} numericToken - The input string containing digits.
 * @returns {number|null} The calculated difference, or null if the input is invalid.
 */
function computeDigitPermutationDifference(numericToken) {
    // --- Input Validation (Guard Clause) ---
    // Ensure the input is a non-empty string consisting only of digits.
    if (typeof numericToken !== 'string' || numericToken.length === 0 || !/^\d+$/.test(numericToken)) {
        console.warn(`Warning: Skipping invalid or non-numeric input token: '${numericToken}'`);
        return null; // Return null to indicate failure or invalid input.
    }

    // Convert the numeric string into an array of individual digit characters.
    // Using `Array.from` is an alternative to `split('')`.
    const digitCharacterSequence = Array.from(numericToken);

    // --- Form the largest possible number from the digits ---
    // Create a mutable copy of the digit sequence for sorting.
    const digitsForMaximumValue = [...digitCharacterSequence];
    // Sort these digits in descending order to construct the largest number.
    digitsForMaximumValue.sort(compareDigitsForDescendingSort);
    // Join the sorted digits back into a string, then convert to a number.
    const largestNumberString = digitsForMaximumValue.join('');
    const maximumNumericValue = Number(largestNumberString);

    // --- Form the smallest possible number from the digits ---
    // Create another mutable copy for the ascending sort.
    const digitsForMinimumValue = [...digitCharacterSequence];
    // Sort these digits in ascending order to construct the smallest number.
    digitsForMinimumValue.sort(compareDigitsForAscendingSort);
    // Join the sorted digits back into a string, then convert to a number.
    // Note: The original code implicitly handles leading zeros by converting "012" to 12.
    // This implementation follows that behavior.
    const smallestNumberString = digitsForMinimumValue.join('');
    const minimumNumericValue = Number(smallestNumberString);

    // Calculate the final difference.
    const resultantDifference = maximumNumericValue - minimumNumericValue;

    return resultantDifference;
}

// --- Main Execution Block ---
try {
    // Read the entire content from the standard input file synchronously.
    const rawInputContentBuffer = FILE_SYSTEM_MODULE.readFileSync(STANDARD_INPUT_FILE_PATH, INPUT_CHARACTER_ENCODING);

    // Split the raw input content into an array of string segments using the whitespace pattern.
    // Filter out any empty strings that might result from multiple consecutive delimiters.
    const inputStringSegments = rawInputContentBuffer
        .split(WHITESPACE_SEPARATOR_PATTERN)
        .filter(segment => segment.length > 0);

    // Initialize an iterator for processing the input segments.
    // The original code starts processing from the second segment (index 1),
    // so we replicate this behavior.
    let segmentProcessingIndex = 1;

    // Iterate through the input segments.
    while (segmentProcessingIndex < inputStringSegments.length) {
        const currentInputSegment = inputStringSegments[segmentProcessingIndex];

        // Process the current segment to get the desired difference.
        const calculatedDifference = computeDigitPermutationDifference(currentInputSegment);

        // If the calculation was successful (i.e., not null), print the result.
        if (calculatedDifference !== null) {
            console.log(calculatedDifference);
        }

        // Advance to the next segment.
        segmentProcessingIndex++;
    }

} catch (inputReadError) {
    // Catch and report any errors that occur during file reading.
    console.error(`Error encountered during standard input processing: ${inputReadError.message}`);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}