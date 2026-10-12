function findBestMoveForPlayerOne() {
    let highestScore = 0; // Variable to store the maximum number of pieces that can be captured
    let bestPosition = []; // Array to hold the [row, column] coordinates of the best move found
    // Iterate through the 8x8 playing grid, starting from row 1, column 1
    for (let boardRow = 1; boardRow <= 8; boardRow++) {
        for (let boardCol = 1; boardCol <= 8; boardCol++) {
            // Check if the current cell is an empty spot (represented by '.')
            if (gameBoard[boardRow][boardCol] !== ".") {
                continue; // If not empty, skip to the next cell
            }
            // Calculate the number of pieces captured if player 'o' makes a move here.
            // In this context, 'x' is the current player's piece and 'o' is the opponent's piece.
            let currentCaptureCount = calculateCaptureCount(boardRow, boardCol, "x", "o");
            // If this move captures more pieces than any previous move, update the best move
            if (currentCaptureCount > highestScore) {
                bestPosition = [boardRow, boardCol]; // Store the new best coordinates
                highestScore = currentCaptureCount; // Update the highest score
            }
        }
    }
    return bestPosition; // Return the coordinates of the best move, or an empty array if no valid move exists
}

function findBestMoveForPlayerTwo() {
    let maximumScore = 0; // Variable to store the maximum number of pieces that can be flipped
    let optimalPlacement = []; // Array to hold the [row, column] coordinates for the optimal move
    // Iterate through the 8x8 playing grid in reverse order, from row 8, column 8
    for (let gridRow = 8; gridRow >= 1; gridRow--) {
        for (let gridCol = 8; gridCol >= 1; gridCol--) {
            // Check if the current cell is an empty spot
            if (gameBoard[gridRow][gridCol] !== ".") {
                continue; // If not empty, proceed to the next cell
            }
            // Calculate potential captures for player 'x' at this position.
            // Here, 'o' is the current player's piece and 'x' is the opponent's piece.
            let potentialFlips = calculateCaptureCount(gridRow, gridCol, "o", "x");
            // If this move results in more flips than previously found, update the optimal move
            if (potentialFlips > maximumScore) {
                optimalPlacement = [gridRow, gridCol]; // Update the coordinates
                maximumScore = potentialFlips; // Update the maximum score
            }
        }
    }
    return optimalPlacement; // Return the coordinates of the optimal move
}

function calculateCaptureCount(rowCoord, colCoord, playerPiece, opponentPiece) {
    const rowDirections = [-1, -1, -1, 0, 0, 1, 1, 1]; // Array of row changes for 8 directions
    const colDirections = [-1, 0, 1, -1, 1, -1, 0, 1]; // Array of column changes for 8 directions
    let totalCapturedPieces = 0; // Accumulator for the total count of pieces that would be captured

    // Loop through all 8 possible directions
    for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
        let currentRowDelta = rowDirections[directionIndex]; // Row change for the current direction
        let currentColDelta = colDirections[directionIndex]; // Column change for the current direction
        let piecesInLine = 0; // Counter for opponent pieces found in the current line
        let stepMultiplier = 1; // Multiplier to move further in the current direction

        // Traverse in the current direction until a boundary, empty spot, or player's own piece is found
        while (true) {
            const nextRow = rowCoord + currentRowDelta * stepMultiplier;
            const nextCol = colCoord + currentColDelta * stepMultiplier;

            // Check for board boundaries ('f') or empty spots ('.')
            if (gameBoard[nextRow][nextCol] === "f" || gameBoard[nextRow][nextCol] === ".") {
                break; // Stop if a boundary or empty spot is encountered
            } else if (gameBoard[nextRow][nextCol] === playerPiece) {
                piecesInLine++; // Increment count if an opponent's piece is found
            } else if (gameBoard[nextRow][nextCol] === opponentPiece) {
                // If the current player's piece is found, add the counted opponent pieces to the total and break
                totalCapturedPieces += piecesInLine;
                break;
            }
            stepMultiplier++; // Move to the next cell in this direction
        }
    }
    return totalCapturedPieces; // Return the total count of pieces that would be captured
}

function applyMoveAndFlipPieces(rowPos, colPos, opponentMark, playerMark) {
    gameBoard[rowPos][colPos] = playerMark; // Place the current player's piece at the chosen position

    const rowDirectionChanges = [-1, -1, -1, 0, 0, 1, 1, 1]; // Row offsets for 8 directions
    const colDirectionChanges = [-1, 0, 1, -1, 1, -1, 0, 1]; // Column offsets for 8 directions

    // Iterate through all 8 directions to check for pieces to flip
    for (let directionIdx = 0; directionIdx < 8; directionIdx++) {
        let currentDR = rowDirectionChanges[directionIdx]; // Current row delta
        let currentDC = colDirectionChanges[directionIdx]; // Current column delta
        let stepCount = 1; // Distance multiplier from the placed piece
        let foundOpponentPiece = false; // Flag to indicate if an opponent's piece was encountered in this line

        // Traverse in the current direction
        while (true) {
            const targetRow = rowPos + currentDR * stepCount;
            const targetCol = colPos + currentDC * stepCount;

            // Stop if a board boundary ('f') or an empty spot ('.') is reached
            if (gameBoard[targetRow][targetCol] === "f" || gameBoard[targetRow][targetCol] === ".") {
                break;
            } else if (gameBoard[targetRow][targetCol] === opponentMark) {
                foundOpponentPiece = true; // Mark that an opponent's piece was found
            } else if (gameBoard[targetRow][targetCol] === playerMark) {
                // If the current player's piece is found, and opponent pieces were in between, flip them
                if (foundOpponentPiece) {
                    // Go back and flip all pieces between the placed piece and the current player's piece
                    let backtrackStep = stepCount;
                    while (backtrackStep-- > 0) {
                        gameBoard[rowPos + currentDR * backtrackStep][colPos + currentDC * backtrackStep] = playerMark;
                    }
                }
                break; // Stop in this direction
            }
            stepCount++; // Move to the next cell in this direction
        }
    }
}

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

// Initialize the game board with 'f' (frame) borders
let gameBoard = [];
gameBoard.push("ffffffffff".split("")); // Add a top border of 'f' characters

// Process each line of the input to form the main board, adding 'f' borders
inputLines.forEach(function(lineContent) {
    lineContent = "f" + lineContent + "f"; // Add 'f' borders to the left and right of each row
    gameBoard.push(lineContent.split(""));
});
gameBoard.push("ffffffffff".split("")); // Add a bottom border of 'f' characters

let consecutivePasses = 0; // Counter for consecutive turns where no valid moves are found

// Main game loop for playing Othello
while (true) {
    // Player One's turn (player 'o', searching for 'x' as opponent)
    const playerOneMove = findBestMoveForPlayerOne();
    if (playerOneMove.length === 0) {
        consecutivePasses++; // No valid move for Player One, increment the pass counter
    } else {
        consecutivePasses = 0; // A valid move was made, reset the pass counter
        applyMoveAndFlipPieces(playerOneMove[0], playerOneMove[1], "x", "o"); // Apply the move for player 'o'
    }

    // Player Two's turn (player 'x', searching for 'o' as opponent)
    const playerTwoMove = findBestMoveForPlayerTwo();
    if (playerTwoMove.length === 0) {
        consecutivePasses++; // No valid move for Player Two, increment the pass counter
    } else {
        consecutivePasses = 0; // A valid move was made, reset the pass counter
        applyMoveAndFlipPieces(playerTwoMove[0], playerTwoMove[1], "o", "x"); // Apply the move for player 'x'
    }

    // If two consecutive passes occur, the game ends
    if (consecutivePasses >= 2) {
        break;
    }
}

// Remove the 'f' borders from the game board before printing
gameBoard.shift(); // Remove the top border row
gameBoard.pop(); // Remove the bottom border row

// Print the final game board, removing commas from array joining and 'f' characters
console.log(gameBoard.join("\n").replace(/\,|f/g, ""));
