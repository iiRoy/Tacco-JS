/*
 * This module contains game logic for an abstract board game.
 * It identifies optimal moves and executes them.
 */
function findBestMoveForPlayerX() {
    // Initialize variables for tracking the highest score and corresponding position
    var highestScore = 0;
    var optimalPosition = [];

    // Iterate through the game board rows
    for (
        var rowIndex = 1;
        rowIndex <= 8;
        rowIndex++
    ) {
        // Iterate through the game board columns
        for (
            var colIndex = 1;
            colIndex <= 8;
            colIndex++
        ) {
            // Skip if the current cell is not empty
            if (
                boardState[rowIndex][colIndex] !== "."
            ) continue;

            // Calculate potential captures for player 'x'
            var currentScore = evaluateCaptureOpportunity(
                rowIndex,
                colIndex,
                "x",
                "o"
            );

            // Update optimal position if a better score is found
            if (
                currentScore > highestScore
            ) {
                optimalPosition = [rowIndex, colIndex];
                highestScore = currentScore;
            }
        }
    }
    // Return the best found position
    return optimalPosition;
}

function determineOptimalPlacementForPlayerO() {
    // Variables to store the maximum capture count and the best move coordinates
    var greatestValue = 0;
    var bestCoordinate = [];

    // Loop through the grid in reverse row order
    for (
        var rowIter = 8;
        rowIter >= 1;
        rowIter--
    ) {
        // Loop through the grid in reverse column order
        for (
            var colIter = 8;
            colIter >= 1;
            colIter--
        ) {
            // Calculate potential captures for player 'o'
            var captureCount = evaluateCaptureOpportunity(
                rowIter,
                colIter,
                "o",
                "x"
            );

            // Skip if the current cell is occupied
            if (
                gameGrid[rowIter][colIter] !== "."
            ) continue;

            // Update the best coordinate if the current move yields more captures
            if (
                captureCount > greatestValue
            ) {
                bestCoordinate = [rowIter, colIter];
                greatestValue = captureCount;
            }
        }
    }
    // Return the coordinates of the most advantageous move
    return bestCoordinate;
}

// ----------------------------------------------------
// This function computes the total number of pieces that would be captured
// if a move is made at a given position by a specific player.
// Parameters:
//   rowPos: The row coordinate of the potential move.
//   colPos: The column coordinate of the potential move.
//   opponentPiece: The character representing the opponent's piece (e.g., "x").
//   playerPiece: The character representing the current player's piece (e.g., "o").
function evaluateCaptureOpportunity(
    rowPos,
    colPos,
    opponentPiece,
    playerPiece
) {
    // Arrays defining the 8 possible directions (Y and X offsets)
    var yDirections = [-1, -1, -1, 0, 0, 1, 1, 1];
    var xDirections = [-1, 0, 1, -1, 1, -1, 0, 1];

    var totalCaptured = 0; // Accumulator for total pieces captured

    // Iterate through all 8 directions
    for (
        var directionIndex = 0;
        directionIndex < 8;
        directionIndex++
    ) {
        var currentYDirection = yDirections[directionIndex];
        var currentXDirection = xDirections[directionIndex];
        var piecesToFlipInDirection = 0; // Counter for pieces to flip in the current direction
        var stepSize = 1; // Multiplier for distance from the starting point

        // Traverse in the current direction until a boundary, empty spot, or player's piece is found
        while (true) {
            var checkRow = rowPos + currentYDirection * stepSize;
            var checkCol = colPos + currentXDirection * stepSize;

            // If an invalid boundary ('f') or an empty spot ('.') is encountered, break
            if (
                boardData[checkRow][checkCol] === "f" ||
                boardData[checkRow][checkCol] === "."
            ) {
                break;
            }
            // If an opponent's piece is found, increment the flip counter
            else if (
                boardData[checkRow][checkCol] === opponentPiece
            ) {
                piecesToFlipInDirection++;
            }
            // If the current player's piece is found, add the counted pieces to the total and break
            else if (
                boardData[checkRow][checkCol] === playerPiece
            ) {
                totalCaptured += piecesToFlipInDirection;
                break;
            }
            stepSize++; // Move to the next cell in this direction
        }
    }
    return totalCaptured; // Return the aggregate count of capturable pieces
}

// ----------------------------------------------------------
// This function updates the game board by placing a piece and flipping opponent pieces.
// Parameters:
//   targetRow: The row coordinate where the piece is placed.
//   targetCol: The column coordinate where the piece is placed.
//   enemyToken: The character representing the opponent's piece.
//   playerToken: The character representing the current player's piece.
function applyMoveAndFlip(
    targetRow,
    targetCol,
    enemyToken,
    playerToken
) {
    // Place the current player's token at the target position
    gameMatrix[targetRow][targetCol] = playerToken;

    // Define direction vectors for Y and X axes
    var yOffset = [-1, -1, -1, 0, 0, 1, 1, 1];
    var xOffset = [-1, 0, 1, -1, 1, -1, 0, 1];

    // This variable is declared but not used in the original, so it remains.
    var flippedCount = 0;

    // Iterate over all eight possible directions
    for (
        var dirIdx = 0;
        dirIdx < 8;
        dirIdx++
    ) {
        var currentYOffset = yOffset[dirIdx];
        var currentXOffset = xOffset[dirIdx];

        // Another unused variable, kept for structural fidelity.
        var unusedFlipCounter = 0;
        var distanceFactor = 1; // Distance from the placed piece
        var foundOpponentPiece = false; // Flag to indicate if opponent pieces were found in this line

        // Traverse in the current direction
        while (true) {
            var currentRow = targetRow + currentYOffset * distanceFactor;
            var currentCol = targetCol + currentXOffset * distanceFactor;

            // If an invalid boundary ('f') or an empty spot ('.') is reached, stop
            if (
                gameMatrix[currentRow][currentCol] === "f" ||
                gameMatrix[currentRow][currentCol] === "."
            ) {
                break;
            }
            // If an opponent's piece is found, set the flag
            else if (
                gameMatrix[currentRow][currentCol] === enemyToken
            ) {
                foundOpponentPiece = true;
            }
            // If the current player's piece is found
            else if (
                gameMatrix[currentRow][currentCol] === playerToken
            ) {
                // If opponent pieces were found in between, flip them
                if (
                    foundOpponentPiece
                ) {
                    var backtrackDistance = distanceFactor;
                    while (
                        backtrackDistance-- > 0
                    ) {
                        gameMatrix[targetRow + currentYOffset * backtrackDistance][targetCol + currentXOffset * backtrackDistance] = playerToken;
                    }
                }
                break; // Stop traversing in this direction
            }
            distanceFactor++; // Increment distance
        }
    }
}

// var initialGridInput = require('fs').readFileSync('/dev/stdin', 'utf8');
// Example input for local testing:
var rawGridInput = '........\n........\n........\n...ox...\n...xo...\n........\n........\n........';

var gridLinesArray = rawGridInput.trim().split("\n");
var gameBoardMatrix = [];

// Add a border of 'f' characters to handle boundaries easily
gameBoardMatrix.push("ffffffffff".split(""));

// Process each line of the input grid
gridLinesArray.forEach(function (currentLine) {
    currentLine = "f" + currentLine + "f"; // Add 'f' border to each side of the row
    gameBoardMatrix.push(currentLine.split(""));
});

gameBoardMatrix.push("ffffffffff".split("")); // Add bottom 'f' border

var skipCount = 0; // Counter for consecutive passes

// Main game loop
while (true) {

    // Determine player X's best move
    var resultForX = findBestMoveForPlayerX();

    // If player X has no valid moves
    if (
        resultForX.length === 0
    ) {
        skipCount++; // Increment pass counter
    } else {
        skipCount = 0; // Reset pass counter
        // Apply player X's move and flip pieces
        applyMoveAndFlip(
            resultForX[0],
            resultForX[1],
            "x",
            "o"
        );
    }

    // If both players have passed consecutively, end the game
    if (
        skipCount === 2
    ) break;

    // Determine player O's best move
    var resultForO = determineOptimalPlacementForPlayerO();

    // If player O has no valid moves
    if (
        resultForO.length === 0
    ) {
        skipCount++; // Increment pass counter
    } else {
        skipCount = 0; // Reset pass counter
        // Apply player O's move and flip pieces
        applyMoveAndFlip(
            resultForO[0],
            resultForO[1],
            "o",
            "x"
        );
    }

    // If both players have passed consecutively, end the game
    if (
        skipCount === 2
    ) break;
}

// Remove the 'f' borders from the game board before printing
gameBoardMatrix.shift(); // Remove top border
gameBoardMatrix.pop();   // Remove bottom border

// Print the final state of the board, removing commas and 'f' characters
console.log(
    gameBoardMatrix.join("\n").replace(
        /,|f/g,
        ""
    )
);