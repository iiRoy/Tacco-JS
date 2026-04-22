// This module provides a structured approach for processing textual input
// by performing specific transformations and presenting the result.

// Define essential configuration parameters as constants for clarity and maintainability.
const SYSTEM_INPUT_SOURCE_PATH = "/dev/stdin";
const TARGET_DELIMITER_CHAR = ',';
const SUBSTITUTION_STRING = ' ';
const FILE_READ_ENCODING = "utf8";

/**
 * Retrieves the raw content from a specified file path using synchronous I/O.
 * Includes basic error handling for file system operations.
 * @param {string} inputFilePath - The absolute or relative path to the source file.
 * @returns {string | null} The entire content of the file as a string,
 *                          or null if an error occurs during reading.
 */
function acquireFileContent(inputFilePath) {
    let fileContents = null;
    try {
        // Dynamically import the 'fs' module.
        const fileSystemUtility = require("fs");
        fileContents = fileSystemUtility.readFileSync(inputFilePath, FILE_READ_ENCODING);
    } catch (ioError) {
        // Log the error to standard error stream, indicating a failure in input acquisition.
        console.error(`ERROR: Failed to read input from '${inputFilePath}'. Details: ${ioError.message}`);
        // Return null to signal that content acquisition was unsuccessful.
        return null;
    }
    return fileContents;
}

/**
 * Processes a multi-line string to isolate and return only its first line.
 * It handles cases where the input might be empty, not a string, or contain no newlines.
 * @param {string | null | undefined} completeInputText - The full string content, potentially multi-line.
 * @returns {string} The first line of the input text, or an empty string if input is invalid or empty.
 */
function extractFirstMeaningfulLine(completeInputText) {
    // Validate input: ensure it's a non-empty string.
    if (typeof completeInputText !== 'string' || completeInputText.length === 0) {
        return ""; // Return an empty string for invalid or empty input.
    }

    // Find the position of the first newline character.
    const firstNewlinePosition = completeInputText.indexOf('\n');

    // If no newline is found, the entire string is considered the first line.
    if (firstNewlinePosition === -1) {
        return completeInputText;
    }

    // Otherwise, extract the substring from the beginning up to the first newline.
    return completeInputText.substring(0, firstNewlinePosition);
}

/**
 * Applies a string transformation by replacing all occurrences of a specific delimiter
 * with a designated replacement string. This uses a split-and-join strategy.
 * @param {string} sourceLine - The string on which the transformation is to be performed.
 * @param {string} delimiterToReplace - The character or sequence of characters to find.
 * @param {string} replacementValue - The string to insert in place of the delimiter.
 * @returns {string} The transformed string. Returns an empty string if sourceLine is invalid.
 */
function transformDelimitedString(sourceLine, delimiterToReplace, replacementValue) {
    // Pre-validation for the source string.
    if (typeof sourceLine !== 'string') {
        return ""; // Invalid source, return empty.
    }
    // Pre-validation for delimiter and replacement. Ensure they are strings.
    if (typeof delimiterToReplace !== 'string' || typeof replacementValue !== 'string') {
        // If delimiter or replacement are not strings, fall back to default behavior or error.
        // For this clone, we'll just return the original line if the delimiter isn't a string.
        return sourceLine;
    }

    // If the delimiter is empty, splitting by it would yield an array of characters.
    // To maintain functional similarity with `replace(/,/g, ' ')`, we skip if delimiter is empty.
    if (delimiterToReplace.length === 0) {
        return sourceLine;
    }

    // Split the source string by the delimiter, then join the parts with the replacement value.
    const segments = sourceLine.split(delimiterToReplace);
    const modifiedString = segments.join(replacementValue);

    return modifiedString;
}

/**
 * Orchestrates the entire data processing workflow:
 * 1. Acquires raw input.
 * 2. Extracts the primary data line.
 * 3. Transforms the extracted line.
 * 4. Displays the final output.
 */
function beginInputTransformationProcess() {
    // Attempt to read the full content from the predefined system input path.
    const completeRawInput = acquireFileContent(SYSTEM_INPUT_SOURCE_PATH);

    // Check if input acquisition was successful. If not, log and terminate.
    if (completeRawInput === null) {
        console.log("Processing halted due to failure in input acquisition.");
        return;
    }

    // Extract the very first line from the acquired raw input.
    const initialDataLine = extractFirstMeaningfulLine(completeRawInput);

    // If the first line is empty after extraction, there's nothing to transform.
    if (initialDataLine.length === 0) {
        console.log("No significant data found on the first line for transformation.");
        // We could output the original full content or just terminate. Terminating for now.
        return;
    }

    // Perform the core transformation: replacing target delimiters with the specified string.
    const finalProcessedResult = transformDelimitedString(
        initialDataLine,
        TARGET_DELIMITER_CHAR,
        SUBSTITUTION_STRING
    );

    // Output the transformed result clearly to the console.
    console.log("--- START OF PROCESSED OUTPUT ---");
    console.log(finalProcessedResult);
    console.log("--- END OF PROCESSED OUTPUT ---");
}

// Initiate the main processing flow when the script is executed.
beginInputTransformationProcess();