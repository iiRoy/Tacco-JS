// This module provides utilities for file system operations, crucial for reading input.
const systemFileHandler = require('fs');

// The specific path from which standard input is typically read on Unix-like systems.
const standardInputEndpoint = '/dev/stdin';

// The character encoding to correctly interpret the bytes read from the input stream.
const designatedEncoding = 'utf8';

// A regular expression pattern designed to detect the presence of any single uppercase English letter.
const uppercaseCharacterMatcher = /[A-Z]/;

/**
 * Reads content from a specified input source and determines if it contains any uppercase English characters.
 * This function encapsulates the entire logic of input acquisition and case evaluation.
 * @returns {string} Returns 'A' if at least one uppercase character is found in the input, otherwise returns 'a'.
 */
function evaluateInputForCase() {
    // Variable to hold the raw textual content read from the input source.
    let retrievedInputText;

    try {
        // Synchronously read the entire content from the standard input path using the specified encoding.
        // This operation can throw errors, hence wrapped in a try-catch block for robustness.
        retrievedInputText = systemFileHandler.readFileSync(standardInputEndpoint, designatedEncoding);
    } catch (fileReadError) {
        // In case of an error during file reading (e.g., permissions, non-existent path),
        // log the error message to the console and default to an empty string to prevent further issues.
        // For typical `/dev/stdin` usage, this catch block is rarely hit unless the environment is severely misconfigured.
        console.error(`Error encountered while accessing input source: ${fileReadError.message}`);
        retrievedInputText = ''; // Default to an empty string on error.
    }

    // Ensure the input is explicitly treated as a string, even though `readFileSync` with an encoding
    // usually returns a string. This provides an additional layer of type safety.
    const processedContentString = String(retrievedInputText);

    // A boolean flag initialized to false, which will be set to true if an uppercase character is identified.
    let isUppercaseCharacterPresent = false;

    // Perform an initial check for an empty input string. If the input is empty,
    // no uppercase character can possibly exist, and iteration is unnecessary.
    if (processedContentString.length === 0) {
        // If the input content is empty, the `isUppercaseCharacterPresent` flag remains false,
        // correctly indicating no uppercase characters were found.
        // An optional log could be added here for debugging empty inputs:
        // console.warn('Input content was empty; no case determination possible.');
    } else {
        // Iterate through each individual character of the processed input string.
        // This loop checks for the first occurrence of an uppercase letter.
        for (let characterIndex = 0; characterIndex < processedContentString.length; characterIndex++) {
            const currentCharacter = processedContentString[characterIndex];

            // Utilize the predefined regular expression pattern to test if the current character
            // is an uppercase English letter.
            if (uppercaseCharacterMatcher.test(currentCharacter)) {
                isUppercaseCharacterPresent = true; // Update the flag to true.
                break; // Exit the loop immediately as the condition has been met.
            }
        }
    }

    // Based on the final state of the `isUppercaseCharacterPresent` flag,
    // determine the appropriate outcome string.
    let outcomeString;
    if (isUppercaseCharacterPresent) {
        outcomeString = 'A'; // Output 'A' if an uppercase character was found.
    } else {
        outcomeString = 'a'; // Output 'a' if no uppercase character was found.
    }

    // Return the final result string to the caller.
    return outcomeString;
}

// Execute the main logic encapsulated within the `evaluateInputForCase` function
// and display its return value to the standard output stream.
console.log(evaluateInputForCase());