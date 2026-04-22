const fileSystemModule = require('fs');
let rawPuzzleData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Define constants for the puzzle board dimensions and tile values
const BOARD_DIMENSIONS_ROWS = 2;
const BOARD_DIMENSIONS_COLS = 4;
const BLANK_TILE_REPRESENTATION = 0;
const DESIRED_FINAL_STATE_KEY = "01234567"; // The sorted arrangement of tiles

// Define the relative movements for the blank tile (up, left, right, down)
const DELTA_ROW_COORDINATES = [-1, 0, 0, 1];
const DELTA_COL_COORDINATES = [0, -1, 1, 0];

/**
 * Determines the minimum number of moves to solve a 2x4 sliding puzzle
 * from a given initial configuration using Breadth-First Search (BFS).
 *
 * @param {number[]} startingBoardConfiguration - A 1D array representing the puzzle's initial tile arrangement.
 * @returns {number} The least number of moves required to reach the target state, or -1 if no solution exists.
 */
function findMinimumMovesForPuzzle(startingBoardConfiguration) {
    // --- Input Validation (Type III addition) ---
    // Ensure the input board has the correct number of tiles for a 2x4 puzzle.
    if (!startingBoardConfiguration || startingBoardConfiguration.length !== BOARD_DIMENSIONS_ROWS * BOARD_DIMENSIONS_COLS) {
        console.error("Error: Initial board configuration must contain exactly 8 tiles.");
        return -1;
    }

    // --- BFS Data Structures (Type II renames, Type III set usage) ---
    // A set to keep track of all board configurations that have already been visited
    // to prevent redundant processing and infinite loops.
    const exploredConfigurations = new Set();
    // The queue for BFS, storing tuples of [boardStateArray, currentMoveCount].
    const processingQueue = [];

    // --- Initialization (Type II renames) ---
    // Convert the initial board array to a string key for storage in the 'exploredConfigurations' set.
    const initialBoardKey = startingBoardConfiguration.join('');
    exploredConfigurations.add(initialBoardKey);
    // Add the starting configuration to the queue with 0 moves.
    processingQueue.push([startingBoardConfiguration, 0]);

    // --- BFS Loop ---
    while (processingQueue.length > 0) {
        // Dequeue the next state to process.
        const [currentBoardState, movesAccumulated] = processingQueue.shift();

        // --- Goal Check (Type II renames) ---
        // If the current board state matches the desired final state, a solution is found.
        if (currentBoardState.join('') === DESIRED_FINAL_STATE_KEY) {
            return movesAccumulated; // Return the total moves taken.
        }

        // --- Blank Tile Location (Type II renames, Type III explicit calculation) ---
        // Find the 1D index of the blank tile (represented by BLANK_TILE_REPRESENTATION).
        const blankTile1DIndex = currentBoardState.indexOf(BLANK_TILE_REPRESENTATION);
        // Convert the 1D index to 2D coordinates (row and column).
        const blankTileCurrentRow = Math.floor(blankTile1DIndex / BOARD_DIMENSIONS_COLS);
        const blankTileCurrentCol = blankTile1DIndex % BOARD_DIMENSIONS_COLS;

        // --- Explore Adjacent Moves (Type II renames, Type III simplified swap logic) ---
        // Iterate through all four possible directions (up, left, right, down).
        for (let directionIndex = 0; directionIndex < DELTA_ROW_COORDINATES.length; directionIndex++) {
            // Calculate the potential new 2D coordinates for the blank tile.
            const potentialNewBlankRow = blankTileCurrentRow + DELTA_ROW_COORDINATES[directionIndex];
            const potentialNewBlankCol = blankTileCurrentCol + DELTA_COL_COORDINATES[directionIndex];

            // --- Boundary Check (Type III guard clause) ---
            // Ensure the potential new position is within the puzzle board's boundaries.
            if (potentialNewBlankRow < 0 || potentialNewBlankCol < 0 ||
                potentialNewBlankRow >= BOARD_DIMENSIONS_ROWS || potentialNewBlankCol >= BOARD_DIMENSIONS_COLS) {
                continue; // This move is invalid, try the next direction.
            }

            // Calculate the 1D index of the tile that will be swapped with the blank.
            const tileToSwap1DIndex = potentialNewBlankRow * BOARD_DIMENSIONS_COLS + potentialNewBlankCol;

            // --- Generate New Board State (Type III structural rewrite) ---
            // Create a new board configuration by performing the swap.
            // We use the spread operator to create a shallow copy of the current board state.
            const subsequentBoardState = [...currentBoardState];
            // Move the tile from the adjacent position into the blank's old position.
            subsequentBoardState[blankTile1DIndex] = currentBoardState[tileToSwap1DIndex];
            // Move the blank tile into the adjacent tile's old position.
            subsequentBoardState[tileToSwap1DIndex] = BLANK_TILE_REPRESENTATION;

            // Convert the new board state to a string key for checking against 'exploredConfigurations'.
            const nextBoardStateIdentifier = subsequentBoardState.join('');

            // --- Visited Check and Enqueue (Type II renames, Set usage) ---
            // If this new board configuration has not been explored yet:
            if (!exploredConfigurations.has(nextBoardStateIdentifier)) {
                exploredConfigurations.add(nextBoardStateIdentifier); // Mark it as explored.
                // Add the new state to the queue with an incremented move count.
                processingQueue.push([subsequentBoardState, movesAccumulated + 1]);
            }
        }
    }

    // --- No Solution Found (Type III return value for failure) ---
    // If the queue becomes empty and the goal state was never reached, it means
    // the puzzle is unsolvable from the given starting configuration.
    return -1;
}

// --- Main Processing Loop (Type II renames, Type III additions) ---
// Clean and split the raw input data into individual puzzle lines.
// Added a filter to handle potential empty lines from trimming.
const puzzleInputLines = rawPuzzleData.trim().split("\n").filter(line => line.length > 0);

// --- Global Input Validation (Type III addition) ---
if (puzzleInputLines.length === 0) {
    console.warn("Warning: No puzzle configurations were provided in the input.");
    // Optionally, an early exit could be placed here if no input implies no further processing.
}

// Process each puzzle configuration provided in the input.
puzzleInputLines.forEach((individualPuzzleLine, puzzleIndex) => {
    // Parse the space-separated numbers from the line into an array of integers.
    // Added .filter(n => !isNaN(n)) for robustness against non-numeric input fragments.
    const parsedInitialTiles = individualPuzzleLine.split(" ").map(Number).filter(num => !isNaN(num));

    // --- Per-Line Input Validation (Type III addition) ---
    // Check if the parsed line resulted in the correct number of tiles.
    if (parsedInitialTiles.length !== BOARD_DIMENSIONS_ROWS * BOARD_DIMENSIONS_COLS) {
        console.error(`Error on input line ${puzzleIndex + 1}: Expected ${BOARD_DIMENSIONS_ROWS * BOARD_DIMENSIONS_COLS} tiles, but found ${parsedInitialTiles.length}. This puzzle will be skipped.`);
        return; // Skip processing this malformed line.
    }

    // Attempt to solve the current puzzle configuration.
    const calculatedMinimumMoves = findMinimumMovesForPuzzle(parsedInitialTiles);

    // --- Output Results (Type III informative messages) ---
    if (calculatedMinimumMoves !== -1) {
        console.log(calculatedMinimumMoves); // Print the solution (minimum moves).
    } else {
        // Provide a more descriptive message if no solution was found.
        console.log(`No solution could be found for puzzle configuration from line ${puzzleIndex + 1}.`);
    }
});