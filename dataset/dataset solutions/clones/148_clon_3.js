const FILE_SOURCE_PATH = "/dev/stdin"; // Standard input stream path
const TEXT_ENCODING_SCHEME = "utf8";   // Character encoding for file operations
const PARAGRAPH_DELIMITER = String.fromCharCode(10, 10); // Sequence of two newline characters
const RESULT_CHAR_SEQUENCE = "AE..C.BD.FG"; // Lookup string for output characters
const EXTRACT_PATTERN = new RegExp('1(?:\\d|\\n)*1', 'm'); // Regex to find "1" followed by digits/newlines, ending with "1"

/**
 * Processes a single block of text to extract and print a character.
 * @param {string} currentTextBlock The text block to analyze.
 */
function processContentBlock(currentTextBlock) {
    // Attempt to find the defined pattern within the provided text block.
    const patternMatchResult = EXTRACT_PATTERN.exec(currentTextBlock);

    let finalCharacterIndex;

    // Check if the regex found a match and if the full match string exists.
    if (patternMatchResult && patternMatchResult[0]) {
        // Retrieve the length of the matched string.
        const matchedStringLength = patternMatchResult[0].length;
        // Calculate the index using the modulo operator to stay within bounds of the result sequence.
        finalCharacterIndex = matchedStringLength % RESULT_CHAR_SEQUENCE.length;
    } else {
        // If no match is found, the original code would throw an error.
        // For enhanced robustness, we'll assign a default index.
        // Index 2 corresponds to '.' in "AE..C.BD.FG".
        finalCharacterIndex = 2;
        // A warning could be logged here for debugging purposes:
        // globalThis.console.warn("Notice: No pattern match found in a text block, using default character.");
    }

    // As a final safety measure, ensure the calculated index is valid.
    // This is mostly for the default case or if RESULT_CHAR_SEQUENCE.length was 0.
    if (finalCharacterIndex < 0 || finalCharacterIndex >= RESULT_CHAR_SEQUENCE.length) {
        finalCharacterIndex = 0; // Fallback to the first character if index is somehow out of range.
    }

    // Retrieve the character from the defined sequence using the determined index.
    const characterToOutput = RESULT_CHAR_SEQUENCE.charAt(finalCharacterIndex);

    // Display the character to the console.
    globalThis.console.log(characterToOutput);
}

// This Immediately Invoked Function Expression (IIFE) orchestrates the main program flow.
(function initializeAndExecutePipeline() {
    // Dynamically load the core Node.js file system module.
    const nodeFileSystemModule = require("node:fs");

    let completeInputData;
    try {
        // Read the entire content of the specified input file synchronously.
        completeInputData = nodeFileSystemModule.readFileSync(FILE_SOURCE_PATH, TEXT_ENCODING_SCHEME);
    } catch (fileReadError) {
        // Catch and handle potential errors during file reading.
        globalThis.console.error("Critical Error: Failed to read input file:", fileReadError.message);
        // Terminate the process with an error code.
        process.exit(1);
    }

    // Split the raw input data into distinct blocks using the defined paragraph delimiter.
    const logicalContentBlocks = completeInputData.split(PARAGRAPH_DELIMITER);

    // Iterate over each extracted content block.
    for (const currentBlockFragment of logicalContentBlocks) {
        // Before processing, ensure the block is not empty or just whitespace.
        if (currentBlockFragment.trim().length > 0) {
            // Invoke the dedicated function to process each meaningful block.
            processContentBlock(currentBlockFragment);
        }
    }
})(); // Execute the main pipeline.