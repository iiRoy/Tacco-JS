const BOARD_SIZE = 8;
const EMPTY_CELL = ".";
const BORDER_CELL = "f";
const PLAYER_X_PIECE = "x";
const PLAYER_O_PIECE = "o";

const ROW_DIRECTIONS = [-1, -1, -1, 0, 0, 1, 1, 1];
const COL_DIRECTIONS = [-1, 0, 1, -1, 1, -1, 0, 1];

let boardState = []; // Global board state for game operations

// Helper function to initialize the game board from raw input data
function initializeBoard(rawInput) {
    const inputLines = rawInput.trim().split("\n");
    const paddedBoard = [];

    // Add a top border row of 'f' characters
    paddedBoard.push(Array(BOARD_SIZE + 2).fill(BORDER_CELL));

    // Process each input line to form game rows with 'f' borders
    inputLines.forEach(line => {
        const rowContent = line.split("");
        const borderedRow = [BORDER_CELL, ...rowContent, BORDER_CELL];
        paddedBoard.push(borderedRow);
    });

    // Add a bottom border row of 'f' characters
    paddedBoard.push(Array(BOARD_SIZE + 2).fill(BORDER_CELL));

    return paddedBoard;
}

// Calculates the number of opponent pieces that would be captured in a single direction
function calculateCapturedPiecesInDirection(yCoord, xCoord, currentDy, currentDx, currentPlayerPiece, opponentPiece) {
    let capturedCount = 0;
    let stepMultiplier = 1;
    while (true) {
        const targetRow = yCoord + currentDy * stepMultiplier;
        const targetCol = xCoord + currentDx * stepMultiplier;
        const cellValue = boardState[targetRow]?.[targetCol]; // Safely access cell value

        // If we hit a border or an empty cell, no capture is possible in this direction
        if (cellValue === BORDER_CELL || cellValue === EMPTY_CELL) {
            return 0;
        }
        // If we find the current player's piece, increment count of potential captures
        else if (cellValue === opponentPiece) {
            capturedCount++;
        }
        // If we find the opponent's piece, it means a valid capture sequence is formed
        else if (cellValue === currentPlayerPiece) {
            return capturedCount; // Return the accumulated count of captured pieces
        }
        stepMultiplier++;
    }
}

// Calculates the total number of opponent pieces that would be captured by a potential move
function calculateTotalCapturedPieces(yCoord, xCoord, currentPlayerPiece, opponentPiece) {
    let totalCaptured = 0;
    // Iterate through all 8 possible directions
    for (let i = 0; i < ROW_DIRECTIONS.length; i++) {
        totalCaptured += calculateCapturedPiecesInDirection(yCoord, xCoord, ROW_DIRECTIONS[i], COL_DIRECTIONS[i], currentPlayerPiece, opponentPiece);
    }
    return totalCaptured;
}

// Applies a move to the board and flips any captured opponent pieces
function applyMoveAndFlipPieces(yCoord, xCoord, currentPlayerPiece, opponentPiece) {
    boardState[yCoord][xCoord] = currentPlayerPiece; // Place the current player's piece at the chosen coordinates

    // Iterate through all 8 directions to check for and apply flips
    for (let directionIndex = 0; directionIndex < ROW_DIRECTIONS.length; directionIndex++) {
        const currentDy = ROW_DIRECTIONS[directionIndex];
        const currentDx = COL_DIRECTIONS[directionIndex];
        let stepMultiplier = 1;
        let potentialFlips = []; // Stores coordinates of pieces that might be flipped in this direction
        let foundOpponentSequence = false; // Flag to indicate if opponent pieces have been encountered

        while (true) {
            const targetRow = yCoord + currentDy * stepMultiplier;
            const targetCol = xCoord + currentDx * stepMultiplier;
            const cellValue = boardState[targetRow]?.[targetCol];

            // If we hit a border or an empty cell, no flip is possible in this direction
            if (cellValue === BORDER_CELL || cellValue === EMPTY_CELL) {
                break;
            }
            // If we find an opponent's piece, add it to potential flips and set flag
            else if (cellValue === opponentPiece) {
                potentialFlips.push([targetRow, targetCol]);
                foundOpponentSequence = true;
            }
            // If we find the current player's piece, check if a flip sequence was formed
            else if (cellValue === currentPlayerPiece) {
                if (foundOpponentSequence) {
                    // If opponent pieces were found, flip all pieces in the 'potentialFlips' list
                    for (const [flipY, flipX] of potentialFlips) {
                        boardState[flipY][flipX] = currentPlayerPiece;
                    }
                }
                break; // End of this direction
            }
            stepMultiplier++;
        }
    }
}

// Finds the optimal move (the one capturing the most pieces) for a given player
function findOptimalMove(currentPlayerPiece, opponentPiece, reverseIterationOrder = false) {
    let maximumCaptureCount = 0;
    let bestMoveCoordinates = [];

    // Determine iteration order based on 'reverseIterationOrder' flag
    const startRow = reverseIterationOrder ? BOARD_SIZE : 1;
    const endRow = reverseIterationOrder ? 1 : BOARD_SIZE;
    const rowIncrement = reverseIterationOrder ? -1 : 1;

    const startCol = reverseIterationOrder ? BOARD_SIZE : 1;
    const endCol = reverseIterationOrder ? 1 : BOARD_SIZE;
    const colIncrement = reverseIterationOrder ? -1 : 1;

    // Iterate through the board cells
    for (let rowIndex = startRow; reverseIterationOrder ? rowIndex >= endRow : rowIndex <= endRow; rowIndex += rowIncrement) {
        for (let colIndex = startCol; reverseIterationOrder ? colIndex >= endCol : colIndex <= endCol; colIndex += colIncrement) {
            // Skip cells that are not empty
            if (boardState[rowIndex][colIndex] !== EMPTY_CELL) {
                continue;
            }
            // Calculate captures for the current potential move
            const currentCaptureCount = calculateTotalCapturedPieces(rowIndex, colIndex, currentPlayerPiece, opponentPiece);

            // If this move captures more pieces, update the best move
            if (currentCaptureCount > maximumCaptureCount) {
                bestMoveCoordinates = [rowIndex, colIndex];
                maximumCaptureCount = currentCaptureCount;
            }
        }
    }
    return bestMoveCoordinates;
}

// Main function to execute the Reversi game simulation
function playGame() {
    const fs = require('fs');
    const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');
    boardState = initializeBoard(rawInputData);

    let consecutivePasses = 0;
    const player1Piece = PLAYER_X_PIECE;
    const player2Piece = PLAYER_O_PIECE;

    while (true) {
        // Player 1 (X) turn: searches forward (original A function)
        const player1MoveResult = findOptimalMove(player1Piece, player2Piece, false);
        if (player1MoveResult.length === 0) {
            consecutivePasses++;
        } else {
            consecutivePasses = 0;
            applyMoveAndFlipPieces(player1MoveResult[0], player1MoveResult[1], player1Piece, player2Piece);
        }

        // Player 2 (O) turn: searches backward (original B function)
        const player2MoveResult = findOptimalMove(player2Piece, player1Piece, true);
        if (player2MoveResult.length === 0) {
            consecutivePasses++;
        } else {
            consecutivePasses = 0;
            applyMoveAndFlipPieces(player2MoveResult[0], player2MoveResult[1], player2Piece, player1Piece);
        }

        // If two consecutive passes occur, the game ends
        if (consecutivePasses >= 2) {
            break;
        }
    }

    // Prepare the final board state for output
    // Extract only the 8x8 game area, removing the 'f' borders
    const finalBoardRows = boardState.slice(1, BOARD_SIZE + 1); // Get rows from index 1 to BOARD_SIZE
    const formattedOutput = finalBoardRows.map(row => {
        // For each row, remove the 'f' borders and join characters into a string
        return row.slice(1, BOARD_SIZE + 1).join("");
    }).join("\n"); // Join all formatted rows with newline characters

    console.log(formattedOutput);
}

// Start the game
playGame();
