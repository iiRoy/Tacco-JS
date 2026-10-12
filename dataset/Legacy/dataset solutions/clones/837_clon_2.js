const deltaX = [1, 1, 1, 0, 0, -1, -1, -1]; // Horizontal movement offsets for 8 directions
const deltaY = [1, 0, -1, 1, -1, 1, 0, -1]; // Vertical movement offsets for 8 directions

/**
 * Evaluates the number of pieces that would be flipped if a player makes a move at a given position.
 * @param {Array<Array<number>>} boardState The current state of the game board.
 * @param {number} currentPlayer The player making the move (1 or -1).
 * @param {number} targetRow The row index of the potential move.
 * @param {number} targetCol The column index of the potential move.
 * @returns {number} The total count of pieces that would be flipped.
 */
function evaluateMove(boardState, currentPlayer, targetRow, targetCol) {
    let totalFlips = 0; // Accumulator for total pieces flipped across all directions

    // Iterate through all 8 possible directions
    for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
        let currentDirectionFlips = 0; // Count of opponent pieces encountered in the current direction
        let currentX = targetCol + deltaX[directionIndex];
        let currentY = targetRow + deltaY[directionIndex];

        // Traverse in the current direction until an edge, empty cell, or own piece is found
        while (currentX > 0 && currentX < 9 && currentY > 0 && currentY < 9) {
            if (boardState[currentY][currentX] === currentPlayer) {
                totalFlips += currentDirectionFlips; // Found own piece, so all opponent pieces between can be flipped
                break;
            } else if (boardState[currentY][currentX] === currentPlayer * (-1)) {
                currentDirectionFlips++; // Found an opponent's piece, increment count
            } else {
                break; // Empty cell or out of bounds, stop scanning this direction
            }
            currentX += deltaX[directionIndex];
            currentY += deltaY[directionIndex];
        }
    }
    return totalFlips;
}

/**
 * Applies a move to the game board, placing the player's piece and flipping opponent pieces.
 * @param {Array<Array<number>>} boardState The current state of the game board (modified in place).
 * @param {number} currentPlayer The player making the move (1 or -1).
 * @param {number} targetRow The row index where the piece is placed.
 * @param {number} targetCol The column index where the piece is placed.
 */
function applyMove(boardState, currentPlayer, targetRow, targetCol) {
    // Check all 8 directions to identify and flip pieces
    for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
        let flipsInDirection = 0; // Number of opponent pieces to flip in this specific direction
        let currentX = targetCol + deltaX[directionIndex];
        let currentY = targetRow + deltaY[directionIndex];
        let canFlip = false; // Flag to indicate if a valid line of opponent pieces ending in an own piece is found

        // Scan along the current direction to determine if flips are possible
        while (currentX > 0 && currentX < 9 && currentY > 0 && currentY < 9) {
            if (boardState[currentY][currentX] === currentPlayer) {
                canFlip = true; // Found own piece, so pieces between can be flipped
                break;
            } else if (boardState[currentY][currentX] === currentPlayer * (-1)) {
                flipsInDirection++; // Found an opponent's piece
            } else {
                break; // Empty cell or out of bounds, no flips in this direction
            }
            currentX += deltaX[directionIndex];
            currentY += deltaY[directionIndex];
        }

        // If a valid line was found and there are pieces to flip
        if (canFlip) {
            // Reset coordinates to start from the target cell again for flipping
            let flipX = targetCol + deltaX[directionIndex];
            let flipY = targetRow + deltaY[directionIndex];
            // Flip the opponent's pieces to the current player's color
            for (let flipCounter = 0; flipCounter < flipsInDirection; flipCounter++) {
                boardState[flipY][flipX] = currentPlayer;
                flipX += deltaX[directionIndex];
                flipY += deltaY[directionIndex];
            }
        }
    }
    // Finally, place the current player's piece at the target location
    boardState[targetRow][targetCol] = currentPlayer;
}

/**
 * Main function to process the Othello game simulation.
 * Reads initial board state, simulates turns, and prints the final board.
 * @param {string} gameInput The input string representing the initial board.
 */
function ProcessGame(gameInput) {
    // Split the input string into an array of lines
    gameInput = gameInput.split("\n");
    let gameBoard = []; // Represents the 8x8 Othello board, 1-indexed for convenience

    // Initialize the board with empty arrays for rows
    for (let rowIndex = 1; rowIndex <= 8; rowIndex++) {
        gameBoard[rowIndex] = [];
    }

    let filledCells = 0; // Counter for cells that are not empty, used to detect game end

    // Populate the game board based on input characters
    for (let rowIndex = 1; rowIndex <= 8; rowIndex++) {
        for (let colIndex = 1; colIndex <= 8; colIndex++) {
            const char = gameInput[rowIndex - 1][colIndex - 1]; // Input is 0-indexed
            if (char === 'o') {
                filledCells++;
                gameBoard[rowIndex][colIndex] = 1; // Player 1's piece
            } else if (char === 'x') {
                filledCells++;
                gameBoard[rowIndex][colIndex] = -1; // Player -1's piece
            } else {
                gameBoard[rowIndex][colIndex] = 0; // Empty cell
            }
        }
    }

    let activePlayer = 1; // Player 1 starts the game
    let passedTurn = false; // Flag to detect if the previous player passed their turn

    // Main game loop: continues until the board is full (64 cells) or two consecutive passes occur
    while (filledCells < 64) {
        let maxFlips = 0; // Stores the maximum number of flips for the current player's best move
        let bestRow = -1; // Row index of the best move found
        let bestCol = -1; // Column index of the best move found

        // Logic for Player 1 (maximizes flips, tie-breaking by first encountered)
        if (activePlayer === 1) {
            for (let rowIndex = 1; rowIndex <= 8; rowIndex++) {
                for (let colIndex = 1; colIndex <= 8; colIndex++) {
                    if (gameBoard[rowIndex][colIndex] === 0) { // If the cell is empty
                        let currentFlips = evaluateMove(gameBoard, activePlayer, rowIndex, colIndex);
                        if (currentFlips > maxFlips) { // Player 1 takes the move with strictly more flips
                            maxFlips = currentFlips;
                            bestRow = rowIndex;
                            bestCol = colIndex;
                        }
                    }
                }
            }
        } else { // Logic for Player -1 (maximizes flips, tie-breaking by last encountered, due to >=)
            for (let rowIndex = 1; rowIndex <= 8; rowIndex++) {
                for (let colIndex = 1; colIndex <= 8; colIndex++) {
                    if (gameBoard[rowIndex][colIndex] === 0) { // If the cell is empty
                        let currentFlips = evaluateMove(gameBoard, activePlayer, rowIndex, colIndex);
                        if (currentFlips >= maxFlips) { // Player -1 takes the move with greater or equal flips
                            maxFlips = currentFlips;
                            bestRow = rowIndex;
                            bestCol = colIndex;
                        }
                    }
                }
            }
        }

        // If a valid move was found (i.e., maxFlips > 0)
        if (maxFlips > 0) {
            passedTurn = false; // Reset the pass flag as a move was made
            filledCells++; // One more cell is now occupied
            applyMove(gameBoard, activePlayer, bestRow, bestCol); // Execute the best move
        } else {
            // No valid moves for the current player
            if (passedTurn) {
                break; // If the previous player also passed, the game ends
            }
            passedTurn = true; // Current player passes their turn
        }
        activePlayer *= (-1); // Switch to the other player for the next turn
    }

    // Output the final state of the board
    for (let rowIndex = 1; rowIndex <= 8; rowIndex++) {
        let outputLine = "";
        for (let colIndex = 1; colIndex <= 8; colIndex++) {
            if (gameBoard[rowIndex][colIndex] === 1) {
                outputLine += 'o';
            } else if (gameBoard[rowIndex][colIndex] === (-1)) {
                outputLine += 'x';
            } else {
                outputLine += '.';
            }
        }
        console.log(outputLine);
    }
}

// Read input from stdin and pass it to the game processing function
ProcessGame(require("fs").readFileSync("/dev/stdin", "utf8"));
