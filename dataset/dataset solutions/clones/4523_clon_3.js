// This module provides functionalities for interacting with the file system.
const fileSystemModule = require("fs");

/**
 * Helper function to determine if a given numeric value is perfectly divisible by four.
 * This is a common mathematical check often used for various algorithms.
 * @param {number} valueToTest - The integer value to be checked for divisibility.
 * @returns {boolean} True if the value is divisible by 4, false otherwise.
 */
const checkDivisibilityByFour = (valueToTest) => {
    // A number is divisible by 4 if the number formed by its last two digits is divisible by 4.
    // For any number `N = 100*A + B`, where `B` represents the last two digits,
    // since `100*A` is always divisible by 4, the divisibility of `N` by 4
    // solely depends on the divisibility of `B` by 4.
    return valueToTest % 4 === 0;
};

// Define constants for expected input structure and output messages, enhancing readability.
const EXPECTED_MIN_INPUT_LENGTH = 5; // e.g., "1 2 3" has a length of 5 characters.
const SUCCESS_MESSAGE = 'YES';
const FAILURE_MESSAGE = 'NO';

// Main execution block for processing standard input.
// A try-catch block is used to gracefully handle potential errors during file operations or parsing.
try {
    // Read the entire content from standard input synchronously.
    // The 'utf8' encoding ensures that characters are interpreted correctly.
    const rawInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Clean up the input string by removing any leading or trailing whitespace characters.
    // This makes the parsing more robust against inconsistent input formatting.
    const processedInputString = rawInputBuffer.trim();

    // Perform a basic validation on the length of the processed input string.
    // If the string is too short, it cannot contain the necessary digits at the expected positions.
    if (processedInputString.length < EXPECTED_MIN_INPUT_LENGTH) {
        // Output the failure message and terminate the process.
        console.log(FAILURE_MESSAGE);
        process.exit(0);
    }

    // Extract specific characters from the input string based on their fixed positions.
    // The original logic implies an input format like "D D D", where D is a digit.
    const charAtHundredsPosition = processedInputString.charAt(0);
    const charAtTensPosition = processedInputString.charAt(2);
    const charAtUnitsPosition = processedInputString.charAt(4);

    // Convert the extracted character digits into their numeric equivalents.
    // `Number.parseInt()` with a radix of 10 is explicitly used to ensure correct base conversion.
    const numericHundredsDigit = Number.parseInt(charAtHundredsPosition, 10);
    const numericTensDigit = Number.parseInt(charAtTensPosition, 10);
    const numericUnitsDigit = Number.parseInt(charAtUnitsPosition, 10);

    // Validate if the parsed values are indeed numbers.
    // If any character was not a valid digit, `parseInt` would return `NaN` (Not a Number).
    if (isNaN(numericHundredsDigit) || isNaN(numericTensDigit) || isNaN(numericUnitsDigit)) {
        // If any digit is invalid, the input cannot form a meaningful number for calculation.
        console.log(FAILURE_MESSAGE);
        process.exit(0);
    }

    // Construct the number formed by the last two digits (tens and units).
    // This is the only part of the number relevant for checking divisibility by 4,
    // due to the mathematical property that 100 (and thus any multiple of 100) is divisible by 4.
    const numberFromLastTwoDigits = (numericTensDigit * 10) + numericUnitsDigit;

    // Determine the final outcome by calling the helper function with the relevant part of the number.
    const isResultDivisible = checkDivisibilityByFour(numberFromLastTwoDigits);

    // Output the appropriate message to the console based on the divisibility check.
    if (isResultDivisible) {
        console.log(SUCCESS_MESSAGE);
    } else {
        console.log(FAILURE_MESSAGE);
    }

} catch (errorDuringExecution) {
    // Catch any unexpected errors that might occur during the program's execution,
    // such as issues with reading from `/dev/stdin`.
    console.error(`An error occurred during program execution: ${errorDuringExecution.message}`);
    // In case of an error, default to the failure message to indicate the problem.
    console.log(FAILURE_MESSAGE);
    // Exit with a non-zero status code to indicate that the program terminated with an error.
    process.exit(1);
}