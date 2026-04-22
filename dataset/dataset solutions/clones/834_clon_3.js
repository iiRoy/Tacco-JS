// This script processes game grids based on specific rules to find and clear connected blocks,
// simulating a puzzle game's chain reaction and gravity mechanics.
// It reads multiple test cases from standard input, processes each grid,
// and outputs the total score (number of successful clear operations) for each game.

// --- Global-like State Variables ---
// These variables maintain state across recursive calls and main game loop iterations
// within a single game turn, similar to how global variables `CNT` and `p` were used in the original.
let currentChainSizeTracker; // Tracks the number of connected blocks of the same color in the current recursive exploration.
let potentialRemovalCoordinates; // Stores a list of specific coordinates that trigger a block removal,
                               // typically when a chain of a minimum size is detected.

// --- Game Configuration Constants ---
const GRID_DIM_ROWS = 12; // Total number of rows in the game grid.
const GRID_DIM_COLS = 6;  // Total number of columns in the game grid.
const MIN_CHAIN_FOR_DELETION = 4; // The minimum number of connected blocks required to trigger a clear.
const VACANT_CELL_SYMBOL = '.'; // Represents an empty space on the grid.
const IMMOVABLE_BLOCK_SYMBOL = 'O'; // Represents a special obstacle block that can be cleared if adjacent to a chain.
const RECURSION_VISIT_MARKER = '_TMP_EXPLORE'; // Suffix used to temporarily mark cells during chain detection
                                              // to prevent infinite recursion and redundant counting.

/**
 * Recursively explores adjacent cells to identify connected blocks of the same color.
 * It increments a global counter for the chain size and, if the chain reaches a
 * critical length, adds the current block's coordinates to a global queue for removal.
 * Cells are temporarily marked on the game board itself to track visited nodes within
 * the current chain exploration.
 *
 * @param {number} currentPositionRow The row index of the block currently being examined.
 * @param {number} currentPositionCol The column index of the block currently being examined.
 * @param {string} desiredBlockColor The color string of the blocks to search for (e.g., "R", "G").
 * @param {Array<Array<string>>} activeGameBoard The 2D array representing the game grid.
 */
function probeConnectedBlocks(currentPositionRow, currentPositionCol, desiredBlockColor, activeGameBoard) {
    // Define relative shifts for checking neighbors: up, left, right, down.
    const rowDisplacements = [-1, 0, 0, 1];
    const colDisplacements = [0, -1, 1, 0];

    // Iterate through all four cardinal directions.
    for (let cardinalDirection = 0; cardinalDirection < 4; cardinalDirection++) {
        const adjacentRow = currentPositionRow + rowDisplacements[cardinalDirection];
        const adjacentCol = currentPositionCol + colDisplacements[cardinalDirection];

        // Perform boundary checks: ensure the adjacent cell is within the grid.
        if (adjacentRow < 0 || adjacentCol < 0 || adjacentRow >= GRID_DIM_ROWS || adjacentCol >= GRID_DIM_COLS) {
            continue; // Skip processing if out of bounds.
        }

        const neighborBlockContent = activeGameBoard[adjacentRow][adjacentCol];

        // Check if the neighbor block matches the target color and has not been
        // temporarily marked as visited during the current chain detection.
        if (neighborBlockContent === desiredBlockColor) {
            currentChainSizeTracker++; // Increment the global counter for the current chain.

            // If the chain size reaches the minimum threshold, add the coordinates of this
            // specific block to the queue of blocks to be cleared.
            // This behavior matches the original code's logic where the *last* block found
            // that makes the chain meet the criteria is added to the list `p`.
            if (currentChainSizeTracker === MIN_CHAIN_FOR_DELETION) {
                potentialRemovalCoordinates.push({ r: adjacentRow, c: adjacentCol });
            }

            // Temporarily mark this block on the game board as visited for this recursive pass.
            // This prevents re-visiting the same block within the current chain exploration
            // and avoids infinite recursion.
            activeGameBoard[adjacentRow][adjacentCol] = desiredBlockColor + RECURSION_VISIT_MARKER;

            // Recursively continue the exploration from this newly found connected block.
            probeConnectedBlocks(adjacentRow, adjacentCol, desiredBlockColor, activeGameBoard);
        }
    }
}

/**
 * Recursively removes connected blocks of a specified color from the game grid,
 * replacing them with empty space. It also clears any adjacent obstacle blocks ('O').
 *
 * @param {number} startingRowForClear The row index where the clearing process begins.
 * @param {number} startingColForClear The column index where the clearing process begins.
 * @param {string} colorOfBlocksToErase The color string of the blocks to be removed.
 * @param {Array<Array<string>>} activeGameBoard The 2D array representing the game grid.
 */
function initiateBlockRemoval(startingRowForClear, startingColForClear, colorOfBlocksToErase, activeGameBoard) {
    // Define relative shifts for checking neighbors.
    const rowDelta = [-1, 0, 0, 1];
    const colDelta = [0, -1, 1, 0];

    // Mark the current block as an empty space.
    activeGameBoard[startingRowForClear][startingColForClear] = VACANT_CELL_SYMBOL;

    // Explore neighboring cells.
    for (let neighborIndex = 0; neighborIndex < 4; neighborIndex++) {
        const nextClearRow = startingRowForClear + rowDelta[neighborIndex];
        const nextClearCol = startingColForClear + colDelta[neighborIndex];

        // Ensure the neighbor is within the grid boundaries.
        if (nextClearRow < 0 || nextClearCol < 0 || nextClearRow >= GRID_DIM_ROWS || nextClearCol >= GRID_DIM_COLS) {
            continue;
        }

        const neighborCellContent = activeGameBoard[nextClearRow][nextClearCol];

        // If the neighbor is of the same color, recursively remove it.
        if (neighborCellContent === colorOfBlocksToErase) {
            initiateBlockRemoval(nextClearRow, nextClearCol, colorOfBlocksToErase, activeGameBoard);
        }
        // If the neighbor is an obstacle block, clear it as well (special game rule).
        else if (neighborCellContent === IMMOVABLE_BLOCK_SYMBOL) {
            activeGameBoard[nextClearRow][nextClearCol] = VACANT_CELL_SYMBOL;
        }
    }
}

/**
 * Simulates gravity for a specific column, moving blocks downwards to fill an empty space.
 * It searches upwards from the target empty cell for the first non-empty block and moves it down.
 *
 * @param {number} targetEmptyRow The row index of the empty cell that needs to be filled.
 * @param {number} targetColumn The column index where gravity is applied.
 * @param {Array<Array<string>>} activeGameBoard The 2D array representing the game grid.
 */
function applyColumnShiftGravity(targetEmptyRow, targetColumn, activeGameBoard) {
    // Start searching from the cell directly above the target empty cell.
    let currentScanRow = targetEmptyRow;

    // Iterate upwards from the target empty cell towards the top of the column.
    while (currentScanRow > 0) {
        currentScanRow--; // Move to the cell directly above.

        // If a non-empty block is found, it can be moved down.
        if (activeGameBoard[currentScanRow][targetColumn] !== VACANT_CELL_SYMBOL) {
            // Move the found block into the target empty space.
            activeGameBoard[targetEmptyRow][targetColumn] = activeGameBoard[currentScanRow][targetColumn];
            // Mark the original position of the moved block as empty.
            activeGameBoard[currentScanRow][targetColumn] = VACANT_CELL_SYMBOL;
            break; // The empty space has been filled, so stop searching for this target.
        }
    }
}

// --- Main Program Logic ---

// Read the entire raw input data from standard input.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim leading/trailing whitespace and split into an array of lines.
const processedInputLines = rawInputContent.trim().split('\n');

// The very first line of the input specifies the total number of test cases.
// Convert this string to an integer.
const totalGameSessions = parseInt(processedInputLines.shift(), 10);

// Loop through each individual game session (test case).
for (let sessionIndex = 0; sessionIndex < totalGameSessions; sessionIndex++) {
    // Initialize the game grid for the current session.
    let gameGridState = [];
    for (let rowBuilder = 0; rowBuilder < GRID_DIM_ROWS; rowBuilder++) {
        // Each subsequent line represents a row of blocks; split it into an array of characters.
        const currentRowBlocks = processedInputLines.shift().split('');
        gameGridState.push(currentRowBlocks);
    }

    let currentSessionScore = 0; // Initialize the score for the current game session.

    // Main game simulation loop: continues as long as blocks are being cleared in turns.
    while (true) {
        potentialRemovalCoordinates = []; // Reset the queue of blocks to remove for this new turn.

        // --- Phase 1: Identify and Mark Connected Chains ---
        // Iterate through every cell in the grid to find potential starting points for block chains.
        for (let r = 0; r < GRID_DIM_ROWS; r++) {
            for (let c = 0; c < GRID_DIM_COLS; c++) {
                const cellBlockValue = gameGridState[r][c];

                // A block can be a starting point for a chain check if it's:
                // 1. Not an empty space.
                // 2. Not an immovable obstacle block.
                // 3. Has not been temporarily marked as visited during *this* chain detection sweep.
                if (cellBlockValue !== VACANT_CELL_SYMBOL &&
                    cellBlockValue !== IMMOVABLE_BLOCK_SYMBOL &&
                    !cellBlockValue.endsWith(RECURSION_VISIT_MARKER))
                {
                    currentChainSizeTracker = 1; // Initialize the chain counter for this new chain.
                    const originalBlockColor = cellBlockValue; // Store the original color.

                    // Temporarily mark the current starting block as visited on the game grid itself.
                    gameGridState[r][c] = originalBlockColor + RECURSION_VISIT_MARKER;

                    // Initiate the recursive exploration from this block.
                    // This function will update `currentChainSizeTracker` and `potentialRemovalCoordinates`.
                    probeConnectedBlocks(r, c, originalBlockColor, gameGridState);
                }
            }
        }

        // --- Global Cleanup of Temporary Markers ---
        // After all potential chains have been explored in the grid,
        // revert all temporary visit markers back to their original block colors.
        // This matches the original code's `slice(0,1)` loop.
        for (let r = 0; r < GRID_DIM_ROWS; r++) {
            for (let c = 0; c < GRID_DIM_COLS; c++) {
                if (gameGridState[r][c].endsWith(RECURSION_VISIT_MARKER)) {
                    // Remove the temporary suffix to restore the cell's true block color.
                    gameGridState[r][c] = gameGridState[r][c].slice(0, -RECURSION_VISIT_MARKER.length);
                }
            }
        }

        // --- Check for Game End Condition ---
        // If no blocks met the criteria for removal in this turn, the game loop ends.
        if (potentialRemovalCoordinates.length === 0) {
            break;
        }

        currentSessionScore++; // Increment the score for a successful clearing turn.

        // --- Phase 2: Clear Identified Blocks ---
        // Process each coordinate in the queue of blocks designated for removal.
        potentialRemovalCoordinates.forEach(function(blockCoordinate) {
            const rowToClear = blockCoordinate.r;
            const colToClear = blockCoordinate.c;
            const blockContentAtCoord = gameGridState[rowToClear][colToClear];

            // Only proceed with clearing if the block still exists and is not already empty.
            // This guards against multiple chains marking the same block for removal.
            if (blockContentAtCoord !== VACANT_CELL_SYMBOL) {
                initiateBlockRemoval(rowToClear, colToClear, blockContentAtCoord, gameGridState);
            }
        });

        // --- Phase 3: Apply Gravity to the Grid ---
        // Iterate through the grid from bottom-up and column-wise.
        // This order ensures blocks fall correctly without interfering with subsequent gravity operations
        // in the same column or adjacent columns that have already been processed.
        // The original code iterated rows from 11 down to 1, then columns 0 to 5.
        // `applyColumnShiftGravity` is called when an empty cell is found, attempting to pull a block down into it.
        for (let r = GRID_DIM_ROWS - 1; r > 0; r--) { // Start from the second-to-last row up to the first.
                                                    // Row 0 cannot be a target empty cell for `applyColumnShiftGravity`.
            for (let c = 0; c < GRID_DIM_COLS; c++) {
                // If the current cell is empty, attempt to apply gravity to fill it.
                if (gameGridState[r][c] === VACANT_CELL_SYMBOL) {
                    applyColumnShiftGravity(r, c, gameGridState);
                }
            }
        }
    }

    // Output the final accumulated score for the current game session.
    console.log(currentSessionScore);
}