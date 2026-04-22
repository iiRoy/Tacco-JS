const fileSystemModule = require('fs');

// --- Global/Shared State Variables (re-initialized for each grid processing) ---
let squareDimension;        // Stores the current size (N) of the square grid.
let currentValueCounter;    // Tracks the next number to be placed in the grid.
let maxGridValue;           // The maximum number that will be placed (N*N).
let squareGrid;             // The 2D array representing the square grid.

// --- Constants for Readability and Easy Modification ---
const EMPTY_CELL_MARKER = -1;       // Value indicating an unoccupied cell.
const INITIAL_GRID_NUMBER = 1;      // The first number placed in the grid.
const STANDARD_INPUT_PATH = '/dev/stdin'; // Path for reading input.

/**
 * Normalizes a given coordinate to ensure it wraps around the grid boundaries.
 * This implements a toroidal-like behavior where moving off one edge brings you
 * back on the opposite edge.
 *
 * @param {number} coordinateValue - The row or column index to normalize.
 * @param {number} dimensionSize - The size of the grid (N).
 * @returns {number} The adjusted coordinate within the [0, dimensionSize - 1] range.
 */
function normalizeCoordinate(coordinateValue, dimensionSize) {
    if (coordinateValue < 0) {
        return dimensionSize - 1; // Wrap from negative to the last index.
    }
    if (coordinateValue >= dimensionSize) {
        return 0; // Wrap from beyond the last index to the first.
    }
    return coordinateValue; // Coordinate is already within bounds.
}

/**
 * Recursively fills the square grid with numbers based on a specific pattern.
 * This algorithm is a variant of the "Siamese method" often used for magic squares,
 * where numbers are placed diagonally, wrapping around edges, and adjusting position
 * if a cell is already occupied.
 *
 * @param {number} prospectiveRow - The potential row index for placing the next number.
 * @param {number} prospectiveCol - The potential column index for placing the next number.
 */
function populateSquareRecursively(prospectiveRow, prospectiveCol) {
    // Base case: If all numbers (up to N*N) have been placed, terminate recursion.
    if (currentValueCounter > maxGridValue) {
        return;
    }

    // Adjust the prospective coordinates to handle grid wrapping.
    const actualGridRow = normalizeCoordinate(prospectiveRow, squareDimension);
    const actualGridCol = normalizeCoordinate(prospectiveCol, squareDimension);

    // Check if the calculated target cell is already filled.
    if (squareGrid[actualGridRow][actualGridCol] !== EMPTY_CELL_MARKER) {
        // If the cell is occupied, the rule dictates a different movement:
        // Attempt to place the next number one step down and two steps left
        // from the *original prospective position*.
        populateSquareRecursively(prospectiveRow + 1, prospectiveCol - 1);
    } else {
        // If the cell is empty, place the current number.
        squareGrid[actualGridRow][actualGridCol] = currentValueCounter;
        // Increment the counter for the next number to be placed.
        currentValueCounter++;
        // Move to the next position: one step down and one step right
        // from the *original prospective position*.
        populateSquareRecursively(prospectiveRow + 1, prospectiveCol + 1);
    }
}

// --- Main Program Execution Flow ---

// Read the entire content of the input file synchronously.
const rawInputContent = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, 'utf8');

// Process the input:
// 1. Trim any leading/trailing whitespace.
// 2. Split the string into an array of lines.
// 3. Convert each line (which should be a string representation of a number) to a Number.
const gridDimensionList = rawInputContent.trim().split('\n').map(Number);

// Iterate through each dimension size provided in the input.
for (const currentGridSize of gridDimensionList) {
    // If a dimension size of zero is encountered, it signals the end of input.
    if (currentGridSize === 0) {
        break;
    }

    // Initialize global state variables for the current grid.
    squareDimension = currentGridSize;
    maxGridValue = squareDimension * squareDimension;

    // Create and initialize the 2D grid array.
    // Each cell is pre-filled with the EMPTY_CELL_MARKER.
    squareGrid = Array.from({ length: squareDimension }, () =>
        Array(squareDimension).fill(EMPTY_CELL_MARKER)
    );

    // Determine the initial coordinates for placing the first number (1).
    // The pattern typically places '1' at (N/2 + 1, N/2) for an N x N grid.
    const initialColumnIndex = Math.floor(squareDimension / 2);
    const initialRowIndex = initialColumnIndex + 1;

    // Place the very first number (1) into its starting cell.
    squareGrid[initialRowIndex][initialColumnIndex] = INITIAL_GRID_NUMBER;

    // Set the counter for the next number to be placed (which is 2).
    currentValueCounter = INITIAL_GRID_NUMBER + 1;

    // Initiate the recursive filling process.
    // The first recursive call attempts to place '2' one step down and one step right
    // from where '1' was placed.
    populateSquareRecursively(initialRowIndex + 1, initialColumnIndex + 1);

    // Format the completed grid for console output.
    // 1. Each row's numbers are joined by a single space.
    // 2. All rows are then joined by a newline character.
    // 3. A space is prepended to the beginning of each line to match the original output style.
    const formattedGridOutput = squareGrid
        .map(row => row.join(' '))
        .join('\n')
        .replace(/^/mg, ' '); // Prepend space to each line.

    // Display the formatted grid to standard output.
    console.log(formattedGridOutput);
}