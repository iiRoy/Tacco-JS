// This script is designed to read textual input from a standard input stream,
// process it by removing extraneous whitespace, converting all alphabetic characters
// to their uppercase equivalents, and then displaying the final result.

// --- Initialization and Configuration ---

// Acquire the 'fs' (file system) module, which provides functionality for
// interacting with the file system, including reading files.
const filesystemOperationsModule = require('fs');

// Define the absolute path to the standard input device.
// On Unix-like systems, '/dev/stdin' is a common path for standard input.
const sourceInputDevicePath = '/dev/stdin';

// Specify the character encoding to be used when reading the input data.
// 'utf8' is a widely used and robust encoding for text.
const dataStreamEncoding = 'utf8';

// A variable to temporarily hold the raw content read from the input source.
// It is initialized as an empty string to ensure a defined state.
let unprocessedContentBuffer = '';

// --- Input Acquisition ---

// Employ a try-catch block to gracefully handle potential errors during
// the file reading operation, such as permission issues or device unavailability.
try {
    // Synchronously read the entire content of the specified input path.
    // The content is expected to be returned as a string due to the 'utf8' encoding.
    unprocessedContentBuffer = filesystemOperationsModule.readFileSync(sourceInputDevicePath, dataStreamEncoding);
} catch (ioReadError) {
    // If any error occurs during the read operation, log a descriptive error message
    // to the standard error stream and terminate the process with a non-zero exit code,
    // indicating an abnormal termination.
    console.error(`ERROR: Failed to retrieve data from input source "${sourceInputDevicePath}". Details: ${ioReadError.message}`);
    process.exit(1); // Exit with an error code.
}

// Ensure the content is explicitly treated as a string type. While readFileSync
// with 'utf8' usually returns a string, this step adds robustness.
let initialTextData = String(unprocessedContentBuffer);

// --- Data Transformation Stage 1: Whitespace Normalization ---

// Type III Change: Instead of using the native `String.prototype.trim()` method,
// we're implementing an equivalent operation using a regular expression.
// This regex specifically targets leading and trailing whitespace characters,
// including standard spaces, tabs, newlines, and Unicode whitespace characters
// like non-breaking space (\uFEFF, \xA0).
const cleanedTextWithoutEdgeWhitespace = initialTextData.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

// Type III Addition: Implement a guard clause to check if the input
// is effectively empty after whitespace removal. This prevents unnecessary
// further processing and provides a more informative output.
if (cleanedTextWithoutEdgeWhitespace.length === 0) {
    console.log("NOTICE: Input stream was empty or contained only whitespace. No further processing performed.");
    process.exit(0); // Exit gracefully as there's nothing to do.
}

// --- Data Transformation Stage 2: Uppercase Conversion ---

// Type III Change: Replace the native `String.prototype.toUpperCase()` method
// with a custom, character-by-character conversion logic.
// This demonstrates an alternative, more verbose implementation of the same functionality.

// An array to store individual characters as they are processed and converted.
let transformedCharactersCollection = [];

// Convert the cleaned string into an array of individual characters.
// This is an intermediate step to facilitate iteration.
const individualCharactersArray = cleanedTextWithoutEdgeWhitespace.split('');

// Iterate through each character in the array.
for (let charIterator = 0; charIterator < individualCharactersArray.length; charIterator++) {
    const currentCharacter = individualCharactersArray[charIterator];

    // Determine the ASCII (or Unicode) code for the current character.
    const charCode = currentCharacter.charCodeAt(0);

    // Check if the character's code falls within the range of lowercase English letters (a-z).
    // This is a simplified check primarily for ASCII characters.
    if (charCode >= 'a'.charCodeAt(0) && charCode <= 'z'.charCodeAt(0)) {
        // If it's a lowercase letter, convert it to its uppercase equivalent.
        // The difference between 'a' and 'A' (or 'b' and 'B', etc.) is constant.
        const uppercaseCharCode = charCode - ('a'.charCodeAt(0) - 'A'.charCodeAt(0));
        transformedCharactersCollection.push(String.fromCharCode(uppercaseCharCode));
    } else {
        // If it's not a lowercase English letter, retain the character as is
        // (e.g., numbers, symbols, already uppercase letters, or non-ASCII characters).
        transformedCharactersCollection.push(currentCharacter);
    }
}

// Join all the processed characters back into a single string.
const finalTransformedOutputString = transformedCharactersCollection.join('');

// --- Output Result ---

// Display the final, fully processed and transformed string to the console.
// This is the equivalent of the original `console.log(input.toUpperCase())`
// but now using the result of our detailed Type III transformations.
console.log(finalTransformedOutputString);