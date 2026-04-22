const fileSystemAccess = require('fs');

// Define constants for file paths, delimiters, and special values to improve readability and maintainability.
const STANDARD_INPUT_DEVICE = '/dev/stdin';
const LINE_TERMINATION_CHARACTER = '\n';
const VALUE_DELIMITER_SPACE = ' ';
const PATTERN_FILL_SYMBOL = '#';
const EXIT_CONDITION_STRING = '0 0';

/**
 * Main function to process input and generate the patterned output.
 * This function reads from stdin, parses dimensions, and constructs
 * a string of hash patterns based on the given specifications.
 */
function generatePatternedOutput() {
    let rawInputContent;
    try {
        // Attempt to read the entire content from the standard input synchronously.
        rawInputContent = fileSystemAccess.readFileSync(STANDARD_INPUT_DEVICE, 'utf8');
    } catch (readError) {
        console.error('Error reading from standard input:', readError.message);
        process.exit(1); // Exit with an error code if input cannot be read
    }

    // Process the raw input: trim leading/trailing whitespace and split into individual lines.
    let availableInputLines = rawInputContent.trim().split(LINE_TERMINATION_CHARACTER);

    // Initialize an empty string buffer to accumulate all generated patterns.
    let accumulatedOutputBuffer = '';

    // Iterate through the input lines. We use a while loop with shift() to consume lines
    // and stop when the termination condition is met or all lines are processed.
    while (availableInputLines.length > 0) {
        const currentInputLine = availableInputLines.shift(); // Get the next line and remove it from the array.

        // Check for the specific termination sequence.
        if (currentInputLine === EXIT_CONDITION_STRING) {
            break; // Exit the loop if the termination signal is found.
        }

        // Skip any lines that are empty or contain only whitespace.
        if (!currentInputLine || currentInputLine.trim().length === 0) {
            // Optionally, log a warning for skipped empty lines.
            // console.warn('Skipping an empty or whitespace input line.');
            continue;
        }

        // Split the current line by the space delimiter to get dimension strings.
        const dimensionTokens = currentInputLine.split(VALUE_DELIMITER_SPACE);

        // Validate that exactly two dimension tokens were provided.
        if (dimensionTokens.length !== 2) {
            console.error(`Input format error: Expected two dimensions, but found ${dimensionTokens.length} in line "${currentInputLine}". Skipping.`);
            continue; // Skip malformed lines.
        }

        // Convert string tokens to numeric values.
        const numRows = Number(dimensionTokens[0]);
        const numCols = Number(dimensionTokens[1]);

        // Validate that the converted dimensions are valid non-negative integers.
        if (isNaN(numRows) || isNaN(numCols) || numRows < 0 || numCols < 0) {
            console.error(`Data validation error: Invalid dimension values (${dimensionTokens[0]}, ${dimensionTokens[1]}) in line "${currentInputLine}". Dimensions must be non-negative numbers. Skipping.`);
            continue; // Skip lines with invalid numeric dimensions.
        }

        // Construct a single row of the pattern.
        let singlePatternRow = '';
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            singlePatternRow += PATTERN_FILL_SYMBOL;
        }
        singlePatternRow += LINE_TERMINATION_CHARACTER; // Each row ends with a newline.

        // Construct the full block pattern by repeating the single row.
        let currentBlockPattern = '';
        for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
            currentBlockPattern += singlePatternRow;
        }

        // Append the generated block pattern to the main output buffer.
        accumulatedOutputBuffer += currentBlockPattern;
        // Add an additional newline character to separate blocks as per original logic.
        accumulatedOutputBuffer += LINE_TERMINATION_CHARACTER;
    }

    // Output the final accumulated string to the console.
    console.log(accumulatedOutputBuffer);
}

// Execute the main function to start processing.
generatePatternedOutput();