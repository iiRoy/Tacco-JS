const fileSystemModule = require('fs');

// Define constants for file system interaction and data processing parameters.
// Using constants improves readability and makes the code easier to modify.
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';
const FILE_READ_ENCODING_TYPE = 'utf8';
const NEWLINE_SEPARATOR = '\n';
const WORD_TOKEN_SEPARATOR = ' ';

/**
 * Orchestrates the process of reading input, extracting a specific line,
 * reversing its word tokens, and preparing the final output string.
 * This function encapsulates the core business logic.
 *
 * @param {string} entireInputContent - The full content read from the input source as a single string.
 * @returns {string} The processed string with the second line's tokens reversed,
 *                   or an informational message if input conditions are not met.
 */
function processAndTransformInputLine(entireInputContent) {
    // Step 1: Divide the monolithic input string into an array of individual lines.
    // Each element in `parsedLines` corresponds to a single line from the input.
    const parsedLines = entireInputContent.split(NEWLINE_SEPARATOR);

    // Step 2: Implement a guard clause to ensure the input contains at least two lines.
    // The problem specifies processing the second line, so less than two lines is an invalid state.
    if (parsedLines.length < 2) {
        // Return an explicit error message instead of crashing or returning undefined.
        return "Error: The provided input stream does not contain enough lines. At least two lines are required.";
    }

    // Step 3: Isolate the second line of the input for further processing.
    // Array indices are zero-based, so the second line is at index 1.
    const targetLineForProcessing = parsedLines[1];

    // Step 4: Tokenize the selected line by splitting it into an array of "words" or "tokens".
    // The tokens are separated by the defined `WORD_TOKEN_SEPARATOR` (a space).
    const individualWordTokens = targetLineForProcessing.split(WORD_TOKEN_SEPARATOR);

    // Step 5: Create a reversed version of the word tokens.
    // We create a shallow copy using the spread operator (`...`) before calling `reverse()`
    // to ensure the original `individualWordTokens` array remains unmodified, if it were to be used elsewhere.
    const reversedSequenceOfTokens = [...individualWordTokens].reverse();

    // Step 6: Join the reversed tokens back into a single string.
    // The tokens are re-concatenated using the same `WORD_TOKEN_SEPARATOR`.
    const finalFormattedOutput = reversedSequenceOfTokens.join(WORD_TOKEN_SEPARATOR);

    // Return the result of the transformation.
    return finalFormattedOutput;
}

// Main execution block:
// This block handles file I/O and error management, then calls the processing function.
try {
    // Attempt to read the entire content from the standard input file synchronously.
    // This is the primary data acquisition step.
    const fullSourceDataString = fileSystemModule.readFileSync(STANDARD_INPUT_FILE_PATH, FILE_READ_ENCODING_TYPE);

    // Pass the raw input string to our dedicated processing function.
    const processedResultString = processAndTransformInputLine(fullSourceDataString);

    // Output the final generated string to the standard console.
    console.log(processedResultString);

} catch (executionIssue) {
    // Catch and report any errors that might occur during file reading or subsequent processing.
    // This provides robust error handling for unexpected situations (e.g., file not found, permission issues).
    console.error("An unexpected issue arose during the program's execution:", executionIssue.message);
    // Optionally, exit the process with an error code to signal failure to the operating system.
    // process.exit(1);
}