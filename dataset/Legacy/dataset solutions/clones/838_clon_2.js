function findBestMoveForPlayerX() {
  // This function determines the optimal move for player 'x'
  // by evaluating potential flips on the game board.
  let highestScore = 0;
  let optimalSpot = [];

  // Iterate through each cell on the 8x8 board
  for (let rowIdx = 1; rowIdx <= 8; rowIdx++) {
    for (let colIdx = 1; colIdx <= 8; colIdx++) {
      // Only consider empty cells for a move
      if (gameBoard[rowIdx][colIdx] !== EMPTY_CELL) {
        continue;
      }

      // Calculate the number of pieces that would be flipped if 'x' plays here
      let currentFlips = calculateFlips(rowIdx, colIdx, PLAYER_X_PIECE, PLAYER_O_PIECE);

      // If this move yields more flips than previous best, update
      if (currentFlips > highestScore) {
        optimalSpot = [rowIdx, colIdx];
        highestScore = currentFlips;
      }
    }
  }
  return optimalSpot;
}

function findBestMoveForPlayerO() {
  // This function determines the optimal move for player 'o'
  // by evaluating potential flips on the game board.
  let topScore = 0;
  let bestPosition = [];

  // Iterate through the board in reverse order (a different traversal pattern)
  for (let rowIdx = 8; rowIdx >= 1; rowIdx--) {
    for (let colIdx = 8; colIdx >= 1; colIdx--) {
      // Calculate flips for player 'o'
      let currentFlips = calculateFlips(rowIdx, colIdx, PLAYER_O_PIECE, PLAYER_X_PIECE);

      // Only consider empty cells for a move
      if (gameBoard[rowIdx][colIdx] !== EMPTY_CELL) {
        continue;
      }

      // If this move yields more flips than previous best, update
      if (currentFlips > topScore) {
        bestPosition = [rowIdx, colIdx];
        topScore = currentFlips;
      }
    }
  }
  return bestPosition;
}

function calculateFlips(currentY, currentX, playerPiece, opponentPiece) {
  // Define all 8 possible directions for checking flips
  const rowDirections = [-1, -1, -1, 0, 0, 1, 1, 1];
  const colDirections = [-1, 0, 1, -1, 1, -1, 0, 1];
  let totalFlips = 0;

  // Check each direction
  for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
    const currentDR = rowDirections[directionIndex];
    const currentDC = colDirections[directionIndex];
    let flipsInDirection = 0;
    let stepMultiplier = 1;

    // Traverse in the current direction
    while (true) {
      const targetCellY = currentY + currentDR * stepMultiplier;
      const targetCellX = currentX + currentDC * stepMultiplier;

      // If boundary or empty cell, no flips in this direction
      if (gameBoard[targetCellY][targetCellX] === BOUNDARY_MARKER || gameBoard[targetCellY][targetCellX] === EMPTY_CELL) {
        break;
      } else if (gameBoard[targetCellY][targetCellX] === opponentPiece) {
        // Found an opponent's piece, increment potential flips
        flipsInDirection++;
      } else if (gameBoard[targetCellY][targetCellX] === playerPiece) {
        // Found player's own piece, so flips are valid. Add to total.
        totalFlips += flipsInDirection;
        break;
      }
      stepMultiplier++;
    }
  }
  return totalFlips;
}

function applyMoveAndFlip(targetY, targetX, opponentPiece, playerPiece) {
  // Place the current player's piece at the target location
  gameBoard[targetY][targetX] = playerPiece;

  // Define all 8 possible directions for checking flips
  const rowDirections = [-1, -1, -1, 0, 0, 1, 1, 1];
  const colDirections = [-1, 0, 1, -1, 1, -1, 0, 1];

  // Check each direction for pieces to flip
  for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
    const currentDR = rowDirections[directionIndex];
    const currentDC = colDirections[directionIndex];
    let stepMultiplier = 1;
    let foundOpponentPiece = false; // Flag to indicate if opponent's pieces were found in this line

    // Traverse in the current direction
    while (true) {
      const cellY = targetY + currentDR * stepMultiplier;
      const cellX = targetX + currentDC * stepMultiplier;

      // If boundary or empty cell, stop checking this direction
      if (gameBoard[cellY][cellX] === BOUNDARY_MARKER || gameBoard[cellY][cellX] === EMPTY_CELL) {
        break;
      } else if (gameBoard[cellY][cellX] === opponentPiece) {
        // Found an opponent's piece, mark flag
        foundOpponentPiece = true;
      } else if (gameBoard[cellY][cellX] === playerPiece) {
        // Found player's own piece, if opponent's pieces were between, flip them
        if (foundOpponentPiece) {
          // Go back and flip all pieces until the starting point
          while (stepMultiplier > 0) {
            stepMultiplier--; // Decrement first to get to the last opponent piece
            gameBoard[targetY + currentDR * stepMultiplier][targetX + currentDC * stepMultiplier] = playerPiece;
          }
        }
        break; // Stop checking this direction
      }
      stepMultiplier++;
    }
  }
}

// Constants for game pieces and board markers
const EMPTY_CELL = ".";
const PLAYER_X_PIECE = "x";
const PLAYER_O_PIECE = "o";
const BOUNDARY_MARKER = "f";
const TOP_BOTTOM_BOUNDARY = "ffffffffff";
const NEWLINE_SEPARATOR = "\n";
const OUTPUT_CLEANUP_REGEX = /\,|f/g;

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split(NEWLINE_SEPARATOR);

// Initialize the game board with boundary markers
let gameBoard = [];
gameBoard.push(TOP_BOTTOM_BOUNDARY.split("")); // Top boundary

inputLines.forEach(function(lineContent) {
  // Add left and right boundaries to each row
  const paddedLine = BOUNDARY_MARKER + lineContent + BOUNDARY_MARKER;
  gameBoard.push(paddedLine.split(""));
});

gameBoard.push(TOP_BOTTOM_BOUNDARY.split("")); // Bottom boundary

let consecutivePasses = 0; // Counter for consecutive passes

// Main game loop
while (true) {
  // Player X's turn
  const resultPlayerX = findBestMoveForPlayerX();
  if (resultPlayerX.length === 0) {
    consecutivePasses++; // Player X passes
  } else {
    consecutivePasses = 0; // Reset pass counter
    applyMoveAndFlip(resultPlayerX[0], resultPlayerX[1], PLAYER_O_PIECE, PLAYER_X_PIECE);
  }

  // Player O's turn
  const resultPlayerO = findBestMoveForPlayerO();
  if (resultPlayerO.length === 0) {
    consecutivePasses++; // Player O passes
  } else {
    consecutivePasses = 0; // Reset pass counter
    applyMoveAndFlip(resultPlayerO[0], resultPlayerO[1], PLAYER_X_PIECE, PLAYER_O_PIECE);
  }

  // End game if two consecutive passes occur
  if (consecutivePasses >= 2) {
    break;
  }
}

// Remove the top and bottom boundary rows before printing
gameBoard.shift();
gameBoard.pop();

// Print the final board state, removing commas and boundary markers
console.log(gameBoard.join(NEWLINE_SEPARATOR).replace(OUTPUT_CLEANUP_REGEX, ""));
