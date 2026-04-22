// Function to solve the 2x4 sliding tile puzzle using Breadth-First Search (BFS).
// It explores all reachable states and records the minimum number of moves to reach each state.
function solveSlidingPuzzle() {
    // Constants for puzzle dimensions
    const NUM_ROWS = 2;
    const NUM_COLS = 4;
    const EMPTY_TILE_VALUE = 0;

    // Stores the minimum number of moves to reach a particular puzzle state (represented as a string).
    // The key is the flattened puzzle state as a string, value is the move count.
    const stateMoveCounts = {};

    // Define relative movements for row and column (up, left, right, down)
    const rowOffsets = [-1, 0, 0, 1]; // dy
    const colOffsets = [0, -1, 1, 0]; // dx

    // Initial configuration of the puzzle (flattened 1D array)
    const initialTiles = [0, 1, 2, 3, 4, 5, 6, 7]; // V

    // Queue for BFS. Each element is [puzzle_state_array, moves_to_reach_state]
    const bfsQueue = [[initialTiles, 0]]; // P

    // Initialize the distance for the starting state
    stateMoveCounts[initialTiles.join("")] = 0;

    // Helper function to convert a 1D array to a 2D grid representation
    const createGrid = (flatArr) => {
        const grid = [];
        for (let r = 0; r < NUM_ROWS; r++) {
            grid.push(flatArr.slice(r * NUM_COLS, (r + 1) * NUM_COLS));
        }
        return grid;
    };

    // Helper function to convert a 2D grid back to a 1D array
    const flattenGrid = (grid) => {
        return grid[0].concat(grid[1]);
    };

    // Main BFS loop
    while (bfsQueue.length > 0) {
        // Dequeue the current state and its move count
        const [currentBoardArr, currentMoves] = bfsQueue.shift(); // A, arr, cnt

        // Find the position of the empty tile (0)
        const zeroTilePosition = currentBoardArr.indexOf(EMPTY_TILE_VALUE); // index
        const zeroRow = Math.floor(zeroTilePosition / NUM_COLS); // y
        const zeroCol = zeroTilePosition % NUM_COLS; // x

        // Convert the current 1D board array to a 2D grid for easier manipulation
        const currentGrid = createGrid(currentBoardArr); // yx

        // Explore all possible moves from the current empty tile position
        for (let dirIdx = 0; dirIdx < rowOffsets.length; dirIdx++) { // i
            const neighborRow = zeroRow + rowOffsets[dirIdx]; // yy
            const neighborCol = zeroCol + colOffsets[dirIdx]; // xx

            // Check if the neighbor position is within the board boundaries
            if (neighborRow < 0 || neighborCol < 0 || neighborRow >= NUM_ROWS || neighborCol >= NUM_COLS) {
                // Invalid move, skip to the next direction
                continue;
            }

            // Create a temporary grid to simulate the move
            // We clone the currentGrid to avoid modifying it directly for subsequent moves in the same iteration
            const nextGridState = JSON.parse(JSON.stringify(currentGrid));

            // Get the value of the tile to be moved (the neighbor tile)
            const tileToMove = nextGridState[neighborRow][neighborCol]; // card

            // Perform the swap: move the neighbor tile into the empty slot
            nextGridState[zeroRow][zeroCol] = tileToMove;
            nextGridState[neighborRow][neighborCol] = EMPTY_TILE_VALUE;

            // Convert the new 2D grid state back to a 1D array
            const nextBoardArr = flattenGrid(nextGridState); // YX

            // Create a unique string key for the new board state
            const boardStateKey = nextBoardArr.join(""); // str

            // If this state has not been visited before, or if we found a shorter path
            // (though for BFS, the first path found is always the shortest)
            if (!(boardStateKey in stateMoveCounts)) {
                // Record the number of moves to reach this new state
                stateMoveCounts[boardStateKey] = currentMoves + 1;
                // Add the new state to the queue for further exploration
                bfsQueue.push([nextBoardArr, currentMoves + 1]);
            }
            // No need to backtrack the swap here because we created a deep copy (nextGridState)
            // The original `currentGrid` remains unchanged for the next direction iteration.
        }
    }
    // Return the map of all reachable states and their minimum move counts
    return stateMoveCounts;
}

// --- Main execution block ---

// Read all input from standard input (e.g., from a file redirect or pipe)
// In a typical competitive programming environment, /dev/stdin is used.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-calculate all possible puzzle states and their minimum move counts
// This is done once to answer multiple queries efficiently.
const precomputedPuzzleSolutions = solveSlidingPuzzle();

// Process each line of the input data
rawInputData.trim().split("\n").forEach(queryLine => { // Arr.forEach(function(v){
    // Clean up the query line: remove spaces to get the flattened puzzle state string
    const formattedQuery = queryLine.split(" ").join("");

    // Look up the solution for the queried puzzle state
    const solutionMoves = precomputedPuzzleSolutions[formattedQuery];

    // Print the result to standard output
    console.log(solutionMoves);
});