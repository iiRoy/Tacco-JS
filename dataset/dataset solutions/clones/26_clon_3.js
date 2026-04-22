const NEWLINE_CHARACTER_CONSTANT = '\n';

// Utility module for file system operations.
const fileHandlingModule = require('fs');

/**
 * Reverses the order of characters within a given string.
 * This function handles empty or non-string inputs gracefully by returning an empty string.
 * @param {string} sourceString - The string to be reversed.
 * @returns {string} The reversed string, or an empty string if input is invalid.
 */
function obtainReversedSequence(sourceString) {
    if (typeof sourceString !== 'string' || sourceString.length === 0) {
        return ''; // Return an empty string for invalid or empty input.
    }

    let characterStack = []; // Use an array to build the reversed string.
    // Iterate through the input string from the last character to the first.
    for (let charIndex = sourceString.length - 1; charIndex >= 0; charIndex--) {
        characterStack.push(sourceString[charIndex]);
    }
    // Join the characters in the array to form the final reversed string.
    return characterStack.join('');
}

// Main execution pathway for the script.
try {
    // Synchronously read all available data from the standard input stream.
    // File descriptor `0` typically refers to stdin in Unix-like systems, accessible via Node's `fs` module.
    const completeStreamData = fileHandlingModule.readFileSync(0, 'utf8');

    // Implement a preliminary check to ensure that the standard input stream was not entirely empty.
    if (!completeStreamData || completeStreamData.trim().length === 0) {
        console.error("Error: Standard input stream provided no content for processing. Exiting.");
        process.exit(1); // Terminate with an error code.
    }

    // Divide the entire input content into an array of distinct lines, using the defined newline constant.
    const parsedInputLines = completeStreamData.split(NEWLINE_CHARACTER_CONSTANT);

    // Validate that the splitting operation resulted in at least one line.
    if (parsedInputLines.length === 0) {
        console.error("Warning: Input content did not contain any discernible lines. Exiting gracefully with no output.");
        process.exit(0); // Exit successfully if no lines were found (e.g., empty file).
    }

    // Extract the very first line from the array of parsed lines.
    // It's good practice to trim whitespace from the start/end of the line.
    let targetLineForProcessing = parsedInputLines[0].trim();

    // Provide a warning if the primary line selected for reversal is empty after trimming.
    if (targetLineForProcessing.length === 0) {
        console.warn("Notice: The first line of input was empty or contained only whitespace after trimming. Reversing an empty string.");
        // The logic will proceed to reverse an empty string, resulting in an empty string output.
    }

    // Apply the custom string reversal function to the designated line.
    const finalProcessedOutput = obtainReversedSequence(targetLineForProcessing);

    // Print the result of the reversal operation to the standard output.
    console.log(finalProcessedOutput);

} catch (runtimeException) {
    // Catch and report any exceptions that may occur during the file reading or data processing.
    console.error(`A critical error occurred during script execution: ${runtimeException.message}`);
    process.exit(1); // Indicate a failure to the operating system.
}