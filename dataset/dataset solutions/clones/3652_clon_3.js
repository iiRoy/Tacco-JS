/**
 * This module is designed to process a single line of input containing
 * three space-separated numeric values. Its primary function is to
 * calculate and display the difference between the maximum and minimum
 * of these three numbers.
 */

/**
 * Processes a raw string input, attempting to parse it into an array of
 * exactly three valid numeric values. It includes robust checks for input
 * type, length, and numerical validity of each component.
 *
 * @param {string} inputSourceString The initial string obtained from an external source,
 *                                   expected to contain space-separated numbers.
 * @returns {Array<number>|null} An array containing three numbers if parsing is
 *                                successful, otherwise returns `null` to indicate a failure.
 */
function parseNumericString(inputSourceString) {
    // Validate that the provided input is indeed a string and is not empty
    if (typeof inputSourceString !== 'string' || inputSourceString.trim().length === 0) {
        return null; // Input is not a valid string or is entirely whitespace
    }

    // Standardize whitespace: trim outer spaces and split by one or more internal spaces.
    const stringComponents = inputSourceString.trim().split(/\s+/);

    // Ensure that exactly three components were found after splitting.
    // This is crucial for the problem's specific requirement of three numbers.
    if (stringComponents.length !== 3) {
        return null; // Incorrect number of values found
    }

    const collectedNumbers = []; // Initialize an array to store the parsed numbers

    // Iterate through each string component to convert it into a number
    for (let currentStringPart of stringComponents) {
        const numericalRepresentation = Number(currentStringPart);

        // Check if the conversion resulted in a valid finite number.
        // `isNaN` catches non-numeric strings, and `isFinite` excludes Infinity/-Infinity.
        if (isNaN(numericalRepresentation) || !Number.isFinite(numericalRepresentation)) {
            return null; // Encountered a non-numeric or invalid value
        }
        collectedNumbers.push(numericalRepresentation);
    }

    return collectedNumbers; // Return the array of successfully parsed numbers
}

/**
 * Determines the range (the difference between the highest and lowest values)
 * within a given array of numbers.
 *
 * @param {Array<number>} numberSet A collection of numeric values.
 * @returns {number|null} The calculated difference (max - min) if the input array
 *                        is valid and non-empty, otherwise `null`.
 */
function calculateRange(numberSet) {
    // Validate the input: it must be an array and contain at least one element.
    if (!Array.isArray(numberSet) || numberSet.length === 0) {
        return null; // Invalid or empty array provided
    }

    // Utilize built-in Math functions to efficiently find the maximum and minimum values.
    // The spread operator (...) unpacks the array elements as arguments.
    const maximumValue = Math.max(...numberSet);
    const minimumValue = Math.min(...numberSet);

    // Compute the absolute difference, which represents the range.
    const calculatedDifference = maximumValue - minimumValue;

    return calculatedDifference;
}

/**
 * This is the primary function responsible for orchestrating the input processing
 * and result computation. It takes raw input, sanitizes it, parses it, and then
 * calculates the required numerical range, finally displaying the outcome.
 *
 * @param {string} rawInputContent The raw string content obtained from the input stream.
 */
function processInputData(rawInputContent) {
    // Ensure the input is treated as a string and remove any leading/trailing whitespace.
    // An empty string is used as a fallback if `rawInputContent` is null or undefined.
    const cleanedInputString = String(rawInputContent || '').trim();

    // If the input becomes empty after cleaning, there's nothing to process.
    if (cleanedInputString.length === 0) {
        return; // Exit early if no meaningful input remains
    }

    // Attempt to parse the cleaned string into an array of numbers using the helper function.
    const parsedNumericalCollection = parseNumericString(cleanedInputString);

    // Verify that the parsing was successful and yielded exactly three numbers as expected.
    if (!parsedNumericalCollection || parsedNumericalCollection.length !== 3) {
        return; // Stop execution if parsing failed or the count of numbers is incorrect
    }

    // Proceed to calculate the range (max - min) using the dedicated range function.
    const finalResultRange = calculateRange(parsedNumericalCollection);

    // If a valid range was computed, display it to the console.
    // The `calculateRange` function should prevent `null` unless there's an internal logic error.
    if (finalResultRange !== null) {
        console.log(finalResultRange);
    }
}

// --- Program Execution Start ---
// This block handles reading input from the standard input stream
// and initiating the main data processing routine.
try {
    // Dynamically load the 'fs' (file system) module, common in Node.js environments.
    // Read the entire content of '/dev/stdin' (standard input) as a string,
    // assuming UTF-8 encoding for text data.
    const inputBufferFromSystem = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Pass the acquired system input content to the main processing function.
    processInputData(inputBufferFromSystem);
} catch (runtimeError) {
    // In a production environment, errors might be logged or handled more gracefully.
    // For competitive programming, this block is often omitted or simplified.
    // console.error("An unhandled error occurred during input reading or processing:", runtimeError.message);
}