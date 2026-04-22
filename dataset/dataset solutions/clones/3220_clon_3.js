const mathUtils = {
    // Encapsulates the division operation, including a safety check for the denominator.
    performSafeDivision: (numeratorValue, denominatorValue) => {
        // If the denominator is zero, return a special numeric value indicating an invalid operation.
        // NaN (Not a Number) is a common choice for undefined or unrepresentable numeric results.
        if (denominatorValue === 0) {
            return NaN;
        }
        // Otherwise, proceed with the standard division.
        return numeratorValue / denominatorValue;
    }
};

/**
 * Orchestrates the parsing of raw input, validation of numeric components,
 * and computation of their ratio, finally displaying the outcome.
 *
 * @param {string} rawInputContent The complete string read from the input source,
 *                                 expected to contain two space-separated numbers.
 */
function processAndOutputRatio(rawInputContent) {
    // Define the expected delimiter for splitting the input string.
    const inputDelimiter = ' ';

    // Split the raw input string into an array of string fragments.
    // The `filter(Boolean)` ensures that any potential empty strings resulting from
    // multiple consecutive delimiters are removed, making the array cleaner.
    const inputStringComponents = rawInputContent.split(inputDelimiter).filter(Boolean);

    // --- Input Validation: Component Count ---
    // Ensure that at least two distinct components were successfully parsed from the input.
    if (inputStringComponents.length < 2) {
        console.error("Data processing error: Insufficient numeric components found in the input. Expected at least two.");
        return; // Abort further processing for this invalid input.
    }

    // --- Data Conversion: String to Number ---
    // Convert the first two string components into floating-point numbers.
    // `parseFloat` is used to handle potential decimal values gracefully.
    const numericDividend = parseFloat(inputStringComponents[0]);
    const numericDivisor = parseFloat(inputStringComponents[1]);

    // --- Input Validation: Numeric Validity ---
    // Check if both converted values are indeed valid numbers. `isNaN` returns true for non-numeric values.
    if (isNaN(numericDividend) || isNaN(numericDivisor)) {
        console.error("Data processing error: One or both input components could not be converted to valid numbers.");
        return; // Abort processing due to invalid numeric data.
    }

    // --- Core Computation ---
    // Utilize the `mathUtils` helper to perform the division, leveraging its built-in safety checks.
    const calculationResult = mathUtils.performSafeDivision(numericDividend, numericDivisor);

    // --- Result Validation: Division by Zero Check ---
    // Re-check for a division-by-zero scenario if the result is NaN, as `performSafeDivision` returns NaN for it.
    if (isNaN(calculationResult) && numericDivisor === 0) {
        console.error("Arithmetic error: Attempted to perform division by zero, which is an undefined operation.");
        return; // Abort due to arithmetic impossibility.
    }

    // --- Output ---
    // Display the final computed result to the standard output.
    console.log(calculationResult);
}

// --- Application Entry Point ---

// Define the path for standard input, typically `/dev/stdin` on Unix-like systems.
const standardInputFilePath = '/dev/stdin';
// Cache the file system module for repeated use within this block.
const fileSystemInterface = require('fs');

try {
    // Synchronously read the entire content of the standard input file.
    // Specify 'utf8' encoding to correctly interpret text data.
    const receivedInputText = fileSystemInterface.readFileSync(standardInputFilePath, 'utf8');

    // Initiate the primary data processing flow with the acquired input.
    processAndOutputRatio(receivedInputText);

} catch (errorReadingFile) {
    // Capture and report any errors that occur during the file reading operation.
    console.error(`Critical I/O Failure: Could not read data from ${standardInputFilePath}. Details: ${errorReadingFile.message}`);
    // Exit the process with a non-zero status code to indicate that an error occurred.
    process.exit(1);
}