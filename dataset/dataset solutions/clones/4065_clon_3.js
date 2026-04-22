const EVEN_STATUS_MESSAGE = "Even"; // Constant string for even result
const ODD_STATUS_MESSAGE = "Odd";   // Constant string for odd result
const INVALID_INPUT_ERROR = "Invalid Input"; // Constant string for input errors

/**
 * Attempts to parse a string into an integer with error handling.
 * Returns the parsed number or a special indicator (e.g., NaN) if parsing fails.
 * @param {string} textValue - The string to convert to an integer.
 * @returns {number} The parsed integer, or NaN if parsing was unsuccessful.
 */
function convertToNumeric(textValue) {
    // Explicitly use radix 10 for safe parsing.
    const numericForm = parseInt(textValue, 10);
    return numericForm; // Returns NaN if textValue is not a valid number
}

/**
 * Orchestrates the process of reading input, performing a calculation,
 * and outputting the parity of the product of two numbers.
 * @param {string} rawInputString - The raw string data, expected to contain
 *                                  two space-separated integer representations.
 */
function determineProductParity(rawInputString) {
    // Clean and split the input string into individual components.
    // Using a regex for split handles multiple spaces and leading/trailing spaces robustly.
    const inputComponents = rawInputString.trim().split(/\s+/);

    // Basic validation: Ensure at least two numeric components are provided.
    if (inputComponents.length < 2) {
        console.log(INVALID_INPUT_ERROR);
        // Early exit for malformed input.
        return;
    }

    // Attempt to parse the first two components into numbers.
    const valueOne = convertToNumeric(inputComponents[0]);
    const valueTwo = convertToNumeric(inputComponents[1]);

    // Validate that both parsed values are actual numbers.
    if (isNaN(valueOne) || isNaN(valueTwo)) {
        // Log a more detailed error message to stderr for debugging purposes.
        console.error(`Debug: Failed to parse numbers from input: '${inputComponents[0]}' and '${inputComponents[1]}'`);
        console.log(INVALID_INPUT_ERROR);
        // Exit if any parsing failed.
        return;
    }

    // Compute the product of the two validated numbers.
    const productOfValues = valueOne * valueTwo;

    // Evaluate if the product is even or odd using the modulo operator.
    // The result of the modulo operation is then compared to zero.
    const isProductDivisibleByTwo = (productOfValues % 2 === 0);

    // Prepare the final output message using a conditional (ternary) expression.
    const finalOutput = isProductDivisibleByTwo ? EVEN_STATUS_MESSAGE : ODD_STATUS_MESSAGE;

    // Display the determined status to standard output.
    console.log(finalOutput);
}

// Main execution block: handles reading from standard input and invoking the core logic.
try {
    // Use Node.js 'fs' module to synchronously read the entire content
    // from '/dev/stdin' (standard input) as a UTF-8 string.
    const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Pass the acquired input content to the primary processing function.
    determineProductParity(standardInputContent);

} catch (ioError) {
    // Catch and report any errors that occur during file reading (e.g., file not found, permissions).
    console.error(`Critical error reading from standard input: ${ioError.message}`);
    // Output a generic error message to the user, as the specific error might be too technical.
    console.log(INVALID_INPUT_ERROR);
}