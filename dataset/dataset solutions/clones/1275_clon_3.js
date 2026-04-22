// A module reference for file system operations in Node.js environments.
const fileSystemModule = require('fs');

// Define constants for common string literals to improve readability and maintainability.
const NEWLINE_DELIMITER = '\n';
const WORD_DELIMITER = ' ';
const STANDARD_INPUT_PATH = '/dev/stdin';
const TEXT_ENCODING_FORMAT = 'utf8';

// Function to safely retrieve raw text content from a specified source.
const acquireSourceContent = () => {
    try {
        // Synchronously read the entire content of the standard input file.
        // Using 'utf8' ensures proper handling of text characters.
        return fileSystemModule.readFileSync(STANDARD_INPUT_PATH, TEXT_ENCODING_FORMAT);
    } catch (readError) {
        // Log an error if file reading fails and return an empty string to prevent further issues.
        console.error(`Problem encountered while reading input: ${readError.message}`);
        return '';
    }
};

// Main execution block wrapped in an immediately invoked function expression (IIFE)
// for scope isolation and immediate execution.
(() => {
    // Obtain the raw content from the input stream.
    let rawInputContent = acquireSourceContent();

    // Perform an initial check to ensure some content was actually read.
    if (!rawInputContent || rawInputContent.trim().length === 0) {
        console.log(""); // Output an empty line if no content or only whitespace was provided.
        return; // Terminate execution if input is empty.
    }

    // Split the entire content into an array of distinct lines.
    // Each element in this array corresponds to one line from the input.
    const allTextLines = rawInputContent.split(NEWLINE_DELIMITER);

    // The problem statement implies we are interested in the second line of input.
    // Array indices are 0-based, so the second line is at index 1.
    const RELEVANT_LINE_INDEX = 1;

    // Validate if the input actually contains the required number of lines.
    if (allTextLines.length <= RELEVANT_LINE_INDEX) {
        console.error(`Error: Input stream contains fewer than ${RELEVANT_LINE_INDEX + 1} lines.`);
        console.log(""); // Output an empty line as a default if the target line is missing.
        return;
    }

    // Extract the specific line that needs processing.
    let targetLineData = allTextLines[RELEVANT_LINE_INDEX];

    // Trim any leading or trailing whitespace from the target line for cleaner processing.
    targetLineData = targetLineData.trim();

    // If the target line is empty after trimming, there are no words to reverse.
    if (targetLineData.length === 0) {
        console.log(""); // Output an empty line.
        return;
    }

    // Break the target line into an array of individual word tokens.
    // Multiple spaces will result in empty strings in the array, which need to be filtered.
    const originalWordTokens = targetLineData.split(WORD_DELIMITER).filter(token => token.length > 0);

    // If, after splitting and filtering, no valid word tokens remain, output an empty line.
    if (originalWordTokens.length === 0) {
        console.log("");
        return;
    }

    // Create a new array to store the words in reversed order.
    // This approach avoids direct mutation of the 'originalWordTokens' array.
    const finalReversedOrder = [];
    const totalTokens = originalWordTokens.length;

    // Iterate through the original tokens from the last element to the first.
    // This effectively reverses the order of elements.
    for (let i = totalTokens - 1; i >= 0; i--) {
        finalReversedOrder.push(originalWordTokens[i]);
    }

    // Join the reversed word tokens back into a single string,
    // using a space as the separator between words.
    const resultantOutputString = finalReversedOrder.join(WORD_DELIMITER);

    // Display the final processed string to the standard output.
    console.log(resultantOutputString);

})(); // End of the IIFE.