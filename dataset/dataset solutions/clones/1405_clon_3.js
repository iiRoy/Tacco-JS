const FILE_SYSTEM_MODULE = require('fs'); // Alias the 'fs' module for a Type II change

// Define constants for configuration and clarity, enhancing readability (Type II & III)
const INPUT_FILE_PATH = '/dev/stdin';
const TEXT_ENCODING_STANDARD = 'utf8';
const END_OF_INPUT_SIGNAL = '0 0';
const FILL_CHARACTER = '#';
const LINE_BREAK_CHAR = '\n';
const SECTION_DIVIDER = LINE_BREAK_CHAR + LINE_BREAK_CHAR; // Double newline between sections

/**
 * Reads raw content from a specified file path using a given encoding.
 * @param {string} path - The path to the file.
 * @param {string} encoding - The character encoding for reading the file.
 * @returns {string} The raw content of the file.
 */
const retrieveRawInputContent = (path, encoding) => {
    // This is a fundamental I/O operation, so significant changes are limited
    // without altering core functionality or introducing external libraries.
    return FILE_SYSTEM_MODULE.readFileSync(path, encoding);
};

/**
 * Processes raw input text into an array of individual lines, stripping overall whitespace.
 * @param {string} rawText - The raw input text.
 * @returns {string[]} An array where each element is a line from the input.
 */
const segmentInputIntoLines = (rawText) => {
    // Remove leading/trailing whitespace from the entire input before splitting (Type II)
    const cleanedText = rawText.trim();
    return cleanedText.split(LINE_BREAK_CHAR);
};

/**
 * Parses a string containing two space-separated numbers into an array of integers.
 * @param {string} dimensionDescriptor - A string like "R C" where R is rows and C is columns.
 * @returns {number[]} An array [rows, columns]. Returns [0, 0] for invalid input.
 */
const extractNumericParameters = (dimensionDescriptor) => {
    // Added a guard clause for robustness (Type III)
    if (typeof dimensionDescriptor !== 'string' || !dimensionDescriptor.includes(' ')) {
        // Log an error or handle invalid format gracefully
        console.error(`Warning: Invalid dimension descriptor format encountered: "${dimensionDescriptor}". Skipping.`);
        return [0, 0];
    }
    // Using parseInt with radix for explicit number conversion (Type II)
    return dimensionDescriptor.split(' ').map(val => parseInt(val, 10));
};

/**
 * Generates a string consisting of a repeated character a specified number of times.
 * @param {string} charToRepeat - The character to be repeated.
 * @param {number} repeatCount - The number of times to repeat the character.
 * @returns {string} The resulting string of repeated characters.
 */
const createRepeatedCharacterString = (charToRepeat, repeatCount) => {
    // Rewritten to use a loop instead of Array.prototype.join for Type III variation
    if (repeatCount <= 0) {
        return '';
    }
    let constructedString = '';
    for (let i = 0; i < repeatCount; i++) {
        constructedString += charToRepeat;
    }
    return constructedString;
};

/**
 * Main function to process input and render geometric patterns.
 * Encapsulates the entire logic for better organization (Type III).
 */
const processAndRenderPatterns = () => {
    const fullInputContent = retrieveRawInputContent(INPUT_FILE_PATH, TEXT_ENCODING_STANDARD);
    const availableInputSegments = segmentInputIntoLines(fullInputContent);

    // Use an array to accumulate generated blocks, then join them later (Type III update)
    const renderedPatternBlocks = [];
    let currentSegmentIndex = 0; // Managing index explicitly instead of array.shift() (Type III update)

    // Iterate through input segments (Type III: while loop with index instead of while(true) + shift)
    while (currentSegmentIndex < availableInputSegments.length) {
        const segmentData = availableInputSegments[currentSegmentIndex];
        currentSegmentIndex++; // Advance to the next segment for the subsequent iteration

        // Immediate termination check as a guard clause (Type III addition)
        if (segmentData === END_OF_INPUT_SIGNAL) {
            break;
        }

        // Skip empty or invalid lines (Type III addition: robustness guard)
        if (!segmentData || segmentData.trim() === '') {
            continue;
        }

        const numericParameters = extractNumericParameters(segmentData);
        // Destructuring assignment for clearer variable names (Type II)
        const [numberOfRows, numberOfColumns] = numericParameters;

        // Basic validation for parameters (Type III addition: guard clause)
        if (numberOfRows <= 0 || numberOfColumns <= 0) {
            // If dimensions are non-positive, skip this pattern
            continue;
        }

        // Generate a single row of the fill character
        const singleHashRow = createRepeatedCharacterString(FILL_CHARACTER, numberOfColumns);

        // Build the current rectangle block using a loop (Type III update/rewrite)
        let currentRectangleOutput = '';
        for (let rowCounter = 0; rowCounter < numberOfRows; rowCounter++) {
            currentRectangleOutput += singleHashRow;
            // Add a line break after each row, but not after the very last row of the block
            if (rowCounter < numberOfRows - 1) {
                currentRectangleOutput += LINE_BREAK_CHAR;
            }
        }
        
        // Add the completed rectangle block to our collection
        renderedPatternBlocks.push(currentRectangleOutput);
    }

    // Join all collected blocks with the defined section divider (Type III update)
    // This implicitly handles the final trimming from the original code.
    const finalDisplayOutput = renderedPatternBlocks.join(SECTION_DIVIDER);

    // Output the final generated string to the console
    console.log(finalDisplayOutput);
};

// Execute the primary function to start the pattern generation process
processAndRenderPatterns();