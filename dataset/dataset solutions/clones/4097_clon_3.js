// Import the necessary file system module for input operations.
const fileSystemUtility = require('fs');

// Define constants for the input source path and the character encoding.
const standardInputPath = '/dev/stdin';
const contentEncodingFormat = 'utf8';

// Configuration for the string manipulation logic.
const targetCharacterRegex = /7/; // Regular expression to find the first occurrence of '7'.
const substitutionCharacter = '8'; // The character to replace '7' with.

let acquiredInputData = ''; // Variable to hold the raw data read from the input stream.

try {
    // Attempt to synchronously read the entire content from the specified input path.
    // The content is immediately converted to a string using the defined encoding.
    acquiredInputData = fileSystemUtility.readFileSync(standardInputPath, contentEncodingFormat);
} catch (inputReadError) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error message and terminate the process with an error code.
    console.error('An error occurred while attempting to retrieve data from the input source:', inputReadError.message);
    process.exit(1);
}

// Ensure the data is explicitly treated as a string, even though readFileSync with 'utf8' already returns a string.
const processedTextContent = String(acquiredInputData);

/**
 * Applies a specific transformation to a given string by replacing the first occurrence
 * of a predefined character with another.
 * @param {string} originalText The input string to be transformed.
 * @returns {string} The transformed string, or the original string if no transformation occurs or it's empty.
 */
const performTextTransformation = (originalText) => {
    // Validate that the input provided for transformation is indeed a string.
    if (typeof originalText !== 'string') {
        console.warn('Warning: Non-string data type detected for transformation. Attempting conversion to string.');
        originalText = String(originalText);
    }

    // Implement a guard clause for empty input strings.
    if (originalText.length === 0) {
        console.log('The input string for transformation is empty. No changes will be applied.');
        return originalText; // Return the empty string as is.
    }

    // Execute the primary logic: replace the first match of the target regex.
    const modifiedStringResult = originalText.replace(targetCharacterRegex, substitutionCharacter);
    return modifiedStringResult;
};

// Apply the transformation function to the processed input text.
const finalTransformedOutput = performTextTransformation(processedTextContent);

// Display the resulting string to the standard output.
console.log(finalTransformedOutput);