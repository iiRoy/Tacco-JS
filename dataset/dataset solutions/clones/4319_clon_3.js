// This JavaScript module is designed to process textual data from a specified input source.
// Its primary function is to analyze the first line of the input for occurrences of a particular character.

/**
 * Utility function to securely read the entire content of a file.
 * This is an abstraction over Node.js file system operations.
 * @param {string} sourcePath - The absolute or relative path to the file.
 * @returns {string} The full content of the file, decoded as UTF-8.
 * @throws {Error} If the file cannot be accessed or read for any reason.
 */
const obtainFileContents = (sourcePath) => {
    try {
        // Leveraging the Node.js 'fs' module for synchronous file reading.
        // This blocks execution until the file content is fully loaded into memory.
        return require('fs').readFileSync(sourcePath, 'utf8');
    } catch (ioError) {
        // In case of any I/O error (e.g., file not found, permission denied),
        // we log the error details and re-throw a more descriptive error.
        console.error(`ERROR: Unable to read from specified path '${sourcePath}'. Details: ${ioError.message}`);
        throw new Error(`Critical input data acquisition failure: ${ioError.message}`);
    }
};

/**
 * A dedicated function to present the final computed numerical outcome.
 * This ensures consistent output formatting.
 * @param {number} computedValue - The integer result to be displayed to the user.
 */
const presentResult = (computedValue) => {
    // Explicitly converting the number to a string before logging,
    // although `console.log` handles this implicitly, it adds clarity.
    console.log(String(computedValue));
};

/**
 * The primary execution flow of the application.
 * It takes raw string input, processes it, and then outputs a specific count.
 * @param {string} unprocessedInputString - The raw string content obtained from the input source.
 */
const orchestrateProcessing = (unprocessedInputString) => {
    // Define the specific character we are interested in counting within the input.
    const KEY_CHARACTER_TO_FIND = '1';
    // Initialize a accumulator variable to keep track of the count.
    let foundKeyCharacterOccurrences = 0;

    // --- Robust Input Validation and Initial Transformation ---

    // First, check if any input content was actually provided and if it's of the expected type.
    if (!unprocessedInputString || typeof unprocessedInputString !== 'string') {
        console.warn("WARNING: No valid string input was supplied for processing. Defaulting count to zero.");
        presentResult(0); // If no input, the count is inherently zero.
        return; // Terminate execution gracefully.
    }

    // Clean the input: remove any leading or trailing whitespace from the entire block,
    // then split it into an array of strings, where each string represents a line.
    const refinedInputLines = unprocessedInputString.trim().split('\n');

    // Verify that the input contained at least one meaningful line after cleaning.
    if (refinedInputLines.length === 0) {
        console.warn("WARNING: Input content became empty after trimming and splitting by newline. No lines to analyze.");
        presentResult(0); // No lines means no characters to count.
        return;
    }

    // According to the problem specification, we are only concerned with the first line.
    const primaryDataLine = refinedInputLines[0];

    // Transform the selected line into an array of individual characters.
    // This facilitates character-by-character iteration.
    const individualCharactersOfLine = primaryDataLine.split('');

    // A final check to ensure the primary line itself wasn't empty after conversion.
    if (individualCharactersOfLine.length === 0) {
        console.warn("WARNING: The primary input line was empty. No characters available for counting.");
        presentResult(0); // An empty line contains no target characters.
        return;
    }

    // --- Core Logic: Iterative Character Counting ---

    // Iterate over each character present in the `individualCharactersOfLine` array.
    // This explicit loop replaces more concise functional approaches like `filter().length`
    // to demonstrate an alternative, more verbose implementation.
    for (const currentCharacter of individualCharactersOfLine) {
        // Compare the current character with our predefined `KEY_CHARACTER_TO_FIND`.
        if (currentCharacter === KEY_CHARACTER_TO_FIND) {
            // If a match is found, increment our counter.
            foundKeyCharacterOccurrences++;
        }
    }

    // --- Outputting the Final Result ---

    // After iterating through all relevant characters, pass the accumulated count
    // to our dedicated function for displaying results.
    presentResult(foundKeyCharacterOccurrences);
};

// --- Application Entry Point and Environment Setup ---

// Define the standard input stream path, common in Unix-like environments for competitive programming.
const STANDARD_INPUT_STREAM_PATH = '/dev/stdin';

let programExecutionInput; // Variable to hold the content read from the file.

// Encapsulate the file reading operation within a try-catch block
// to handle potential file system errors gracefully at the top level.
try {
    programExecutionInput = obtainFileContents(STANDARD_INPUT_STREAM_PATH);
} catch (executionError) {
    // If file reading fails, log a critical error message and terminate the process
    // with a non-zero exit code, indicating an abnormal termination.
    console.error("FATAL ERROR: Program could not proceed due to an unrecoverable input error.");
    process.exit(1); // Exit code 1 typically signifies an error.
}

// If input was successfully retrieved, proceed with the main processing logic.
orchestrateProcessing(programExecutionInput);