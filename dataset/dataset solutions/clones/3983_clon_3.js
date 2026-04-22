/**
 * @file This module is designed to process text input, specifically to extract
 *       and concatenate characters from predefined positions within the first
 *       three lines of the input. It includes robust error handling for
 *       file operations and gracefully manages cases of insufficient input data.
 */

// Constant defining the character to use as a placeholder when a requested
// character position (line or column) is not found in the input data.
const DEFAULT_SUBSTITUTE_CHARACTER = ''; // An empty string ensures seamless concatenation.

/**
 * A utility method to safely retrieve a character from a specific zero-based
 * line and character index within an array of text lines.
 * This function prevents errors by checking bounds and providing a fallback.
 *
 * @param {string[]} allInputLines - An array where each element is a string representing a line.
 * @param {number} targetRowIndex - The 0-based index of the line to access.
 * @param {number} targetColumnIndex - The 0-based index of the character within the target line.
 * @param {string} [fallbackValue=DEFAULT_SUBSTITUTE_CHARACTER] - The character to return if
 *                                                                the specified position is invalid.
 * @returns {string} The character at the given position, or the `fallbackValue` if out of bounds.
 */
function retrieveCharSafely(allInputLines, targetRowIndex, targetColumnIndex, fallbackValue = DEFAULT_SUBSTITUTE_CHARACTER) {
    // Verify that the requested line index is valid within the array of lines.
    if (targetRowIndex < 0 || targetRowIndex >= allInputLines.length) {
        return fallbackValue; // Line does not exist.
    }

    // Access the specific line string.
    const currentLineString = allInputLines[targetRowIndex];

    // Ensure the retrieved item is indeed a string and that the character index is valid.
    if (typeof currentLineString !== 'string' || targetColumnIndex < 0 || targetColumnIndex >= currentLineString.length) {
        return fallbackValue; // Character position is out of bounds for this line.
    }

    // If all checks pass, return the character at the specified location.
    return currentLineString[targetColumnIndex];
}

/**
 * This is the core processing logic function. It takes raw text content,
 * splits it into lines, extracts specific characters as per the problem
 * definition, and then prints the aggregated result to the console.
 *
 * @param {string} rawContentPayload - The entire input text received,
 *                                     expected to be newline-separated.
 * @returns {void} This function performs a side effect (console output) and returns nothing.
 */
function processDataStream(rawContentPayload) {
    // First, transform the single input string into an array of strings,
    // where each string represents a distinct line from the original input.
    const separatedTextLines = rawContentPayload.split('\n');

    // Introduce a constant for the minimum line count required for character extraction.
    const REQUIRED_MIN_LINES = 3;

    // Optional: Add a warning if the input does not meet the minimum line requirement.
    // This helps in debugging and making the program more user-friendly.
    if (separatedTextLines.length < REQUIRED_MIN_LINES) {
        console.warn(
            `[INPUT_WARNING]: Provided input contains only ${separatedTextLines.length} lines. ` +
            `At least ${REQUIRED_MIN_LINES} lines are typically expected for full processing. ` +
            `Missing character positions will be filled with the default substitute character.`
        );
    }

    // Extract the first character from the first line (index [0][0]).
    const charA = retrieveCharSafely(separatedTextLines, 0, 0);

    // Extract the second character from the second line (index [1][1]).
    const charB = retrieveCharSafely(separatedTextLines, 1, 1);

    // Extract the third character from the third line (index [2][2]).
    const charC = retrieveCharSafely(separatedTextLines, 2, 2);

    // Concatenate the extracted characters into a single result string.
    // Using a template literal for modern and readable string interpolation.
    const concatenatedResult = `${charA}${charB}${charC}`;

    // Output the final generated string to the standard console stream.
    console.log(concatenatedResult);
}

// --- Main Program Execution Block ---
// This section handles the initial setup, including reading from standard
// input and managing potential file system errors.

try {
    // Dynamically load the Node.js file system module for input operations.
    const fileSystemUtil = require("fs");

    // Define the path to the standard input device as a constant for clarity.
    const standardInputDevicePath = "/dev/stdin";

    // Read the entire content of the standard input file synchronously.
    // Specify 'utf8' encoding to correctly interpret text data.
    const stdinContentBuffer = fileSystemUtil.readFileSync(standardInputDevicePath, "utf8");

    // Pass the buffered content to the main processing function.
    processDataStream(stdinContentBuffer);

} catch (fileReadError) {
    // If an error occurs during file reading (e.g., file not found, permission denied),
    // log the error details and attempt to proceed with an empty input to prevent a crash.
    console.error(
        `[RUNTIME_ERROR]: An issue occurred while accessing standard input at '${"/dev/stdin"}'. ` +
        `Error details: ${fileReadError.message}`
    );
    // As a fallback, invoke the processing function with an empty string.
    // This ensures the program doesn't halt abruptly and allows the processing
    // logic to gracefully handle the absence of input data, printing default characters.
    processDataStream("");
}