"use strict"; // Enforce strict parsing and error handling rules for the entire script.

/**
 * A dedicated helper function to output the final computed result to the standard console.
 * This abstracts the console interaction, making it easier to change output methods later.
 * @param {number|string} valueToDisplay - The numerical or string value intended for output.
 */
const displayComputedOutput = (valueToDisplay) => {
    console.log(valueToDisplay);
};

/**
 * Core function responsible for processing the input string and calculating the specific sum.
 * This algorithm aims to find the largest sum of digits for any number less than or equal to
 * the input number, with a special rule for single-digit inputs.
 *
 * @param {string} incomingTextualData - The raw input data, typically read from stdin, which may contain multiple lines.
 */
const processNumericStringForMaxDigitSum = (incomingTextualData) => {
    // Stage 1: Initial parsing and extraction of the primary numeric string.
    // We convert the input to a string, remove any leading/trailing whitespace,
    // and then split it into an array of lines. Only the first line is relevant.
    const parsedInputSegments = String(incomingTextualData).trim().split('\n');

    // Define constants for specific values used in the logic.
    const HARDCODED_SINGLE_DIGIT_RESPONSE = 9; // Special output for 1-digit numbers.
    const MIN_LENGTH_FOR_STANDARD_CALCULATION = 2; // Threshold for applying the general formula.
    const DIGIT_VALUE_FOR_MAXIMIZING_SUM = 9; // The value of trailing digits in the maximal sum construction.

    // Retrieve the actual numeric string that needs processing from the first segment.
    // If the input was entirely empty or just whitespace/newlines, this could be an empty string.
    const targetNumericString = parsedInputSegments[0];

    // Determine the length of the target numeric string.
    // This handles cases where `targetNumericString` might be undefined or empty.
    const currentStringLength = targetNumericString ? targetNumericString.length : 0;

    // A mutable variable to store the result of our calculation.
    let finalResultingSum;

    // Stage 2: Apply conditional logic based on the length of the numeric string.
    // This branches for single-digit inputs versus multi-digit inputs.
    if (currentStringLength < MIN_LENGTH_FOR_STANDARD_CALCULATION) {
        // This block handles cases where the string is empty (length 0) or a single character (length 1).

        if (currentStringLength === 1) {
            // If the input is a single digit (e.g., "5"), the problem states a fixed output.
            finalResultingSum = HARDCODED_SINGLE_DIGIT_RESPONSE;
        } else {
            // This handles an empty string input (length 0).
            // The original code would result in NaN for an empty string input.
            // We explicitly replicate this behavior for functional equivalence.
            // Example: parseInt("") - 1 => NaN - 1 => NaN.
            // Then NaN + (0 - 1) * 9 => NaN + (-9) => NaN.
            finalResultingSum = NaN;
        }
    } else {
        // Stage 3: Perform the general calculation for multi-digit numbers.
        // This logic derives the maximum sum of digits for a number less than or equal to the input.

        // Extract the very first character and convert it to its numerical value.
        // Then, subtract one from it. This represents the adjusted leading digit
        // for the number with the maximal digit sum (e.g., for "123", the first digit of "99" is 0 if we consider 099).
        const firstCharacterAsDigit = Number(targetNumericString.charAt(0));
        const adjustedFirstDigitValue = firstCharacterAsDigit - 1;

        // Calculate the number of remaining digits after the first one.
        // These remaining digits will conceptually be '9's to maximize the sum.
        const numberOfTrailingDigits = currentStringLength - 1;

        // Compute the total sum contributed by these '9's.
        const sumContributionFromTrailingNines = numberOfTrailingDigits * DIGIT_VALUE_FOR_MAXIMIZING_SUM;

        // The final sum is the combination of the adjusted first digit and the sum from trailing nines.
        finalResultingSum = adjustedFirstDigitValue + sumContributionFromTrailingNines;
    }

    // Stage 4: Output the calculated result using the dedicated display function.
    displayComputedOutput(finalResultingSum);
};

/**
 * The entry point function that orchestrates the entire application flow.
 * It handles reading input from the environment and passes it to the core processing logic.
 */
const initializeAndExecuteApplication = () => {
    // Utilize the Node.js file system module to synchronously read all data
    // from standard input, interpreting it as UTF-8 encoded text.
    // 'node:fs' is used for explicit module path for clarity and modern Node.js practices.
    const inputContentFromStandardStream = require('node:fs').readFileSync('/dev/stdin', 'utf8');

    // Invoke the main processing function with the collected input data.
    processNumericStringForMaxDigitSum(inputContentFromStandardStream);
};

// Initiate the application's execution sequence.
initializeAndExecuteApplication();