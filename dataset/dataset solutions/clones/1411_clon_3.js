/**
 * This JavaScript module processes input from standard input to generate
 * and display checkerboard patterns based on provided dimensions.
 *
 * The input format expects pairs of positive integers (height width) on separate lines.
 * Processing continues until a line with "0 0" is encountered, which acts as a termination signal.
 * Invalid dimension lines are skipped with a warning.
 *
 * This code is a Type III clone, featuring extensive renaming, structural
 * modifications, additional helper functions, input validation, and enhanced
 * error handling compared to the original.
 */

/**
 * Parses a string containing two space-separated integers into height and width.
 * Provides validation to ensure the dimensions are positive integers.
 *
 * @param {string} dimensionDescriptor - The input string, e.g., "5 8".
 * @returns {{rowCount: number, colCount: number} | null} An object with
 *   `rowCount` and `colCount` if parsing is successful and values are valid,
 *   otherwise `null`.
 */
const extractGridDimensions = (dimensionDescriptor) => {
    // Clean the input string and split it by one or more whitespace characters.
    const dimensionParts = dimensionDescriptor.trim().split(/\s+/);

    // Validate that exactly two numeric parts were found.
    if (dimensionParts.length !== 2) {
        console.error(`[Dimension Parsing Error]: Invalid format for "${dimensionDescriptor}". Expected two numbers.`);
        return null;
    }

    // Attempt to parse the parts into base-10 integers.
    const prospectiveHeight = parseInt(dimensionParts[0], 10);
    const prospectiveWidth = parseInt(dimensionParts[1], 10);

    // Further validation: ensure parsed values are actual numbers and are positive.
    if (isNaN(prospectiveHeight) || isNaN(prospectiveWidth) || prospectiveHeight <= 0 || prospectiveWidth <= 0) {
        console.error(`[Dimension Parsing Error]: Numeric values are invalid or non-positive: Height=${prospectiveHeight}, Width=${prospectiveWidth}.`);
        return null;
    }

    // Return the successfully parsed and validated dimensions.
    return { rowCount: prospectiveHeight, colCount: prospectiveWidth };
};

/**
 * Main processing function that iterates through input lines, generates
 * checkerboard patterns, and prints them to the console.
 *
 * @param {string[]} incomingTextLines - An array of strings, where each string
 *   represents a line from the input.
 */
const renderCheckerboardGrids = (incomingTextLines) => {
    // Constant for the sequence that signals the end of input.
    const END_OF_INPUT_SEQUENCE = '0 0';
    let currentLineCursor = 0; // Pointer to the current line being processed.
    let successfullyRenderedGrids = 0; // Counter for generated grids.

    // Loop continuously until an explicit break condition is met.
    while (true) {
        // Safely retrieve the current line, trimming any surrounding whitespace.
        // Using optional chaining (`?.`) to handle cases where `currentLineCursor`
        // might exceed the array bounds.
        const activeInputLine = incomingTextLines[currentLineCursor]?.trim();

        // Check if there are no more meaningful input lines.
        if (!activeInputLine) {
            // An empty or undefined line indicates either end of file or
            // extraneous newlines. Break from the loop.
            break;
        }

        // Check if the current line matches the termination sequence.
        if (activeInputLine === END_OF_INPUT_SEQUENCE) {
            break; // Exit loop as instructed.
        }

        // Use the helper function to get grid dimensions.
        const acquiredDimensions = extractGridDimensions(activeInputLine);

        // If dimension parsing failed (due to invalid format or values),
        // log a warning, skip this line, and proceed to the next.
        if (!acquiredDimensions) {
            console.warn(`[Processing Warning]: Skipping malformed or invalid input line: "${activeInputLine}"`);
            currentLineCursor++;
            continue; // Move to the next iteration.
        }

        // Destructure the valid dimensions for clarity.
        const { rowCount: gridHeight, colCount: gridWidth } = acquiredDimensions;

        // An array to accumulate the string representation of each row for the current grid.
        const currentGridRenderBuffer = [];

        // Outer loop for generating each row of the grid.
        for (let rIndex = 0; rIndex < gridHeight; rIndex++) {
            let rowBuilderString = ''; // String to build the current row's characters.
            // Inner loop for generating each character (column) within the current row.
            for (let cIndex = 0; cIndex < gridWidth; cIndex++) {
                // The checkerboard pattern: '#' if sum of indices is even, '.' if odd.
                rowBuilderString += ((rIndex + cIndex) % 2 === 0) ? '#' : '.';
            }
            // Add the completed row string to our buffer for the current grid.
            currentGridRenderBuffer.push(rowBuilderString);
        }

        // Print the entire generated grid, joining rows with newline characters.
        console.log(currentGridRenderBuffer.join('\n'));

        // Add an extra blank line for visual separation between distinct grids.
        console.log('');

        successfullyRenderedGrids++; // Increment counter for successful grid generation.
        currentLineCursor++; // Advance to the next input line.
    }

    // Provide a summary message after all input has been processed.
    if (successfullyRenderedGrids > 0) {
        console.error(`--- Processing concluded. Successfully rendered ${successfullyRenderedGrids} checkerboard patterns. ---`);
    } else {
        console.error("--- No valid grid dimensions were processed or termination sequence appeared immediately. ---");
    }
};

// --- Standard Input Handling Section ---
// This part is responsible for collecting data from Node.js's standard input
// and then passing it to the main processing function.

// An array to store incoming data chunks from stdin.
const incomingDataSegments = [];

// Event listener: When 'data' is received from stdin, append it to our buffer.
process.stdin.on('data', (dataBlock) => {
    incomingDataSegments.push(dataBlock);
});

// Event listener: When the 'end' of the stdin stream is signaled,
// process all the accumulated data.
process.stdin.on('end', () => {
    // Concatenate all data segments into one complete string.
    const completeRawInput = incomingDataSegments.join('');

    // Split the raw input string into an array of lines.
    // Each line is then trimmed of whitespace, and empty lines are filtered out.
    const preparedInputLines = completeRawInput
                                .split('\n')
                                .map(lineContent => lineContent.trim())
                                .filter(lineContent => lineContent.length > 0);

    // If, after cleaning, no meaningful input lines remain, log an error and exit.
    if (preparedInputLines.length === 0) {
        console.error("No discernible input data was provided or all input was empty.");
        return; // Terminate execution if no valid input.
    }

    // Invoke the main function to start rendering grids with the prepared input.
    renderCheckerboardGrids(preparedInputLines);
});

// Optional: Add an error handler for potential issues during stdin operations.
process.stdin.on('error', (ioError) => {
    console.error('[Input Error]: An issue occurred while reading from standard input:', ioError);
    process.exit(1); // Exit with a non-zero code to indicate an error.
});