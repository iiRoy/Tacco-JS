// This JavaScript module is designed to process grid-based input from standard input,
// identify distinct 'objects' (specific characters), count them, and then 'clear' them
// using a recursive flood-fill algorithm. This is common in grid traversal problems.

// --- Global Constants and Configuration ---

// Defines the relative row and column offsets for checking immediate neighbors
// in the four cardinal directions (up, down, left, right).
const NEIGHBOR_OFFSETS = [
    { deltaRow: 0, deltaCol: -1 }, // Move Left
    { deltaRow: 0, deltaCol: 1 },  // Move Right
    { deltaRow: -1, deltaCol: 0 }, // Move Up
    { deltaRow: 1, deltaCol: 0 }   // Move Down
];

// The character used to mark a grid cell as 'visited' or 'cleared'
// after an object has been processed. This prevents re-counting and infinite recursion.
const CLEARED_CELL_MARKER = '0';

// A Set containing all characters that are considered 'objects' to be identified and counted.
// Using a Set provides efficient lookup for these identifiers.
const OBJECT_IDENTIFIERS = new Set(['@', '#', '*']);

// --- Core Flood-Fill Algorithm ---

/**
 * Recursively explores and clears all connected cells in a grid that match a specific
 * target character. This function implements a depth-first search (DFS) based flood-fill.
 *
 * @param {number} startRow The row coordinate of the cell to begin the spread from.
 * @param {number} startCol The column coordinate of the cell to begin the spread from.
 * @param {string} targetCharacter The character value that defines the 'object' to be cleared.
 * @param {Array<Array<string>>} currentWorkingGrid The 2D array representing the mutable grid state.
 * @param {number} totalGridRows The total number of rows (height) in the grid.
 * @param {number} totalGridCols The total number of columns (width) in the grid.
 */
function extinguishSpread(startRow, startCol, targetCharacter, currentWorkingGrid, totalGridRows, totalGridCols) {
    // Basic boundary check: If the starting coordinates are out of bounds,
    // there's nothing to process, so return immediately.
    // This acts as a base case for recursion and a safeguard.
    if (startRow < 0 || startRow >= totalGridRows || startCol < 0 || startCol >= totalGridCols) {
        return;
    }

    // Mark the current cell as cleared. This is crucial to prevent cycles
    // in the recursion (infinite loops) and ensures each cell is processed once.
    currentWorkingGrid[startRow][startCol] = CLEARED_CELL_MARKER;

    // Iterate through all possible neighbor directions.
    for (let directionIdx = 0; directionIdx < NEIGHBOR_OFFSETS.length; ++directionIdx) {
        const offset = NEIGHBOR_OFFSETS[directionIdx];
        const nextRowCoord = startRow + offset.deltaRow;
        const nextColCoord = startCol + offset.deltaCol;

        // Check if the potential neighbor coordinates are within the grid boundaries.
        const isNextRowValid = nextRowCoord >= 0 && nextRowCoord < totalGridRows;
        const isNextColValid = nextColCoord >= 0 && nextColCoord < totalGridCols;

        // If the neighbor is out of bounds, skip to the next direction.
        if (!isNextRowValid || !isNextColValid) {
            continue;
        }

        // Retrieve the content of the adjacent cell.
        const adjacentCellContent = currentWorkingGrid[nextRowCoord][nextColCoord];

        // If the adjacent cell matches the target character,
        // it means it's part of the same object. Recursively clear it.
        if (adjacentCellContent === targetCharacter) {
            extinguishSpread(nextRowCoord, nextColCoord, targetCharacter, currentWorkingGrid, totalGridRows, totalGridCols);
        }
    }
}

// --- Main Program Execution Flow ---

// 1. Read Raw Input:
// Attempt to synchronously read all data from standard input.
// This is typical for competitive programming environments.
let rawInputData;
try {
    rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
} catch (readError) {
    // If reading fails, log an error and terminate the process.
    console.error("Error encountered while attempting to read from /dev/stdin:", readError.message);
    process.exit(1); // Exit with a non-zero code to indicate an error.
}

// 2. Pre-process Input Lines:
// Convert the raw buffer to a string, trim any leading/trailing whitespace,
// and split it into an array of individual lines.
const allProcessedInputLines = rawInputData.toString().trim().split('\n');

let currentLineCursor = 0; // Pointer to keep track of the next line to read from 'allProcessedInputLines'.
let currentTestCaseNumber = 0; // Counter for the number of test cases processed.

// 3. Main Test Case Loop:
// Continuously process test cases until a specific termination condition is met.
while (true) {
    // Guard clause: Check if there are enough lines remaining for dimensions.
    if (currentLineCursor >= allProcessedInputLines.length) {
        // No more input lines, gracefully exit the loop.
        break;
    }

    // Read the line containing grid dimensions (height and width).
    const dimensionInfoLine = allProcessedInputLines[currentLineCursor++];
    const parsedDimensions = dimensionInfoLine.split(' ').map(Number);

    // Input validation for dimensions: Ensure two valid numbers were parsed.
    if (parsedDimensions.length !== 2 || isNaN(parsedDimensions[0]) || isNaN(parsedDimensions[1])) {
        console.error(`Input Error: Invalid dimension format at line ${currentLineCursor - 1}: "${dimensionInfoLine}". Terminating.`);
        process.exit(1);
    }

    const totalGridRows = parsedDimensions[0];
    const totalGridCols = parsedDimensions[1];

    // Termination condition: If both dimensions are zero, it signals the end of input.
    if (totalGridRows === 0 && totalGridCols === 0) {
        break;
    }

    currentTestCaseNumber++; // Increment the test case counter.
    // console.debug(`Processing Test Case ${currentTestCaseNumber}: Grid ${totalGridRows}x${totalGridCols}`); // Optional debug output

    // 4. Construct the Grid for the Current Test Case:
    const currentGridState = [];
    for (let rowIndex = 0; rowIndex < totalGridRows; ++rowIndex) {
        // Ensure there are enough lines for the grid rows.
        if (currentLineCursor >= allProcessedInputLines.length) {
            console.error(`Input Error: Unexpected end of file while reading grid for case ${currentTestCaseNumber}.`);
            process.exit(1);
        }
        const gridRowData = allProcessedInputLines[currentLineCursor++];
        // Optional validation: Check if the row length matches the expected width.
        if (gridRowData.length !== totalGridCols) {
            console.warn(`Warning: Row ${rowIndex} for case ${currentTestCaseNumber} has length ${gridRowData.length}, expected ${totalGridCols}.`);
            // This might indicate malformed input but we'll proceed, potentially leading to issues.
        }
        currentGridState.push(gridRowData.split('')); // Convert row string into an array of characters.
    }

    let detectedObjectCounter = 0; // Initialize counter for distinct objects in this grid.

    // 5. Scan Grid and Process Objects:
    // Iterate through every cell of the newly constructed grid.
    for (let rowIndex = 0; rowIndex < totalGridRows; ++rowIndex) {
        for (let colIndex = 0; colIndex < totalGridCols; ++colIndex) {
            const cellValue = currentGridState[rowIndex][colIndex];

            // Check if the current cell contains an object character that needs processing.
            if (OBJECT_IDENTIFIERS.has(cellValue)) {
                detectedObjectCounter++; // Found a new distinct object, increment counter.

                // Initiate the flood-fill process from this cell to clear all connected
                // parts of this object, marking them as visited.
                extinguishSpread(rowIndex, colIndex, cellValue, currentGridState, totalGridRows, totalGridCols);
            }
        }
    }

    // 6. Output Result:
    // Print the total count of distinct objects found for the current test case.
    console.log(detectedObjectCounter);
}

// Program concludes when the main loop breaks (either by 0 0 dimensions or end of input).