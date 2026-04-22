// This module orchestrates the processing of incoming data.
// It's designed to read from standard input, analyze the content,
// and then output a specific result based on a predefined criterion.

/**
 * Determines if a given text string starts with a particular prefix.
 * This function encapsulates the core logic for the string comparison.
 *
 * @param {string} incomingData The raw string content received for analysis.
 * @returns {string} "Yes" if the prefix is found at the beginning, otherwise "No".
 */
function evaluateContentForPrefix(incomingData) {
    // Define the specific sequence of characters we are looking for
    // at the very beginning of the input string.
    const TARGET_SEQUENCE = "YAKI";

    // Define the response messages for clarity and easier modification.
    const POSITIVE_RESPONSE = "Yes";
    const NEGATIVE_RESPONSE = "No";

    let resultIndicator = NEGATIVE_RESPONSE; // Assume negative outcome by default.

    // Preliminary check: Ensure the input is a valid string and long enough
    // to possibly contain the target sequence. This acts as a guard clause.
    if (typeof incomingData !== 'string' || incomingData.length < TARGET_SEQUENCE.length) {
        // If the input is invalid or too short, we can immediately return the negative response.
        // This avoids unnecessary processing.
        return resultIndicator;
    }

    // Perform the actual comparison: check if the string begins with the target sequence.
    // The `startsWith` method provides a concise and readable way to do this.
    const doesDataBeginWithTarget = incomingData.startsWith(TARGET_SEQUENCE);

    // If the condition is met, update the result indicator.
    if (doesDataBeginWithTarget) {
        resultIndicator = POSITIVE_RESPONSE;
    }
    // No explicit 'else' block is required here, as 'resultIndicator' already holds 'NEGATIVE_RESPONSE' by default.

    return resultIndicator;
}

/**
 * A utility function to output a given string to the standard console.
 * This abstraction helps in separating the display logic from the core processing.
 *
 * @param {string} messageToDisplay The string content to be printed.
 */
function transmitOutputToConsole(messageToDisplay) {
    console.log(messageToDisplay);
}

// --- Main Execution Flow ---
// This section handles the input acquisition and delegates to the processing functions.

// Obtain the file system module, typically used for I/O operations in Node.js environments.
const fileSystemUtility = require("fs");

// Define the standard path for input, common in competitive programming setups.
const standardInputPathSpecifier = "/dev/stdin";

// Specify the character encoding for reading the input file.
const inputCharacterEncoding = "utf8";

try {
    // Read the entire content from the specified standard input path synchronously.
    // The content is expected to be a string based on the encoding.
    const rawInputContentFromStream = fileSystemUtility.readFileSync(
        standardInputPathSpecifier,
        inputCharacterEncoding
    );

    // Pass the acquired raw content to our primary evaluation function.
    // This function will return the appropriate "Yes" or "No" string.
    const finalDeterminedResult = evaluateContentForPrefix(rawInputContentFromStream);

    // Display the computed result to the user via the console.
    transmitOutputToConsole(finalDeterminedResult);

} catch (errorReadingInput) {
    // In case of any error during file reading (e.g., file not found, permission issues),
    // log an error message to the console. This is a basic error handling mechanism.
    console.error("An error occurred while reading input or processing:", errorReadingInput.message);
    // Optionally, transmit a default negative output or an error specific message.
    transmitOutputToConsole("No");
}