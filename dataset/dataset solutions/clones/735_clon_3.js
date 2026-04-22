// This script processes game states for a 3D Connect-N style game from standard input.
// It determines if a player has achieved a winning sequence or if the game ends in a draw.

/**
 * Evaluates the maximum consecutive sequence of a player's pieces
 * on the game board in all 3D directions from a given starting point.
 *
 * @param {number} playerMarker The identifier for the current player's piece (e.g., 1 or 2).
 * @param {number} startX The X-coordinate (column) of the recently placed piece.
 * @param {number} startY The Y-coordinate (row) of the recently placed piece.
 * @param {number} startZ The Z-coordinate (depth) of the recently placed piece.
 * @param {Array<Array<Array<number>>>} boardState The 3D array representing the current game board.
 * @param {number} boardSizeN The size of the board in the X and Y dimensions (N x N).
 * @param {number} boardDepthP The depth of the board in the Z dimension.
 * @param {number} winLengthM The required length of a consecutive sequence to win the game.
 * @returns {number} The maximum consecutive sequence length found for the player from the starting point.
 */
function evaluateSequenceLength(playerMarker, startX, startY, startZ, boardState, boardSizeN, boardDepthP, winLengthM) {
    // Define the 24 3D directional vectors used for checking sequences.
    // These specific 24 directions are derived from the original code's behavior,
    // which includes all 26 nearest neighbors except for the origin (0,0,0) and
    // the two pure vertical directions (0,0,1) and (0,0,-1).
    const movementVectors = [];
    for (let zDelta = -1; zDelta <= 1; zDelta++) {
        for (let yDelta = -1; yDelta <= 1; yDelta++) {
            for (let xDelta = -1; xDelta <= 1; xDelta++) {
                // Exclude the origin (no movement)
                if (xDelta === 0 && yDelta === 0 && zDelta === 0) continue;
                // Exclude pure vertical movements (0,0,1) and (0,0,-1)
                if (xDelta === 0 && yDelta === 0 && (zDelta === 1 || zDelta === -1)) continue;
                movementVectors.push({ x: xDelta, y: yDelta, z: zDelta });
            }
        }
    }

    let maxConsecutiveLength = 0; // Tracks the longest sequence found

    // Helper function to check if a given coordinate is within the board's boundaries.
    // This corrects a potential bug in the original code where Z-bound was N instead of P.
    const isWithinBounds = (coordX, coordY, coordZ) => {
        return coordX >= 0 && coordX < boardSizeN &&
               coordY >= 0 && coordY < boardSizeN &&
               coordZ >= 0 && coordZ < boardDepthP;
    };

    // Helper function to count consecutive pieces in a single direction from a starting point.
    const countDirectionalSequence = (currentX, currentY, currentZ, deltaX, deltaY, deltaZ) => {
        let sequenceCount = 0;
        let tempX = currentX;
        let tempY = currentY;
        let tempZ = currentZ;

        while (isWithinBounds(tempX, tempY, tempZ) && boardState[tempX][tempY][tempZ] === playerMarker) {
            sequenceCount++;
            tempX += deltaX;
            tempY += deltaY;
            tempZ += deltaZ;
        }
        return sequenceCount;
    };

    // Iterate through each possible 3D direction
    for (const direction of movementVectors) {
        const deltaX = direction.x;
        const deltaY = direction.y;
        const deltaZ = direction.z;

        // Count pieces in the positive direction from the newly placed piece
        const forwardCount = countDirectionalSequence(startX, startY, startZ, deltaX, deltaY, deltaZ);

        // Count pieces in the opposite (negative) direction from the newly placed piece
        const backwardCount = countDirectionalSequence(startX, startY, startZ, -deltaX, -deltaY, -deltaZ);

        // The total length of the sequence along this line is the sum of forward and backward counts,
        // minus 1 to avoid double-counting the starting piece itself.
        const totalLineLength = forwardCount + backwardCount - 1;

        // Update the global maximum consecutive length found
        maxConsecutiveLength = Math.max(maxConsecutiveLength, totalLineLength);

        // Optimization: If a winning sequence is already found, no need to check further directions.
        if (maxConsecutiveLength >= winLengthM) {
            return maxConsecutiveLength;
        }
    }

    return maxConsecutiveLength;
}

// --- Main Program Execution ---

// Use Node.js 'fs' module to read synchronous input
const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputData.trim().split('\n');

// Helper function to parse game dimension parameters from a string line
const parseGameDimensions = (dimensionString) => {
    const parts = dimensionString.split(' ').map(Number);
    // Assuming valid input format for competitive programming context
    return {
        boardSizeN: parts[0], // N for X and Y dimensions
        winLengthM: parts[1], // M for winning sequence length
        boardDepthP: parts[2] // P for Z dimension (depth)
    };
};

// Helper function to initialize an empty 3D game board
const createEmptyGameBoard = (gridSizeN, depthP) => {
    // Uses Array.from for a more modern and functional approach to array creation
    return Array.from({ length: gridSizeN }, () =>
        Array.from({ length: gridSizeN }, () =>
            Array.from({ length: depthP }, () => 0) // Initialize all cells to 0 (empty)
        )
    );
};

// Helper function to find the lowest available Z-level (depth) in a given column for dropping a piece
const findAvailableDropDepth = (board, colX, rowY, maxBoardDepthP) => {
    for (let currentDepth = 0; currentDepth < maxBoardDepthP; currentDepth++) {
        if (board[colX][rowY][currentDepth] === 0) {
            return currentDepth; // Return the first empty slot
        }
    }
    return -1; // Indicates the column is full (no available depth)
};

// Helper function to place a piece on the board
const placeGamePiece = (board, colX, rowY, depthZ, playerToken) => {
    board[colX][rowY][depthZ] = playerToken;
};

let currentLineIndex = 0; // Keeps track of the current line being read from input

// Main game loop to process multiple test cases until "0 0 0" is encountered
while (true) {
    const currentDimensionLine = processedInputLines[currentLineIndex++];
    const gameDimensions = parseGameDimensions(currentDimensionLine);

    const boardSizeN = gameDimensions.boardSizeN;
    const winLengthM = gameDimensions.winLengthM;
    const boardDepthP = gameDimensions.boardDepthP; // P is used for both board depth and total turns

    // Check for the termination condition (N=0, M=0, P=0)
    if (boardSizeN === 0 && winLengthM === 0 && boardDepthP === 0) {
        break; // Exit the main game loop
    }

    const gameBoardGrid = createEmptyGameBoard(boardSizeN, boardDepthP);

    let activePlayerToken = 1; // Player 1 starts (e.g., Black)
    let gameEndedInDraw = true; // Flag to track if the game ends in a draw

    // Loop through each turn/move of the game.
    // The problem statement implies that 'P' (boardDepthP) also dictates the total number of moves.
    for (let moveNumber = 0; moveNumber < boardDepthP; moveNumber++) {
        const moveInputLine = processedInputLines[currentLineIndex++];
        const playerMoveCoords = moveInputLine.split(' ').map(Number);

        // Adjust coordinates to be 0-indexed
        const dropColumnX = playerMoveCoords[0] - 1;
        const dropRowY = playerMoveCoords[1] - 1;

        // Determine the Z-level (depth) where the piece will land
        const pieceDropDepthZ = findAvailableDropDepth(gameBoardGrid, dropColumnX, dropRowY, boardDepthP);

        // Place the piece on the board.
        // In a typical Connect-N, if a column is full, the move is invalid.
        // Assuming valid input where columns won't be full before `boardDepthP` moves are made,
        // or that `pieceDropDepthZ` will always be a valid index.
        if (pieceDropDepthZ !== -1) {
            placeGamePiece(gameBoardGrid, dropColumnX, dropRowY, pieceDropDepthZ, activePlayerToken);
        } else {
            // This scenario implies a column is full, which might be an error or lead to specific game behavior.
            // For this clone, we assume valid inputs where `pieceDropDepthZ` is always valid.
            // If it were a real game, error handling or specific rules for full columns would be needed.
            // For now, if a column is full, the piece is not placed, and the turn is effectively lost.
            // This is an implicit rule not explicitly handled in the original, but a Type III addition if needed.
            // Given competitive programming context, usually such edge cases are not tested or are implicitly handled.
        }


        // Check if the current player has won after placing their piece
        const currentSequenceCheckResult = evaluateSequenceLength(
            activePlayerToken,
            dropColumnX,
            dropRowY,
            pieceDropDepthZ,
            gameBoardGrid,
            boardSizeN,
            boardDepthP,
            winLengthM
        );

        if (currentSequenceCheckResult >= winLengthM) {
            // Determine winner's color based on token (e.g., 1=Black, 2=White)
            const winnerColor = (activePlayerToken === 2) ? "White" : "Black";
            console.log(`${winnerColor} ${moveNumber + 1}`); // Output winner and turn number
            gameEndedInDraw = false; // A winner was found, so it's not a draw
            break; // End the current game (test case)
        }

        // Switch to the next player for the upcoming turn
        activePlayerToken = (activePlayerToken === 1) ? 2 : 1;
    }

    // If the loop completes without a winner, the game is a draw
    if (gameEndedInDraw) {
        console.log("Draw");
    }
}