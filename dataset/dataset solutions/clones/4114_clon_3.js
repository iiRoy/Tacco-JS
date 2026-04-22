// Define a central processing routine for a specific numerical operation.
function executeNumericalTransformation(inputPayload) {
    // A key constant used in the transformation. This value is fixed for the calculation.
    const baseValueForSubtraction = 48;

    // Validate the input payload before attempting any parsing.
    // This ensures we have a non-empty string to work with.
    if (typeof inputPayload !== 'string' || inputPayload.trim() === '') {
        console.error("Error: Received an invalid or empty input string for processing.");
        return; // Early exit if the input is not suitable.
    }

    // Attempt to convert the string payload into a numerical type.
    // The .trim() method removes leading/trailing whitespace, making parsing more robust.
    // Using Number() provides a concise way to convert, implicitly handling base 10 for integer strings.
    let numericOperand = Number(inputPayload.trim());

    // Guard clause: Ensure the parsed value is indeed a valid number.
    // If the input string could not be converted to a number, isNaN will be true.
    if (isNaN(numericOperand)) {
        console.error(`Error: Could not parse "${inputPayload.trim()}" into a valid numerical operand.`);
        return; // Exit if parsing fails, preventing further erroneous calculations.
    }

    // Perform the core arithmetic operation: subtract the parsed number from the base value.
    const computedDifference = baseValueForSubtraction - numericOperand;

    // Output the final computed result to the standard output.
    console.log(computedDifference);
}

// Helper function to abstract away the details of reading from standard input.
function retrieveStandardInputData() {
    // Import the built-in Node.js file system module for I/O operations.
    const fsModule = require('fs');
    // Define the standard path for reading input in a Unix-like environment.
    const inputDevicePath = '/dev/stdin';
    // Specify the character encoding for the input stream to correctly interpret characters.
    const inputEncoding = 'utf8';

    try {
        // Synchronously read the entire content from the specified input device.
        // This blocks execution until the input is fully read.
        const fileContent = fsModule.readFileSync(inputDevicePath, inputEncoding);
        return fileContent; // Return the raw string content.
    } catch (readError) {
        // Catch and log any errors that occur during the file reading process.
        console.error(`Failed to read from standard input device: ${readError.message}`);
        return null; // Indicate failure by returning null.
    }
}

// Main execution block of the script.
// First, attempt to obtain the raw data from the standard input source.
const rawDataFromStdin = retrieveStandardInputData();

// Proceed with the numerical transformation only if input data was successfully retrieved.
// This check prevents errors if the input reading failed.
if (rawDataFromStdin !== null) {
    // Pass the raw, unvalidated data to the core transformation function for processing.
    executeNumericalTransformation(rawDataFromStdin);
}