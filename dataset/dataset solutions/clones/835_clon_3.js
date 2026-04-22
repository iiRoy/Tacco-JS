const BOARD_HEIGHT = 12; // Constant for the number of rows on the game board
const BOARD_WIDTH = 6;    // Constant for the number of columns on the game board

// Minimum number of connected blocks required to trigger a chain reaction
const MIN_CLUSTER_SIZE_FOR_CHAIN = 4;

// Direction vectors for checking adjacent cells: [Up, Left, Right, Down]
const DELTA_ROWS = [-1, 0, 0, 1];
const DELTA_COLS = [0, -1, 1, 0];
const NUM_DIRECTIONS = DELTA_ROWS.length; // Should always be 4 for 4-directional adjacency

/**
 * Checks if a given row and column index are within the defined board boundaries.
 * @param {number} r - The row index to check.
 * @param {number} c - The column index to check.
 * @returns {boolean} - True if the coordinates are within bounds, false otherwise.
 */
function isWithinBounds(r, c) {
    return r >= 0 && r < BOARD_HEIGHT && c >= 0 && c < BOARD_WIDTH;
}

/**
 * Recursively finds and marks connected blocks of the same color, updating cluster information.
 * This function modifies the `playField` by appending the current cluster size to the block's color
 * (e.g., "R" becomes "R1", "R2", etc.) to mark it as visited and keep track of its sequence in the cluster.
 * If the cluster reaches `MIN_CLUSTER_SIZE_FOR_CHAIN` at any point, the current cell's coordinates
 * are added to `clusterInfo.chainTriggers`.
 *
 * @param {number} currentRow - The current row index being evaluated.
 * @param {number} currentCol - The current column index being evaluated.
 * @param {string} targetColor - The base color of the blocks to search for (e.g., "R", "G").
 * @param {string[][]} playField - The 2D array representing the game board.
 * @param {object} clusterInfo - An object containing:
 *   - `size`: The current count of connected blocks found in the cluster.
 *   - `chainTriggers`: An array where potential chain reaction points (`[row, col]`) are stored.
 */
function evaluateCluster(currentRow, currentCol, targetColor, playField, clusterInfo) {
    // If the current cell is the one that causes the cluster to reach the minimum chain size,
    // add its coordinates to the list of chain triggers.
    // The `clusterInfo.size` would have been incremented just before this call for this cell.
    if (clusterInfo.size === MIN_CLUSTER_SIZE_FOR_CHAIN) {
        clusterInfo.chainTriggers.push([currentRow, currentCol]);
    }

    // Explore all 4 adjacent cells (Up, Left, Right, Down)
    for (let i = 0; i < NUM_DIRECTIONS; i++) {
        const nextRow = currentRow + DELTA_ROWS[i];
        const nextCol = currentCol + DELTA_COLS[i];

        // Skip if the next cell is out of board boundaries
        if (!isWithinBounds(nextRow, nextCol)) {
            continue;
        }

        // Check if the adjacent cell is the `targetColor` and has not been visited yet.
        // A cell is considered "not visited" if its content is exactly `targetColor` (length 1).
        if (playField[nextRow][nextCol] === targetColor) {
            clusterInfo.size++; // Increment the cluster size counter for the new connected block
            // Mark the next cell as visited by appending its sequence number (current cluster size)
            playField[nextRow][nextCol] = targetColor + clusterInfo.size;

            // Recursively call this function for the newly found connected block
            evaluateCluster(nextRow, nextCol, targetColor, playField, clusterInfo);
        }
    }
}

/**
 * Recursively clears connected blocks from the game board starting from a given point.
 * It removes blocks of `clearColor` (and any marked versions like "R1", "G4") and also
 * clears any adjacent 'O' blocks. Cleared blocks are replaced with a '.' (empty marker).
 *
 * @param {number} startRow - The row index to begin clearing from.
 * @param {number} startCol - The column index to begin clearing from.
 * @param {string} clearColor - The base color of the blocks to clear (e.g., "R", "G").
 * @param {string[][]} boardState - The 2D array representing the game board.
 */
function obliterateBlocks(startRow, startCol, clearColor, boardState) {
    // Guard clause: If out of bounds or the cell is already empty, stop recursion.
    if (!isWithinBounds(startRow, startCol) || boardState[startRow][startCol] === '.') {
        return;
    }

    // Clear the current block by setting it to '.' (empty)
    boardState[startRow][startCol] = '.';

    // Explore adjacent cells to continue clearing
    for (let i = 0; i < NUM_DIRECTIONS; i++) {
        const neighborRow = startRow + DELTA_ROWS[i];
        const neighborCol = startCol + DELTA_COLS[i];

        // Skip if the neighbor is out of bounds
        if (!isWithinBounds(neighborRow, neighborCol)) {
            continue;
        }

        const neighborContent = String(boardState[neighborRow][neighborCol]);

        // If the neighbor is of the `clearColor` (or a marked version like "R1")
        // or if it's an 'O' block, recursively clear it.
        if (neighborContent.startsWith(clearColor) || neighborContent === 'O') {
            obliterateBlocks(neighborRow, neighborCol, clearColor, boardState);
        }
    }
}

/**
 * Simulates gravity for a specific column, moving blocks downwards to fill an empty spot.
 * It searches upwards from `emptySpotRow` in `columnIdx` for the first non-empty block
 * and moves it into the `emptySpotRow`.
 *
 * @param {number} emptySpotRow - The row index of the empty spot that needs to be filled.
 * @param {number} columnIdx - The column index where gravity is being applied.
 * @param {string[][]} boardGrid - The 2D array representing the game board.
 */
function performColumnGravity(emptySpotRow, columnIdx, boardGrid) {
    // Guard clause: Ensure the `emptySpotRow` is valid and actually contains an empty spot.
    // If not empty or out of bounds, no gravity action is needed for this specific spot.
    if (!isWithinBounds(emptySpotRow, columnIdx) || boardGrid[emptySpotRow][columnIdx] !== '.') {
        return;
    }

    // Iterate upwards from the row directly above the empty spot to the top of the board.
    let searchRow = emptySpotRow - 1;
    while (searchRow >= 0) {
        // If a non-empty block is found above, move it down to the `emptySpotRow`.
        if (boardGrid[searchRow][columnIdx] !== '.') {
            boardGrid[emptySpotRow][columnIdx] = boardGrid[searchRow][columnIdx]; // Move block down
            boardGrid[searchRow][columnIdx] = '.'; // Clear the original position of the block
            break; // Stop after moving one block; this single empty spot is now filled.
        }
        searchRow--; // Continue searching upwards
    }
}

// --- Main Program Execution Flow ---

// Utilize Node.js standard library for file system operations
const fsModule = require('node:fs');

// Read the entire raw input data from standard input (usually `/dev/stdin` in competitive programming)
const rawInputData = fsModule.readFileSync('/dev/stdin', 'utf8');

// Process input: remove leading/trailing whitespace and split the string into an array of lines
const inputLines = rawInputData.trim().split('\n');

// The very first line of input specifies the total number of game boards to simulate
// Use parseInt with radix 10 for robust conversion from string to integer.
const numberOfGameBoards = parseInt(inputLines.shift(), 10);

// Loop through each game board simulation as specified by `numberOfGameBoards`
for (let boardCounter = 0; boardCounter < numberOfGameBoards; boardCounter++) {
    // Initialize a new game board (2D array) for the current simulation
    const gameBoard = [];
    for (let rowInitializer = 0; rowInitializer < BOARD_HEIGHT; rowInitializer++) {
        // Read each subsequent line from input, split it into individual characters (blocks),
        // and add it as a row to the `gameBoard`.
        const rowData = inputLines.shift().split('');
        gameBoard.push(rowData);
    }

    let boardScore = 0; // Initialize the chain reaction count (score) for the current board

    // This is the main game simulation loop for a single board.
    // It continues as long as chain reactions are successfully identified and cleared.
    gameSimulationLoop: while (true) {
        // Object to manage state for the current cluster analysis phase.
        // `size` is reset for each individual cluster search.
        // `chainTriggers` collects all points that caused a chain reaction in this iteration.
        const currentClusterAnalysis = {
            size: 0,
            chainTriggers: []
        };

        // --- Phase 1: Identify and Mark All Potential Chain Reactions ---
        // Iterate through every cell on the game board to find starting points of clusters.
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            for (let c = 0; c < BOARD_WIDTH; c++) {
                const cellContent = gameBoard[r][c];

                // Only process cells that are single-character colors (e.g., "R", "G"),
                // meaning they haven't been visited/marked yet by `evaluateCluster` and are not empty.
                if (cellContent.length === 1 && cellContent !== '.') {
                    currentClusterAnalysis.size = 1; // Initialize size for this new cluster starting at (r,c)
                    // Mark the starting cell with its initial cluster size (e.g., "R1")
                    gameBoard[r][c] = cellContent + currentClusterAnalysis.size;

                    // Start the recursive evaluation to find and mark the rest of the cluster
                    evaluateCluster(r, c, cellContent, gameBoard, currentClusterAnalysis);
                }
            }
        }

        // --- Phase 2: Clean Up Temporary Cluster Markings ---
        // After all clusters have been identified and marked (e.g., "R1", "G4"),
        // revert these cells back to their original base color ("R", "G").
        // This prepares the board for the next steps (clearing and gravity).
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            for (let c = 0; c < BOARD_WIDTH; c++) {
                // If a cell's content has a length greater than 1, it indicates a temporary mark.
                // Extract the first character (the original color).
                if (String(gameBoard[r][c]).length > 1) {
                    gameBoard[r][c] = String(gameBoard[r][c]).charAt(0);
                }
            }
        }

        // --- Phase 3: Check for Chain Reactions and Initiate Block Clearing ---
        // If no clusters met the `MIN_CLUSTER_SIZE_FOR_CHAIN` criteria during this iteration,
        // then no chain reactions occurred, and the game loop for this board ends.
        if (currentClusterAnalysis.chainTriggers.length === 0) {
            break gameSimulationLoop; // Exit the `while` loop using its label
        }

        boardScore++; // Increment the chain reaction counter for this board's score

        // For each cell identified as a trigger point for a chain reaction,
        // initiate the recursive clearing process.
        currentClusterAnalysis.chainTriggers.forEach(function(triggerCoordinates) {
            const triggerRow = triggerCoordinates[0];
            const triggerCol = triggerCoordinates[1];
            const blockColorToClear = gameBoard[triggerRow][triggerCol];

            // Only proceed with clearing if the block still exists (hasn't been cleared by an earlier trigger in this phase)
            if (blockColorToClear !== '.') {
                obliterateBlocks(triggerRow, triggerCol, blockColorToClear, gameBoard);
            }
        });

        // --- Phase 4: Apply Gravity to Make Blocks Fall Down ---
        // Iterate through the board from the bottom-most row upwards to the top row.
        // For each cell, if it's found to be empty ('.'), attempt to apply gravity
        // to its column to make blocks above it fall down.
        for (let r = BOARD_HEIGHT - 1; r >= 0; r--) { // Start from the last row, go up to the first
            for (let c = 0; c < BOARD_WIDTH; c++) {
                if (gameBoard[r][c] === '.') {
                    performColumnGravity(r, c, gameBoard);
                }
            }
        }
    } // End of gameSimulationLoop for the current board

    // Output the final score (total number of chain reactions) for the current board
    console.log(boardScore);
} // End of loop for all game boards