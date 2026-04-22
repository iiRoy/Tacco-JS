// This module defines a utility for processing a specific text pattern from standard input.

/**
 * Defines a collection of constants used throughout the program.
 * Using constants enhances readability, maintainability, and reduces magic strings.
 */
const CRITICAL_MATCH_STRING = "ABC"; // The specific string we are checking for in the input.
const SUCCESSFUL_MATCH_OUTPUT = "ARC"; // The string to output if CRITICAL_MATCH_STRING is found.
const DEFAULT_FALLBACK_OUTPUT = "ABC"; // The string to output if no match or invalid input.
const LINE_BREAK_DELIMITER = "\n"; // Character used to separate lines in the input stream.
const STDIN_FILE_PATH = '/dev/stdin'; // Standard input file path, common in competitive programming.

/**
 * Determines the final message to be displayed based on the content of a single line.
 * This function centralizes the core business logic of the application.
 *
 * @param {string | null | undefined} evaluationLine - The line of text to evaluate.
 * @returns {string} The result string, either `SUCCESSFUL_MATCH_OUTPUT` or `DEFAULT_FALLBACK_OUTPUT`.
 */
const decideOutputBasedOnContent = (evaluationLine) => {
    // Perform a robust check: ensure the line is a string and, after trimming,
    // matches the critical string exactly.
    const sanitizedLine = typeof evaluationLine === 'string' ? evaluationLine.trim() : '';

    if (sanitizedLine === CRITICAL_MATCH_STRING) {
        return SUCCESSFUL_MATCH_OUTPUT;
    } else {
        // If the line does not match the critical string, or if it was empty/invalid,
        // we return the default output.
        return DEFAULT_FALLBACK_OUTPUT;
    }
};

/**
 * Orchestrates the reading, parsing, and processing of the raw input data stream.
 * It includes comprehensive validation and error handling steps.
 *
 * @param {string | null | undefined} completeInputDataStream - The entire raw string content from the input source.
 */
const processStandardInputChallenge = (completeInputDataStream) => {
    // --- Phase 1: Input Validation and Initial Parsing ---
    // Validate that the provided input is a non-empty string.
    if (typeof completeInputDataStream !== 'string' || completeInputDataStream === null || completeInputDataStream.length === 0) {
        console.error("Error: Input data stream is either invalid, null, or empty. Cannot proceed.");
        console.log(DEFAULT_FALLBACK_OUTPUT); // Output default in case of critical input error.
        return; // Terminate execution for invalid input.
    }

    // Split the raw input into an array of individual lines using the defined delimiter.
    const parsedInputLines = completeInputDataStream.split(LINE_BREAK_DELIMITER);

    // Check if any lines were successfully extracted from the input.
    if (parsedInputLines.length === 0) {
        console.warn("Warning: No discernible lines were found in the input data stream.");
        console.log(DEFAULT_FALLBACK_OUTPUT); // Fallback to default output if no lines.
        return;
    }

    // --- Phase 2: Core Logic Application ---
    // Extract the very first line for primary evaluation.
    // The .trim() method removes any leading or trailing whitespace, ensuring accurate comparison.
    const targetLineForEvaluation = parsedInputLines[0].trim();

    // Delegate the decision-making process to the dedicated helper function.
    const finalResultToDisplay = decideOutputBasedOnContent(targetLineForEvaluation);

    // --- Phase 3: Output Generation ---
    // Print the determined result to the standard output.
    console.log(finalResultToDisplay);
};

// --- Program Entry Point: Self-Executing Anonymous Function ---
// This structure ensures that the program's execution begins immediately upon script load,
// handling file I/O and orchestrating the main processing flow.
(function initializeApplicationPipeline() {
    let rawFileContentBuffer; // Variable to temporarily hold content read from file system.
    let decodedStringContent = ''; // Variable to store the final UTF-8 decoded string.

    try {
        // Attempt to read the entire content of the standard input file synchronously.
        // The 'fs' module is a Node.js built-in, required for file system operations.
        rawFileContentBuffer = require('fs').readFileSync(STDIN_FILE_PATH);

        // Convert the raw buffer data into a human-readable UTF-8 string.
        decodedStringContent = rawFileContentBuffer.toString('utf8');

        // Pass the successfully read and decoded content to our main processing function.
        processStandardInputChallenge(decodedStringContent);

    } catch (fileSystemError) {
        // Catch any errors that occur during the file reading process (e.g., file not found, permissions).
        console.error(`Critical Runtime Error: Failed to access or read from standard input path (${STDIN_FILE_PATH}).`);
        console.error(`Details: ${fileSystemError.message}`);
        // Output the default message even in case of I/O failure, as per original functionality's spirit of always having an output.
        console.log(DEFAULT_FALLBACK_OUTPUT);
        // Exit the process with a non-zero status code to indicate an error to the operating system.
        process.exit(1);
    }
})();