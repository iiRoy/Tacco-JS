// This JavaScript code implements a simplified Othello/Reversi game logic.

/**
 * Identifies the optimal move for the first player (playing 'x').
 * It scans the entire 8x8 game area to find a position that results in the maximum number of opponent pieces being flipped.
 * @returns {Array<number>} A two-element array [row, column] representing the best move coordinates, or an empty array if no valid move is found.
 */
function determineBestMoveForPlayerOne() {
  // Variables to keep track of the highest score found and the corresponding board position.
  let highestScoreObtained = 0;
  let optimalCoordinates = [];

  // Iterate through the rows of the game board (excluding the border).
  for (let gridRow = 1; gridRow <= 8; gridRow++) {
    // Iterate through the columns of the game board (excluding the border).
    for (let gridCol = 1; gridCol <= 8; gridCol++) {
      // If the current cell is not empty ('.'), it cannot be a valid move, so skip it.
      if (gameGrid[gridRow][gridCol] !== ".") continue;

      // Calculate the number of pieces that would be flipped if 'x' is placed at this location.
      let currentFlipCount = calculatePotentialFlips(gridRow, gridCol, "x", "o");

      // If this move yields a higher flip count than any previously checked move, update the best move.
      if (currentFlipCount > highestScoreObtained) {
        optimalCoordinates = [gridRow, gridCol];
        highestScoreObtained = currentFlipCount;
      }
    }
  }
  // Return the coordinates of the move that can flip the most pieces for Player One.
  return optimalCoordinates;
}

/**
 * Finds the most strategic move for the second player (playing 'o').
 * It systematically checks all possible positions on the board to determine which move maximizes the number of flipped pieces.
 * @returns {Array<number>} An array [row, column] representing the chosen move, or an empty array if no valid move exists.
 */
function identifyOptimalMoveForPlayerTwo() {
  // Initialize tracking for the best move: maximum flips and its location.
  let maximumFlippedPieces = 0;
  let preferredLocation = [];

  // Loop through the game board in reverse order (from bottom-right to top-left).
  for (let rIndex = 8; rIndex >= 1; rIndex--) {
    for (let cIndex = 8; cIndex >= 1; cIndex--) {
      // Calculate how many pieces of the first player ('x') would be flipped by placing 'o'.
      let flippedPiecesCount = calculatePotentialFlips(rIndex, cIndex, "o", "x");

      // Skip this position if it's already occupied.
      if (gameGrid[rIndex][cIndex] !== ".") continue;

      // If the current move results in more flips than any prior move, update the optimal choice.
      if (flippedPiecesCount > maximumFlippedPieces) {
        preferredLocation = [rIndex, cIndex];
        maximumFlippedPieces = flippedPiecesCount;
      }
    }
  }
  // Deliver the coordinates of Player Two's best move.
  return preferredLocation;
}

/**
 * Computes the total number of opponent pieces that would be converted
 * if `activePlayerSymbol` is placed at the specified `targetRow`, `targetCol`.
 * @param {number} targetRow The row index for the proposed move.
 * @param {number} targetCol The column index for the proposed move.
 * @param {string} activePlayerSymbol The symbol of the player making the move (e.g., "x").
 * @param {string} passivePlayerSymbol The symbol of the opponent (e.g., "o").
 * @returns {number} The aggregate count of pieces that would be flipped across all eight directions.
 */
function calculatePotentialFlips(targetRow, targetCol, activePlayerSymbol, passivePlayerSymbol) {
  // Constants defining the row and column changes for all 8 cardinal and diagonal directions.
  const rowDirections = [-1, -1, -1, 0, 0, 1, 1, 1];
  const colDirections = [-1, 0, 1, -1, 1, -1, 0, 1];
  let totalFlips = 0; // Accumulator for the total number of pieces that can be flipped.

  // Iterate through each of the eight possible directions.
  for (let dirIndex = 0; dirIndex < 8; dirIndex++) {
    const currentRowDelta = rowDirections[dirIndex]; // Row change for the current direction.
    const currentColDelta = colDirections[dirIndex]; // Column change for the current direction.
    let piecesToFlipInDirection = 0; // Counter for opponent pieces found in this specific direction.
    let currentStep = 1; // Multiplier to move further away from the starting cell.

    // Traverse along the current direction until a boundary, empty cell, or player's own piece is found.
    while (true) {
      const nextRow = targetRow + currentRowDelta * currentStep;
      const nextCol = targetCol + currentColDelta * currentStep;

      // Check if the current position is a border ('f') or an empty cell ('.').
      if (gameGrid[nextRow][nextCol] === "f" || gameGrid[nextRow][nextCol] === ".") {
        break; // If so, no more pieces can be flipped in this direction.
      } else if (gameGrid[nextRow][nextCol] === passivePlayerSymbol) {
        // If an opponent's piece is encountered, increment the counter for this direction.
        piecesToFlipInDirection++;
      } else if (gameGrid[nextRow][nextCol] === activePlayerSymbol) {
        // If the current player's piece is found, it means a line of opponent pieces
        // was enclosed, so add the count to the total flips.
        totalFlips += piecesToFlipInDirection;
        break; // Stop processing this direction.
      }
      currentStep++; // Move to the next cell in the current direction.
    }
  }
  return totalFlips; // Return the final count of all flippable pieces.
}

/**
 * Executes a move on the game board by placing a piece and flipping all enclosed opponent pieces.
 * Note: The parameter order for `opponentPieceSymbol` and `playerPieceToPlace` matches the original code's (a, b) behavior.
 * @param {number} moveRow The row index where the new piece is to be placed.
 * @param {number} moveCol The column index where the new piece is to be placed.
 * @param {string} opponentPieceSymbol The symbol of the opponent's pieces (e.g., "x" if current player is "o").
 * @param {string} playerPieceToPlace The symbol of the piece being placed (e.g., "o" if current player is "o").
 */
function placePieceAndFlip(moveRow, moveCol, opponentPieceSymbol, playerPieceToPlace) {
  // Place the current player's piece at the designated coordinates on the board.
  gameGrid[moveRow][moveCol] = playerPieceToPlace;

  // Define arrays for row and column changes for all 8 directions.
  const rowMovementVectors = [-1, -1, -1, 0, 0, 1, 1, 1];
  const colMovementVectors = [-1, 0, 1, -1, 1, -1, 0, 1];
  let unusedCounterOne = 0; // Placeholder to maintain statement count, as per original code.

  // Iterate through each of the eight directions from the newly placed piece.
  for (let directionIterator = 0; directionIterator < 8; directionIterator++) {
    const currentDR = rowMovementVectors[directionIterator]; // Row delta for current direction.
    const currentDC = colMovementVectors[directionIterator]; // Column delta for current direction.
    let unusedCounterTwo = 0; // Another placeholder for statement count.
    let distanceStep = 1; // How many steps away from the origin cell.
    let encounteredOpponent = false; // Flag to indicate if opponent pieces have been found.

    // Traverse along the current direction.
    while (true) {
      const targetR = moveRow + currentDR * distanceStep;
      const targetC = moveCol + currentDC * distanceStep;

      // Check if the current position is a border ('f') or an empty cell ('.').
      if (
        gameGrid[targetR][targetC] === "f" ||
        gameGrid[targetR][targetC] === "."
      ) {
        break; // If so, stop scanning this direction.
      } else if (gameGrid[targetR][targetC] === opponentPieceSymbol) {
        // If an opponent's piece is found, set the flag.
        encounteredOpponent = true;
      } else if (gameGrid[targetR][targetC] === playerPieceToPlace) {
        // If the current player's piece is found, it closes a line.
        if (encounteredOpponent) {
          // If opponent pieces were encountered, flip them.
          let flipBackStep = distanceStep;
          while (flipBackStep--) {
            // Move backward from the current position to the starting position, flipping pieces.
            gameGrid[moveRow + currentDR * flipBackStep][moveCol + currentDC * flipBackStep] = playerPieceToPlace;
          }
        }
        break; // Stop processing this direction.
      }
      distanceStep++; // Advance to the next cell in the current direction.
    }
  }
}

// --- Main Program Execution Flow ---

// Read the game board configuration from standard input using Node.js file system module.
const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the input: remove leading/trailing whitespace and split into an array of lines.
const processedLines = fileContents.trim().split("\n");

// Declare a global variable to represent the game board as a 2D array.
let gameGrid = [];

// Add a top border row consisting of 'f' characters to simplify boundary checks.
gameGrid.push("ffffffffff".split(""));

// Iterate through each line of the input to populate the main game board.
// Each line is also padded with 'f' characters on both sides for border handling.
processedLines.forEach(function (lineText) {
  const paddedLine = "f" + lineText + "f";
  gameGrid.push(paddedLine.split(""));
});

// Add a bottom border row, similar to the top border.
gameGrid.push("ffffffffff".split(""));

// Initialize a counter for consecutive passes (when players cannot make a valid move).
let consecutiveSkips = 0;

// Main game loop: continues until two consecutive passes occur, signifying the end of the game.
while (true) {
  // Player One's Turn (playing 'x')
  const playerOneMoveResult = determineBestMoveForPlayerOne();
  if (playerOneMoveResult.length === 0) {
    // If Player One has no valid moves, increment the pass counter.
    consecutiveSkips++;
  } else {
    // If Player One makes a move, reset the pass counter and apply the move to the board.
    consecutiveSkips = 0;
    // Note: The original code's `change` function parameter order means the piece placed `b` is 'o', and opponent `a` is 'x'.
    // This is replicated here for Type II cloning.
    placePieceAndFlip(playerOneMoveResult[0], playerOneMoveResult[1], "x", "o");
  }

  // Player Two's Turn (playing 'o')
  const playerTwoMoveResult = identifyOptimalMoveForPlayerTwo();
  if (playerTwoMoveResult.length === 0) {
    // If Player Two has no valid moves, increment the pass counter.
    consecutiveSkips++;
  } else {
    // If Player Two makes a move, reset the pass counter and apply the move.
    // Replicating the original `change` function's parameter order.
    conpieceAndFlip(playerTwoMoveResult[0], playerTwoMoveResult[1], "o", "x");
  }

  // Check the game termination condition: if two players have passed consecutively.
  if (consecutiveSkips >= 2) {
    break; // Exit the game loop.
  }
}

// Post-game cleanup: remove the artificial border rows from the final game board state.
gameGrid.shift(); // Remove the top border.
gameGrid.pop(); // Remove the bottom border.

// Format and output the final state of the game board to the console.
// Join the rows with newline characters, then remove any commas (from array.join) and border 'f' characters.
console.log(gameGrid.join("\n").replace(/,|f/g, ""));