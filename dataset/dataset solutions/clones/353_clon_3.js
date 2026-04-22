const fileSystemModule = require('fs');

// --- Configuration Constants ---
const INPUT_FILE_PATH = '/dev/stdin';
const OPEN_SPACE_CHARACTER = '.'; // Represents a '.' in the input grid
const TERMINATION_SIGNAL_HEIGHT = 0;
const TERMINATION_SIGNAL_WIDTH = 0;

// --- Utility Functions ---

/**
 * Safely parses a string into an integer. If parsing fails or results in NaN,
 * it returns a specified default value. This guards against malformed input.
 * @param {string} textValue - The string to be parsed.
 * @param {number} fallbackValue - The value to return if parsing is unsuccessful.
 * @returns {number} The parsed integer or the fallback value.
 */
function safelyParseInteger(textValue, fallbackValue = 0) {
    const parsedNumber = parseInt(textValue, 10);
    return isNaN(parsedNumber) ? fallbackValue : parsedNumber;
}

/**
 * Retrieves and prepares the input data from the specified file path.
 * It reads the file, trims whitespace, splits it into individual lines,
 * and filters out any empty lines to ensure clean processing.
 * Includes error handling for file reading operations.
 * @returns {string[]} An array where each element is a line from the input file.
 */
function obtainInputLineSegments() {
    try {
        const rawBufferContents = fileSystemModule.readFileSync(INPUT_FILE_PATH, 'utf8');
        // Trim leading/trailing whitespace from the entire buffer and split by newline.
        // Filter ensures that truly empty lines (e.g., multiple newlines) are discarded.
        return rawBufferContents.trim().split('\n').filter(segment => segment.length > 0);
    } catch (fileReadError) {
        console.error(`An error occurred while attempting to read the input file: ${fileReadError.message}`);
        // Return an empty array to prevent subsequent processing from crashing.
        return [];
    }
}

// --- Main Program Execution Flow ---

let parsedInputSegments = obtainInputLineSegments();
let currentLinePointer = 0; // Tracks the current line being processed from `parsedInputSegments`

// The main loop continues as long as there are lines to process.
while (currentLinePointer < parsedInputSegments.length) {
    const headerLine = parsedInputSegments[currentLinePointer];

    // Split the header line to get height and width tokens, then parse them.
    const dimensionTokens = headerLine.split(' ');
    const gridRowsCount = safelyParseInteger(dimensionTokens[0]);
    const gridColsCount = safelyParseInteger(dimensionTokens[1]);

    // Check for the termination condition (0 0).
    if (gridRowsCount === TERMINATION_SIGNAL_HEIGHT && gridColsCount === TERMINATION_SIGNAL_WIDTH) {
        break; // Exit the processing loop if the termination signal is found.
    }

    // Advance the line pointer past the dimension line.
    currentLinePointer++;

    // --- Input Validation for Grid Dimensions ---
    if (gridRowsCount <= 0 || gridColsCount <= 0) {
        console.warn(`Encountered invalid grid dimensions: ${gridRowsCount}x${gridColsCount}. Skipping this block.`);
        // If dimensions are invalid, we must skip the corresponding data lines.
        currentLinePointer += gridRowsCount; // Assuming 'gridRowsCount' lines of data would follow
        continue; // Move to the next block of input.
    }

    // Initialize a 2D array to store the computed cumulative heights of '.' characters.
    // `cumulativeDotHeights[r][c]` will represent the number of consecutive '.' characters
    // upwards from and including the cell at `(r, c)`.
    const cumulativeDotHeights = [];

    // --- Populate the Cumulative Dot Heights Matrix ---
    for (let rowIndex = 0; rowIndex < gridRowsCount; ++rowIndex) {
        // Guard against unexpected end of input.
        if (currentLinePointer >= parsedInputSegments.length) {
            console.error("Premature end of input detected while reading grid data. Halting processing.");
            // Set pointer to end to terminate outer loop.
            currentLinePointer = parsedInputSegments.length;
            break; // Exit inner loop to prevent out-of-bounds access.
        }

        const rowCharacterData = parsedInputSegments[currentLinePointer].split('');
        cumulativeDotHeights[rowIndex] = []; // Initialize the current row array.

        // Iterate through each character in the current row.
        for (let colIndex = 0; colIndex < gridColsCount; ++colIndex) {
            const cellChar = rowCharacterData[colIndex];

            // Determine the cumulative height for the current cell.
            if (cellChar === OPEN_SPACE_CHARACTER) {
                // If it's an open space, its height is 1 plus the height of the cell directly above it (if any).
                cumulativeDotHeights[rowIndex][colIndex] = (rowIndex === 0) ? 1 : (cumulativeDotHeights[rowIndex - 1][colIndex] + 1);
            } else {
                // If it's not an open space, the cumulative height is 0.
                cumulativeDotHeights[rowIndex][colIndex] = 0;
            }
        }
        currentLinePointer++; // Advance to the next line of input for the grid.
    }

    // If the grid was not fully read due to premature EOF, skip to the next input block.
    if (cumulativeDotHeights.length !== gridRowsCount) {
        continue;
    }

    // --- Calculate the Largest Rectangle Area for the Current Grid ---
    let maximumRectangleAreaForCurrentBlock = 0; // Resets for each HxW block.

    // Process each row of the `cumulativeDotHeights` matrix as a histogram.
    for (let histogramRowIndex = 0; histogramRowIndex < gridRowsCount; ++histogramRowIndex) {
        const heightMonotonicStack = []; // Stores [barHeight, effectiveStartIndex]
        // Create a copy of the current histogram row and append a sentinel '0' bar.
        // The sentinel ensures all remaining bars on the stack are processed at the end of the row.
        const currentHistogramBars = [...cumulativeDotHeights[histogramRowIndex], 0];

        // Iterate through each bar (column) in the current histogram row, including the sentinel.
        for (let currentColumnIndex = 0; currentColumnIndex <= gridColsCount; ++currentColumnIndex) {
            const currentBarValue = currentHistogramBars[currentColumnIndex];

            // --- Replicating the Original Histogram Algorithm's Logic ---
            // This specific algorithm has a unique way of managing indices and pushes.

            // Scenario 1: The stack is currently empty.
            if (heightMonotonicStack.length === 0) {
                // Push the current bar's value and a modified start index (`currentColumnIndex + 1`).
                // This `+1` is a specific indexing convention from the original code.
                heightMonotonicStack.push([currentBarValue, currentColumnIndex + 1]);
                continue; // Move to the next bar.
            }

            // Scenario 2: The current bar is strictly taller than the bar at the top of the stack.
            if (heightMonotonicStack[heightMonotonicStack.length - 1][0] < currentBarValue) {
                // Push the current bar's value and its actual column index.
                heightMonotonicStack.push([currentBarValue, currentColumnIndex]);
            }
            // Scenario 3: The current bar has the same height as the bar at the top of the stack.
            else if (heightMonotonicStack[heightMonotonicStack.length - 1][0] === currentBarValue) {
                // The original code effectively does nothing (continues), extending the top bar's rectangle.
            }
            // Scenario 4: The current bar is shorter than the bar at the top of the stack.
            else { // heightMonotonicStack[heightMonotonicStack.length - 1][0] > currentBarValue
                // Process bars on the stack that are taller than or equal to the `currentBarValue`.
                while (heightMonotonicStack.length > 0) {
                    const poppedBarData = heightMonotonicStack.pop(); // [poppedHeight, poppedStartIndex]
                    const poppedHeight = poppedBarData[0];
                    const poppedStartIndex = poppedBarData[1];

                    // If the `currentBarValue` is now taller than the `poppedHeight`,
                    // push the `poppedBarData` back onto the stack and break.
                    // This signifies that `currentBarValue` does not cut off `poppedHeight`.
                    if (currentBarValue > poppedHeight) {
                        heightMonotonicStack.push(poppedBarData);
                        break;
                    }
                    // If `currentBarValue` is the same height as `poppedHeight`, break.
                    // The `poppedBarData` is consumed, and `currentBarValue` is not pushed.
                    else if (currentBarValue === poppedHeight) {
                        break;
                    }
                    // If `currentBarValue` is strictly shorter than `poppedHeight`,
                    // calculate the area for the `poppedHeight` bar.
                    else { // currentBarValue < poppedHeight
                        // The width is calculated using `currentColumnIndex + 1` (as an exclusive end)
                        // and `poppedStartIndex` (as an inclusive start). This `+1` is consistent
                        // with the initial push in Scenario 1.
                        const calculatedArea = poppedHeight * ((currentColumnIndex + 1) - poppedStartIndex);
                        maximumRectangleAreaForCurrentBlock = Math.max(maximumRectangleAreaForCurrentBlock, calculatedArea);
                    }
                }
                // Crucially, in this specific algorithm, `currentBarValue` is NOT explicitly pushed
                // after this `while` loop if it was shorter than or equal to popped bars.
                // It relies on subsequent iterations or the initial `if` conditions to be pushed.
            }
        }
    }
    // After processing all rows and their respective histograms for the current grid,
    // print the maximum area found for this block.
    console.log(maximumRectangleAreaForCurrentBlock);
}