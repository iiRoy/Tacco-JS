// This script processes a series of grid-based navigation puzzles from standard input.
// Each puzzle involves navigating a character grid starting from (0,0) until a target
// cell is found or a loop is detected.

// Global constants for grid characters, promoting readability and ease of modification.
const VISITED_PATH_MARKER = '#';      // Character used to mark cells as visited during traversal.
const DESTINATION_CELL_INDICATOR = '.'; // The character representing the successful target cell.
const MOVE_EAST_SYMBOL = '>';         // Character indicating a move to the right (east).
const MOVE_WEST_SYMBOL = '<';         // Character indicating a move to the left (west).
const MOVE_NORTH_SYMBOL = '^';        // Character indicating a move upwards (north).
const MOVE_SOUTH_SYMBOL = 'v';        // Character indicating a move downwards (south).

// Global variables to manage the state across recursive calls and test cases.
let currentGridState = [];            // Represents the 2D character array for the current puzzle.
let navigationOutcome = "";           // Stores the final result string for the current puzzle.

/**
 * Recursively navigates the grid from a given starting position.
 * This function attempts to find a path to a destination cell or detect a loop.
 *
 * @param {number} currentRowIndex The current row index in the grid.
 * @param {number} currentColumnIndex The current column index in the grid.
 */
function traverseLabyrinth(currentRowIndex, currentColumnIndex) {
    // --- Input Validation and Boundary Checks (Added Robustness) ---
    // Ensure the current coordinates are within the valid bounds of the grid.
    if (
        currentRowIndex < 0 || currentColumnIndex < 0 ||
        currentRowIndex >= currentGridState.length ||
        currentColumnIndex >= currentGridState[0].length
    ) {
        navigationOutcome = "OUT_OF_BOUNDS_PATH"; // Indicate an invalid path beyond grid limits.
        return; // Terminate this recursive branch.
    }

    // Cache the character at the current cell *before* modification.
    // This is crucial to determine the next move based on the original instruction.
    const originalCellChar = currentGridState[currentRowIndex][currentColumnIndex];

    // --- Base Case: Loop Detection (Updated Condition) ---
    // If the cell has already been visited in the current traversal path.
    if (originalCellChar === VISITED_PATH_MARKER) {
        navigationOutcome = "LOOP"; // Declare a loop detected.
        return; // Terminate this recursive branch.
    }

    // --- Base Case: Destination Reached (Updated Output Format) ---
    // If the current cell is the target destination.
    if (originalCellChar === DESTINATION_CELL_INDICATOR) {
        navigationOutcome = `${currentColumnIndex} ${currentRowIndex}`; // Format result using template literal.
        return; // Terminate this recursive branch.
    }

    // --- Mark Current Cell as Visited (State Update) ---
    // Modify the grid to mark the current cell as part of the visited path.
    currentGridState[currentRowIndex][currentColumnIndex] = VISITED_PATH_MARKER;

    // --- Determine Next Coordinates Based on Cell Instruction (Rewritten Logic) ---
    let nextRowPosition = currentRowIndex;
    let nextColPosition = currentColumnIndex;

    // Use a switch statement for clearer direction handling.
    switch (originalCellChar) {
        case MOVE_EAST_SYMBOL:
            nextColPosition++;
            break;
        case MOVE_WEST_SYMBOL:
            nextColPosition--;
            break;
        case MOVE_NORTH_SYMBOL:
            nextRowPosition--;
            break;
        case MOVE_SOUTH_SYMBOL:
            nextRowPosition++;
            break;
        default:
            // --- Error Handling for Unknown Cell Types (New Fragment) ---
            // If an unexpected character is encountered, consider it an invalid path.
            navigationOutcome = "INVALID_CELL_INSTRUCTION";
            return; // Terminate this recursive branch.
    }

    // --- Recursive Call ---
    // Continue the traversal from the newly calculated position.
    traverseLabyrinth(nextRowPosition, nextColPosition);
}

// --- Main Program Execution Block ---

// Acquire necessary modules.
const fileInputSystem = require('fs'); // Renamed 'fs' for clarity.

// Read all input data from standard input synchronously.
const rawInputBufferData = fileInputSystem.readFileSync('/dev/stdin', 'utf8');
// Split the entire input into an array of lines, removing any leading/trailing whitespace.
const inputLineCollection = rawInputBufferData.trim().split("\n");

let currentInputLinePointer = 0; // Helper variable to keep track of the current line being processed.

// Main loop to process multiple test cases/puzzles from the input.
while (true) {
    // Check for premature end of input, a new guard clause.
    if (currentInputLinePointer >= inputLineCollection.length) {
        // console.error("Warning: Reached end of input unexpectedly.");
        break; // Exit if no more lines are available.
    }

    // Parse the dimension line (e.g., "N M") for the current grid.
    const dimensionTokens = inputLineCollection[currentInputLinePointer++].split(" ").map(Number);
    const totalRows = dimensionTokens[0];
    const totalColumns = dimensionTokens[1];

    // --- Termination Condition for the Main Loop ---
    // A test case with dimensions 0 0 signals the end of all puzzles.
    if (totalRows === 0 && totalColumns === 0) {
        break;
    }

    // --- Validate Grid Dimensions (New Guard Clause) ---
    if (totalRows <= 0 || totalColumns <= 0) {
        navigationOutcome = "INVALID_GRID_DIMENSIONS";
        console.log(navigationOutcome);
        // Consume the expected number of grid lines even for invalid dimensions
        // to correctly advance the line pointer for the next test case.
        for (let r = 0; r < totalRows; r++) {
            if (currentInputLinePointer < inputLineCollection.length) {
                currentInputLinePointer++;
            }
        }
        continue; // Skip to the next puzzle.
    }

    // Initialize the grid for the current puzzle.
    currentGridState = []; // Reset the grid for each new test case.
    navigationOutcome = ""; // Reset the outcome for each new test case.

    // Populate the grid from the input lines.
    for (let rIdx = 0; rIdx < totalRows; rIdx++) {
        // Check for insufficient grid data.
        if (currentInputLinePointer >= inputLineCollection.length) {
            navigationOutcome = "INCOMPLETE_GRID_DATA";
            break; // Break from grid population loop.
        }
        const rowCharacters = inputLineCollection[currentInputLinePointer++].split("");
        // --- Row Length Validation (New Fragment) ---
        if (rowCharacters.length !== totalColumns) {
            // This is a warning, as the original code might implicitly handle this
            // by array indexing, but explicit check is better.
            // console.warn(`Row ${rIdx} has unexpected length. Expected ${totalColumns}, got ${rowCharacters.length}.`);
            // Decide on error handling: pad, truncate, or set error outcome.
            // For now, we'll proceed but might lead to issues later. Let's make it an error.
            navigationOutcome = "MISMATCHED_ROW_LENGTH";
            break;
        }
        currentGridState.push(rowCharacters);
    }

    // If grid population failed for any reason, print the error and move to next test case.
    if (navigationOutcome !== "") {
        console.log(navigationOutcome);
        continue;
    }

    // --- Initial Position Validation (New Fragment) ---
    // The problem statement implies starting at (0,0). Validate this start.
    const initialRow = 0;
    const initialCol = 0;
    if (initialRow >= totalRows || initialCol >= totalColumns || initialRow < 0 || initialCol < 0) {
        navigationOutcome = "START_POSITION_INVALID";
    } else {
        // Initiate the recursive grid traversal from the starting point.
        traverseLabyrinth(initialRow, initialCol);
    }


    // Output the final result for the current puzzle.
    console.log(navigationOutcome);
}