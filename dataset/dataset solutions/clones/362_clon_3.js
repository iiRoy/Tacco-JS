const fileSystem = require('fs');

const GRID_ROWS = 2;
const GRID_COLS = 4;
const TOTAL_TILES = GRID_ROWS * GRID_COLS;

const TARGET_PUZZLE_SEQUENCE = "01234567";

const ROW_DELTAS = [-1, 0, 0, 1]; // Changes in row for Up, Left, Right, Down
const COL_DELTAS = [0, -1, 1, 0]; // Changes in column for Up, Left, Right, Down

/**
 * Determines if a given grid position (row, column) is within the defined puzzle boundaries.
 * @param {number} r - The row index to check.
 * @param {number} c - The column index to check.
 * @returns {boolean} True if the position is valid, false otherwise.
 */
function isPositionValid(r, c) {
    return r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS;
}

/**
 * Converts a 1D array index into its corresponding 2D grid coordinates.
 * @param {number} linearIndex - The 1D index.
 * @returns {{row: number, col: number}} An object containing the row and column.
 */
function getGridCoordinates(linearIndex) {
    return {
        row: Math.floor(linearIndex / GRID_COLS),
        col: linearIndex % GRID_COLS
    };
}

/**
 * Converts 2D grid coordinates (row, column) into a 1D array index.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @returns {number} The 1D array index.
 */
function getArrayIndex(row, col) {
    return row * GRID_COLS + col;
}


// Read all puzzle input data from standard input, assuming UTF-8 encoding.
const rawPuzzleInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Split the raw input into individual lines, removing any leading/trailing whitespace
// and filtering out empty lines to ensure valid processing.
const puzzleInputLines = rawPuzzleInput.trim().split("\n").filter(line => line.trim() !== '');

// Process each puzzle configuration provided in the input.
for (const currentLineData of puzzleInputLines) {
    // Parse the space-separated numbers from the current line into an array of integers.
    const initialTileArrangement = currentLineData.split(" ").map(val => Number(val.trim()));

    // Perform basic validation on the parsed input array.
    // Ensure the correct number of tiles and that all values are valid numbers.
    if (initialTileArrangement.length !== TOTAL_TILES || initialTileArrangement.some(isNaN)) {
        // console.error(`Skipping invalid puzzle: "${currentLineData}". Expected ${TOTAL_TILES} numeric tiles.`);
        continue; // Move to the next input line if the current one is malformed.
    }

    // Initialize the Breadth-First Search (BFS) queue.
    // Each entry in the queue is a tuple: [puzzle_state_array, moves_taken_to_reach_this_state].
    const explorationQueue = [];
    explorationQueue.push([initialTileArrangement, 0]);

    // Initialize a Map to keep track of visited puzzle states.
    // This prevents redundant computations and infinite loops by avoiding re-processing states.
    // Keys are string representations of the puzzle state, values are simple booleans (true).
    const visitedStatesTracker = new Map();
    visitedStatesTracker.set(initialTileArrangement.join(""), true);

    let solutionDiscovered = false; // A flag to indicate if a solution has been found for the current puzzle.

    // Commence the BFS algorithm.
    while (explorationQueue.length > 0) {
        // Dequeue the next puzzle state and its associated move count from the front of the queue.
        const [currentPuzzleState, currentMoveCount] = explorationQueue.shift();

        // Check if the current puzzle state matches the target configuration.
        if (currentPuzzleState.join("") === TARGET_PUZZLE_SEQUENCE) {
            console.log(currentMoveCount); // If it matches, output the total moves required.
            solutionDiscovered = true;
            break; // Terminate BFS for this puzzle as the optimal solution (minimum moves) has been found.
        }

        // Locate the position of the empty tile (represented by 0) within the current puzzle state.
        const emptyTileLinearIndex = currentPuzzleState.indexOf(0);
        const { row: emptyTileRow, col: emptyTileCol } = getGridCoordinates(emptyTileLinearIndex);

        // Iterate through all four possible directions (Up, Left, Right, Down) to move the empty tile.
        for (let directionIndex = 0; directionIndex < ROW_DELTAS.length; directionIndex++) {
            const nextEmptyTileRow = emptyTileRow + ROW_DELTAS[directionIndex];
            const nextEmptyTileCol = emptyTileCol + COL_DELTAS[directionIndex];

            // Verify if the potential new position for the empty tile is within the grid boundaries.
            if (!isPositionValid(nextEmptyTileRow, nextEmptyTileCol)) {
                continue; // If out of bounds, skip this move and try the next direction.
            }

            // Calculate the 1D index of the tile that would be swapped with the empty tile.
            const tileToSwapLinearIndex = getArrayIndex(nextEmptyTileRow, nextEmptyTileCol);

            // Create a new array representing the puzzle state after the swap.
            // It's essential to create a shallow copy to avoid modifying the original state in the queue.
            const nextPuzzleState = [...currentPuzzleState];

            // Perform the tile swap: move the adjacent tile into the empty spot,
            // and the empty spot into the adjacent tile's original position.
            nextPuzzleState[emptyTileLinearIndex] = nextPuzzleState[tileToSwapLinearIndex];
            nextPuzzleState[tileToSwapLinearIndex] = 0;

            // Generate a unique string key for the new puzzle state for efficient lookup in the visited states tracker.
            const nextStateIdentifier = nextPuzzleState.join("");

            // If this new state has not been visited before:
            if (!visitedStatesTracker.has(nextStateIdentifier)) {
                visitedStatesTracker.set(nextStateIdentifier, true); // Mark it as visited.
                // Add the new state to the queue along with an incremented move count.
                explorationQueue.push([nextPuzzleState, currentMoveCount + 1]);
            }
        }
    }

    // If the BFS completes for a puzzle and no solution was found,
    // the original problem description implies no output in this case.
    // if (!solutionDiscovered) {
    //     console.error(`No path found to target for puzzle: ${initialTileArrangement.join(" ")}`);
    // }
}