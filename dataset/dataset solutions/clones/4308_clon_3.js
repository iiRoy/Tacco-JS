'use strict'; // Enforce strict parsing and error handling for code execution.

/**
 * Processes raw string content to extract a specific prefix based on a defined suffix.
 * This function expects the input to be a string, typically read from a file or standard input.
 * It identifies the first meaningful word from the first line of the input and checks if it
 * ends with a predefined suffix. If it does, the part of the string before the suffix is printed.
 *
 * @param {string} rawTextContent - The complete raw string content provided as input.
 */
const processInputString = (rawTextContent) => {
    // Define the constant suffix we are looking for.
    // This could be dynamically loaded or passed as an argument in a more complex scenario.
    const TARGET_TERMINATOR_SEQUENCE = "FESTIVAL";

    // Step 1: Normalize and parse the incoming raw text content.
    // Trim overall whitespace, then split into individual lines.
    const contentLines = rawTextContent.trim().split('\n');

    // Introduce a guard clause for empty input.
    if (contentLines.length === 0 || contentLines[0].trim().length === 0) {
        console.error("Error: Provided input content is empty or contains no valid lines.");
        // Returning here prevents further errors and provides a clearer message.
        return;
    }

    // Extract the first line and then its first word (token).
    const firstLineData = contentLines[0].trim();
    const lineTokens = firstLineData.split(/\s+/); // Split by one or more whitespace characters.

    // Introduce another guard for lines without words.
    if (lineTokens.length === 0 || lineTokens[0].length === 0) {
        console.error("Error: The first line of input does not contain any recognizable words.");
        return;
    }

    // The primary string candidate to be analyzed.
    const candidateSubjectString = lineTokens[0];

    // Step 2: Perform the pattern matching.
    // Instead of a regex match that directly captures, we'll use string methods for clarity and potential performance.
    let resultantPrefix = ""; // Initialize with an empty string.

    // Check if the candidate string actually ends with our target sequence.
    if (candidateSubjectString.endsWith(TARGET_TERMINATOR_SEQUENCE)) {
        // Calculate the length of the suffix.
        const suffixLengthIndicator = TARGET_TERMINATOR_SEQUENCE.length;
        // Calculate the starting position for the substring operation.
        const effectiveEndIndex = candidateSubjectString.length - suffixLengthIndicator;

        // Extract the part of the string before the suffix.
        resultantPrefix = candidateSubjectString.substring(0, effectiveEndIndex);
    } else {
        // This block handles cases where the suffix is not found.
        // The original code would throw an error when accessing `md[1]` if `md` was `null`.
        // To maintain "recognizably similar" behavior for valid inputs but add robustness,
        // we log an error and return, simulating a "failure" for non-matching input.
        console.error(`Warning: The input string "${candidateSubjectString}" does not end with "${TARGET_TERMINATOR_SEQUENCE}". No prefix extracted.`);
        return;
    }

    // Step 3: Output the extracted prefix.
    // This is the final result of the processing logic.
    console.log(resultantPrefix);
};

// --- Execution Entry Point ---

// Define standard input path as a constant for clarity and potential reusability.
const STANDARD_INPUT_SOURCE_PATH = '/dev/stdin';

try {
    // Dynamically import the filesystem module. In Node.js, `require` is synchronous.
    const getModule = (moduleName) => require(moduleName);
    const fileSystemUtilities = getModule('fs');

    // Read the entire content from the specified input source using UTF-8 encoding.
    const acquireFileContentsSynchronously = fileSystemUtilities.readFileSync;
    const rawInputDataBuffer = acquireFileContentsSynchronously(STANDARD_INPUT_SOURCE_PATH, 'utf8');

    // Invoke the main processing function with the acquired data.
    processInputString(rawInputDataBuffer);

} catch (executionError) {
    // Comprehensive error handling for file reading or other execution issues.
    console.error(`An unexpected error occurred during program execution: ${executionError.message}`);
    // Optionally, log the full stack trace for debugging purposes.
    // console.error(executionError.stack);
    process.exit(1); // Indicate an abnormal termination.
}