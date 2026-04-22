// Expert-level grid path generation utility.
// This script reads grid dimensions from standard input and generates
// a complex, spiraling path pattern within a square grid.

// --- Core Configuration and Constants ---
const EMPTY_PATH_SYMBOL = '+';             // Represents an empty, unvisited cell on the grid.
const FILLED_PATH_SYMBOL = '#';            // Represents a cell that is part of the generated path.
const OUTPUT_SPACE_SYMBOL = ' ';           // Character used to display empty cells in the final output.

// Define movement vectors for Up, Right, Down, Left directions.
// The order is critical for the turning logic in `calculateTurnCoordinates`.
const PATH_MOVEMENT_VECTORS = [
    { dr: -1, dc: 0 }, // Index 0: Move Up (decrease row, column stays same)
    { dr: 0, dc: 1 },  // Index 1: Move Right (row stays same, increase column)
    { dr: 1, dc: 0 },  // Index 2: Move Down (increase row, column stays same)
    { dr: 0, dc: -1 }  // Index 3: Move Left (row stays same, decrease column)
];

// --- Global State Variables for Path Generation Context ---
// These variables maintain state across recursive calls and test cases.
let currentGridSize = 0;             // Stores the side length of the current square grid.
let gridDrawingSurface = [];         // The 2D array representing the grid, where paths are drawn.
let lastKnownPathSegmentEnd = [];    // Tracks the coordinates of the last cell marked as FILLED_PATH_SYMBOL.


/**
 * Determines the new starting coordinates and direction index after the path
 * encounters an existing path segment (a "wall"). This function encapsulates
 * the specific, non-trivial turning logic of the original algorithm.
 *
 * @param {number} wallEncounterRow The row coordinate where the path hit a wall.
 * @param {number} wallEncounterCol The column coordinate where the path hit a wall.
 * @param {number} currentMoveDirection The index of the direction currently being followed (0-3).
 * @returns {{targetRow: number, targetCol: number, nextDirection: number}}
 *          An object containing the calculated new starting row, column, and direction index.
 */
function calculateTurnCoordinates(wallEncounterRow, wallEncounterCol, currentMoveDirection) {
    let newStartRow = wallEncounterRow;
    let newStartCol = wallEncounterCol;
    let subsequentDirection = 0;

    // The original algorithm's specific rules for turning and repositioning
    // are implemented here. These effectively move the path to a new point
    // relative to the original (y,x) that initiated the current step,
    // and then change the direction.
    switch (currentMoveDirection) {
        case 0: // Was moving Up, hit wall at (wallEncounterRow, wallEncounterCol)
            // Original logic resulted in bomb(y+1, x+1, 1) from original (y,x)
            newStartRow = wallEncounterRow + 2;
            newStartCol = wallEncounterCol + 1;
            subsequentDirection = 1; // Turn Right
            break;
        case 1: // Was moving Right, hit wall at (wallEncounterRow, wallEncounterCol)
            // Original logic resulted in bomb(y+1, x-1, 2) from original (y,x)
            newStartRow = wallEncounterRow + 1;
            newStartCol = wallEncounterCol - 2;
            subsequentDirection = 2; // Turn Down
            break;
        case 2: // Was moving Down, hit wall at (wallEncounterRow, wallEncounterCol)
            // Original logic resulted in bomb(y-1, x-1, 3) from original (y,x)
            newStartRow = wallEncounterRow - 2;
            newStartCol = wallEncounterCol - 1;
            subsequentDirection = 3; // Turn Left
            break;
        case 3: // Was moving Left, hit wall at (wallEncounterRow, wallEncounterCol)
            // Original logic resulted in bomb(y-1, x+1, 0) from original (y,x)
            newStartRow = wallEncounterRow - 1;
            newStartCol = wallEncounterCol + 2;
            subsequentDirection = 0; // Turn Up
            break;
        default:
            // This case should ideally not be reached if direction indices are handled correctly (0-3).
            console.error("Critical Error: Invalid direction index passed to turn calculation.");
            return { targetRow: -1, targetCol: -1, nextDirection: -1 }; // Indicate an error state
    }
    return { targetRow: newStartRow, targetCol: newStartCol, nextDirection: subsequentDirection };
}


/**
 * The primary recursive function that carves the intricate path into the `gridDrawingSurface`.
 * It follows a path, turning based on boundary hits or encountering existing path segments.
 *
 * @param {number} currentCellRow The current row index of the cell being processed.
 * @param {number} currentCellCol The current column index of the cell being processed.
 * @param {number} currentMoveDirection The index indicating the current direction of movement.
 */
function carveGridPath(currentCellRow, currentCellCol, currentMoveDirection) {
    // --- Guard Clause / Base Case ---
    // If the current cell is outside the grid boundaries, or if it's already
    // marked as part of the path (not EMPTY_PATH_SYMBOL), then this path segment terminates.
    if (currentCellRow < 0 || currentCellCol < 0 ||
        currentCellRow >= currentGridSize || currentCellCol >= currentGridSize ||
        gridDrawingSurface[currentCellRow][currentCellCol] !== EMPTY_PATH_SYMBOL) {
        return;
    }

    // Determine the coordinates for the next potential step.
    const rowDelta = PATH_MOVEMENT_VECTORS[currentMoveDirection].dr;
    const colDelta = PATH_MOVEMENT_VECTORS[currentMoveDirection].dc;
    const nextPotentialRow = currentCellRow + rowDelta;
    const nextPotentialCol = currentCellCol + colDelta;

    // Check if the next potential step is out of bounds or hits an existing path segment.
    const isNextOutOfBounds = (nextPotentialRow < 0 || nextPotentialCol < 0 ||
                               nextPotentialRow >= currentGridSize || nextPotentialCol >= currentGridSize);
    const isNextHittingWall = !isNextOutOfBounds && (gridDrawingSurface[nextPotentialRow][nextPotentialCol] === FILLED_PATH_SYMBOL);

    if (isNextOutOfBounds || isNextHittingWall) {
        // --- Path Turning Logic ---
        if (isNextOutOfBounds) {
            // If the next step is outside the grid, change direction (rotate clockwise)
            // and try again from the *current* cell.
            const newDirectionIndex = (currentMoveDirection + 1) % PATH_MOVEMENT_VECTORS.length;
            carveGridPath(currentCellRow, currentCellCol, newDirectionIndex);
        } else { // It must be `isNextHittingWall`
            // If the next step hits an already filled cell (a "wall"):
            // 1. Revert the current cell to an empty state. This specific rule
            //    creates the distinct "spiral" pattern by erasing the previous mark.
            gridDrawingSurface[currentCellRow][currentCellCol] = EMPTY_PATH_SYMBOL;

            // 2. Calculate the new starting point and direction based on complex turning rules.
            const { targetRow, targetCol, nextDirection } = calculateTurnCoordinates(currentCellRow, currentCellCol, currentMoveDirection);

            // 3. Initiate a new path segment from the calculated new position and direction.
            //    Include a safety check for invalid calculated coordinates.
            if (targetRow === -1) {
                console.warn("Skipping path segment due to invalid turn calculation.");
                return;
            }
            carveGridPath(targetRow, targetCol, nextDirection);
        }
    } else {
        // --- Path Continuation Logic ---
        // If the path is clear (within bounds and pointing to an empty cell):
        // 1. Mark the current cell as part of the path.
        gridDrawingSurface[currentCellRow][currentCellCol] = FILLED_PATH_SYMBOL;
        // 2. Update the global variable for the last marked position.
        lastKnownPathSegmentEnd = [currentCellRow, currentCellCol];
        // 3. Recursively continue the path from the next potential cell in the same direction.
        carveGridPath(nextPotentialRow, nextPotentialCol, currentMoveDirection);
    }
}


// --- Main Program Execution Flow ---
try {
    // Read all input data from standard input.
    const rawInputDataString = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Process the input: trim whitespace, split by newlines, and convert to numbers.
    const numericInputValues = rawInputDataString.trim().split('\n').map(Number);

    // The first number in the input is the total count of test cases.
    let totalTestCaseCount = numericInputValues.shift();

    // Iterate through each test case provided in the input.
    for (let caseIteration = 0; caseIteration < totalTestCaseCount; caseIteration++) {
        // The next number in the input array is the grid's side length for the current case.
        const currentSideLength = numericInputValues.shift();
        currentGridSize = currentSideLength; // Update the global grid size.

        // --- Handle Edge Cases for Grid Dimensions ---
        if (currentGridSize <= 0) {
            console.log(''); // For zero or negative dimensions, print an empty line.
            continue;
        }
        if (currentGridSize === 1) {
            console.log(FILLED_PATH_SYMBOL); // A 1x1 grid is simply a single filled cell.
            continue;
        }

        // --- Grid Initialization ---
        // Create a new 2D array (grid) and fill it entirely with EMPTY_PATH_SYMBOL.
        // Using Array.from for a declarative, functional approach to grid creation.
        gridDrawingSurface = Array.from({ length: currentGridSize }, () =>
            Array(currentGridSize).fill(EMPTY_PATH_SYMBOL)
        );

        // Reset the last known path end for the new grid.
        lastKnownPathSegmentEnd = [];

        // --- Initiate Path Generation ---
        // The path always begins at the bottom-left corner of the grid (row: N-1, col: 0)
        // and initially moves upwards (direction index 0).
        carveGridPath(currentGridSize - 1, 0, 0);

        // --- Post-Processing Rule ---
        // If the grid's side length is an even number, the very last cell that was marked
        // as FILLED_PATH_SYMBOL is reverted back to EMPTY_PATH_SYMBOL.
        if (currentGridSize % 2 === 0 && lastKnownPathSegmentEnd.length === 2) {
            gridDrawingSurface[lastKnownPathSegmentEnd[0]][lastKnownPathSegmentEnd[1]] = EMPTY_PATH_SYMBOL;
        }

        // --- Output Formatting and Display ---
        // Convert the 2D grid array into a single string for output.
        // - Each row's elements are joined without commas.
        // - All EMPTY_PATH_SYMBOL instances are replaced with OUTPUT_SPACE_SYMBOL for display.
        // - Rows are joined by newline characters.
        const finalFormattedOutput = gridDrawingSurface
            .map(row => row.join('').replace(new RegExp(EMPTY_PATH_SYMBOL, 'g'), OUTPUT_SPACE_SYMBOL))
            .join('\n');
        console.log(finalFormattedOutput);
    }

} catch (executionError) {
    // Basic error handling for file reading or other runtime issues.
    console.error("An unexpected error occurred during program execution:", executionError.message);
    // In a production environment, more detailed logging (e.g., stack trace) would be appropriate.
}