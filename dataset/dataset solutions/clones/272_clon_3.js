const EMPTY_GRID_MARKER = -1;

let currentNumberToPlace;
let currentGridDimension;
let entireSquareGrid;
let maximumFillValue;

/**
 * Initializes a 2D square grid of a specified size, filling all cells with an empty marker.
 * This ensures each inner array is a distinct instance, preventing shared references.
 *
 * @param {number} size The dimension (n) for the n x n grid. Must be a positive integer.
 * @returns {Array<Array<number>>} A newly created and initialized square grid.
 * @throws {Error} If the provided size is not a positive integer.
 */
function initializeSquareGrid(size) {
    if (size <= 0 || !Number.isInteger(size)) {
        throw new Error("Grid dimension must be a positive integer.");
    }
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => EMPTY_GRID_MARKER)
    );
}

/**
 * Recursively fills the magic square grid following the Siamese method rules.
 * This involves moving down-right, wrapping around the edges, and adjusting
 * to down-left if a cell is already occupied.
 *
 * @param {number} prospectiveRow The potential row index for the next number.
 * @param {number} prospectiveCol The potential column index for the next number.
 */
function recursivelyFillMagicSquare(prospectiveRow, prospectiveCol) {
    // Termination condition: If all numbers from 1 to n*n have been successfully placed.
    // The `currentNumberToPlace` starts at 2 (after 1 is placed), and goes up to `n*n`.
    // So, if it exceeds `maximumFillValue` (which is n*n), we are done.
    if (currentNumberToPlace > maximumFillValue) {
        return;
    }

    // Normalize the row and column indices to handle wrap-around effects.
    // The modulo operator, combined with adding currentGridDimension before another modulo,
    // correctly handles both negative and positive out-of-bounds indices for wrapping.
    const actualGridRow = (prospectiveRow % currentGridDimension + currentGridDimension) % currentGridDimension;
    const actualGridCol = (prospectiveCol % currentGridDimension + currentGridDimension) % currentGridDimension;

    // Check if the calculated cell in the grid is already occupied.
    if (entireSquareGrid[actualGridRow][actualGridCol] !== EMPTY_GRID_MARKER) {
        // If the cell is occupied, the rule is to try the position one step down and one step left
        // from the *last successfully placed number's original position*.
        // Since `(actualGridRow, actualGridCol)` represents the current occupied cell,
        // we move relative to this position to find the next candidate.
        const nextAttemptRow = actualGridRow + 1;
        const nextAttemptCol = actualGridCol - 1;
        recursivelyFillMagicSquare(nextAttemptRow, nextAttemptCol);
    } else {
        // If the cell is empty, place the current number, then prepare for the next.
        entireSquareGrid[actualGridRow][actualGridCol] = currentNumberToPlace;
        currentNumberToPlace++; // Increment the number for the subsequent placement.

        // The standard rule is to move one step down and one step right for the next number.
        const nextMoveRow = actualGridRow + 1;
        const nextMoveCol = actualGridCol + 1;
        recursivelyFillMagicSquare(nextMoveRow, nextMoveCol);
    }
}

/**
 * Converts a 2D numeric grid into a formatted string for console output.
 * Each row's numbers are space-separated, and rows are newline-separated.
 *
 * @param {Array<Array<number>>} gridToFormat The 2D array representing the magic square.
 * @returns {string} A string representation of the grid.
 */
function formatGridOutput(gridToFormat) {
    // Map each row array to a space-separated string, then join these row strings with newlines.
    return gridToFormat.map(row => row.join(" ")).join("\n");
}

// --- Main Program Execution Block ---
try {
    // Read all raw input data from standard input, assuming UTF-8 encoding.
    const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Process the raw input: trim leading/trailing whitespace, split by newline to get individual dimensions,
    // and convert each dimension string to a number.
    const listOfSquareDimensions = rawInputBuffer.trim().split("\n").map(Number);

    // Iterate through each dimension provided in the input list.
    for (let currentInputIdx = 0; currentInputIdx < listOfSquareDimensions.length; currentInputIdx++) {
        const inputDimensionValue = listOfSquareDimensions[currentInputIdx];

        // A zero dimension value acts as a sentinel to terminate further processing.
        if (inputDimensionValue === 0) {
            console.log("Encountered zero dimension. Halting further magic square generation.");
            break;
        }

        // Type III Addition: Input validation for the Siamese method, which typically works for odd dimensions.
        // It also checks for non-positive dimensions, though `initializeSquareGrid` also validates.
        if (inputDimensionValue < 1 || inputDimensionValue % 2 === 0) {
            console.error(`Warning: Skipping dimension ${inputDimensionValue}. This algorithm is best suited for positive odd dimensions.`);
            continue; // Move to the next input dimension in the list.
        }

        // Initialize global variables specific to the current magic square generation.
        currentGridDimension = inputDimensionValue;
        maximumFillValue = currentGridDimension * currentGridDimension; // The largest number to place (n*n).
        entireSquareGrid = initializeSquareGrid(currentGridDimension);

        // Determine the initial coordinates for placing the number '1'.
        // This specific pattern (middle column, one row below middle row) is common for Siamese method variations.
        const initialColumnForOne = Math.floor(currentGridDimension / 2);
        const initialRowForOne = initialColumnForOne + 1; // E.g., for n=3, (1,1) becomes (2,1)

        // Place the first number (1) into its designated starting cell.
        entireSquareGrid[initialRowForOne][initialColumnForOne] = 1;

        // Set the counter for the next number to be placed, which is 2.
        currentNumberToPlace = 2;

        // Initiate the recursive filling process. The first recursive call attempts to place '2'
        // by moving one step down and one step right from where '1' was placed.
        recursivelyFillMagicSquare(initialRowForOne + 1, initialColumnForOne + 1);

        // Once the square is fully generated, format it and print to standard output.
        const finalFormattedOutput = formatGridOutput(entireSquareGrid);
        console.log(finalFormattedOutput);
    }
} catch (programError) {
    // Type III Addition: Comprehensive error handling for the main program logic.
    console.error("An unrecoverable error occurred during program execution:", programError.message);
    // For detailed debugging, uncomment the line below to show the full stack trace.
    // console.error(programError.stack);
}