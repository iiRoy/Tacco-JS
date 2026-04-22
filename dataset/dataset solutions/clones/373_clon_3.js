// This JavaScript program reads an 8x8 character grid from standard input,
// then performs three successive 90-degree clockwise rotations on it.
// After each rotation, the current state of the grid is printed to the console
// along with a label indicating the total degrees of rotation from the original.

const MATRIX_DIMENSION = 8; // Defines the fixed dimension (N x N) of the square grid.
const STANDARD_INPUT_PATH = '/dev/stdin'; // Specifies the file path for reading standard input.

/**
 * Executes a 90-degree clockwise rotation on a provided square matrix.
 * The function ensures the input matrix adheres to the expected 8x8 dimensions.
 *
 * @param {Array<Array<string>>} sourceMatrix The matrix (2D array of strings) to be rotated.
 * @returns {Array<Array<string>>} A newly created matrix representing the result of the rotation.
 * @throws {Error} If the `sourceMatrix` is not a valid square matrix of `MATRIX_DIMENSION`.
 */
function performMatrixRotation(sourceMatrix) {
    // Robust validation to ensure the input matrix is correctly structured.
    if (!Array.isArray(sourceMatrix) || sourceMatrix.length !== MATRIX_DIMENSION) {
        throw new Error(`Rotation error: Input must be an array with ${MATRIX_DIMENSION} rows.`);
    }

    // Iterate through each row to validate its structure and length.
    for (let currentGridRow = 0; currentGridRow < MATRIX_DIMENSION; currentGridRow++) {
        if (!Array.isArray(sourceMatrix[currentGridRow]) || sourceMatrix[currentGridRow].length !== MATRIX_DIMENSION) {
            throw new Error(`Rotation error: Row ${currentGridRow} of input matrix must contain ${MATRIX_DIMENSION} elements.`);
        }
    }

    // Initialize the output matrix with empty rows.
    // This matrix will hold the characters after rotation.
    const destinationMatrix = [];
    for (let rowInitializer = 0; rowInitializer < MATRIX_DIMENSION; rowInitializer++) {
        destinationMatrix.push([]); // Add an empty array for each row of the rotated grid.
    }

    // Traverse the destination matrix to populate it with rotated values.
    for (let targetRow = 0; targetRow < MATRIX_DIMENSION; targetRow++) {
        for (let targetColumn = 0; targetColumn < MATRIX_DIMENSION; targetColumn++) {
            // The transformation logic for a 90-degree clockwise rotation (N x N matrix):
            // A cell at (old_row, old_col) moves to (new_row, new_col) where:
            // new_row = old_col
            // new_col = N - 1 - old_row
            // Therefore, to find the source for (targetRow, targetColumn):
            // old_col = targetRow
            // old_row = N - 1 - targetColumn
            const originalRowIndex = MATRIX_DIMENSION - 1 - targetColumn;
            const originalColumnIndex = targetRow;

            // Assign the character from its original position to its new, rotated position.
            destinationMatrix[targetRow][targetColumn] = sourceMatrix[originalRowIndex][originalColumnIndex];
        }
    }

    return destinationMatrix; // Return the fully rotated matrix.
}

/**
 * A utility function to format and print a grid's current state to the console.
 *
 * @param {string} descriptiveLabel A label (e.g., "90", "180") to precede the grid output.
 * @param {Array<Array<string>>} gridContent The 2D array of characters representing the grid state.
 */
function printGridState(descriptiveLabel, gridContent) {
    // Basic check for valid grid content before attempting to process.
    if (!Array.isArray(gridContent) || gridContent.length === 0) {
        console.error(`Warning: Attempted to print an empty or invalid grid for label "${descriptiveLabel}".`);
        return; // Skip printing if content is invalid.
    }

    // Map each inner array (row) to a joined string, then join these strings with newlines.
    const formattedOutput = gridContent.map(row => row.join('')).join('\n');
    console.log(`${descriptiveLabel}\n${formattedOutput}`);
}

// --- Main Program Execution Flow ---
let fileContents;
try {
    // Attempt to read the entire content of the specified input path synchronously.
    fileContents = require('fs').readFileSync(STANDARD_INPUT_PATH, 'utf8');
} catch (readError) {
    // If an error occurs during file reading (e.g., file not found), log and exit.
    console.error(`Error reading input from ${STANDARD_INPUT_PATH}: ${readError.message}`);
    process.exit(1); // Terminate the process with an error code.
}

// Process the raw text content: remove leading/trailing whitespace and split into lines.
const inputLines = fileContents.trim().split('\n');

// Initialize the grid that will be manipulated throughout the program.
let activelyProcessedGrid = [];

// Validate the number of input lines and the length of each line, then populate the grid.
if (inputLines.length < MATRIX_DIMENSION) {
    console.error(`Input format error: Expected ${MATRIX_DIMENSION} lines, but received only ${inputLines.length}.`);
    process.exit(1);
}

for (let currentLineIndex = 0; currentLineIndex < MATRIX_DIMENSION; currentLineIndex++) {
    const charactersInLine = inputLines[currentLineIndex].split('');
    if (charactersInLine.length !== MATRIX_DIMENSION) {
        console.error(`Input format error: Line ${currentLineIndex + 1} has ${charactersInLine.length} characters; expected ${MATRIX_DIMENSION}.`);
        process.exit(1);
    }
    activelyProcessedGrid.push(charactersInLine); // Add the parsed line as a row to the grid.
}

// --- Perform and display rotations ---

// First 90-degree rotation.
activelyProcessedGrid = performMatrixRotation(activelyProcessedGrid);
printGridState("90", activelyProcessedGrid); // Output the grid after 90 degrees.

// Second 90-degree rotation, cumulative 180 degrees.
activelyProcessedGrid = performMatrixRotation(activelyProcessedGrid);
printGridState("180", activelyProcessedGrid); // Output the grid after 180 degrees.

// Third 90-degree rotation, cumulative 270 degrees.
activelyProcessedGrid = performMatrixRotation(activelyProcessedGrid);
printGridState("270", activelyProcessedGrid); // Output the grid after 270 degrees.

// The program concludes after printing the 270-degree rotated grid.