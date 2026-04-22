// This module defines a core function to process an array of input lines
// and determine the maximum outcome from a set of basic arithmetic operations
// on the first two numerical values found.

/**
 * Processes an array of string lines, extracting two numbers from the first line,
 * and then computes the maximum value among their sum, difference, and product.
 * Results are printed to the console.
 *
 * @param {string[]} inputLinesArray An array where the first element is expected
 *                                   to be a string containing two space-separated integers.
 * @returns {void} This function prints its result directly and does not return a value.
 */
function calculateMaxOperationResult(inputLinesArray) {
    // Guard clause: Ensure that input data is provided and is not empty.
    if (!Array.isArray(inputLinesArray) || inputLinesArray.length === 0) {
        console.error("Processing halted: No valid input lines were supplied.");
        return;
    }

    // Access the very first line of the input array, where our operands reside.
    const primaryInputString = inputLinesArray[0];

    // Split this string by whitespace to get individual string tokens.
    // This assumes the numbers are separated by at least one space.
    const inputTokens = primaryInputString.trim().split(/\s+/);

    // Validate that we have at least two numerical tokens to work with.
    if (inputTokens.length < 2) {
        console.error("Processing halted: Insufficient numerical tokens found on the first line. Expected at least two.");
        return;
    }

    // Convert the extracted string tokens into integer numbers.
    // Using parseInt with radix 10 for explicit base conversion.
    const firstNumber = Number.parseInt(inputTokens[0], 10);
    const secondNumber = Number.parseInt(inputTokens[1], 10);

    // Perform a check to ensure that both parsed values are indeed valid numbers.
    if (Number.isNaN(firstNumber) || Number.isNaN(secondNumber)) {
        console.error("Processing halted: One or both of the provided inputs are not valid integers.");
        return;
    }

    // Calculate the three required arithmetic outcomes.
    const additionResult = firstNumber + secondNumber;
    const subtractionResult = firstNumber - secondNumber;
    const multiplicationResult = firstNumber * secondNumber;

    // Determine the single largest value from these three results.
    // Using the spread operator with Math.max for a cleaner comparison of multiple values.
    const finalMaximum = Math.max(...[additionResult, subtractionResult, multiplicationResult]);

    // Output the final determined maximum value to the standard output.
    console.log(finalMaximum);
}

// --- Program Execution Entry Point ---
// This section handles reading the raw data from the system's standard input
// and then delegates it to the core processing function.
try {
    // Utilize Node.js 'fs' module to synchronously read all data from '/dev/stdin'.
    // The data is decoded as UTF-8, trimmed for leading/trailing whitespace,
    // and then split into an array of lines based on newline characters.
    const rawDataBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
    const cleanInputLines = rawDataBuffer.trim().split('\n');

    // Initiate the primary calculation logic with the prepared input.
    calculateMaxOperationResult(cleanInputLines);
} catch (executionError) {
    // Catch and report any exceptions that occur during file I/O or initial processing.
    console.error("An unrecoverable error occurred during program execution:", executionError.message);
    // Optionally, exit with a non-zero status to indicate failure.
    // process.exit(1);
}