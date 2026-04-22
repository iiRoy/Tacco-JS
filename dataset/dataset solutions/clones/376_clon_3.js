const fs = require('fs');

const GRID_DIMENSION = 8;

/**
 * Performs a 90-degree clockwise rotation on a square 2D grid.
 *
 * This function takes an input matrix (a 2D array) and returns a new matrix
 * where the elements are rotated 90 degrees clockwise. The element at
 * original position (row, col) moves to (col, GRID_DIMENSION - 1 - row)
 * in the new grid.
 *
 * @param {Array<Array<any>>} sourceMatrix - The input 2D array (grid) to be rotated.
 * @returns {Array<Array<any>>} A freshly created 2D array representing the rotated grid.
 * @throws {Error} If the provided input matrix does not conform to the expected
 *                 square dimensions defined by GRID_DIMENSION.
 */
function performClockwiseRotation(sourceMatrix) {
    // Validate the incoming matrix to ensure it's a square grid of the expected size.
    if (!Array.isArray(sourceMatrix) || sourceMatrix.length !== GRID_DIMENSION) {
        throw new Error(`Rotation error: Input matrix must be an array with exactly ${GRID_DIMENSION} rows.`);
    }

    // Initialize a new grid for the rotated output.
    // Using Array.from with a callback provides a clean way to create a 2D array
    // without shared references for inner arrays.
    const rotatedResultGrid = Array.from({ length: GRID_DIMENSION },
                                         () => Array(GRID_DIMENSION).fill(null));

    // Iterate through the target positions in the new grid to determine
    // which element from the source grid belongs there.
    for (let targetRowIndex = 0; targetRowIndex < GRID_DIMENSION; targetRowIndex++) {
        const currentRow = sourceMatrix[targetRowIndex]; // Cache current row for potential validation/performance
        if (!Array.isArray(currentRow) || currentRow.length !== GRID_DIMENSION) {
            throw new Error(`Rotation error: Row ${targetRowIndex} of the input matrix ` +
                            `must be an array with ${GRID_DIMENSION} elements.`);
        }

        for (let targetColIndex = 0; targetColIndex < GRID_DIMENSION; targetColIndex++) {
            // The element for (targetRowIndex, targetColIndex) in the new grid
            // comes from (GRID_DIMENSION - 1 - targetColIndex, targetRowIndex) in the source grid.
            const originalRowForTarget = GRID_DIMENSION - 1 - targetColIndex;
            const originalColForTarget = targetRowIndex;

            rotatedResultGrid[targetRowIndex][targetColIndex] =
                sourceMatrix[originalRowForTarget][originalColForTarget];
        }
    }

    return rotatedResultGrid;
}

/**
 * Outputs a 2D character grid to the console, optionally prefixed with a header.
 * Each row of the grid is joined into a string, and rows are separated by newlines.
 *
 * @param {Array<Array<string>>} gridToDisplay - The 2D array of characters (the grid) to print.
 * @param {string} [headerMessage] - An optional string to print before the grid content.
 */
function renderGridOutput(gridToDisplay, headerMessage = "") {
    const serializedGrid = gridToDisplay.map(gridRow => gridRow.join('')).join('\n');
    if (headerMessage) {
        console.log(`${headerMessage}\n${serializedGrid}`);
    } else {
        console.log(serializedGrid);
    }
}

// --- Main application execution logic ---
try {
    // Retrieve raw input data from the standard input stream.
    const rawInputBuffer = fs.readFileSync('/dev/stdin', 'utf8');

    // Normalize input: remove leading/trailing whitespace and split into lines.
    const sanitizedInputContent = rawInputBuffer.trim();
    const inputLineSegments = sanitizedInputContent.split('\n');

    // Initialize our primary data structure for the grid.
    let currentBoardState = [];

    // Validate and populate the initial grid from the processed input lines.
    if (inputLineSegments.length !== GRID_DIMENSION) {
        throw new Error(`Input parsing error: Expected ${GRID_DIMENSION} lines of input, received ${inputLineSegments.length}.`);
    }

    for (let lineIterator = 0; lineIterator < GRID_DIMENSION; lineIterator++) {
        const individualLine = inputLineSegments[lineIterator];
        if (individualLine.length !== GRID_DIMENSION) {
            throw new Error(`Input parsing error: Line ${lineIterator + 1} has ${individualLine.length} characters, ` +
                            `but ${GRID_DIMENSION} were expected.`);
        }
        // Split each line into an array of individual characters.
        currentBoardState.push(individualLine.split(''));
    }

    // Define the sequence of rotation display points.
    const rotationMarkers = [90, 180, 270];

    // Perform and display each successive 90-degree rotation.
    for (const degreesRotated of rotationMarkers) {
        // Apply the clockwise rotation to the current state of the board.
        currentBoardState = performClockwiseRotation(currentBoardState);
        // Output the rotated board along with its corresponding degree marker.
        renderGridOutput(currentBoardState, String(degreesRotated));
    }

} catch (executionError) {
    // Catch and report any errors that occur during file reading, parsing, or rotation.
    console.error(`An unhandled error interrupted the program: ${executionError.message}`);
    // Exit the process with a non-zero status code to indicate failure.
    process.exit(1);
}