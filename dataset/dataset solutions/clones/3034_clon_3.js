// This script processes a given multi-line string input to transform a primary string.
// It identifies a specific character based on an index and replaces all other characters
// in the primary string (up to a specified length) with a predefined symbol.

/**
 * Executes the main logic for processing the input data.
 * This function handles parsing, validation, and the core character replacement algorithm.
 *
 * @param {string} rawInputString - The complete input as a single string,
 *                                  expected to contain multiple lines separated by newlines.
 */
function processInputData(rawInputString) {
    // Define symbolic constants for better readability and maintainability.
    // The line separator is assumed to be a standard newline character.
    const INPUT_LINE_DELIMITER = '\n';
    // The character used to replace non-matching characters.
    const WILDCARD_SYMBOL = '*';

    // Split the raw input string into an array of individual lines.
    // This prepares the data for structured access.
    let arrayOfInputLines = rawInputString.split(INPUT_LINE_DELIMITER);

    // --- Data Extraction and Initial Validation ---

    // Ensure that the input contains the minimum required number of lines (N, S, K).
    if (arrayOfInputLines.length < 3) {
        console.error("Error: The provided input is incomplete. Expected at least three lines.");
        return; // Terminate execution if essential input is missing.
    }

    // Parse the first line as the maximum length parameter for string processing.
    // `parseInt` is used for robust conversion, and `trim()` removes leading/trailing whitespace.
    let processingLengthLimit = parseInt(arrayOfInputLines[0].trim(), 10);

    // Extract the second line as the primary string to be manipulated.
    let mainCharacterSequence = arrayOfInputLines[1].trim();

    // Parse the third line as the 1-based index for the target character.
    let oneBasedTargetIndex = parseInt(arrayOfInputLines[2].trim(), 10);

    // --- Numerical Input Validation ---

    // Verify that the parsed numerical parameters are valid integers.
    if (isNaN(processingLengthLimit) || isNaN(oneBasedTargetIndex)) {
        console.error("Error: The length parameter or target index is not a valid number.");
        return;
    }

    // --- Boundary Condition Checks ---

    // Validate the target index against the actual length of the main string.
    // It must be within the bounds of the string (1-indexed).
    if (oneBasedTargetIndex < 1 || oneBasedTargetIndex > mainCharacterSequence.length) {
        console.error(
            `Error: Target index (${oneBasedTargetIndex}) is out of permissible range ` +
            `for a string of length ${mainCharacterSequence.length}.`
        );
        return;
    }

    // If the provided processing length limit (N) is greater than the actual string length,
    // we should cap it to prevent out-of-bounds access during iteration.
    // This is a safety measure to ensure the loop doesn't go beyond the string's actual end.
    if (processingLengthLimit > mainCharacterSequence.length) {
        console.warn(
            `Warning: Declared processing length (${processingLengthLimit}) ` +
            `exceeds actual string length (${mainCharacterSequence.length}). ` +
            `Processing will be capped at string's actual length.`
        );
        processingLengthLimit = mainCharacterSequence.length;
    }

    // Determine the reference character that will be preserved.
    // Adjusting the 1-based index to a 0-based index for string access.
    const preservedCharacter = mainCharacterSequence[oneBasedTargetIndex - 1];

    // Initialize an array to accumulate the processed characters.
    // Using an array for character building is generally more efficient than
    // repeated string concatenation in JavaScript.
    let transformedCharacterCollection = [];

    // --- Core Transformation Logic ---

    // Iterate through the main character sequence up to the determined processing limit.
    for (let currentCharacterPosition = 0; currentCharacterPosition < processingLengthLimit; currentCharacterPosition++) {
        // Retrieve the character at the current iteration position.
        const characterUnderTest = mainCharacterSequence[currentCharacterPosition];

        // Compare the current character with the designated preserved character.
        if (characterUnderTest !== preservedCharacter) {
            // If they do not match, append the wildcard symbol to the collection.
            transformedCharacterCollection.push(WILDCARD_SYMBOL);
        } else {
            // If they match, append the original character to preserve it.
            transformedCharacterCollection.push(characterUnderTest);
        }
    }

    // Join all characters in the collection to form the final output string.
    const finalProcessedString = transformedCharacterCollection.join('');

    // Output the resulting string to the standard console.
    console.log(finalProcessedString);
}

// --- Input Acquisition Utility ---

/**
 * Retrieves input from the standard input stream, typically `/dev/stdin` in competitive programming environments.
 * This function abstracts the file system interaction.
 *
 * @returns {string} The content read from `/dev/stdin` as a UTF-8 string.
 *                   Returns an empty string in case of an error.
 */
function readStandardInput() {
    try {
        // Dynamically require the 'fs' (file system) module, common in Node.js.
        const fileSystemHandler = require('fs');
        // Read the entire content of `/dev/stdin` synchronously,
        // decoding it as a UTF-8 string.
        return fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
    } catch (inputError) {
        // Log any errors encountered during input reading.
        console.error("Failed to acquire input from standard stream:", inputError.message);
        return ""; // Return an empty string to allow `processInputData` to handle it gracefully.
    }
}

// --- Script Execution Entry Point ---

// Invoke the main processing function with the input obtained from the standard input.
processInputData(readStandardInput());