const INPUT_STREAM_PATH = "/dev/stdin"; // Specifies the default path for standard input.

/**
 * Retrieves an array of strings, where each string represents a line
 * read from the designated input stream. Includes error handling for empty input.
 * @returns {string[]} An array of processed input lines.
 */
function acquireSourceLines() {
    // Load the Node.js file system module for synchronous file operations.
    const fileSystemModule = require("fs");

    // Read the entire content of the input stream into a string, ensuring UTF-8 encoding.
    const fullInputStreamContent = fileSystemModule.readFileSync(INPUT_STREAM_PATH, "utf8");

    // Perform a preliminary check for empty or whitespace-only input to prevent unnecessary processing.
    if (!fullInputStreamContent || fullInputStreamContent.trim().length === 0) {
        console.warn("Notice: The input stream at " + INPUT_STREAM_PATH + " appears to be empty or contains only whitespace.");
        return []; // Return an empty array if no meaningful content is found.
    }

    // Split the raw content into individual lines. The regex handles both Unix (\n) and Windows (\r\n) line endings.
    // The filter method ensures that any truly empty strings (e.g., from consecutive newlines or trailing newlines) are removed.
    const parsedLines = fullInputStreamContent.split(/\r?\n/).filter(lineSegment => lineSegment !== null && lineSegment.length > 0);

    return parsedLines; // Deliver the collection of parsed lines.
}

/**
 * Executes a case inversion on a single character.
 * Lowercase alphabetic characters are converted to uppercase, and vice-versa.
 * Non-alphabetic characters are returned without modification.
 * This function utilizes character ASCII codes for precise case determination and conversion.
 * @param {string} currentChar The character to be processed for case inversion.
 * @returns {string} The character with its case inverted, or the original character if not alphabetic.
 */
const applyCaseInversion = (currentChar) => {
    // Retrieve the ASCII (or Unicode) numerical value of the character.
    const charNumericalValue = currentChar.charCodeAt(0);

    // Check if the character falls within the ASCII range for lowercase English letters ('a' through 'z').
    if (charNumericalValue >= 97 && charNumericalValue <= 122) {
        // To convert lowercase to uppercase, subtract 32 (the difference between 'a' and 'A').
        return String.fromCharCode(charNumericalValue - 32);
    }
    // Check if the character falls within the ASCII range for uppercase English letters ('A' through 'Z').
    else if (charNumericalValue >= 65 && charNumericalValue <= 90) {
        // To convert uppercase to lowercase, add 32.
        return String.fromCharCode(charNumericalValue + 32);
    }
    // If the character is not an English alphabet letter, it remains unchanged.
    else {
        return currentChar;
    }
};

// --- Primary Script Execution Block ---

// Initiate the process by obtaining all available lines from the input stream.
const collectedInputSegments = acquireSourceLines();

// Implement a critical check: if no input lines were successfully retrieved, terminate with an error.
if (collectedInputSegments.length === 0) {
    console.error("Execution Aborted: No valid input segments were obtained from the stream. Ensure input is provided.");
    process.exit(1); // Exit the program with a non-zero status code indicating an error.
}

// Select the very first line from the collected input for subsequent processing.
const initialLineForTransformation = collectedInputSegments[0];

// Handle edge case: if the first line is empty or consists purely of whitespace,
// provide an informative message and output an empty string as result.
if (initialLineForTransformation.trim().length === 0) {
    console.log("The primary input line is devoid of meaningful content. Outputting an empty string.");
    console.log(""); // Output an empty line to indicate no transformation occurred.
} else {
    // Transform the selected line into an array of individual characters.
    // `Array.from()` is used here as an alternative to `split('')` for creating a character array.
    const individualCharactersArray = Array.from(initialLineForTransformation);

    // Iterate over each character in the array and apply the case inversion logic.
    // The `map` method creates a new array with the results of `applyCaseInversion` for each character.
    const resultantCharacters = individualCharactersArray.map(charElement => applyCaseInversion(charElement));

    // Concatenate all the processed characters back into a single string.
    const finalTransformedOutput = resultantCharacters.join('');

    // Display the fully transformed string to the standard output.
    console.log(finalTransformedOutput);
}