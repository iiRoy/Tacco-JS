'use strict'; // Enforce strict mode for cleaner code practices

// Import the Node.js file system module for reading input.
const fileSystemModule = require('fs');

/**
 * Orchestrates the processing of raw input data to generate a specific character pattern.
 * This function handles input parsing, validation, and the core logic for pattern generation.
 * @param {string} rawInputContent - The complete input string, typically from stdin.
 */
function processInputAndGeneratePattern(rawInputContent) {
    // Step 1: Preprocess the raw input content.
    // Trim leading/trailing whitespace and split into individual lines.
    const cleanedLines = rawInputContent.trim().split('\n');

    // Early validation: Ensure we have the minimum expected number of input lines.
    // The program expects at least three lines for N, S, and K.
    if (cleanedLines.length < 3) {
        console.error("Input Error: Expected at least 3 lines of data, but received fewer.");
        // If input is malformed, we exit early to prevent further errors.
        return;
    }

    // Step 2: Parse individual parameters from the cleaned lines.
    // Use parseInt with radix 10 for robust number conversion from string to integer.
    const initialNumericParameter = parseInt(cleanedLines[0], 10); // Corresponds to original 'N'
    const charSequence = cleanedLines[1].split('');               // Corresponds to original 'S', split into an array of characters
    const keyPositionIndex = parseInt(cleanedLines[2], 10);       // Corresponds to original 'K'

    // Additional Validation 1: Validate the initial numeric parameter.
    // Assuming 'N' represents the expected length of the character sequence.
    if (isNaN(initialNumericParameter) || initialNumericParameter <= 0) {
        console.error("Validation Error: The first parameter (numeric count) is invalid or non-positive.");
        return; // Halt execution if the numeric parameter is not valid.
    }
    if (initialNumericParameter !== charSequence.length) {
        console.warn(`Data Mismatch Warning: Declared sequence length (${initialNumericParameter}) does not match actual sequence length (${charSequence.length}). Proceeding with actual length.`);
        // This is a new guard clause. The original code ignored N. Here, we validate it.
    }

    // Additional Validation 2: Validate the key position index.
    // Ensure the index is a valid number and falls within the bounds of the character sequence.
    if (isNaN(keyPositionIndex) || keyPositionIndex < 0 || keyPositionIndex >= charSequence.length) {
        console.error(`Validation Error: The target position index (${keyPositionIndex}) is out of bounds for the character sequence of length ${charSequence.length}.`);
        return; // Halt execution if the index is invalid.
    }

    // Step 3: Determine the reference character based on the key position.
    // This character will be used for comparison against all other characters in the sequence.
    const designatedReferenceChar = charSequence[keyPositionIndex];

    // Step 4: Construct the output pattern.
    // Instead of using the 'map' and 'join' array methods directly,
    // we'll use a traditional 'for' loop for a structural change (Type III).
    // An array is used to build the result string efficiently before joining.
    const processedCharacters = [];
    for (let i = 0; i < charSequence.length; i++) {
        const currentSymbol = charSequence[i]; // Get the character at the current index.

        // Compare the current character with the designated reference character.
        if (currentSymbol === designatedReferenceChar) {
            processedCharacters.push(currentSymbol); // Keep the character if it matches the reference.
        } else {
            processedCharacters.push('*');          // Replace with an asterisk if it doesn't match.
        }
    }

    // Step 5: Join the array of processed characters to form the final result string.
    const finalOutputPattern = processedCharacters.join('');

    // Step 6: Display the generated pattern.
    // Using console.info as a minor variation from console.log.
    console.info(finalOutputPattern);
}

// Main execution block:
// This block reads the input from standard input and passes it to the processing function.
try {
    // Read the entire content of /dev/stdin as a UTF-8 encoded string.
    // This is a common pattern for competitive programming environments.
    const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    
    // Invoke the main processing function with the obtained input.
    processInputAndGeneratePattern(standardInputContent);
} catch (readingError) {
    // Handle potential errors during file reading (e.g., file not found, permission issues).
    console.error("Runtime Error: Could not read input from /dev/stdin. Details:", readingError.message);
    // Optionally, log the full stack trace for more detailed debugging.
    // console.error(readingError.stack);
}