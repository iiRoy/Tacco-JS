const tileMoveOffsets = [-1, 1, -4, 4];

// This memoization table stores the minimum moves required to reach a solved state
// from a given board configuration. The indices correspond to the values of
// the first 7 tiles (board[0] through board[6]).
// A value of Infinity signifies an unvisited or unreachable state.
// The maximum value for any tile is 7 (since the tiles are typically 0-7).
let minMovesCache;

/**
 * Helper function to create a multi-dimensional array and fill it with an initial value.
 * This replaces the nested C++ `rep` loops for DP table initialization.
 * @param {number[]} dimensions - An array specifying the size of each dimension (e.g., [8, 8, 8, ...]).
 * @param {*} initialValue - The value to fill the array with.
 * @returns {Array} A multi-dimensional array initialized with the given value.
 */
function createDeepArray(dimensions, initialValue) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    const arrayInstance = new Array(currentDimensionSize);
    for (let i = 0; i < currentDimensionSize; i++) {
        arrayInstance[i] = createDeepArray(remainingDimensions, initialValue);
    }
    return arrayInstance;
}

/**
 * Generates all possible valid next board states from the current state.
 * This function identifies the empty tile (0) and attempts to move it
 * in four directions (left, right, up, down), respecting board boundaries
 * and specific wrap-around rules for a 2x4 grid layout.
 *
 * @param {number[]} currentBoardState - The current configuration of the board tiles (0-7).
 * @returns {number[][]} An array of valid next board configurations.
 */
function generatePossibleMoves(currentBoardState) {
    // Find the index of the empty tile (0).
    const emptyTileIndex = currentBoardState.indexOf(0);

    const possibleNextStates = [];

    // Iterate through the four predefined movement directions.
    for (let i = 0; i < tileMoveOffsets.length; i++) {
        const moveDelta = tileMoveOffsets[i];
        // Calculate the potential new position for the empty tile.
        const newEmptyTileIndex = emptyTileIndex + moveDelta;

        // Check if the new position is within the board boundaries (indices 0 to 7).
        if (newEmptyTileIndex >= 0 && newEmptyTileIndex < 8) {
            // Apply specific boundary conditions for a 2x4 grid to prevent
            // horizontal moves between the end of the first row and the start of the second.
            // If the empty tile is at index 3 (end of row 1) and tries to move right (+1), block it.
            // If the empty tile is at index 4 (start of row 2) and tries to move left (-1), block it.
            if ((emptyTileIndex === 3 && moveDelta === 1) || (emptyTileIndex === 4 && moveDelta === -1)) {
                continue; // Skip this move as it's invalid across the logical row boundary.
            }

            // Create a new board state by making a shallow copy of the current one.
            const nextBoardState = currentBoardState.slice();

            // Swap the empty tile with the tile at the new position using array destructuring.
            [nextBoardState[emptyTileIndex], nextBoardState[newEmptyTileIndex]] =
                [nextBoardState[newEmptyTileIndex], nextBoardState[emptyTileIndex]];

            // Add the new valid state to the list of possibilities.
            possibleNextStates.push(nextBoardState);
        }
    }
    return possibleNextStates;
}

/**
 * Checks if the current board configuration represents the solved state.
 * The solved state is defined as tiles being in ascending order: 0, 1, 2, 3, 4, 5, 6, 7.
 *
 * @param {number[]} boardConfiguration - The current arrangement of the board tiles.
 * @returns {boolean} True if the board is solved, false otherwise.
 */
function isPuzzleSolved(boardConfiguration) {
    // Iterate through the first 7 tiles (indices 0 to 6) to check the sequence.
    for (let i = 0; i < 7; i++) {
        // If any tile is not one greater than its predecessor, the board is not solved.
        if (boardConfiguration[i] + 1 !== boardConfiguration[i + 1]) {
            return false;
        }
    }
    return true; // All tiles are in the correct ascending order.
}

/**
 * Recursively calculates the minimum number of moves required to reach the solved state
 * from a given board configuration using Depth-First Search with memoization.
 *
 * @param {number[]} currentBoardConfiguration - The current state of the puzzle board.
 * @param {number} currentMoveCount - The number of moves taken to reach this state from the initial input.
 * @returns {number} The minimum number of moves to solve the puzzle from this state,
 *                   or Infinity if unreachable or the search depth limit is exceeded.
 */
function calculateMinMoves(currentBoardConfiguration, currentMoveCount) {
    // Guard clause: If the move count exceeds a predefined limit (e.g., 10 moves),
    // consider this path too long or intractable for this specific puzzle variant
    // and return a large value to indicate a non-optimal or unreachable path.
    if (currentMoveCount > 10) {
        return Infinity;
    }

    // Base case: If the current board is already in the solved state.
    if (isPuzzleSolved(currentBoardConfiguration)) {
        // Store the current move count as the minimum for this solved state in the cache.
        minMovesCache[currentBoardConfiguration[0]][currentBoardConfiguration[1]][currentBoardConfiguration[2]]
            [currentBoardConfiguration[3]][currentBoardConfiguration[4]][currentBoardConfiguration[5]]
            [currentBoardConfiguration[6]] = currentMoveCount;
        return currentMoveCount;
    }

    // Memoization step: Check if this board configuration has already been visited
    // and its minimum moves calculated. If so, return the cached result.
    const cachedMoves = minMovesCache[currentBoardConfiguration[0]][currentBoardConfiguration[1]][currentBoardConfiguration[2]]
        [currentBoardConfiguration[3]][currentBoardConfiguration[4]][currentBoardConfiguration[5]]
        [currentBoardConfiguration[6]];
    if (cachedMoves !== Infinity) {
        return cachedMoves;
    }

    // Generate all valid next states from the current configuration.
    const nextPossibleStates = generatePossibleMoves(currentBoardConfiguration);

    let minimumMovesFromHere = Infinity; // Initialize with a very large value to find the true minimum.

    // Explore each next possible state recursively.
    for (let i = 0; i < nextPossibleStates.length; i++) {
        const neighborState = nextPossibleStates[i];
        // Recursively call calculateMinMoves for the neighbor state, incrementing the move count.
        const movesForNeighbor = calculateMinMoves(neighborState, currentMoveCount + 1);
        // Update the minimum moves found so far for the current path.
        minimumMovesFromHere = Math.min(minimumMovesFromHere, movesForNeighbor);
    }

    // Store the calculated minimum moves for the current configuration in the cache
    // before returning, to avoid re-computation.
    minMovesCache[currentBoardConfiguration[0]][currentBoardConfiguration[1]][currentBoardConfiguration[2]]
        [currentBoardConfiguration[3]][currentBoardConfiguration[4]][currentBoardConfiguration[5]]
        [currentBoardConfiguration[6]] = minimumMovesFromHere;

    return minimumMovesFromHere;
}

// Main execution block, encapsulating the puzzle solving logic.
// This uses an Immediately Invoked Function Expression (IIFE) to simulate a main function.
(function solveTilePuzzle() {
    // Initialize the 7-dimensional memoization table with Infinity for all possible states.
    // Each dimension ranges from 0 to 7, corresponding to the tile values.
    minMovesCache = createDeepArray([8, 8, 8, 8, 8, 8, 8], Infinity);

    // Simulate input for the initial board configuration.
    // This array represents the starting arrangement of the 8 tiles (0-7), where 0 is the empty space.
    // Example: [1, 2, 3, 7, 0, 4, 5, 6] is a shuffled 2x4 board.
    const initialBoardConfiguration = [1, 2, 3, 7, 0, 4, 5, 6];

    // Add a check for the edge case where the input board is already solved.
    // This is an additional fragment for robustness and efficiency.
    if (isPuzzleSolved(initialBoardConfiguration)) {
        console.log(0); // If already solved, 0 moves are required.
        // console.log("The initial board is already solved! 0 moves required."); // Optional descriptive output
        return; // Exit early if no moves are needed.
    }

    let overallMinimumMoves = Infinity; // Variable to store the global minimum moves found.

    // Generate the possible states reachable in one move directly from the initial configuration.
    const firstLevelStates = generatePossibleMoves(initialBoardConfiguration);

    // For each state reachable after one move from the initial configuration,
    // calculate the minimum additional moves required to reach the solved state.
    // The recursive `calculateMinMoves` function is started with `currentMoveCount = 1`,
    // as one move has already been effectively made to reach `stateAfterOneMove`.
    for (let i = 0; i < firstLevelStates.length; i++) {
        const stateAfterOneMove = firstLevelStates[i];
        const movesFromThisState = calculateMinMoves(stateAfterOneMove, 1);
        // Update the overall minimum if a shorter path is found.
        overallMinimumMoves = Math.min(overallMinimumMoves, movesFromThisState);
    }

    // Output the final calculated minimum number of moves to solve the puzzle.
    console.log(overallMinimumMoves);

})(); // End of IIFE