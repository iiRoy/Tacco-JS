"use strict";

// This function orchestrates the primary business logic based on provided input.
function processInputData(sourceString) {
    // --- Input Validation and Preparation ---
    // A preliminary check to ensure the input is not empty or malformed.
    // This serves as a guard clause for robustness.
    if (!sourceString || typeof sourceString !== 'string' || sourceString.trim().length === 0) {
        console.error("Application Error: Received an empty or invalid input string.");
        // In a production scenario, one might throw an exception or return a specific error code.
        return;
    }

    // Normalize the input by trimming leading/trailing whitespace.
    const normalizedInputContent = sourceString.trim();

    // Segment the normalized input into an array of individual lines.
    // Using a distinct variable name for clarity.
    const inputLineSegments = normalizedInputContent.split("\n");

    // Verify that the expected number of lines are present.
    // This is crucial for preventing `undefined` access later.
    const minimumExpectedLines = 3;
    if (inputLineSegments.length < minimumExpectedLines) {
        console.error(`Application Error: Insufficient input lines. Expected at least ${minimumExpectedLines}, but received ${inputLineSegments.length}.`);
        return;
    }

    // --- Data Extraction and Transformation ---

    // Extract and tokenize the very first line of the input.
    // Represents configuration parameters or initial state identifiers.
    const configurationTokens = inputLineSegments[0].split(" ");

    // Process the second line to obtain a pair of numeric values.
    // This demonstrates a more explicit iteration over `map(Number)`.
    const initialNumericValues = [];
    const rawNumericStringsFromLine = inputLineSegments[1].split(" ");

    // Iterate through the raw strings to parse them into numbers.
    for (let segmentIndex = 0; segmentIndex < rawNumericStringsFromLine.length; segmentIndex++) {
        const currentStringValue = rawNumericStringsFromLine[segmentIndex];
        const parsedNumber = Number(currentStringValue); // Explicit type conversion.

        // Validate that each segment successfully converted to a number.
        if (isNaN(parsedNumber)) {
            console.error(`Data Parsing Error: Non-numeric data encountered in the second line: '${currentStringValue}'.`);
            return;
        }
        initialNumericValues.push(parsedNumber);
    }

    // The third line is treated as a key for comparison.
    // Renamed for better semantic understanding.
    const comparisonKeyIdentifier = inputLineSegments[2];

    // --- Core Logic Execution ---

    // Initialize variables to hold the computed output components.
    // This allows for modification based on the conditional logic.
    let computedResultFirstComponent;
    let computedResultSecondComponent = initialNumericValues[1]; // This component is fixed initially.

    // Evaluate the primary condition: Does the comparison key match the first configuration token?
    if (comparisonKeyIdentifier === configurationTokens[0]) {
        // If they match, decrement the first numeric value.
        computedResultFirstComponent = initialNumericValues[0] - 1;
        // The second component remains as its initial value.
    } else {
        // If they do not match, the first numeric value remains unchanged.
        computedResultFirstComponent = initialNumericValues[0];
        // And the second numeric value is decremented.
        computedResultSecondComponent = initialNumericValues[1] - 1;
    }

    // --- Result Formatting and Output ---

    // Construct the final output string using explicit string conversions.
    // This ensures consistent string representation for logging.
    const finalOutputMessage = String(computedResultFirstComponent) + " " + String(computedResultSecondComponent);

    // Print the computed result to standard output.
    console.log(finalOutputMessage);
}

// --- Application Entry Point ---

// Define constants for file system operations to improve readability.
const standardFileSystemModule = require('fs');
const standardInputDevicePath = '/dev/stdin';
const textEncodingStandard = 'utf8';

// Utilize a try-catch block for robust error handling during file I/O.
try {
    // Asynchronously read the entire content from the standard input.
    const inputContentFromFile = standardFileSystemModule.readFileSync(standardInputDevicePath, textEncodingStandard);

    // Invoke the main processing function with the read content.
    processInputData(inputContentFromFile);
} catch (ioOperationError) {
    // Log any errors that occur during the file reading process.
    console.error("Critical I/O Error: Could not read from standard input device.", ioOperationError.message);
    // A more sophisticated application might exit with a non-zero status code here.
}