"use strict"; // Enforces stricter parsing and error handling for improved code quality.

// This constant defines the specific character used as a separator between individual data elements.
const DATA_FIELD_SEPARATOR = ' ';

/**
 * Initiates and manages the primary workflow of the application.
 * This self-executing function handles input acquisition, error management,
 * and delegates data processing to a specialized function.
 */
(function initiateApplicationPipeline() {
    // Acquire the Node.js 'fs' module for performing file system operations.
    const fileSystemModuleAccessor = require('fs');
    // Specify the standard input stream path, commonly used in Unix-like environments.
    const standardInputReferencePath = '/dev/stdin';
    // Define the character encoding to be used when reading data from the input stream.
    const characterEncodingScheme = 'utf8';

    let acquiredTextualContent; // This variable will store the string data read from the input source.

    try {
        // Attempt to read all content from the designated standard input path synchronously.
        // By specifying 'utf8' encoding, the read data is directly returned as a string.
        acquiredTextualContent = fileSystemModuleAccessor.readFileSync(standardInputReferencePath, characterEncodingScheme);
    } catch (readingError) {
        // In the event of an I/O error during input reading (e.g., permissions, non-existent stream),
        // log a critical error message and terminate the process with an error code.
        console.error("Critical error encountered while accessing standard input:", readingError.message);
        process.exit(1); // Exit with a non-zero status to indicate an abnormal termination.
    }

    // Once input is successfully acquired, pass it to the dedicated function for parsing and display.
    processAndOutputFormattedComponents(acquiredTextualContent);

})(); // Immediately invokes the application's initialization function.


/**
 * Responsible for taking a raw input string, parsing it into constituent components,
 * and then printing a specific permutation of these components to the console.
 *
 * @param {string} rawInputDatum - The unprocessed string data, expected to contain at least two
 *                                 space-separated sub-strings.
 * @returns {void} This function performs an action (prints to console) but does not return a value.
 */
function processAndOutputFormattedComponents(rawInputDatum) {

    // Implement a preliminary validation check to ensure the input is a valid, non-empty string.
    if (typeof rawInputDatum !== 'string' || rawInputDatum.length === 0) {
        console.warn("Invalid or empty data provided for processing. A non-empty string is required.");
        // For robustness, one might log more details or use a default value here.
        return; // Halt execution if input is invalid.
    }

    // Step 1: Sanitize the input string by removing any leading or trailing whitespace characters.
    const cleanedStringPayload = rawInputDatum.trim();

    // Step 2: Deconstruct the cleaned string into an array of distinct tokens using the predefined separator.
    // If 'cleanedStringPayload' is empty, this operation will result in an array containing a single empty string [''].
    const separatedStringElements = cleanedStringPayload.split(DATA_FIELD_SEPARATOR);

    // Define the minimum number of expected elements for the subsequent operations to be meaningful.
    const REQUIRED_ELEMENT_COUNT = 2;

    // Validate that the tokenized array contains at least the expected number of elements.
    // This guard clause prevents potential errors from accessing undefined array indices.
    if (separatedStringElements.length < REQUIRED_ELEMENT_COUNT) {
        console.error(`Data integrity issue: Expected at least ${REQUIRED_ELEMENT_COUNT} data elements, but found only ${separatedStringElements.length}.`);
        console.log("Operation aborted: Cannot produce the required output due to insufficient data.");
        return; // Prevent further execution if data is incomplete.
    }

    // Extract the first and second elements from the array for improved readability and direct access.
    // Array indexing in JavaScript is zero-based.
    const initialElement = separatedStringElements[0]; // Corresponds to the first component.
    const subsequentElement = separatedStringElements[1]; // Corresponds to the second component.

    // Construct the final output string by concatenating the second element followed by the first element.
    // Utilizes template literals for modern and clear string interpolation.
    const finalConcatenatedResult = `${subsequentElement}${initialElement}`;

    // Display the final constructed string to the standard output stream.
    console.log(finalConcatenatedResult);

    // Optional: A verbose log message that could be enabled for debugging purposes.
    // console.info("Data processing and output generation completed successfully.");
}