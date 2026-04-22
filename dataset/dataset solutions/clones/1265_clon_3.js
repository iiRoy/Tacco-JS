// This script's purpose is to generate and display rectangular character grids
// based on dimensions provided via standard input.
// It expects input lines formatted as "HEIGHT WIDTH".
// The program will continue processing lines until it encounters "0 0", at which point it gracefully terminates.

// A global control flag to manage the overall execution state.
// When set to 'false', no further input lines will be processed.
let continueProcessing = true;

// --- Core Pattern String Generation ---

// Define the two alternating characters that will form our base pattern.
const primaryPatternChar = '#';
const secondaryPatternChar = '.';

// Specify the desired total length for the extensive repeating pattern string.
// This length corresponds to the capacity of the original 'col' buffer.
const totalPatternStringLength = 300;

// Dynamically construct the full, repeating pattern string.
// This loop builds a string where characters alternate (e.g., "#.#.#.#...")
// for the entire specified length. This differs from the original's
// small buffer repetition but achieves a similar alternating character sequence.
let generatedFullPattern = '';
for (let charIndex = 0; charIndex < totalPatternStringLength; ++charIndex) {
    if (charIndex % 2 === 0) {
        generatedFullPattern += primaryPatternChar;
    } else {
        generatedFullPattern += secondaryPatternChar;
    }
}

// --- Input Acquisition and Orchestration ---

// Import the Node.js file system module for reading input.
const fileSystemAccessor = require('fs');

try {
    // Read all available input from standard input (file descriptor 0) as a UTF-8 string.
    // Using 'utf8' is generally more robust than 'ascii'.
    const rawInputData = fileSystemAccessor.readFileSync(0, 'utf8');

    // Process the raw input: split it into lines, remove leading/trailing whitespace
    // from each line, and then filter out any resulting empty lines.
    const cleanedInputLines = rawInputData
        .split('\n')
        .map(segment => segment.trim())
        .filter(segment => segment.length > 0);

    // Iterate through the array of cleaned input lines.
    // A 'while' loop is used here for flow control, as opposed to 'forEach',
    // allowing for early termination based on the 'continueProcessing' flag.
    let currentLinePointer = 0;
    while (currentLinePointer < cleanedInputLines.length && continueProcessing) {
        processInputSegment(cleanedInputLines[currentLinePointer]);
        currentLinePointer++; // Move to the next input line.
    }

} catch (inputReadError) {
    // If an error occurs during the input reading phase, log it and exit.
    console.error("An unrecoverable error occurred while attempting to read input:", inputReadError.message);
    process.exit(1); // Terminate the process with an error code.
}


// --- Main Input Line Processing Function ---

/**
 * Handles the parsing and validation of a single input line, then delegates grid rendering.
 * @param {string} currentInputSegment - The raw string segment read from input (e.g., "5 10").
 */
function processInputSegment(currentInputSegment) {
    // If the global termination flag has been set, cease all further processing.
    if (!continueProcessing) {
        return;
    }

    // Define the specific string that signals the end of input.
    const terminationCommand = '0 0';
    if (currentInputSegment === terminationCommand) {
        continueProcessing = false; // Update the global flag to stop processing subsequent lines.
        return;
    }

    // Basic validation: ensure the input is a non-empty string and contains a space
    // to separate the two expected dimension values.
    if (typeof currentInputSegment !== 'string' || currentInputSegment.length === 0 || !currentInputSegment.includes(' ')) {
        console.warn(`Warning: Skipping input line "${currentInputSegment}" due to invalid format. Expected "H W".`);
        return;
    }

    // Attempt to parse the height and width from the input string.
    // The 'Number' constructor is used to convert string parts to numerical values.
    const parsedDimensions = currentInputSegment.split(' ').map(Number);

    // Comprehensive validation for the parsed numerical dimensions:
    // 1. Ensure exactly two numbers were parsed.
    // 2. Check that both parsed values are actual numbers (not NaN).
    // 3. Verify that both dimensions are non-negative.
    if (parsedDimensions.length !== 2 || parsedDimensions.some(isNaN) || parsedDimensions.some(dim => dim < 0)) {
        console.warn(`Warning: Input "${currentInputSegment}" contains invalid or negative numeric dimensions. Skipping.`);
        return;
    }

    const requestedHeight = parsedDimensions[0];
    const requestedWidth = parsedDimensions[1];

    // If the requested width is zero or negative, a meaningful pattern cannot be displayed.
    // Print a newline for separation (consistent with original behavior) and then return.
    if (requestedWidth <= 0) {
        console.log();
        return;
    }

    // Extract the specific pattern segments required for the current grid width.
    // The "first row" pattern starts from the beginning of the full pattern.
    const patternForFirstRows = generatedFullPattern.substring(0, requestedWidth);
    // The "alternate row" pattern starts one character into the full pattern.
    const patternForAlternateRows = generatedFullPattern.substring(1, requestedWidth + 1);

    // Delegate the actual printing of the grid to a dedicated rendering function.
    renderAlternatingGrid(requestedHeight, patternForFirstRows, patternForAlternateRows);

    // Output an empty line after each grid to separate outputs, as per original specification.
    console.log();
}

// --- Grid Display Utility Function ---

/**
 * Outputs an alternating pattern grid to the console.
 * @param {number} totalRows - The total number of rows to be printed.
 * @param {string} firstRowContent - The pattern string to use for even-indexed rows (0, 2, 4...).
 * @param {string} secondRowContent - The pattern string to use for odd-indexed rows (1, 3, 5...).
 */
function renderAlternatingGrid(totalRows, firstRowContent, secondRowContent) {
    // If no rows are specified (or a negative number), there's nothing to render.
    // This serves as an early exit guard clause.
    if (totalRows <= 0) {
        return;
    }

    // Loop through each row index to determine which pattern to print.
    for (let currentRowIndex = 0; currentRowIndex < totalRows; ++currentRowIndex) {
        // A ternary operator provides a concise way to select the appropriate pattern.
        const outputLine = (currentRowIndex % 2 === 0)
            ? firstRowContent  // For even-indexed rows
            : secondRowContent; // For odd-indexed rows

        console.log(outputLine);
    }
}