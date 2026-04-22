const GAME_BOARD_HEIGHT = 12; // Number of rows in the game board
const GAME_BOARD_WIDTH = 6;   // Number of columns in the game board
const EMPTY_CELL_IDENTIFIER = '.'; // Represents an empty slot on the board
const OBSTACLE_CELL_IDENTIFIER = 'O'; // Represents a special obstacle block
const MIN_CLUSTER_FOR_CLEARANCE = 4; // Minimum number of connected blocks to trigger a clear
const ADJACENCY_DIRECTIONS = [
    { dr: -1, dc: 0 }, // Up
    { dr: 0, dc: -1 }, // Left
    { dr: 0, dc: 1 },  // Right
    { dr: 1, dc: 0 }   // Down
];

/**
 * Checks if a given row and column coordinate is within the bounds of the game board.
 * @param {number} r - The row index.
 * @param {number} c - The column index.
 * @returns {boolean} - True if coordinates are valid, false otherwise.
 */
function isValidBoardPosition(r, c) {
    return r >= 0 && r < GAME_BOARD_HEIGHT && c >= 0 && c < GAME_BOARD_WIDTH;
}

/**
 * Recursively explores connected blocks of the same color, marking them temporarily
 * and tracking the cluster's size and potential trigger points for clearing.
 * This function modifies the gameBoard temporarily to mark visited cells and
 * updates the clusterTracking object by reference.
 *
 * @param {number} currentRow - The current row index to start exploration from.
 * @param {number} currentCol - The current column index to start exploration from.
 * @param {string} targetColor - The base color of the blocks being searched for.
 * @param {Array<Array<string>>} gameBoard - The 2D array representing the game board.
 * @param {object} clusterTracking - An object to store cluster statistics:
 *   - `currentSize`: The number of blocks found in the current cluster.
 *   - `clearActivationPoints`: An array of [row, col] coordinates that triggered clearance conditions.
 */
function analyzeCluster(currentRow, currentCol, targetColor, gameBoard, clusterTracking) {
    // Iterate over all four cardinal directions to find adjacent blocks
    for (const direction of ADJACENCY_DIRECTIONS) {
        const neighborRow = currentRow + direction.dr;
        const neighborCol = currentCol + direction.dc;

        // Skip if the neighbor is out of board boundaries
        if (!isValidBoardPosition(neighborRow, neighborCol)) {
            continue;
        }

        const neighborCellContent = gameBoard[neighborRow][neighborCol];
        // If the neighbor block matches the target color, process it
        if (neighborCellContent === targetColor) {
            clusterTracking.currentSize++; // Increment the size of the current cluster

            // If the cluster size reaches the minimum for clearance,
            // add this neighbor's coordinates as a potential activation point.
            // The original logic pushed the *neighbor* that caused the count to reach 4.
            if (clusterTracking.currentSize === MIN_CLUSTER_FOR_CLEARANCE) {
                clusterTracking.clearActivationPoints.push([neighborRow, neighborCol]);
            }

            // Temporarily mark the visited neighbor on the board to prevent re-visiting
            // and to carry the cluster size context.
            gameBoard[neighborRow][neighborCol] = targetColor + clusterTracking.currentSize;

            // Recursively call the function for the newly found connected block
            analyzeCluster(neighborRow, neighborCol, targetColor, gameBoard, clusterTracking);
        }
    }
}

/**
 * Recursively removes connected blocks of a specified color (or 'O' obstacles) from the game board.
 * This function modifies the gameBoard in place by replacing cleared blocks with an empty cell identifier.
 *
 * @param {number} startRow - The row index to begin clearing from.
 * @param {number} startCol - The column index to begin clearing from.
 * @param {string} colorToClear - The color of blocks to be removed.
 * @param {Array<Array<string>>} gameBoard - The 2D array representing the game board.
 */
function performClearing(startRow, startCol, colorToClear, gameBoard) {
    // Immediately mark the current cell as empty to prevent infinite recursion and double-clearing
    gameBoard[startRow][startCol] = EMPTY_CELL_IDENTIFIER;

    // Explore adjacent cells
    for (const direction of ADJACENCY_DIRECTIONS) {
        const neighborRow = startRow + direction.dr;
        const neighborCol = startCol + direction.dc;

        // Skip if out of bounds
        if (!isValidBoardPosition(neighborRow, neighborCol)) {
            continue;
        }

        const neighborCell = gameBoard[neighborRow][neighborCol];

        // If the neighbor matches the target color, clear it recursively
        if (neighborCell === colorToClear) {
            performClearing(neighborRow, neighborCol, colorToClear, gameBoard);
        }
        // Special case: If an obstacle block 'O' is found, clear it as well
        else if (neighborCell === OBSTACLE_CELL_IDENTIFIER) {
            gameBoard[neighborRow][neighborCol] = EMPTY_CELL_IDENTIFIER;
            // Note: Obstacles are cleared but do not trigger further recursive clearing of their neighbors
            // unless those neighbors match the original colorToClear.
        }
    }
}

/**
 * Applies gravity to a specific column, moving blocks upwards to fill an empty slot.
 * This function modifies the gameBoard in place. It searches upwards from `currentRow`
 * in `targetColumn` for the first non-empty block and moves it to `currentRow`,
 * leaving the original spot empty.
 *
 * @param {number} currentRow - The row index of the empty slot to be filled.
 * @param {number} targetColumn - The column index where gravity is applied.
 * @param {Array<Array<string>>} gameBoard - The 2D array representing the game board.
 */
function applyColumnGravity(currentRow, targetColumn, gameBoard) {
    // If the target cell is not empty, there's no need to apply gravity here.
    // This check acts as a guard clause, though the caller typically ensures this.
    if (gameBoard[currentRow][targetColumn] !== EMPTY_CELL_IDENTIFIER) {
        return;
    }

    // Start searching from the row directly above the current empty slot
    let searchRow = currentRow - 1;

    // Iterate upwards until the top of the board is reached
    while (searchRow >= 0) {
        // If a non-empty block is found
        if (gameBoard[searchRow][targetColumn] !== EMPTY_CELL_IDENTIFIER) {
            // Move the found block down to the empty slot
            gameBoard[currentRow][targetColumn] = gameBoard[searchRow][targetColumn];
            // Clear the original position of the moved block
            gameBoard[searchRow][targetColumn] = EMPTY_CELL_IDENTIFIER;
            break; // Stop searching as the slot has been filled
        }
        searchRow--; // Move to the next row above
    }
}

// --- Main Program Execution ---

// Use Node.js file system module to read input synchronously
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into an array of lines, removing any leading/trailing whitespace
const inputLines = rawInputData.trim().split('\n');

// The first line contains the number of test cases
const numberOfTestCases = parseInt(inputLines.shift(), 10);

// Process each test case
for (let caseIndex = 0; caseIndex < numberOfTestCases; caseIndex++) {
    // Initialize the game board for the current test case
    const currentGameBoard = [];
    for (let r = 0; r < GAME_BOARD_HEIGHT; r++) {
        // Each line represents a row, split into individual characters (blocks)
        currentGameBoard.push(inputLines.shift().split(''));
    }

    let totalChainReactions = 0; // Counter for successful chain reactions

    // Main game simulation loop
    gameLoop: while (true) {
        const potentialClearCandidates = []; // Stores coordinates that activated a clearance condition

        // First pass: Analyze the board for potential clusters that meet clearance criteria
        for (let r = 0; r < GAME_BOARD_HEIGHT; r++) {
            for (let c = 0; c < GAME_BOARD_WIDTH; c++) {
                const cellContent = currentGameBoard[r][c];

                // Skip empty or obstacle cells, or already marked cells (length > 1 means it's "color+count")
                if (cellContent === EMPTY_CELL_IDENTIFIER || cellContent === OBSTACLE_CELL_IDENTIFIER || cellContent.length > 1) {
                    continue;
                }

                // Initialize cluster tracking for the current starting block
                const clusterTracking = {
                    currentSize: 1, // The starting block itself counts as 1
                    clearActivationPoints: [] // Points that triggered MIN_CLUSTER_FOR_CLEARANCE
                };

                // Temporarily mark the starting cell to indicate it's part of the current exploration
                // and to prevent it from being re-processed as a starting point during this pass.
                currentGameBoard[r][c] = cellContent + clusterTracking.currentSize;

                // Recursively analyze the cluster starting from this cell
                analyzeCluster(r, c, cellContent, currentGameBoard, clusterTracking);

                // Collect all activation points found by this cluster analysis
                potentialClearCandidates.push(...clusterTracking.clearActivationPoints);
            }
        }

        // Second pass: Reset the temporary markings on the board
        // This removes the "color+count" format, restoring blocks to just their base color.
        for (let r = 0; r < GAME_BOARD_HEIGHT; r++) {
            for (let c = 0; c < GAME_BOARD_WIDTH; c++) {
                // Only reset if it was a marked block (i.e., its content length is > 1)
                if (currentGameBoard[r][c].length > 1) {
                    currentGameBoard[r][c] = currentGameBoard[r][c].slice(0, 1);
                }
            }
        }

        // If no clusters met the clearance criteria in this round, the game loop ends
        if (potentialClearCandidates.length === 0) {
            break gameLoop;
        }

        totalChainReactions++; // Increment the chain reaction counter

        // Third pass: Perform actual clearing based on the identified activation points
        // Filter out duplicate activation points to avoid redundant clearing operations
        const uniqueClearCandidates = Array.from(new Set(potentialClearCandidates.map(JSON.stringify))).map(JSON.parse);

        uniqueClearCandidates.forEach(coords => {
            const [clearRow, clearCol] = coords;
            const blockColorAtPoint = currentGameBoard[clearRow][clearCol];

            // Only clear if the block hasn't already been cleared by a previous operation in this round
            if (blockColorAtPoint !== EMPTY_CELL_IDENTIFIER) {
                // The color to clear should be the base color (first character)
                const baseColorForClearing = blockColorAtPoint.slice(0, 1);
                performClearing(clearRow, clearCol, baseColorForClearing, currentGameBoard);
            }
        });

        // Fourth pass: Apply gravity to all columns, starting from the bottom
        // Iterate rows from bottom up (excluding the very top row which cannot have blocks fall into it from above)
        for (let r = GAME_BOARD_HEIGHT - 1; r > 0; r--) {
            for (let c = 0; c < GAME_BOARD_WIDTH; c++) {
                // If a cell is empty, attempt to pull a block down into it
                if (currentGameBoard[r][c] === EMPTY_CELL_IDENTIFIER) {
                    applyColumnGravity(r, c, currentGameBoard);
                }
            }
        }
    }

    // Output the total number of chain reactions for the current test case
    console.log(totalChainReactions);
}