'use strict';

/**
 * Executes the primary data processing logic for the application.
 * It takes a raw string input, parses specific numeric values,
 * performs a calculation, and outputs the result.
 *
 * @param {string} rawDataString - The complete string content read from the input source.
 */
const processInputData = (rawDataString) => {
    // --- Type III Addition: Input Validation ---
    // Ensure that the provided input is a valid non-empty string.
    if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
        console.error("Error: Input data is either not a string or is empty. Cannot proceed.");
        return; // Exit early if input is invalid
    }

    // --- Type III Update: Step-by-step parsing instead of chained operations ---
    // First, divide the entire input string into an array of individual lines.
    const contentLines = rawDataString.split('\n');

    // --- Type III Addition: Input Structure Validation ---
    // Verify that there are at least two lines available for parsing the required numbers.
    if (contentLines.length < 2) {
        console.error("Error: Insufficient number of lines in the input. Expected at least two.");
        return;
    }

    // --- Type II & III: Renaming, Type Conversion, and Intermediate Variables ---
    // Extract the first line, split it by spaces, and attempt to parse the first token as a number.
    const firstLineSegments = contentLines[0].split(' ');
    let primaryOperandValue = Number(firstLineSegments[0]); // Using Number() instead of parseInt()

    // --- Type III Addition: Numeric Parsing Validation ---
    // Check if the parsing of the first value resulted in a valid number.
    if (isNaN(primaryOperandValue)) {
        console.error(`Error: Failed to parse a valid number from the first input line: '${firstLineSegments[0]}'`);
        return;
    }

    // Extract the second line, split it by spaces, and attempt to parse the first token as a number.
    const secondLineSegments = contentLines[1].split(' ');
    let subtractiveValue = Number(secondLineSegments[0]); // Consistent use of Number()

    // --- Type III Addition: Numeric Parsing Validation ---
    // Check if the parsing of the second value resulted in a valid number.
    if (isNaN(subtractiveValue)) {
        console.error(`Error: Failed to parse a valid number from the second input line: '${secondLineSegments[0]}'`);
        return;
    }

    // --- Type III Update: Calculation method change and intermediate variable ---
    // Calculate the square of the primary operand using Math.pow for clarity.
    const squaredPrimaryOperand = Math.pow(primaryOperandValue, 2);

    // Perform the final arithmetic operation.
    const finalComputationResult = squaredPrimaryOperand - subtractiveValue;

    // --- Type II: Reformatting and Comments ---
    // Output the computed result to the standard console.
    console.log(finalComputationResult);
};

// --- Type III Addition: Robust Input Reading with Error Handling ---
// This block handles reading the input from standard input, ensuring the main function receives data.
try {
    // Dynamically require the 'fs' (file system) module.
    const fileSystemHandler = require('fs');

    // Define the path for standard input, common in Unix-like systems.
    const standardInputDevicePath = '/dev/stdin';

    // Specify the character encoding for reading the file.
    const textEncodingFormat = 'utf8';

    // Read the entire content of the standard input synchronously.
    // The result might be a Buffer, so convert it to a string explicitly.
    const receivedInputContent = fileSystemHandler.readFileSync(standardInputDevicePath, textEncodingFormat).toString();

    // Invoke the core processing function with the obtained input.
    processInputData(receivedInputContent);
} catch (inputReadError) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`An error occurred while attempting to read from standard input: ${inputReadError.message}`);
}