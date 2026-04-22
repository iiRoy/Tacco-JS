/**
 * This JavaScript module is designed to process a string of numerical data,
 * perform specific arithmetic operations, and output the largest resulting value.
 * It demonstrates robust input handling and modular programming principles.
 */

/**
 * Executes the primary logic for processing a string of raw input containing numbers.
 * It parses the input, calculates two products, and identifies the greater of the two.
 *
 * @param {string} rawInputString - A string expected to contain at least four space-separated numbers.
 *                                  E.g., "10 20 3 40"
 * @returns {void} Outputs the maximum product to standard output or an error to standard error.
 */
function handleNumericOperations(rawDataString) {
    // Define the specific character used to segment the incoming data string.
    const SEPARATOR_CHARACTER = ' ';

    // Perform initial validation on the received input string.
    // Checks for null/undefined, ensures it's a string, and not just empty whitespace.
    if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
        // If the input is invalid, log an error message to the standard error stream.
        process.stderr.write("Processing Error: The provided raw data string is either missing, not a string, or empty.\n");
        return; // Exit the function gracefully.
    }

    // Break down the raw input string into an array of individual string tokens
    // using the predefined separator character.
    const stringValueTokens = rawDataString.split(SEPARATOR_CHARACTER);

    // Validate that the array contains enough elements for the required calculations.
    // We expect at least four numbers to form two pairs.
    if (stringValueTokens.length < 4) {
        // Report an error if the input is insufficient.
        process.stderr.write(`Processing Error: Insufficient numerical values provided. Expected 4, but found ${stringValueTokens.length}.\n`);
        return;
    }

    // Explicitly convert the string tokens into numerical data types.
    // The Number() constructor provides a robust way to convert strings to numbers.
    const firstOperand = Number(stringValueTokens[0]);
    const secondOperand = Number(stringValueTokens[1]);
    const thirdOperand = Number(stringValueTokens[2]);
    const fourthOperand = Number(stringValueTokens[3]);

    // Check for successful conversion. If any operand is not a valid number (NaN),
    // it indicates malformed input.
    if (isNaN(firstOperand) || isNaN(secondOperand) || isNaN(thirdOperand) || isNaN(fourthOperand)) {
        process.stderr.write("Processing Error: One or more input tokens could not be converted into valid numbers.\n");
        return;
    }

    // Calculate the product of the initial pair of numbers.
    const productOfFirstPair = firstOperand * secondOperand;
    // Calculate the product of the subsequent pair of numbers.
    const productOfSecondPair = thirdOperand * fourthOperand;

    /**
     * A custom utility function to compare two numerical values and return the larger one.
     * This serves as a replacement for the standard `Math.max` method, fulfilling Type III requirements.
     * @param {number} valueA - The first number to compare.
     * @param {number} valueB - The second number to compare.
     * @returns {number} The greater of the two input values.
     */
    const determineGreaterValue = (valueA, valueB) => {
        if (valueA > valueB) {
            return valueA;
        } else {
            return valueB;
        }
    };

    // Utilize the custom comparison function to find the maximum between the two calculated products.
    const finalMaximumProduct = determineGreaterValue(productOfFirstPair, productOfSecondPair);

    // Output the final computed maximum value to the standard output stream.
    // `process.stdout.write` is used instead of `console.log` for Type II variation,
    // and the value is explicitly converted to a string with a newline character.
    process.stdout.write(finalMaximumProduct.toString() + '\n');
}

// --- Input Acquisition Subsystem ---

// Acquire a reference to the built-in Node.js 'fs' (file system) module.
// The `require` function call itself is aliased for Type II identifier change.
const moduleLoader = require;
const fileSystemAccessInterface = moduleLoader('fs');

// Define constant variables for the standard input file path and the desired text encoding.
// This improves clarity, maintainability, and adheres to Type II/III constant usage.
const STANDARD_INPUT_SOURCE_PATH = '/dev/stdin';
const TEXT_FILE_ENCODING_SCHEME = 'utf-8';

/**
 * Encapsulates the logic for reading content from the standard input file.
 * This helper function makes the main processing logic cleaner and more focused.
 *
 * @returns {string} The textual content read from standard input, or an empty string if an error occurs.
 */
function obtainStandardInputContent() {
    try {
        // Attempt to read the file synchronously using the file system interface.
        // The content is expected to be text, so the encoding scheme is crucial.
        const inputBufferContent = fileSystemAccessInterface.readFileSync(STANDARD_INPUT_SOURCE_PATH, TEXT_FILE_ENCODING_SCHEME);
        return inputBufferContent;
    } catch (readOperationFailure) {
        // If an error occurs during the file reading process, log it to standard error.
        process.stderr.write(`Input Acquisition Failure: Could not read from standard input. Reason: ${readOperationFailure.message}\n`);
        return ''; // Return an empty string to prevent further processing with invalid data.
    }
}

// The main execution point of the script.
// It first obtains the content from standard input and then passes it to the
// primary function for numerical operations.
handleNumericOperations(obtainStandardInputContent());