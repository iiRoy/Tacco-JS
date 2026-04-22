// This module facilitates the evaluation of numerical parity for a product of two integers.

/**
 * Configurable constants for the application, ensuring consistency and easy modification.
 * Using Object.freeze to make these constants immutable.
 */
const ApplicationSettings = Object.freeze({
    INPUT_VALUE_SEPARATOR: /\s+/, // Regular expression to split input by one or more whitespace characters.
    NUMERIC_BASE_RADIX: 10,       // The base (radix) for integer parsing, typically 10 for decimal numbers.
    OUTPUT_LABEL_EVEN: 'Even',    // String label for an even result.
    OUTPUT_LABEL_ODD: 'Odd',      // String label for an odd result.
    STANDARD_INPUT_PATH: '/dev/stdin' // Default path for reading standard input.
});

/**
 * Utility function to safely parse a string into an integer.
 * It handles potential NaN results by returning NaN, which can then be checked.
 *
 * @param {string} stringRepresentation The string to be converted to an integer.
 * @returns {number} The parsed integer value, or NaN if parsing fails.
 */
function obtainIntegerFromString(stringRepresentation) {
    // Attempt to parse the string using the predefined radix.
    const parsedValue = parseInt(stringRepresentation, ApplicationSettings.NUMERIC_BASE_RADIX);
    // Return the parsed value, allowing NaN to propagate for error handling.
    return parsedValue;
}

/**
 * Determines if a given numeric value is an even number.
 * This function uses a bitwise AND operation for efficiency in parity checking.
 *
 * @param {number} numericInput The number to check for evenness.
 * @returns {boolean} True if the number is even, false otherwise.
 */
function checkParityForEvenness(numericInput) {
    // A number is even if its least significant bit is 0.
    // (number & 1) will be 0 for even numbers and 1 for odd numbers.
    return (numericInput & 1) === 0;
}

/**
 * The primary function responsible for processing raw input data.
 * It tokenizes the input, parses numeric values, calculates their product,
 * and determines if the product is even or odd, printing the result to console.
 *
 * @param {string} rawStringData The unprocessed string data, expected to contain two space-separated numbers.
 * @returns {void} This function does not return a value; it prints directly to standard output or error.
 */
function processNumericalProductParity(rawStringData) {
    // Early exit for invalid or empty input to prevent further processing errors.
    if (typeof rawStringData !== 'string' || rawStringData.trim().length === 0) {
        console.error('Input error: Provided data is not a valid non-empty string.');
        return;
    }

    // Split the raw input string into an array of tokens based on the defined separator.
    const dataTokens = rawStringData.trim().split(ApplicationSettings.INPUT_VALUE_SEPARATOR);

    // Ensure that at least two numeric tokens are available for calculation.
    if (dataTokens.length < 2) {
        console.error('Input error: Insufficient numeric values. Two numbers are required.');
        return;
    }

    // Parse the first two tokens into integers.
    const firstNumericalComponent = obtainIntegerFromString(dataTokens[0]);
    const secondNumericalComponent = obtainIntegerFromString(dataTokens[1]);

    // Validate that both parsed components are indeed numbers.
    if (isNaN(firstNumericalComponent) || isNaN(secondNumericalComponent)) {
        console.error('Input error: Failed to parse one or both input tokens into valid integers.');
        return;
    }

    // Compute the product of the two valid numerical components.
    const productOfComponents = firstNumericalComponent * secondNumericalComponent;

    // Determine if the calculated product is an even number.
    const isProductValueEven = checkParityForEvenness(productOfComponents);

    // Select the appropriate output label based on the parity check.
    const finalParityLabel = isProductValueEven
        ? ApplicationSettings.OUTPUT_LABEL_EVEN
        : ApplicationSettings.OUTPUT_LABEL_ODD;

    // Print the final result to the console.
    console.log(finalParityLabel);
}

// --- Application Entry Point ---
// This block handles reading input from the file system and invoking the main processing logic.
try {
    // Dynamically import the 'fs' (file system) module required for file operations.
    const fileSystemModule = require('fs');

    // Read the content from the standard input path, ensuring UTF-8 encoding.
    // This operation is synchronous to simplify the example.
    const standardInputContent = fileSystemModule.readFileSync(ApplicationSettings.STANDARD_INPUT_PATH, 'utf8');

    // Pass the acquired content to the main processing function.
    processNumericalProductParity(standardInputContent);
} catch (executionError) {
    // Catch and report any errors that occur during the file reading or subsequent processing.
    console.error(`Runtime error encountered: ${executionError.message}`);
    // In a production environment, one might also log the stack trace: console.error(executionError.stack);
    // Optionally, exit the process with a non-zero status code to indicate failure.
    // process.exit(1);
}