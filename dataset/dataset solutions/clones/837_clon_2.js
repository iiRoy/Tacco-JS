const xOffsets = [ 1, 1, 1, 0, 0, -1, -1, -1 ];
const yOffsets = [ 1, 0, -1, 1, -1, 1, 0, -1 ];

/**
 * Determines the number of opponent tokens that would be captured
 * if a specific move is made by the current player.
 * @param {Array<Array<number>>} boardState The current configuration of the game board.
 * @param {number} activePlayer The player whose turn it is (1 for 'o', -1 for 'x').
 * @param {number} targetRow The row index of the potential move.
 * @param {number} targetCol The column index of the potential move.
 * @returns {number} The total count of tokens that would be flipped.
 */
function evaluatePotentialFlips(boardState, activePlayer, targetRow, targetCol)
{
    let totalCaptured = 0; // Accumulates flips from all directions
    // Loop through all 8 possible directional vectors
    for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
        let capturedInDirection = 0; // Tracks flips for the current direction
        let currentScanCol = targetCol + xOffsets[directionIndex];
        let currentScanRow = targetRow + yOffsets[directionIndex];

        // Traverse along the current direction while within board limits
        while (currentScanCol > 0 && currentScanCol < 9 && currentScanRow > 0 && currentScanRow < 9) {
            // If the scanning encounters the active player's own piece, a valid capture line is formed
            if (boardState[currentScanRow][currentScanCol] === activePlayer) {
                totalCaptured += capturedInDirection; // Add the captured pieces from this line
                break; // Stop scanning in this specific direction
            }
            // If an opponent's piece is found, increment the counter for this direction
            else if (boardState[currentScanRow][currentScanCol] === activePlayer * (-1)) {
                capturedInDirection++;
            }
            // If an empty space or an invalid piece is found, no capture can occur in this direction
            else {
                break; // Stop scanning in this specific direction
            }
            // Advance to the next cell in the current direction
            currentScanCol += xOffsets[directionIndex];
            currentScanRow += yOffsets[directionIndex];
        }
    }
    return totalCaptured; // Return the grand total of all potential flips
}

/**
 * Executes a move on the game board, placing the player's piece
 * and flipping all valid opponent pieces.
 * @param {Array<Array<number>>} boardState The game board, which will be modified.
 * @param {number} activePlayer The player making the move.
 * @param {number} placedRow The row index where the piece is placed.
 * @param {number} placedCol The column index where the piece is placed.
 */
function performBoardPlacement(boardState, activePlayer, placedRow, placedCol)
{
    // Iterate through all eight directions to identify and flip pieces
    for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
        let piecesToFlip = 0; // Counter for pieces encountered in this direction
        let currentScanCol = placedCol + xOffsets[directionIndex];
        let currentScanRow = placedRow + yOffsets[directionIndex];
        let isPathValid = false; // Flag to confirm a valid line for flipping

        // Scan along the current direction
        while (currentScanCol > 0 && currentScanCol < 9 && currentScanRow > 0 && currentScanRow < 9) {
            // If player's own piece is found, it closes a line, making the path valid
            if (boardState[currentScanRow][currentScanCol] === activePlayer) {
                isPathValid = true;
                break;
            }
            // If an opponent's piece is found, count it
            else if (boardState[currentScanRow][currentScanCol] === activePlayer * (-1)) {
                piecesToFlip++;
            }
            // If an empty cell or an unexpected piece is found, the path is not valid
            else {
                break;
            }
            // Move to the next cell in the direction
            currentScanCol += xOffsets[directionIndex];
            currentScanRow += yOffsets[directionIndex];
        }

        // If a valid path was identified, proceed with flipping the pieces
        if (isPathValid) {
            // Re-initialize scan coordinates from the neighbor of the placed piece
            currentScanCol = placedCol + xOffsets[directionIndex];
            currentScanRow = placedRow + yOffsets[directionIndex];
            // Perform the actual flipping for the counted pieces
            for (let flipCounter = 0; flipCounter < piecesToFlip; flipCounter++) {
                boardState[currentScanRow][currentScanCol] = activePlayer; // Change ownership
                currentScanCol += xOffsets[directionIndex];
                currentScanRow += yOffsets[directionIndex];
            }
        }
    }
    // Finally, place the current player's piece at the chosen location
    boardState[placedRow][placedCol] = activePlayer;
}



/**
 * Orchestrates the entire game simulation from input parsing to final output.
 * @param {string} rawGameInput The raw string input representing the initial game state.
 */
function runOthelloSimulation(rawGameInput)
{
    // Parse the input string into an array of lines
    const inputLines = rawGameInput.split("\n");
    let gameBoard = []; // Represents the 8x8 game board

    // Initialize the game board with empty arrays for rows (using 1-based indexing)
    for (let boardRowIndex = 1; boardRowIndex <= 8; boardRowIndex++) {
        gameBoard[boardRowIndex] = [];
    }

    let totalOccupiedSlots = 0; // Counter for the number of pieces currently on the board

    // Populate the game board based on the provided input
    for (let boardRowIndex = 1; boardRowIndex <= 8; boardRowIndex++) {
        for (let boardColIndex = 1; boardColIndex <= 8; boardColIndex++) {
            // 'o' character corresponds to player 1
            if (inputLines[boardRowIndex - 1][boardColIndex - 1] === 'o') {
                totalOccupiedSlots++;
                gameBoard[boardRowIndex][boardColIndex] = 1;
            }
            // 'x' character corresponds to player -1
            else if (inputLines[boardRowIndex - 1][boardColIndex - 1] === 'x') {
                totalOccupiedSlots++;
                gameBoard[boardRowIndex][boardColIndex] = -1;
            }
            // '.' character signifies an empty cell
            else {
                gameBoard[boardRowIndex][boardColIndex] = 0;
            }
        }
    }

    let activePlayer = 1; // Player 1 starts the game (represented by 1)
    let consecutivePassesOccurred = false; // Flag to track if both players passed in a row

    // Main game loop: continues until the board is completely filled (64 cells)
    while (totalOccupiedSlots < 64) {
        let bestFlipCount = 0; // Stores the maximum flips found for a valid move in the current turn
        let bestMoveRow = -1;  // Row of the best move
        let bestMoveCol = -1;  // Column of the best move

        // Logic for Player 1: find the move that maximizes flips
        if (activePlayer === 1) {
            for (let currentRow = 1; currentRow <= 8; currentRow++) {
                for (let currentCol = 1; currentCol <= 8; currentCol++) {
                    // Only consider empty cells for potential moves
                    if (gameBoard[currentRow][currentCol] === 0) {
                        const currentMoveFlips = evaluatePotentialFlips(gameBoard, activePlayer, currentRow, currentCol);
                        // Update the best move if more flips are possible
                        if (currentMoveFlips > bestFlipCount) {
                            bestFlipCount = currentMoveFlips;
                            bestMoveRow = currentRow;
                            bestMoveCol = currentCol;
                        }
                    }
                }
            }
        }
        // Logic for Player -1: also find the move that maximizes flips (with a slightly different tie-breaking rule)
        else {
            for (let currentRow = 1; currentRow <= 8; currentRow++) {
                for (let currentCol = 1; currentCol <= 8; currentCol++) {
                    // Only consider empty cells
                    if (gameBoard[currentRow][currentCol] === 0) {
                        const currentMoveFlips = evaluatePotentialFlips(gameBoard, activePlayer, currentRow, currentCol);
                        // Update the best move if an equal or greater number of flips is possible
                        if (currentMoveFlips >= bestFlipCount) { // Note: original code uses >= here
                            bestFlipCount = currentMoveFlips;
                            bestMoveRow = currentRow;
                            bestMoveCol = currentCol;
                        }
                    }
                }
            }
        }

        // If a valid move with flips was found (bestFlipCount > 0)
        if (bestFlipCount > 0) {
            consecutivePassesOccurred = false; // Reset the pass flag
            totalOccupiedSlots++;             // Increment the count of occupied cells
            performBoardPlacement(gameBoard, activePlayer, bestMoveRow, bestMoveCol); // Apply the chosen move
        }
        // If no valid move was found for the current player
        else {
            // If this is the second consecutive pass, the game concludes
            if (consecutivePassesOccurred) {
                break;
            }
            consecutivePassesOccurred = true; // Mark that a pass has occurred
        }
        // Switch players for the next turn
        activePlayer *= (-1);
    }

    // Output the final state of the game board
    for (let boardRowIndex = 1; boardRowIndex <= 8; boardRowIndex++) {
        let rowOutputString = ""; // String builder for the current row
        for (let boardColIndex = 1; boardColIndex <= 8; boardColIndex++) {
            if (gameBoard[boardRowIndex][boardColIndex] === 1) {
                rowOutputString += 'o'; // Player 1's piece
            }
            else if (gameBoard[boardRowIndex][boardColIndex] === -1) {
                rowOutputString += 'x'; // Player -1's piece
            }
            else {
                rowOutputString += '.'; // Empty cell
            }
        }
        console.log(rowOutputString); // Print the row to console
    }
}

// Read the input from standard input and initiate the game simulation
runOthelloSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));