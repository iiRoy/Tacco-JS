/**
 * This module exports a utility function designed to evaluate a specific numerical property:
 * whether an integer is perfectly divisible by the sum of its individual digits.
 * It includes robust handling for various input conditions and edge cases.
 */

/**
 * Computes the aggregate sum of all numeric digits present within a given string.
 * Non-digit characters are gracefully ignored during the summation process.
 *
 * @param {string} sourceString - The string from which digits are to be extracted and summed.
 *                                 Expected to be a representation of a number.
 * @returns {number} The total sum of the digits. Returns 0 if the input is not a string,
 *                   is empty, or contains no valid digits.
 */
function calculateDigitSumFromText(sourceString) {
    // Defensive check: Ensure the input is a valid string before processing.
    // If not a string or if it's empty, a sum of zero is returned as a sensible default.
    if (typeof sourceString !== 'string' || sourceString.length === 0) {
        return 0;
    }

    // Convert the input string into an array of its constituent characters.
    // This allows for easy iteration over each character using array methods.
    const charArray = Array.from(sourceString);

    // Utilize the `reduce` method to iteratively sum the numeric value of each character.
    // This offers a functional and concise way to accumulate the total.
    const totalAccumulatedSum = charArray.reduce((currentTotal, charElement) => {
        // Attempt to convert the current character into a number.
        // `Number()` is used here for its direct conversion, returning `NaN` for non-numeric chars.
        const numericDigit = Number(charElement);

        // Only add the value to the total if the conversion resulted in a valid number (not NaN).
        // This effectively filters out non-digit characters like spaces, signs, or decimal points.
        if (!isNaN(numericDigit)) {
            return currentTotal + numericDigit;
        }
        // If the character is not a digit, its value does not contribute to the sum.
        return currentTotal;
    }, 0); // The initial value for the accumulator (currentTotal) is set to 0.

    return totalAccumulatedSum;
}

/**
 * Orchestrates the primary logic: it takes a raw input, parses it as a number,
 * calculates the sum of its digits, and then determines if the original number
 * is perfectly divisible by this digit sum. The result ('Yes' or 'No') is logged.
 *
 * Includes several guard clauses and specific handling for edge cases like invalid input
 * or a zero sum of digits.
 *
 * @param {any} rawInputPayload - The initial data provided, anticipated to represent a number.
 */
function checkDivisibilityByDigits(rawInputPayload) {
    // Convert the input payload into its string representation.
    // This step is crucial for extracting individual digits later.
    const textRepresentation = String(rawInputPayload);

    // Parse the raw input into an integer. `parseInt` with radix 10 is used
    // to ensure a base-10 conversion and handle potential leading non-numeric characters.
    const principalNumericValue = parseInt(rawInputPayload, 10);

    // --- Robust Input Validation ---
    // If `parseInt` fails to produce a valid number (e.g., input was "hello"),
    // we log a specific message and terminate the function gracefully.
    if (isNaN(principalNumericValue)) {
        console.log('No - Non-numeric input detected.');
        return;
    }

    // Invoke the helper function to compute the sum of the digits from the string.
    const cumulativeDigitSum = calculateDigitSumFromText(textRepresentation);

    // --- Edge Case Management: Zero Sum of Digits ---
    // A division by zero scenario must be explicitly handled.
    if (cumulativeDigitSum === 0) {
        // Conventionally, 0 is considered divisible by 0.
        // Any non-zero number is not divisible by zero.
        if (principalNumericValue === 0) {
            console.log('Yes'); // 0 is divisible by its digit sum (0).
        } else {
            console.log('No'); // A non-zero number cannot be divided by a zero digit sum.
        }
        return; // Exit after handling the zero-sum case.
    }

    // --- Core Divisibility Check ---
    // Calculate the remainder of the division of the principal number by its digit sum.
    const remainderAfterDivision = principalNumericValue % cumulativeDigitSum;

    // Based on the remainder, output the final determination.
    // A remainder of 0 indicates perfect divisibility.
    if (remainderAfterDivision === 0) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

// --- Program Entry Point and Environment Setup ---
// This block is responsible for reading input from the standard input stream
// and initiating the core logic. It includes error handling for input operations.
try {
    // Read the entire content from /dev/stdin synchronously, decoding it as UTF-8.
    // `.trim()` is added to remove any leading/trailing whitespace, including newlines.
    const stdInputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

    // Execute the main divisibility checking function with the retrieved input.
    checkDivisibilityByDigits(stdInputData);
} catch (ioError) {
    // If any error occurs during file reading (e.g., file not found, permission issues),
    // log the error details and output 'No' as a default failure state.
    console.error("Input processing error:", ioError.message);
    console.log('No - Input acquisition failed.');
}