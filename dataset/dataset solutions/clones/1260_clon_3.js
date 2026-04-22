// Module for file system operations.
const fileSystemModule = require('fs');

// Path to the standard input stream, typically used in competitive programming environments.
const standardInputPath = '/dev/stdin';

/**
 * Retrieves raw text content from a specified file path.
 * This function handles file reading and basic error reporting.
 *
 * @param {string} filePath - The absolute or relative path to the file to be read.
 * @returns {string} The content of the file as a UTF-8 encoded string. Returns an empty string on error.
 */
const retrieveRawInputContent = (filePath) => {
    try {
        return fileSystemModule.readFileSync(filePath, 'utf8');
    } catch (error) {
        // Log a warning if the file cannot be read, but allow the program to continue.
        // In a production system, this might warrant throwing the error or exiting.
        console.error(`Warning: Failed to read input from '${filePath}': ${error.message}`);
        return ''; // Return an empty string to prevent further processing with invalid data.
    }
};

/**
 * Generates a string by repeating a given character a specified number of times.
 * This is a utility function to simplify string construction.
 *
 * @param {number} count - The number of times the character should be repeated. Must be non-negative.
 * @param {string} character - The single character (or string) to repeat.
 * @returns {string} The resulting repeated string. Returns an empty string if count is invalid.
 */
const generateRepeatedString = (count, character) => {
    // Ensure the count is a valid non-negative integer before attempting repetition.
    const effectiveCount = Math.max(0, Math.floor(count));
    // Utilize the built-in String.prototype.repeat() method for efficient string generation.
    return character.repeat(effectiveCount);
};

// The main execution routine, wrapped in an Immediately Invoked Function Expression (IIFE)
// to encapsulate variables and prevent global scope pollution.
(() => {
    // Obtain the complete raw input data from the standard input stream.
    const rawInputData = retrieveRawInputContent(standardInputPath);

    // Split the raw input into an array of individual lines.
    // The .filter() method is used to remove any empty lines that might occur due to
    // multiple consecutive newlines or a trailing newline at the end of the input.
    const inputLineSegments = rawInputData.split("\n").filter(segment => segment.trim() !== '');

    // Initialize a mutable string buffer that will accumulate all the generated rectangle blocks.
    let compiledOutputBuffer = '';

    // Initialize a numerical index to track the current line being processed from the input array.
    let currentProcessingIndex = 0;

    // Begin an infinite loop to process input lines until a specific termination condition is met.
    while (true) {
        // Check if the current index has exceeded the bounds of the input line segments array.
        if (currentProcessingIndex >= inputLineSegments.length) {
            // If all lines have been processed, exit the loop.
            break;
        }

        // Retrieve the current line segment to be parsed.
        const activeLineSegment = inputLineSegments[currentProcessingIndex];

        // Split the current line segment by a space character to extract potential dimension tokens.
        const dimensionTokens = activeLineSegment.split(" ");

        // Implement a guard clause to validate the format of the input line.
        // We expect exactly two numerical tokens for height and width.
        if (dimensionTokens.length !== 2) {
            console.warn(`Skipping malformed input line (expected two numbers separated by space): "${activeLineSegment}"`);
            currentProcessingIndex++; // Advance to the next line.
            continue; // Proceed to the next iteration of the loop, skipping this invalid line.
        }

        // Attempt to parse the first token as the rectangle's height and the second as its width.
        // parseInt() with radix 10 is used for robust integer conversion.
        const parsedHeightValue = parseInt(dimensionTokens[0], 10);
        const parsedWidthValue = parseInt(dimensionTokens[1], 10);

        // Another guard clause to validate that the parsed values are indeed valid numbers.
        if (isNaN(parsedHeightValue) || isNaN(parsedWidthValue)) {
            console.warn(`Skipping input line with non-numeric dimensions: "${activeLineSegment}"`);
            currentProcessingIndex++; // Advance to the next line.
            continue; // Proceed to the next iteration.
        }

        // Check for the designated termination condition: both height and width are zero.
        if (parsedHeightValue === 0 && parsedWidthValue === 0) {
            // If the sentinel values are found, terminate the processing loop.
            break;
        }

        // Construct a single horizontal row of asterisks based on the parsed width.
        // A newline character is appended to ensure each row occupies its own line.
        const asteriskRowPattern = generateRepeatedString(parsedWidthValue, '*') + '\n';

        // Initialize a temporary string to build the current rectangle block.
        let currentRectangleVisualization = '';
        // Loop 'heightValue' times to append the asterisk row pattern, forming the full rectangle.
        for (let rowCounter = 0; rowCounter < parsedHeightValue; rowCounter++) {
            currentRectangleVisualization += asteriskRowPattern;
        }

        // Append the fully constructed rectangle visualization to the main output buffer.
        compiledOutputBuffer += currentRectangleVisualization;

        // Add an additional blank line after each rectangle block for clear visual separation.
        // This replicates the original script's behavior of adding an extra newline between blocks.
        compiledOutputBuffer += '\n';

        // Increment the processing index to move to the next line segment for the subsequent iteration.
        currentProcessingIndex++;
    }

    // After processing all relevant input lines, print the entire accumulated output
    // to the standard output stream (console).
    console.log(compiledOutputBuffer);
})();