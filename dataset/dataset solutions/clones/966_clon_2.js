// Application configuration parameters.
appSettings = { dataSource: '/dev/stdin', lineSeparator: '\n' }; // Input from standard input

const validationModule = require('assert'); // Required for potential assertions, though not used in this specific script.

const GRID_TOTAL_CELLS = 0x10; // Total number of cells in the puzzle grid (16 for a 4x4 board).
const GRID_SIDE_LENGTH = Math.sqrt(GRID_TOTAL_CELLS); // The length of one side of the square grid.

// Prepare an array where each number is wrapped in its own single-element array.
// This acts as a unique object reference for each tile value.
tileRepresentations = [];
for (let loopCounter = 0; loopCounter < GRID_TOTAL_CELLS; loopCounter++) {
    tileRepresentations.push([loopCounter]);
}

// Read the initial puzzle state from the configured input source.
// The input is expected to be a few lines of space-separated numbers.
startingConfiguration = require('fs').readFileSync(appSettings.dataSource, 'utf8')
    .trim() // Remove leading/trailing whitespace.
    .split(appSettings.lineSeparator) // Split into individual lines.
    .map(function(inputLine) {
        return inputLine.split(' ').map(Number); // Convert each line of space-separated strings to an array of numbers.
    });

// Flatten the 2D array representing the initial grid into a single 1D array.
startingConfiguration = [].concat(
    startingConfiguration[0],
    startingConfiguration[1],
    startingConfiguration[2],
    startingConfiguration[3]
);

// Map the raw numbers from the input to their unique object representations.
startingConfiguration = startingConfiguration.map(function(parsedNumber) {
    return tileRepresentations[parsedNumber];
});

// Define the target final arrangement of the puzzle tiles.
// This is typically sorted 1 to 15, with 0 (empty) at the end.
finalArrangement = [];
for (let k = 1; k < GRID_TOTAL_CELLS; k++) {
    finalArrangement.push(tileRepresentations[k]);
}
finalArrangement.push(tileRepresentations[0]); // The empty tile goes last in the goal state.

// Initialize the current puzzle board state with the starting configuration.
currentPuzzleBoard = [].concat(startingConfiguration);

// Define the adjacency list for each cell on the 4x4 grid.
// This array indicates which cells are direct neighbors (up, down, left, right).
neighboringIndices = [
    [1, 4], [0, 2, 5], [1, 3, 6], [2, 7],
    [0, 5, 8], [1, 4, 6, 9], [2, 5, 7, 10], [3, 6, 11],
    [4, 9, 12], [5, 8, 10, 13], [6, 9, 11, 14], [7, 10, 15],
    [8, 13], [9, 12, 14], [10, 13, 15], [11, 14]
];

// Pre-calculate Manhattan distances between all possible cell pairs on the grid.
// This is used for the heuristic function in the search algorithm.
heuristicDistances = [];
for (let indexA = 0; indexA < GRID_TOTAL_CELLS; indexA++) {
    heuristicDistances.push(new Array(GRID_TOTAL_CELLS));
}

// Populate the distance matrix.
for (let rowA = 0; rowA < GRID_SIDE_LENGTH; rowA++) {
    for (let colA = 0; colA < GRID_SIDE_LENGTH; colA++) {
        for (let rowB = 0; rowB < GRID_SIDE_LENGTH; rowB++) {
            for (let colB = 0; colB < GRID_SIDE_LENGTH; colB++) {
                const sourcePosition = (GRID_SIDE_LENGTH * rowA) + colA;
                const targetPosition = (GRID_SIDE_LENGTH * rowB) + colB;
                heuristicDistances[sourcePosition][targetPosition] = Math.abs(rowA - rowB) + Math.abs(colA - colB);
            }
        }
    }
}

/**
 * Performs a depth-limited search (DLS) as part of an Iterative Deepening Depth-First Search (IDDFS).
 * It checks if the current board state can reach the goal within a given depth limit.
 *
 * @param {Array<Array<number>>} currentPuzzleBoard The current state of the puzzle board.
 * @param {number} currentPathLength The number of moves made so far to reach this state.
 * @param {number} maximumAllowedLength The maximum depth to search in this iteration.
 * @param {number} emptyCellPosition The index of the empty cell (tile 0) on the current board.
 * @returns {boolean} True if the goal state is found within the depth limit, false otherwise.
 */
function depthLimitedSearch(currentPuzzleBoard, currentPathLength, maximumAllowedLength, emptyCellPosition) {
    var loopVar, estimatedCost, nextEmptyCell;

    // Base case: If the current path length equals the maximum allowed depth.
    if (currentPathLength === maximumAllowedLength) {
        // Check if the current board configuration matches the final arrangement.
        for (loopVar in currentPuzzleBoard) {
            if (currentPuzzleBoard[loopVar] !== finalArrangement[loopVar]) {
                return false; // Not the goal state.
            }
        }
        return true; // Goal state reached at max depth.
    }

    // Calculate the Manhattan distance heuristic for the current board state.
    estimatedCost = 0;
    for (loopVar in tileRepresentations) {
        estimatedCost += heuristicDistances[currentPuzzleBoard.indexOf(tileRepresentations[loopVar])][finalArrangement.indexOf(tileRepresentations[loopVar])];
    }
    estimatedCost = Math.floor(estimatedCost / 2); // Divide by 2 for linear conflict adjustments in 15-puzzle.

    // Pruning: If current path length plus heuristic estimate exceeds max allowed depth,
    // this path cannot reach the goal within the limit.
    if (currentPathLength + estimatedCost > maximumAllowedLength) {
        return false;
    }

    // Explore possible moves from the current empty cell position.
    for (loopVar in neighboringIndices[emptyCellPosition]) {
        nextEmptyCell = neighboringIndices[emptyCellPosition][loopVar];

        // Simulate a tile swap: move the tile from 'nextEmptyCell' into 'emptyCellPosition'.
        currentPuzzleBoard[emptyCellPosition] = currentPuzzleBoard[nextEmptyCell];
        currentPuzzleBoard[nextEmptyCell] = tileRepresentations[0]; // Mark the old 'nextEmptyCell' as the new empty spot.

        // Recursively call DLS for the new state.
        if (depthLimitedSearch(currentPuzzleBoard, currentPathLength + 1, maximumAllowedLength, nextEmptyCell)) {
            return true; // Goal found!
        }

        // Backtrack: Undo the move to explore other paths.
        currentPuzzleBoard[nextEmptyCell] = currentPuzzleBoard[emptyCellPosition]; // Restore the tile.
        currentPuzzleBoard[emptyCellPosition] = tileRepresentations[0]; // Restore the empty cell.
    }

    return false; // No solution found from this state within the current depth limit.
}

// Main loop for Iterative Deepening: progressively increase the depth limit.
let depthIterator;
for (depthIterator = 0; depthIterator <= 45; depthIterator++) { // Max depth typically around 45 for 15-puzzle.
    const initialEmptySlotIndex = startingConfiguration.indexOf(tileRepresentations[0]);
    if (depthLimitedSearch(currentPuzzleBoard, 0, depthIterator, initialEmptySlotIndex)) {
        break; // Solution found at this depth.
    }
}

// Output the minimum number of moves required to solve the puzzle.
console.log(depthIterator);