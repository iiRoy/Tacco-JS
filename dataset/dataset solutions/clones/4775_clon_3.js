// This module provides a specialized utility for processing incoming text streams.
// Its primary function is to read data, isolate the initial line segment,
// and then transform that segment by substituting a specific character
// (the comma) with another (a space) before displaying the result.

/**
 * Orchestrates the processing of a raw, multi-line string buffer.
 * It identifies the first line, performs a character replacement operation,
 * and then outputs the modified string to the standard console.
 *
 * @param {string} rawInputContent The complete string content received, potentially spanning multiple lines.
 */
const transformAndOutputFirstLine = (rawInputContent) => {

    // Declare constants for characters involved in the transformation process.
    const NEWLINE_CHARACTER = '\n';
    const OLD_SEPARATOR_CHAR = ',';
    const NEW_SEPARATOR_CHAR = ' ';

    // --- Pre-processing and Input Integrity Checks ---
    // A robust system should always validate its inputs.
    // Ensure the provided content is indeed a string type.
    if (typeof rawInputContent !== 'string') {
        // If the input is not a string, log an error and terminate execution gracefully.
        console.error("Input processing failed: Expected a string buffer, but received a different data type.");
        return;
    }

    let initialContentSegment;

    // --- Extraction of the Primary Data Line ---
    // Instead of splitting the entire string into an array, which could be memory-intensive for large inputs,
    // we efficiently locate the first newline character.
    const firstNewlinePosition = rawInputContent.indexOf(NEWLINE_CHARACTER);

    if (firstNewlinePosition !== -1) {
        // If a newline is present, extract the substring from the beginning up to that position.
        initialContentSegment = rawInputContent.slice(0, firstNewlinePosition);
    } else {
        // If no newline is found, the entire input is considered a single line.
        initialContentSegment = rawInputContent;
    }

    // --- Conditional Check for Empty Extracted Content ---
    // Although not strictly an error, an empty line might indicate unexpected input.
    // This could be a point for logging a warning or applying default behavior.
    if (!initialContentSegment || initialContentSegment.length === 0) {
        // For this specific clone, we allow an empty string to pass through,
        // resulting in an empty line being printed. A more complex system might log:
        // console.warn("Notice: The initial line extracted from the input was empty.");
    }

    // --- Core Transformation Logic: Character Substitution ---
    // The original code used a regular expression `replace`.
    // This alternative approach uses `split` and `join`, which achieves the same outcome
    // but represents a structural difference in implementation.
    const segmentsSeparatedByOldChar = initialContentSegment.split(OLD_SEPARATOR_CHAR);
    const finalTransformedString = segmentsSeparatedByOldChar.join(NEW_SEPARATOR_CHAR);

    // --- Output Handling Module ---
    // Encapsulate the logging mechanism for better maintainability and potential future enhancements
    // (e.g., writing to a file, sending over network).
    const deliverResultToConsole = (resultPayload) => {
        // A final check before logging: ensure the result isn't null or undefined.
        if (resultPayload !== null && resultPayload !== undefined) {
             console.log(resultPayload);
        } else {
             // In case of an unexpected null/undefined result, output an empty line
             // to prevent errors or inconsistent console output.
             console.log("");
        }
    };

    // Trigger the output delivery with the final processed string.
    deliverResultToConsole(finalTransformedString);
};

// --- Application Entry Point and Input Acquisition ---
// This block handles the initial setup, reading from the standard input stream,
// and invoking the core processing function.
try {
    // Obtain a reference to the Node.js 'fs' (file system) module.
    const fileSystemHandler = require('fs');

    // Synchronously read all data from the standard input device (`/dev/stdin`).
    // The input is expected to be UTF-8 encoded text.
    const rawDataFromStandardInput = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

    // Initiate the primary processing workflow with the acquired input.
    transformAndOutputFirstLine(rawDataFromStandardInput);

} catch (runtimeException) {
    // Catches any errors that occur during file reading or initial function execution.
    // Logs a descriptive error message to the console.
    console.error(`An unhandled exception occurred during application execution: ${runtimeException.message}`);
    // Optionally, uncomment the line below to exit the process with a non-zero status code,
    // signaling an abnormal termination to the operating system.
    // process.exit(1);
}