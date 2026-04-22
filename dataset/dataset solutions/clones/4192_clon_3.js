/*
 * This script processes a numeric string input,
 * calculates the sum of its digits, and
 * determines if the original number is divisible by this sum.
 * The result is then printed to the standard output stream.
 */

// Define constants for output messages and file operations
const POSITIVE_RESPONSE_MESSAGE = 'Yes';
const NEGATIVE_RESPONSE_MESSAGE = 'No';
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';
const FILE_ENCODING_TYPE = 'utf8';

/**
 * Calculates the sum of all digits within a given numeric string.
 * Non-digit characters are treated as zero.
 *
 * @param {string} numericString - The input string containing digits.
 * @returns {number} The total sum of the digits.
 * @throws {TypeError} If the input is not a string.
 */
function computeDigitSum(numericString) {
    // Validate input type to ensure it's a string
    if (typeof numericString !== 'string') {
        throw new TypeError('Input for digit sum calculation must be a string.');
    }

    // Convert the string into an array of individual character digits
    const characterDigits = Array.from(numericString);

    // Map each character to its integer value, treating non-numeric as 0
    const integerDigits = characterDigits.map(charItem => {
        const parsedDigitValue = parseInt(charItem, 10);
        // If parsing results in NaN (not a number), substitute with 0
        return isNaN(parsedDigitValue) ? 0 : parsedDigitValue;
    });

    // Sum all the integer digits using a reducer with an initial value of 0
    const aggregatedSum = integerDigits.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

    return aggregatedSum;
}

/**
 * Evaluates if a given numeric string (when parsed as a whole number)
 * is perfectly divisible by the sum of its individual digits.
 *
 * @param {string} rawInputString - The raw string data from input.
 * @returns {string} "Yes" if divisible, "No" otherwise.
 */
function processDivisibilityCheck(rawInputString) {
    // Guard clause for empty, undefined, or non-string input
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error('Error: Received empty, null, or invalid input string for processing.');
        return NEGATIVE_RESPONSE_MESSAGE;
    }

    // Remove leading/trailing whitespace from the input string
    const sanitizedString = rawInputString.trim();

    // Calculate the sum of digits using the helper function
    const totalDigitsValue = computeDigitSum(sanitizedString);

    // Special handling for a sum of zero. This usually happens for input '0' or non-numeric strings.
    if (totalDigitsValue === 0) {
        const originalParsedValue = parseInt(sanitizedString, 10);
        // According to Harshad number definition, 0 is often considered a Harshad number.
        // If the number itself is 0, and its digit sum is 0, it's considered divisible.
        if (originalParsedValue === 0) {
            return POSITIVE_RESPONSE_MESSAGE;
        }
        // If the sum is zero but the number is not (e.g., input was "abc"), it's not divisible.
        return NEGATIVE_RESPONSE_MESSAGE;
    }

    // Convert the entire sanitized string to a whole number
    const numericRepresentation = parseInt(sanitizedString, 10);

    // Guard against cases where the input string cannot be parsed as a valid number
    if (isNaN(numericRepresentation)) {
        console.error('Error: Input string could not be converted into a valid whole number.');
        return NEGATIVE_RESPONSE_MESSAGE;
    }

    // Determine if the whole number is perfectly divisible by its digit sum.
    // Using Number.isInteger for an alternative divisibility check.
    const isDivisibleResult = Number.isInteger(numericRepresentation / totalDigitsValue);

    // Return the appropriate message based on the divisibility outcome
    const finalOutcomeMessage = isDivisibleResult ? POSITIVE_RESPONSE_MESSAGE : NEGATIVE_RESPONSE_MESSAGE;

    return finalOutcomeMessage;
}

/**
 * Orchestrates the script's execution flow: reads input, processes it, and prints output.
 */
function initiateProgramExecution() {
    let acquiredFileContents;
    try {
        // Utilize the 'fs' module to synchronously read data from the standard input file
        acquiredFileContents = require('fs').readFileSync(STANDARD_INPUT_FILE_PATH, FILE_ENCODING_TYPE);
    } catch (fileReadError) {
        // Log an error if file reading fails and terminate the process
        console.error(`An error occurred while attempting to read the input file: ${fileReadError.message}`);
        process.exit(1); // Exit with a non-zero status code indicating an error
    }

    // Pass the acquired content to the main processing function
    const finalProgramResult = processDivisibilityCheck(acquiredFileContents);

    // Output the final result to the standard console information stream
    console.info(finalProgramResult);
}

// Begin the execution of the program
initiateProgramExecution();