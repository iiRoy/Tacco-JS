let gameGrid = [];
let currentMatchSize = 0;
let pendingClears = new Set();

const GRID_HEIGHT = 12;
const GRID_WIDTH = 6;
const MINIMUM_MATCH_COUNT = 4;
const EMPTY_SPACE_SYMBOL = '.';
const BLOCK_TYPES = ['R', 'G', 'B', 'Y', 'P'];
const MOVEMENT_DELTAS = [
    [-1, 0], // North
    [0, -1], // West
    [0, 1],  // East
    [1, 0]   // South
];

/**
 * Extracts the base color from a grid cell value, ignoring temporary markers.
 * For example, "R1" becomes "R", while "." remains ".".
 * @param {string} cellContent The value of a cell in the grid.
 * @returns {string} The fundamental block type or the original content if no marker is present.
 */
function getBaseBlockType(cellContent) {
    if (cellContent && cellContent.length > 1 && BLOCK_TYPES.some(type => cellContent.startsWith(type))) {
        return cellContent.charAt(0);
    }
    return cellContent;
}

/**
 * Recursively traverses adjacent blocks of the same color, identifying connected groups.
 * Updates the global 'currentMatchSize' and 'pendingClears' Set.
 * Temporarily marks visited blocks on the 'gameGrid' to prevent infinite loops within a scan.
 * @param {number} currentRow The row index of the current block.
 * @param {number} currentCol The column index of the current block.
 * @param {string} desiredColor The color to match during this exploration.
 */
function exploreConnectedBlocks(currentRow, currentCol, desiredColor) {
    // Validate the desired color to ensure it's a known block type.
    if (!BLOCK_TYPES.includes(desiredColor)) {
        return;
    }

    // Iterate through all four possible cardinal directions (up, left, right, down).
    for (const [rowOffset, colOffset] of MOVEMENT_DELTAS) {
        const nextRow = currentRow + rowOffset;
        const nextCol = currentCol + colOffset;

        // Check if the calculated next position falls within the game grid boundaries.
        if (nextRow < 0 || nextCol < 0 || nextRow >= GRID_HEIGHT || nextCol >= GRID_WIDTH) {
            continue; // Skip positions that are out of bounds.
        }

        // Retrieve the base color of the adjacent cell, stripping any temporary visited markers.
        const adjacentCellBaseColor = getBaseBlockType(gameGrid[nextRow][nextCol]);

        // If the adjacent cell's base color matches the desired color and it hasn't been visited
        // in the current exploration path (indicated by its base color being present), proceed.
        if (adjacentCellBaseColor === desiredColor) {
            currentMatchSize++; // Increment the global counter for the current chain.
            // Mark the cell as visited for this specific scan by appending the current chain size.
            // This also prevents re-processing this cell within the same recursive call tree.
            gameGrid[nextRow][nextCol] = desiredColor + currentMatchSize;

            // If the size of the connected chain meets or exceeds the minimum required count,
            // add this cell's coordinates to the set of blocks scheduled for clearing.
            if (currentMatchSize >= MINIMUM_MATCH_COUNT) {
                pendingClears.add(`${nextRow},${nextCol}`);
            }
            
            // Recursively continue the exploration from this newly found connected block.
            exploreConnectedBlocks(nextRow, nextCol, desiredColor);
        }
    }
}

/**
 * Recursively removes a connected group of blocks that match a specified color.
 * Cleared cells are replaced with the EMPTY_SPACE_SYMBOL.
 * @param {number} startRow The starting row index for the clearing operation.
 * @param {number} startCol The starting column index for the clearing operation.
 * @param {string} colorToRemove The color of blocks to be removed.
 */
function purgeMatchingBlocks(startRow, startCol, colorToRemove) {
    // Ensure the current coordinates are within the valid grid boundaries.
    if (startRow < 0 || startCol < 0 || startRow >= GRID_HEIGHT || startCol >= GRID_WIDTH) {
        return;
    }

    // Get the base color of the block at the current position.
    const currentCellBaseColor = getBaseBlockType(gameGrid[startRow][startCol]);

    // If the current block's base color matches the color to remove, clear it and recurse.
    if (currentCellBaseColor === colorToRemove) {
        gameGrid[startRow][startCol] = EMPTY_SPACE_SYMBOL; // Replace the block with an empty space.

        // Explore and clear adjacent blocks in all four directions.
        for (const [rowOffset, colOffset] of MOVEMENT_DELTAS) {
            purgeMatchingBlocks(startRow + rowOffset, startCol + colOffset, colorToRemove);
        }
    }
    // Note: The original code included an 'else if ("O")' condition which was unused in the context
    // of the provided problem and has been removed for simplicity as a Type III modification.
}

/**
 * Applies gravity to a single empty cell in a column by pulling a block down from above it.
 * This function handles the movement for one specific empty spot.
 * @param {number} targetRow The row index of the empty cell to be filled.
 * @param {number} targetCol The column index where gravity is applied.
 */
function applySingleCellGravity(targetRow, targetCol) {
    // If the target cell is not empty, there's no need to pull anything down into it.
    if (gameGrid[targetRow][targetCol] !== EMPTY_SPACE_SYMBOL) {
        return;
    }

    let searchRow = targetRow;
    // Iterate upwards from the target empty row to find the first non-empty block.
    while (searchRow > 0) {
        searchRow--; // Move to the row directly above.
        // If a non-empty block is found, move it to the target empty position.
        if (gameGrid[searchRow][targetCol] !== EMPTY_SPACE_SYMBOL) {
            gameGrid[targetRow][targetCol] = gameGrid[searchRow][targetCol]; // Move block down.
            gameGrid[searchRow][targetCol] = EMPTY_SPACE_SYMBOL; // Empty the block's original position.
            break; // Stop after moving one block; this single empty spot is now filled.
        }
    }
}

/**
 * Resets all temporary markers on the game grid (e.g., "R1", "G2" back to "R", "G").
 * This is crucial after scanning for connected blocks but before initiating the clearing phase,
 * ensuring the grid state is clean for subsequent operations.
 */
function normalizeGridBlockMarkers() {
    for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
            gameGrid[r][c] = getBaseBlockType(gameGrid[r][c]);
        }
    }
}

// --- Main Program Execution ---
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split('\n');

const totalTestCases = Number(inputLines.shift()); // Convert the first line to the number of test cases.

// Loop through each distinct test case provided in the input.
for (let testCaseIndex = 0; testCaseIndex < totalTestCases; testCaseIndex++) {
    // Initialize the game board (grid) for the current test case.
    gameGrid = [];
    for (let r = 0; r < GRID_HEIGHT; r++) {
        gameGrid.push(inputLines.shift().split('')); // Read each row and split into characters.
    }

    let chainReactionCount = 0; // Counter for successful chain reactions.
    let blocksWereClearedInThisRound = true; // Flag to control the main game loop.

    // The main game loop continues as long as blocks are being cleared and gravity is applied.
    while (blocksWereClearedInThisRound) {
        pendingClears.clear(); // Reset the set of blocks to be cleared for this new round.
        currentMatchSize = 0; // Reset the chain size counter for each full board scan.

        // Phase 1: Scan the entire board to identify all potential blocks for clearing.
        for (let r = 0; r < GRID_HEIGHT; r++) {
            for (let c = 0; c < GRID_WIDTH; c++) {
                const initialBlockType = getBaseBlockType(gameGrid[r][c]);

                // If the current block is a valid color type (not empty or already marked).
                if (BLOCK_TYPES.includes(initialBlockType)) {
                    currentMatchSize = 1; // Start counting from the current block itself.
                    // Temporarily mark the current block as visited for this scan.
                    gameGrid[r][c] = initialBlockType + currentMatchSize;

                    // If this single block already meets the minimum chain requirement (unlikely for MINIMUM_MATCH_COUNT > 1).
                    if (currentMatchSize >= MINIMUM_MATCH_COUNT) {
                        pendingClears.add(`${r},${c}`);
                    }
                    
                    // Begin recursive exploration for connected blocks starting from this position.
                    exploreConnectedBlocks(r, c, initialBlockType);
                }
            }
        }

        // After all board scans are complete, remove the temporary markers (e.g., "R1" becomes "R").
        normalizeGridBlockMarkers();

        // Check if any blocks were identified for clearing in this round.
        blocksWereClearedInThisRound = pendingClears.size > 0;

        if (!blocksWereClearedInThisRound) {
            break; // If no blocks were found to clear, the chain reaction ends.
        }

        chainReactionCount++; // Increment the counter for successful chain reactions.

        // Phase 2: Clear the identified blocks from the game board.
        // Convert the Set of coordinates to an Array to safely iterate (Set might change during recursion).
        const cellsToProcess = Array.from(pendingClears);
        for (const coordString of cellsToProcess) {
            const [r, c] = coordString.split(',').map(Number);
            const blockColorAtCoord = getBaseBlockType(gameGrid[r][c]);
            // Ensure the cell still contains a block before attempting to purge it.
            if (BLOCK_TYPES.includes(blockColorAtCoord)) {
                purgeMatchingBlocks(r, c, blockColorAtCoord);
            }
        }

        // Phase 3: Apply gravity to all columns, shifting blocks downwards to fill empty spaces.
        // Iterate through each column from left to right.
        for (let c = 0; c < GRID_WIDTH; c++) {
            // Iterate through rows from bottom to top within each column.
            for (let r = GRID_HEIGHT - 1; r >= 0; r--) {
                // If an empty space is found, apply gravity to bring blocks down into it.
                if (gameGrid[r][c] === EMPTY_SPACE_SYMBOL) {
                    applySingleCellGravity(r, c);
                }
            }
        }
    }

    console.log(chainReactionCount); // Output the total chain reaction count for the current test case.
}