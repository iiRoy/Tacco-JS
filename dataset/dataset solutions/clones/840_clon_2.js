// This function determines the optimal move for the first player ('x').
function findBestMoveForPlayerOne() {
  let highestScore = 0; // Tracks the maximum number of pieces that can be flipped.
  let chosenCoordinates = []; // Stores the [row, column] of the best move found.

  // Iterate through each cell on the 8x8 game grid.
  for (let rowIdx = 1; rowIdx <= 8; rowIdx++) {
    for (let colIdx = 1; colIdx <= 8; colIdx++) {
      // Skip cells that are not empty (represented by '.').
      if (gameBoard[rowIdx][colIdx] !== ".") {
        continue;
      }

      // Calculate the number of pieces that would be flipped if player 'x' places a piece here.
      const currentFlips = calculateFlips(rowIdx, colIdx, "x", "o");

      // If this move yields more flips than previously found, update the best move.
      if (currentFlips > highestScore) {
        chosenCoordinates = [rowIdx, colIdx];
        highestScore = currentFlips;
      }
    }
  }
  return chosenCoordinates; // Return the coordinates of the best move.
}

// This function identifies the most advantageous move for the second player ('o').
function findBestMoveForPlayerTwo() {
  let bestCount = 0; // Holds the maximum flip count for player 'o'.
  let selectedSpot = []; // Stores the coordinates of the optimal placement.

  // Loop through the board in reverse order, which might change evaluation order but not logic.
  for (let r = 8; r >= 1; r--) {
    for (let c = 8; c >= 1; c--) {
      // If the current cell is not empty, skip it.
      if (gameBoard[r][c] !== ".") continue;

      // Determine the number of pieces player 'o' would capture at this spot.
      const flipsAchieved = calculateFlips(r, c, "o", "x");

      // Update the best move if more pieces are captured.
      if (flipsAchieved > bestCount) {
        selectedSpot = [r, c];
        bestCount = flipsAchieved;
      }
    }
  }
  return selectedSpot; // Returns the best position for player 'o'.
}

// Calculates the total number of opponent pieces that would be flipped by placing a piece at (posY, posX).
function calculateFlips(posY, posX, playerToken, opponentToken) {
  // Define direction vectors for Y-axis (8 directions: up, down, left, right, diagonals).
  const yDirections = [-1, -1, -1, 0, 0, 1, 1, 1];
  // Define direction vectors for X-axis.
  const xDirections = [-1, 0, 1, -1, 1, -1, 0, 1];

  let totalFlips = 0; // Accumulator for the total number of flipped pieces.

  // Iterate through all 8 possible directions from the given position.
  for (let dirIndex = 0; dirIndex < 8; dirIndex++) {
    let currentYDir = yDirections[dirIndex]; // Y-component of the current direction.
    let currentXDir = xDirections[dirIndex]; // X-component of the current direction.

    let flipsInDirection = 0; // Counter for pieces flipped in the current direction.
    let step = 1; // Distance from the starting position in the current direction.

    // Traverse along the current direction until a boundary, empty cell, or player's own piece is found.
    while (true) {
      const targetY = posY + currentYDir * step;
      const targetX = posX + currentXDir * step;
      const cellContent = gameBoard[targetY][targetX];

      // If we hit a 'f' (fence/boundary) or '.' (empty cell), this direction doesn't result in flips.
      if (cellContent === "f" || cellContent === ".") {
        break;
      }
      // If we find a piece belonging to the player whose turn it was *before* placing this piece.
      else if (cellContent === playerToken) {
        flipsInDirection++;
      }
      // If we encounter the current player's piece, all opponent pieces encountered so far in this direction are flipped.
      else if (cellContent === opponentToken) {
        totalFlips += flipsInDirection;
        break; // Stop searching in this direction.
      }
      step++; // Move to the next cell in this direction.
    }
  }
  return totalFlips; // Return the grand total of all pieces that would be flipped.
}

// Executes a move by placing a piece and flipping all captured opponent pieces.
function applyMoveAndFlip(targetY, targetX, opponentDisc, currentDisc) {
  // Place the current player's piece at the specified coordinates.
  gameBoard[targetY][targetX] = currentDisc;

  // Define offsets for checking all 8 directions around a cell.
  const yAxisOffsets = [-1, -1, -1, 0, 0, 1, 1, 1];
  const xAxisOffsets = [-1, 0, 1, -1, 1, -1, 0, 1];

  // Iterate through each of the eight possible directions.
  for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
    const currentYOffset = yAxisOffsets[directionIndex];
    const currentXOffset = xAxisOffsets[directionIndex];

    let distanceStep = 1; // Current distance from the placed piece (targetY, targetX).
    let opponentPieceFound = false; // Flag to track if opponent pieces are encountered in this line.

    // Traverse cells in the current direction.
    while (true) {
      const checkY = targetY + currentYOffset * distanceStep;
      const checkX = targetX + currentXOffset * distanceStep;
      const cellValue = gameBoard[checkY][checkX]; // Get the content of the cell.

      // If a boundary 'f' or an empty spot '.' is encountered, no pieces can be flipped in this direction.
      if (cellValue === "f" || cellValue === ".") {
        break;
      }
      // If an opponent's disc is found, mark it. This disc might be flipped later.
      else if (cellValue === opponentDisc) {
        opponentPieceFound = true;
      }
      // If the current player's disc is found (closing the line of opponent discs).
      else if (cellValue === currentDisc) {
        // If opponent discs were indeed found between the placed piece and this closing disc.
        if (opponentPieceFound) {
          // Flip all the opponent discs in this line.
          let flipDistance = distanceStep - 1; // Start flipping from the disc adjacent to the closing disc.
          while (flipDistance > 0) {
            gameBoard[targetY + currentYOffset * flipDistance][
              targetX + currentXOffset * flipDistance
            ] = currentDisc; // Change the disc to the current player's symbol.
            flipDistance--;
          }
        }
        break; // Stop processing this direction.
      }
      distanceStep++; // Move to the next cell in the current direction.
    }
  }
}

// Global game state representing the Reversi board.
let gameBoard = [];

// Read raw input data from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace and split into individual lines.
const trimmedLines = rawData.trim().split("\n");

// Initialize the game board with a top boundary row of 'f' characters.
gameBoard.push("ffffffffff".split(""));

// Iterate over each input line to construct the playable area of the board.
trimmedLines.forEach(function(lineData) {
  // Add 'f' characters as left and right boundaries for each row.
  const paddedLine = "f" + lineData + "f";
  gameBoard.push(paddedLine.split(""));
});

// Add a bottom boundary row of 'f' characters to complete the board.
gameBoard.push("ffffffffff".split(""));

let consecutivePasses = 0; // Counter for consecutive turns where no valid moves are available.

// Main game loop: continues until two consecutive passes occur.
while (true) {
  // Determine the best move for Player 'x'.
  const playerOneMove = findBestMoveForPlayerOne();

  // Check if Player 'x' has any valid moves.
  if (playerOneMove.length === 0) {
    consecutivePasses++; // Increment pass counter if no move.
  } else {
    consecutivePasses = 0; // Reset pass counter if a move is made.
    // Apply Player 'x''s move and flip pieces. Parameters: (y, x, opponent's disc, current player's disc).
    applyMoveAndFlip(playerOneMove[0], playerOneMove[1], "x", "o");
  }

  // Determine the best move for Player 'o'.
  const playerTwoMove = findBestMoveForPlayerTwo();

  // Check if Player 'o' has any valid moves.
  if (playerTwoMove.length === 0) {
    consecutivePasses++; // Increment pass counter if no move.
  } else {
    consecutivePasses = 0; // Reset pass counter if a move is made.
    // Apply Player 'o''s move and flip pieces. Parameters: (y, x, opponent's disc, current player's disc).
    applyMoveAndFlip(playerTwoMove[0], playerTwoMove[1], "o", "x");
  }

  // If two or more consecutive passes have occurred, the game ends.
  if (consecutivePasses >= 2) {
    break; // Exit the game loop.
  }
}

// Remove the top and bottom boundary rows before printing the final board.
gameBoard.shift();
gameBoard.pop();

// Format and print the final game board to standard output.
// Joins rows with newlines, then removes commas (from split("")) and 'f' characters.
console.log(gameBoard.join("\n").replace(/,|f/g, ""));