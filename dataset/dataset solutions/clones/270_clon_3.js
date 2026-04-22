const EMPTY_CELL_MARKER = -1; // Represents an unassigned cell within the grid.

// Global-like variables that hold the state for the current magic square generation.
// These are re-initialized for each new square processed from the input.
let currentNumberToPlace; // The integer value to be inserted into the next available cell.
let maximumValueLimit;    // The total count of numbers to place (N*N) plus one, acting as a stop condition.
let squareDimension;      // The side length (N) of the square grid currently being generated.
let generatedSquareGrid;  // The 2D array that stores the magic square's contents.

/**
 * Calculates the wrapped coordinate for a toroidal grid.
 * Ensures that coordinates that go out of bounds (negative or exceeding dimension)
 * wrap around to the other side of the grid.
 * @param {number} coordValue - The raw coordinate (row or column).
 * @param {number} gridDimension - The side length of the square grid.
 * @returns {number} The adjusted coordinate within the grid's bounds.
 */
function getToroidalCoordinate(coordValue, gridDimension) {
    // The modulo operator (%) in JavaScript can return negative results for negative inputs.
    // Adding `gridDimension` before the final modulo ensures a positive result.
    return (coordValue % gridDimension + gridDimension) % gridDimension;
}

/**
 * Recursively populates the magic square grid using a specific pattern.
 * This function attempts to place `currentNumberToPlace` at the given `initialRow` and `initialCol`.
 * It handles cell occupancy and determines the subsequent cell for placement.
 * @param {number} initialRow - The current row index candidate for placement.
 * @param {number} initialCol - The current column index candidate for placement.
 */
function recursivelyFillMagicSquare(initialRow, initialCol) {
    // Termination condition: If all numbers up to N*N have been successfully placed,
    // the recursion stops. `maximumValueLimit` is N*N + 1, so we check if `currentNumberToPlace`
    // has exceeded N*N.
    if (currentNumberToPlace >= maximumValueLimit) {
        return;
    }

    // Apply toroidal wrapping to the potential placement coordinates.
    const effectiveRow = getToroidalCoordinate(initialRow, squareDimension);
    const effectiveCol = getToroidalCoordinate(initialCol, squareDimension);

    // Check if the target cell is already occupied by a previously placed number.
    if (generatedSquareGrid[effectiveRow][effectiveCol] !== EMPTY_CELL_MARKER) {
        // Collision detected: The cell is not empty.
        // According to the algorithm's rule, move one step down and one step left
        // from the *current effective position* to find the next placement attempt.
        const nextCollisionRow = effectiveRow + 1;
        const nextCollisionCol = effectiveCol - 1;
        recursivelyFillMagicSquare(nextCollisionRow, nextCollisionCol);
    } else {
        // Cell is empty: Proceed with placing the current number.
        // Format the number to a fixed width string (e.g., "   1", " 123").
        const formattedNumberString = String(currentNumberToPlace).padStart(4, ' ');
        generatedSquareGrid[effectiveRow][effectiveCol] = formattedNumberString;

        // Increment the number counter for the next recursive call.
        currentNumberToPlace++;

        // Determine the next cell to attempt placement, following the primary diagonal rule:
        // one step down and one step right from the *current effective position*.
        const nextNormalRow = effectiveRow + 1;
        const nextNormalCol = effectiveCol + 1;
        recursivelyFillMagicSquare(nextNormalRow, nextNormalCol);
    }
}

/**
 * Creates and initializes a 2D array (grid) of a specified dimension,
 * filling all cells with a given marker value.
 * @param {number} dim - The side length of the square grid.
 * @param {*} fillValue - The initial value for all cells (e.g., EMPTY_CELL_MARKER).
 * @returns {Array<Array<*>>} The newly created and initialized grid.
 */
function initializeSquareGrid(dim, fillValue) {
    const newGrid = [];
    for (let r = 0; r < dim; r++) {
        // Efficiently create a row array and fill it.
        newGrid[r] = new Array(dim).fill(fillValue);
    }
    return newGrid;
}

/**
 * Converts the 2D grid array into a single string for console output.
 * Each row's elements are joined without separators, and rows are separated by newlines.
 * @param {Array<Array<string|number>>} gridDataToFormat - The grid containing numbers or formatted strings.
 * @returns {string} A multi-line string representation of the grid.
 */
function generateFormattedOutput(gridDataToFormat) {
    // Map each inner array (row) to a single string by concatenating its elements,
    // then join these row strings with newline characters.
    return gridDataToFormat.map(rowArray => rowArray.join('')).join('\n');
}

// --- Main Program Logic ---

// Read the entire standard input content as a UTF-8 string.
const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input:
// 1. Trim leading/trailing whitespace.
// 2. Split the string into an array of lines based on newline characters.
// 3. Convert each line (which should be a number string) into an actual number.
const inputDimensions = rawInputBuffer.trim().split('\n').map(Number);

// Iterate through each dimension provided in the input array.
for (let dimIndex = 0; dimIndex < inputDimensions.length; dimIndex++) {
    const currentInputDimension = inputDimensions[dimIndex];

    // If a dimension of 0 is encountered, it signifies the end of input, so break the loop.
    if (currentInputDimension === 0) {
        break;
    }

    // Optional: Add a guard clause for invalid (negative) dimensions.
    if (currentInputDimension < 1) {
        console.error(`Warning: Skipping invalid grid dimension of ${currentInputDimension}. Only positive integers are supported.`);
        continue; // Move to the next input dimension.
    }

    // Set up the context variables for the current magic square generation.
    squareDimension = currentInputDimension;
    // The limit for numbers to place is N*N. `maximumValueLimit` is N*N + 1,
    // used as an exclusive upper bound for `currentNumberToPlace`.
    maximumValueLimit = (squareDimension * squareDimension) + 1;
    currentNumberToPlace = 1; // Start placing numbers from 1.

    // Initialize the 2D grid for the current square with empty markers.
    generatedSquareGrid = initializeSquareGrid(squareDimension, EMPTY_CELL_MARKER);

    // Calculate the initial starting position for the recursive filling process.
    // Original pattern: (floor(N/2)+1, floor(N/2))
    const startingRow = Math.floor(squareDimension / 2) + 1;
    const startingCol = Math.floor(squareDimension / 2);

    // Initiate the recursive function to fill the magic square.
    recursivelyFillMagicSquare(startingRow, startingCol);

    // Print the fully generated and formatted magic square to the console.
    console.log(generateFormattedOutput(generatedSquareGrid));
}