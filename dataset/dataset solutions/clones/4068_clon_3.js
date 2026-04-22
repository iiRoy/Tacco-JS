/**
 * Determines and outputs whether the product of two space-separated integers,
 * parsed from an input string, is an even or an odd number.
 * This function handles input parsing, validation, and calculation.
 *
 * @param {string} rawInputData - The raw string input, expected to contain two integers
 *                                separated by a single space. E.g., "5 7".
 */
function determineProductParity(rawInputData) {
    // Trim whitespace and split the input string into individual tokens.
    // This step prepares the string for numeric parsing.
    const inputTokens = rawInputData.trim().split(' ');

    // Implement a guard clause to ensure sufficient input tokens are provided.
    // The original code would proceed with undefined values, leading to NaN.
    if (inputTokens.length < 2) {
        console.error('Input Error: Expected two numeric values, but received insufficient data.');
        return; // Exit early if input is invalid.
    }

    // Parse the first token into an integer, specifying base 10 for safety.
    const firstOperand = Number.parseInt(inputTokens[0], 10);
    // Parse the second token into an integer, also specifying base 10.
    const secondOperand = Number.parseInt(inputTokens[1], 10);

    // Validate that both parsed values are indeed numbers.
    // The original code would silently proceed with NaN if parsing failed.
    if (Number.isNaN(firstOperand) || Number.isNaN(secondOperand)) {
        console.error('Parsing Error: One or both input values could not be converted to valid integers.');
        return; // Exit early if parsing yields non-numeric results.
    }

    // Calculate the product of the two validated integers.
    // Storing this in an intermediate variable enhances readability.
    const computedProduct = firstOperand * secondOperand;

    // Determine if the computed product is even or odd using a bitwise AND operation.
    // An even number always has its least significant bit (LSB) as 0.
    // An odd number always has its LSB as 1.
    const isProductAnEvenNumber = (computedProduct & 1) === 0;

    // Prepare the message based on the parity determination.
    let finalResultMessage;
    if (isProductAnEvenNumber) {
        finalResultMessage = 'Even';
    } else {
        finalResultMessage = 'Odd';
    }

    // Output the final result to the console.
    console.log(finalResultMessage);
}

// Entry point for execution: reads input from standard I/O.
// Encapsulating the I/O operation in a try-catch block for robustness.
try {
    // Use 'node:fs' for explicit module reference.
    // Reads the entire content from /dev/stdin (standard input) as a UTF-8 string.
    const stdInputContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
    // Invoke the main logic with the acquired input.
    determineProductParity(stdInputContent);
} catch (ioError) {
    // Log a more informative error message if reading from stdin fails.
    console.error('Runtime Error: Could not read from standard input. Details:', ioError.message);
    // Exit the process with a non-zero status code to indicate failure.
    process.exit(1);
}