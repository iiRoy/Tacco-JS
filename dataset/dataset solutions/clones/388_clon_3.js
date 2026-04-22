/*
 * This JavaScript code generates a specific maze-like pattern on a square grid.
 * It processes multiple test cases, each defined by a grid dimension.
 * The core logic is implemented in a recursive function that navigates and marks cells
 * based on complex rules, including collision detection and redirection.
 */

// Define constants for cell markers to improve readability and maintainability.
const PATH_MARKER = '#';      // Represents a cell that is part of the generated path.
const EMPTY_MARKER = '+';     // Represents an unvisited or empty cell.

/**
 * Recursively explores and marks a path segment on the grid.
 * This function is the heart of the pattern generation algorithm.
 *
 * @param {number} currentR The current row index in the grid.
 * @param {number} currentC The current column index in the grid.
 * @param {number} currentDirIdx The index representing the current direction of movement (0: Up, 1: Right, 2: Down, 3: Left).
 * @param {object} mazeData An object containing the shared state of the maze generation.
 *                          - gridContent: The 2D array representing the grid.
 *                          - dimensionSize: The size (N) of the square grid.
 *                          - lastMarkedCell: An array [row, col] storing the coordinates of the last cell marked as PATH_MARKER.
 * @returns {void} This function returns nothing; it modifies the `mazeData` object directly.
 */
function navigateMazePath(currentR, currentC, currentDirIdx, mazeData) {
    const { gridContent, dimensionSize, lastMarkedCell } = mazeData;

    // --- Guard Clause 1: Check if the current cell is already processed or an obstacle ---
    // If the cell at (currentR, currentC) is not an empty marker, it means
    // it's either already part of the path, or a boundary, or has been reset.
    // In any case, we should not process it further in this path segment.
    if (gridContent[currentR][currentC] !== EMPTY_MARKER) {
        return; // Terminate this recursive branch.
    }

    // Define the changes in row and column indices for each cardinal direction.
    // The order corresponds to `currentDirIdx`: 0=Up, 1=Right, 2=Down, 3=Left.
    const rowMovement = [-1, 0, 1, 0]; // Delta for rows (Up, No change, Down, No change)
    const colMovement = [0, 1, 0, -1]; // Delta for columns (No change, Right, No change, Left)

    // Calculate the potential coordinates for the next step based on the current direction.
    let nextR = currentR + rowMovement[currentDirIdx];
    let nextC = currentC + colMovement[currentDirIdx];

    // --- Helper for boundary checking ---
    // This inline function determines if a given coordinate pair is within the grid's bounds.
    const isWithinGridBounds = (r, c, size) => r >= 0 && c >= 0 && r < size && c < size;

    // --- Boundary Check ---
    // If the next calculated step is outside the grid's dimensions.
    if (!isWithinGridBounds(nextR, nextC, dimensionSize)) {
        // Rotate the direction clockwise by one step and try again from the current cell.
        // This ensures the path attempts to find an open direction without moving out of bounds.
        let updatedDirectionIndex = (currentDirIdx + 1) % 4;
        navigateMazePath(currentR, currentC, updatedDirectionIndex, mazeData);
    } else {
        // The next step (nextR, nextC) is within the grid boundaries.
        const targetCellValue = gridContent[nextR][nextC];

        // --- Collision Detection and Redirection Logic ---
        if (targetCellValue === PATH_MARKER) {
            // Case A: The next cell is already marked as part of the path.
            // This indicates a collision, requiring a specific redirection or backtracking.
            // First, reset the current cell (currentR, currentC) back to an empty marker.
            // This effectively "unmarks" the current position as part of the path segment.
            gridContent[currentR][currentC] = EMPTY_MARKER;

            // Calculate new starting coordinates and a new initial direction for a "jump" or "wrap-around" effect.
            // The logic here is highly specific to the desired pattern.
            let redirectionRow, redirectionCol, newStartingDirection;

            // Use a switch statement for cleaner handling of direction-dependent calculations.
            switch (currentDirIdx) {
                case 3: // Original direction `z == 3` (Left)
                    redirectionRow = nextR - (2 * rowMovement[currentDirIdx]) - 1;
                    redirectionCol = nextC - (2 * colMovement[currentDirIdx]);
                    newStartingDirection = 0; // New direction: Up
                    break;
                case 0: // Original direction `z == 0` (Up)
                    redirectionRow = nextR - (2 * rowMovement[currentDirIdx]);
                    redirectionCol = nextC - (2 * colMovement[currentDirIdx]) + 1;
                    newStartingDirection = 1; // New direction: Right
                    break;
                case 1: // Original direction `z == 1` (Right)
                    redirectionRow = nextR - (2 * rowMovement[currentDirIdx]) + 1;
                    redirectionCol = nextC - (2 * colMovement[currentDirIdx]);
                    newStartingDirection = 2; // New direction: Down
                    break;
                case 2: // Original direction `z == 2` (Down)
                    redirectionRow = nextR - (2 * rowMovement[currentDirIdx]);
                    redirectionCol = nextC - (2 * colMovement[currentDirIdx]) - 1;
                    newStartingDirection = 3; // New direction: Left
                    break;
                default:
                    // This case should theoretically not be reached if `currentDirIdx` is always 0-3.
                    console.warn("Unexpected direction index encountered during path redirection.");
                    return;
            }
            // Recursively call the function with the newly calculated starting point and direction.
            navigateMazePath(redirectionRow, redirectionCol, newStartingDirection, mazeData);

        } else {
            // Case B: The next cell is an EMPTY_MARKER (or any other value not PATH_MARKER).
            // This means we can extend the path to the current cell.
            // Mark the current cell as part of the path.
            gridContent[currentR][currentC] = PATH_MARKER;

            // Update the coordinates of the last cell that was marked as part of the path.
            // This is used for a specific post-processing step.
            lastMarkedCell[0] = currentR;
            lastMarkedCell[1] = currentC;

            // Recursively proceed to the next cell in the same direction.
            navigateMazePath(nextR, nextC, currentDirIdx, mazeData);
        }
    }
}

// --- Main Program Execution ---

// Utilize the Node.js 'fs' module to read input from standard input.
const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace, split into lines, filter empty lines, and convert to numbers.
const numericInputValues = rawInput
    .trim()
    .split('\n')
    .filter(line => line.length > 0) // Ensure no empty lines are processed as numbers
    .map(Number);

// The first number in the input array represents the total number of test cases.
let totalTestCases = numericInputValues.shift();

// Iterate through each test case provided in the input.
for (let testIterator = 0; testIterator < totalTestCases; testIterator++) {
    // Extract the grid dimension (N) for the current test case.
    const currentGridDimension = numericInputValues.shift();

    // --- Input Validation for Grid Dimension ---
    // Ensure the dimension is a positive integer. Skip if invalid.
    if (isNaN(currentGridDimension) || currentGridDimension <= 0 || !Number.isInteger(currentGridDimension)) {
        console.error(`Error: Invalid grid dimension '${currentGridDimension}' for test case ${testIterator + 1}. Skipping.`);
        continue; // Move to the next test case.
    }

    // --- Special Case: 1x1 Grid ---
    // A 1x1 grid is a trivial case that simply outputs a single path marker.
    if (currentGridDimension === 1) {
        console.log(PATH_MARKER);
        continue; // Move to the next test case.
    }

    // --- Initialize Maze Generation Context ---
    // Create an object to hold all relevant state for the current grid generation.
    // This allows passing a single object to the recursive function, avoiding global variables.
    const mazeGenerationContext = {
        gridContent: [], // The 2D array that will store the maze pattern.
        dimensionSize: currentGridDimension,
        lastMarkedCell: [-1, -1] // Placeholder for the last cell marked as PATH_MARKER.
    };

    // --- Grid Initialization ---
    // Populate the grid with EMPTY_MARKER characters.
    // This creates a fresh, empty grid for each test case.
    for (let r = 0; r < mazeGenerationContext.dimensionSize; r++) {
        mazeGenerationContext.gridContent[r] = [];
        for (let c = 0; c < mazeGenerationContext.dimensionSize; c++) {
            mazeGenerationContext.gridContent[r][c] = EMPTY_MARKER;
        }
    }

    // --- Start Path Generation ---
    // Begin the recursive path generation process.
    // The starting point is the bottom-left corner of the grid (N-1, 0).
    // The initial direction is 'Up' (index 0).
    navigateMazePath(mazeGenerationContext.dimensionSize - 1, 0, 0, mazeGenerationContext);

    // --- Post-processing Rule ---
    // Apply a specific rule: If the grid dimension is an even number,
    // the very last cell that was marked as part of the path needs to be reset to an EMPTY_MARKER.
    if (mazeGenerationContext.dimensionSize % 2 === 0) {
        const [lastRow, lastCol] = mazeGenerationContext.lastMarkedCell;
        // Ensure that `lastMarkedCell` was actually updated during path generation.
        if (lastRow !== -1 && lastCol !== -1) {
            mazeGenerationContext.gridContent[lastRow][lastCol] = EMPTY_MARKER;
        }
    }

    // --- Format and Print Output ---
    // Transform the 2D grid array into a single string for display.
    // 1. Join inner arrays (rows) into strings without commas.
    // 2. Join these row strings with newline characters.
    // 3. Replace all remaining EMPTY_MARKER characters ('+') with spaces (' ') for final presentation.
    const finalFormattedOutput = mazeGenerationContext.gridContent
                                    .map(rowArray => rowArray.join('')) // Convert each row array to a string
                                    .join('\n')                         // Join all row strings with newlines
                                    .replace(/\+/g, ' ');               // Replace '+' with ' '

    // Output the generated maze pattern to the console.
    console.log(finalFormattedOutput);
}