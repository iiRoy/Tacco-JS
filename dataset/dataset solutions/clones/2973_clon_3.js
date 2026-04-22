"use strict"; // Enforce strict JavaScript parsing and execution rules.

/**
 * A utility function to safely convert a string into an integer.
 * It uses base 10 for parsing and returns null if the conversion fails (e.g., non-numeric string).
 * @param {string} numberAsString - The string representation of a number.
 * @returns {number | null} The parsed integer or null if parsing is unsuccessful.
 */
const convertToIntegerSafely = (numberAsString) => {
    const parsedValue = parseInt(numberAsString, 10);
    return isNaN(parsedValue) ? null : parsedValue;
};

/**
 * Handles the final output of the computed numerical result.
 * This function abstracts away the specific output method (e.g., console, file, network).
 * @param {number} finalCalculatedValue - The number to be displayed.
 */
const presentOutputValue = (finalCalculatedValue) => {
    // For this application, we simply log to the console.
    console.log(finalCalculatedValue);
};

/**
 * The core logic responsible for processing the raw input string, performing calculations,
 * and orchestrating the output.
 * @param {string} completeInputData - The entire content read from the input source as a single string.
 */
const performDataProcessing = (completeInputData) => {
    // Initial validation: check if the input data is valid and not empty.
    if (typeof completeInputData !== 'string' || completeInputData.length === 0) {
        console.error("Error: No input data provided or data is of an invalid type.");
        return; // Terminate execution if input is invalid.
    }

    // Break down the input string into individual lines, ensuring each line is trimmed of whitespace.
    const linesOfInput = completeInputData
        .split('\n') // Split by newline characters.
        .map(currentLine => currentLine.trim()) // Trim leading/trailing whitespace from each line.
        .filter(trimmedLine => trimmedLine.length > 0); // Remove any empty lines resulting from trimming.

    // A guard clause to ensure there's at least one non-empty line to process.
    if (linesOfInput.length === 0) {
        console.error("Error: Input data contains no usable lines after trimming.");
        return;
    }

    // Focus on the very first line of input as it contains our parameters.
    const firstRelevantLine = linesOfInput[0];

    // Split the first line by space to isolate the numerical parameter strings.
    const numericParameterStrings = firstRelevantLine.split(' ');

    // Validate that we have received at least two parameters as expected.
    if (numericParameterStrings.length < 2) {
        console.error("Error: Insufficient numerical parameters on the first line. Expected at least two.");
        return;
    }

    // Parse the first parameter string into an integer.
    const primaryOperand = convertToIntegerSafely(numericParameterStrings[0]);
    // Parse the second parameter string into an integer.
    const secondaryOperand = convertToIntegerSafely(numericParameterStrings[1]);

    // Final validation for parsed numbers.
    if (primaryOperand === null || secondaryOperand === null) {
        console.error("Error: One or both parameters could not be converted to valid integers.");
        return;
    }

    // Perform the required arithmetic operation.
    // The original logic was (N - K) + 1.
    // This can be equivalently expressed as N - (K - 1).
    // Introducing an intermediate step for clarity and structural change.
    const adjustmentValue = secondaryOperand - 1;
    const finalComputationResult = primaryOperand - adjustmentValue;

    // Output the final result using the dedicated presentation function.
    presentOutputValue(finalComputationResult);
};

// --- Application Entry Point ---
// This immediately invoked function expression (IIFE) serves as the main execution block.
(function initializeApplication() {
    // Define the standard input file path as a constant.
    const standardInputFile = '/dev/stdin';
    // Acquire the Node.js file system module.
    const fileSystemHandler = require('fs');

    let receivedInputContent;
    try {
        // Attempt to synchronously read all content from the standard input file.
        // Specify 'utf8' encoding to handle text data correctly.
        receivedInputContent = fileSystemHandler.readFileSync(standardInputFile, 'utf8');
    } catch (readOperationError) {
        // If an error occurs during file reading (e.g., file not found, permissions),
        // log the error and terminate the application gracefully.
        console.error(`Failed to retrieve data from ${standardInputFile}:`, readOperationError.message);
        return; // Exit the IIFE.
    }

    // If input content was successfully read, pass it to the main processing function.
    performDataProcessing(receivedInputContent);
})();