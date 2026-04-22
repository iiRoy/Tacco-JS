/**
 * This script processes a series of 3D Connect-4-like game simulations.
 * It reads game configurations (grid dimensions, required sequence length, total moves)
 * and player moves from standard input.
 * For each game, it initializes a 3D board, simulates token drops, and checks for winning conditions.
 * A win occurs when a player achieves a sequence of 'M' or more of their tokens
 * in a straight line (horizontal, vertical, or diagonal) in 3D space.
 * The game ends in a draw if all 'P' moves are made without a winner.
 */

/**
 * Determines the longest consecutive sequence of a specific player's tokens
 * in any of the 24 predefined 3D directions, originating from a given point (initialX, initialY, initialZ).
 *
 * @param {number} playerToken The identifier for the player (e.g., 1 or 2) whose tokens are being counted.
 * @param {number} initialX The X-coordinate (column) of the starting point.
 * @param {number} initialY The Y-coordinate (row) of the starting point.
 * @param {number} initialZ The Z-coordinate (depth) of the starting point.
 * @param {Array<Array<Array<number>>>} gameGrid The 3D array representing the game board.
 * @param {number} gridSideLength The dimension 'N' used for boundary checks across all axes (X, Y, Z).
 *                                This mirrors the original code's behavior which uses 'N' for all bounds,
 *                                even if the Z-depth (P) is different.
 * @returns {number} The maximum length of a consecutive sequence found for the player.
 */
function evaluateWinState(playerToken, initialX, initialY, initialZ, gameGrid, gridSideLength) {
    // Define the 24 distinct 3D directional vectors by concatenating base vectors.
    // This complex concatenation mimics the original structure to ensure identical direction sets.
    let directionalXComponents = [-1, 0, 1, -1, 1, -1, 0, 1];
    let directionalYComponents = [-1, -1, -1, 0, 0, 1, 1, 1];
    let directionalZComponents = [0, 0, 0, 0, 0, 0, 0, 0];

    // Extend for Z-level -1, 0, 1 variations
    directionalYComponents = directionalYComponents.concat([-1, 0, 1, -1, 1, -1, 0, 1]); // Adds 8 for Z=-1, and 8 for Z=1 (total 16)
    directionalZComponents = directionalZComponents.concat([-1, -1, -1, 0, 0, 1, 1, 1]); // Adds 8 for Z=-1 (total 16)
    directionalXComponents = directionalXComponents.concat([0, 0, 0, 0, 0, 0, 0, 0]);   // Adds 8 for Z=-1 (total 16)

    directionalZComponents = directionalZComponents.concat([-1, 0, 1, -1, 1, -1, 0, 1]); // Adds 8 for Z=1 (total 24)
    directionalXComponents = directionalXComponents.concat([-1, -1, -1, 0, 0, 1, 1, 1]); // Adds 8 for Z=1 (total 24)
    directionalYComponents = directionalYComponents.concat([0, 0, 0, 0, 0, 0, 0, 0]);   // Adds 8 for Z=1 (total 24)

    let maxSequenceLength = 0; // Tracks the longest sequence found across all directions.

    /**
     * Helper function to count consecutive tokens of a specific player
     * starting from a given position and moving in a specified 3D direction.
     *
     * @param {number} startX Current X-coordinate.
     * @param {number} startY Current Y-coordinate.
     * @param {number} startZ Current Z-coordinate.
     * @param {number} deltaX X-component of the direction vector.
     * @param {number} deltaY Y-component of the direction vector.
     * @param {number} deltaZ Z-component of the direction vector.
     * @param {number} targetPlayer The player token to count.
     * @param {Array<Array<Array<number>>>} boardGrid The game board.
     * @param {number} dimLength The boundary check dimension (N).
     * @returns {number} The count of consecutive tokens.
     */
    const countTokensInDirection = (startX, startY, startZ, deltaX, deltaY, deltaZ, targetPlayer, boardGrid, dimLength) => {
        let currentCount = 0;
        let tempX = startX;
        let tempY = startY;
        let tempZ = startZ;

        // Traverse in the given direction as long as coordinates are within bounds
        // and the cell contains the target player's token.
        // The bounds check uses 'dimLength' (which is 'N') for all dimensions,
        // replicating the original code's behavior. If `tempZ` exceeds the actual
        // `P` dimension of the board but is still within `N`, `boardGrid[tempX][tempY][tempZ]`
        // will be `undefined`, which does not match `targetPlayer`, thus breaking the loop.
        while (
            tempX >= 0 && tempX < dimLength &&
            tempY >= 0 && tempY < dimLength &&
            tempZ >= 0 && tempZ < dimLength
        ) {
            // Accessing potentially undefined indices if Z-depth (P) is less than N,
            // but `=== targetPlayer` handles `undefined` correctly (evaluates to false).
            if (boardGrid[tempX] && boardGrid[tempX][tempY] && boardGrid[tempX][tempY][tempZ] === targetPlayer) {
                currentCount++;
            } else {
                break; // Sequence broken or out of actual board bounds
            }
            tempX += deltaX;
            tempY += deltaY;
            tempZ += deltaZ;
        }
        return currentCount;
    };

    // Iterate through each of the 24 3D directions.
    for (let i = 0; i < directionalXComponents.length; i++) {
        const currentDirX = directionalXComponents[i];
        const currentDirY = directionalYComponents[i];
        const currentDirZ = directionalZComponents[i];

        // Calculate sequence length in the positive direction from the initial point.
        const forwardSequenceCount = countTokensInDirection(
            initialX, initialY, initialZ,
            currentDirX, currentDirY, currentDirZ,
            playerToken, gameGrid, gridSideLength
        );

        // Calculate sequence length in the opposite (negative) direction.
        // Start one step *before* the initial point to avoid double-counting the initial cell
        // when combining forward and backward counts.
        const backwardSequenceCount = countTokensInDirection(
            initialX - currentDirX,
            initialY - currentDirY,
            initialZ - currentDirZ,
            -currentDirX, -currentDirY, -currentDirZ,
            playerToken, gameGrid, gridSideLength
        );

        // The total length of the line is the sum of forward and backward counts minus 1
        // (because the initial cell is included in both counts).
        const combinedLineLength = forwardSequenceCount + backwardSequenceCount - 1;

        // Update the overall maximum sequence length found.
        maxSequenceLength = Math.max(maxSequenceLength, combinedLineLength);
    }
    return maxSequenceLength;
}

// Read all input data from standard input.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into an array of lines, removing any leading/trailing whitespace.
let inputLines = rawInputContent.trim().split("\n");

// Main game simulation loop. Each iteration processes one game.
// The loop continues until a specific termination string ("0 0 0") is encountered.
while (true) {
    // Extract the first line, which contains the game's dimensions.
    let gameDimensionsLine = inputLines.shift();

    // Guard clause: Check for unexpected end of input or empty lines (Type III addition).
    if (gameDimensionsLine === undefined || gameDimensionsLine.trim() === "") {
        break; // Exit if no more input lines are available.
    }
    // Termination condition check.
    if (gameDimensionsLine === "0 0 0") {
        break; // Exit the game loop.
    }

    // Parse the game dimensions (N, M, P) from the line.
    // N: grid side length (for X and Y dimensions, and bounds check for Z).
    // M: required sequence length for a win.
    // P: maximum Z-depth for token drops (total number of moves).
    const [gridN, requiredM, maxP] = gameDimensionsLine.split(" ").map(Number);

    // Basic validation for game dimensions (Type III addition).
    if (!(gridN > 0 && requiredM > 0 && maxP > 0)) {
        console.error("Error: Invalid game dimensions received. Skipping to next game configuration.");
        continue; // Skip this invalid game configuration and try the next.
    }

    // Initialize the 3D game board. It's an N x N x P grid.
    // All cells are initialized to 0, representing an empty state.
    let gameBoard = [];
    for (let x = 0; x < gridN; x++) {
        gameBoard[x] = [];
        for (let y = 0; y < gridN; y++) {
            gameBoard[x][y] = new Array(maxP).fill(0); // Initialize inner-most array directly with 0s
        }
    }

    // Initialize the current player. Player 1 (Black) starts.
    let activePlayerToken = 1;
    // Variable to store the index of the move that resulted in a win.
    // Initialized to -1, indicating no win yet.
    let winningMoveIndex = -1;
    // Variable to track the actual number of moves processed.
    let totalMovesProcessed = 0;

    // Loop through each of the 'P' possible moves in the game.
    for (let moveCounter = 0; moveCounter < maxP; moveCounter++) {
        totalMovesProcessed = moveCounter + 1; // Update count of processed moves.

        // Retrieve the line containing the coordinates for the current token drop.
        const moveCoordinatesLine = inputLines.shift();

        // Guard clause: Handle unexpected premature end of input for moves (Type III addition).
        if (moveCoordinatesLine === undefined || moveCoordinatesLine.trim() === "") {
            console.error("Error: Unexpected end of input while reading player moves.");
            break; // Stop processing moves for this game.
        }

        // Parse the 0-indexed X and Y coordinates for the token drop.
        const [dropX, dropY] = moveCoordinatesLine.split(" ").map(coord => Number(coord) - 1);

        // Find the lowest available Z-level (depth) in the specified (X, Y) column.
        let dropZ = 0;
        // Loop while the current Z-level is within the board's depth (maxP)
        // and the cell is already occupied (not 0).
        while (dropZ < maxP && gameBoard[dropX][dropY][dropZ] !== 0) {
            dropZ++;
        }

        // Place the current player's token if an available slot was found.
        if (dropZ < maxP) {
            gameBoard[dropX][dropY][dropZ] = activePlayerToken;
        } else {
            // If the column is full, this move cannot be made.
            // This scenario implies a potential issue with input or game rules.
            // For cloning, we acknowledge and break, assuming it might lead to an early draw.
            console.warn(`Warning: Column (${dropX + 1}, ${dropY + 1}) is full. Skipping this move and subsequent moves for this game.`);
            break;
        }

        // Check if the current move results in a winning sequence for the active player.
        // The `gridN` is passed as `gridSideLength` to `evaluateWinState`
        // to maintain the original code's behavior of checking bounds against `N` for all dimensions.
        if (evaluateWinState(activePlayerToken, dropX, dropY, dropZ, gameBoard, gridN) >= requiredM) {
            const winnerName = (activePlayerToken === 2) ? "White" : "Black"; // Determine winner's color.
            console.log(winnerName, moveCounter + 1); // Output winner and winning move number.
            winningMoveIndex = moveCounter; // Record the move index.
            break; // A winner is found, terminate the moves loop.
        }

        // Switch to the other player for the next turn.
        activePlayerToken = (activePlayerToken === 1) ? 2 : 1;
    }

    // After the moves loop, check for a draw condition.
    // A draw occurs if all 'maxP' moves were processed (totalMovesProcessed === maxP)
    // AND no winner was found (winningMoveIndex remains -1).
    if (winningMoveIndex === -1 && totalMovesProcessed === maxP) {
        console.log("Draw");
    }
}