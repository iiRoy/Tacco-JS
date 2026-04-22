// This program evaluates if a numeric input received via standard input
// is perfectly divisible by a predefined integer.

/**
 * Utility function to retrieve the raw text data from the standard input stream.
 * This abstracts away the file system operations.
 * @returns {string} The complete content read from the standard input.
 */
function acquireStandardInputText() {
    // Lazily load the Node.js 'fs' (file system) module.
    const fileSystemHandler = require("fs");
    // Define the conventional path for standard input in Unix-like systems.
    const standardInputSourcePath = "/dev/stdin";
    // Specify the character encoding to correctly interpret the input bytes.
    const characterEncodingScheme = "utf8";

    // Synchronously read the entire file content from the specified path.
    // This is a blocking operation suitable for simple scripts.
    return fileSystemHandler.readFileSync(standardInputSourcePath, characterEncodingScheme);
}

/**
 * Preprocesses a raw string by removing all embedded whitespace characters.
 * This ensures that only the significant characters (e.g., digits) remain.
 * @param {string} unprocessedString - The original string potentially containing spaces.
 * @returns {string} The string with all whitespace removed.
 */
function eliminateAllWhitespace(unprocessedString) {
    // A regular expression to match any whitespace character (space, tab, newline, etc.)
    // The 'g' flag ensures all occurrences are replaced, not just the first.
    const whitespaceRemovalPattern = /\s/g;
    // Use String.prototype.replaceAll for a more explicit and modern approach
    // compared to String.prototype.replace with a regex.
    return unprocessedString.replaceAll(whitespaceRemovalPattern, '');
}

/**
 * Determines if a given numeric value is perfectly divisible by a specific integer divisor.
 * This is a core logical component, encapsulated for reusability.
 * @param {number} candidateNumber - The number whose divisibility is being tested.
 * @param {number} testDivisor - The integer value to divide by.
 * @returns {boolean} True if the remainder of the division is zero, false otherwise.
 */
function checkExactDivisibility(candidateNumber, testDivisor) {
    // The modulo operator (%) returns the remainder of a division.
    // If the remainder is 0, the number is perfectly divisible.
    return (candidateNumber % testDivisor === 0);
}

/**
 * The primary execution routine for processing the input and generating the output.
 * This function orchestrates all the steps from input acquisition to result display.
 * @param {string} externalInputPayload - The initial string data received, typically from stdin.
 */
function executeInputAnalysis(externalInputPayload) {
    // Define important constants used throughout this function.
    // Encapsulating these makes the code more readable and maintainable.
    const TARGET_DIVISOR_VALUE = 4;
    const POSITIVE_OUTCOME_TEXT = 'YES';
    const NEGATIVE_OUTCOME_TEXT = 'NO';
    const INVALID_INPUT_ERROR_MESSAGE = "Error: Input could not be converted to a valid integer.";

    // Step 1: Clean the raw input string by removing all whitespace.
    // This prepares the string for numeric conversion.
    const cleanedNumericString = eliminateAllWhitespace(externalInputPayload);

    // Step 2: Attempt to convert the cleaned string into an integer.
    // Using parseInt with radix 10 ensures explicit base-10 integer parsing.
    const convertedIntegerDatum = parseInt(cleanedNumericString, 10);

    // Step 3: Implement a guard clause to handle invalid numeric input.
    // If parseInt fails to produce a valid number, it returns NaN.
    if (isNaN(convertedIntegerDatum)) {
        console.error(INVALID_INPUT_ERROR_MESSAGE); // Use console.error for error messages.
        console.log(NEGATIVE_OUTCOME_TEXT); // Output 'NO' as a default for invalid input.
        return; // Terminate execution for this input as it's unprocessable.
    }

    // Step 4: Perform the core divisibility check using the dedicated helper function.
    const isNumberDivisibleByTarget = checkExactDivisibility(convertedIntegerDatum, TARGET_DIVISOR_VALUE);

    // Step 5: Determine the final message based on the divisibility outcome.
    let finalResultStatement;
    if (isNumberDivisibleByTarget) {
        finalResultStatement = POSITIVE_OUTCOME_TEXT;
    } else {
        finalResultStatement = NEGATIVE_OUTCOME_TEXT;
    }

    // Step 6: Output the computed result to the standard console.
    console.log(finalResultStatement);
}

// Orchestration of the script's execution flow:
// First, obtain the initial raw data from the system's standard input.
const rawDataFromSource = acquireStandardInputText();

// Then, pass this raw data to the main analysis function for processing.
executeInputAnalysis(rawDataFromSource);