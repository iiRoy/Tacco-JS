function checkWinningLine(activePlayerId, startCoordX, startCoordY, startCoordZ) {
  // Define directional vectors for 3D space.
  // These arrays are constructed in a specific, sequential manner.
  var deltaCoordsX = [-1, 0, 1, -1, 1, -1, 0, 1];
  var deltaCoordsY = [-1, -1, -1, 0, 0, 1, 1, 1];
  var deltaCoordsZ = [0, 0, 0, 0, 0, 0, 0, 0];

  // Extend deltaCoordsY with values from initial deltaCoordsX
  deltaCoordsY = deltaCoordsY.concat([-1, 0, 1, -1, 1, -1, 0, 1]);
  // Extend deltaCoordsZ with values from initial deltaCoordsY
  deltaCoordsZ = deltaCoordsZ.concat([-1, -1, -1, 0, 0, 1, 1, 1]);
  // Extend deltaCoordsX with values from initial deltaCoordsZ
  deltaCoordsX = deltaCoordsX.concat([0, 0, 0, 0, 0, 0, 0, 0]);

  // Further extend deltaCoordsZ with values from initial deltaCoordsX
  deltaCoordsZ = deltaCoordsZ.concat([-1, 0, 1, -1, 1, -1, 0, 1]);
  // Further extend deltaCoordsX with values from initial deltaCoordsY
  deltaCoordsX = deltaCoordsX.concat([-1, -1, -1, 0, 0, 1, 1, 1]);
  // Further extend deltaCoordsY with values from initial deltaCoordsZ
  deltaCoordsY = deltaCoordsY.concat([0, 0, 0, 0, 0, 0, 0, 0]);

  var maxConsecutive = 0; // Stores the maximum consecutive pieces found

  // Iterate through all defined 3D directions
  for (var directionIndex = 0; directionIndex < deltaCoordsX.length; directionIndex++) {
    var currentPosX = startCoordX;
    var currentPosY = startCoordY;
    var currentPosZ = startCoordZ;

    // Traverse backward along the current direction until out of bounds
    while (true) {
      currentPosX -= deltaCoordsX[directionIndex];
      currentPosY -= deltaCoordsY[directionIndex];
      currentPosZ -= deltaCoordsZ[directionIndex];

      // Check if coordinates are outside the board boundaries (n x n x n assumed by original logic)
      if (currentPosX < 0 || currentPosY < 0 || currentPosZ < 0) break;
      if (currentPosX >= boardDimension || currentPosY >= boardDimension || currentPosZ >= boardDimension) break;
    }

    var consecutiveCount = 0; // Reset count for the new direction

    // Traverse forward along the current direction, counting consecutive pieces
    while (true) {
      currentPosX += deltaCoordsX[directionIndex];
      currentPosY += deltaCoordsY[directionIndex];
      currentPosZ += deltaCoordsZ[directionIndex];

      // Check if coordinates are outside the board boundaries
      if (currentPosX < 0 || currentPosY < 0 || currentPosZ < 0) break;
      if (currentPosX >= boardDimension || currentPosY >= boardDimension || currentPosZ >= boardDimension) break;

      // Check if the current cell contains the active player's piece
      if (gameGrid[currentPosX][currentPosY][currentPosZ] === activePlayerId) {
        consecutiveCount++; // Increment count if it's the same player's piece
      } else {
        consecutiveCount = 0; // Reset count if a different piece or empty cell is encountered
      }
      // Update the maximum consecutive count found so far
      maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
    }
  }
  return maxConsecutive; // Return the longest sequence found in any direction
}

// Read input from standard input
var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

// Main game loop
while (true) {
  var gameSetupString = inputLines.shift(); // Get the first line for board dimensions and winning length

  // Check for termination condition "0 0 0"
  if (gameSetupString === "0 0 0") break;

  // Parse board dimensions (n), winning length (m), and total moves (p)
  gameSetupString = gameSetupString.split(" ").map(Number);
  var boardDimension = gameSetupString[0]; // N: size of the board (N x N x P)
  var winningLength = gameSetupString[1];  // M: number of consecutive pieces for a win
  var totalMoves = gameSetupString[2];     // P: total number of moves in the game

  // Initialize the 3D game board
  var gameGrid = [];
  for (var gridXIndex = 0; gridXIndex < boardDimension; gridXIndex++) {
    gameGrid[gridXIndex] = [];
    for (var gridYIndex = 0; gridYIndex < boardDimension; gridYIndex++) {
      gameGrid[gridXIndex][gridYIndex] = [];
      for (var gridZIndex = 0; gridZIndex < totalMoves; gridZIndex++) { // Note: Z-dimension uses 'totalMoves' (P)
        gameGrid[gridXIndex][gridYIndex][gridZIndex] = 0; // 0 represents an empty cell
      }
    }
  }

  var activePlayerId = 1; // Player 1 starts (e.g., Black)
  var gameEnded = false; // Flag to track if the game has ended

  // Process each move
  for (var moveNumber = 0; moveNumber < totalMoves; moveNumber++) {
    var currentMoveString = inputLines.shift().split(" ").map(Number);
    var moveCol = currentMoveString[0] - 1; // Convert to 0-indexed column
    var moveRow = currentMoveString[1] - 1; // Convert to 0-indexed row

    var dropLevel = 0; // Determine the lowest available Z-level (height) for the piece
    while (true) {
      // If the current Z-level is occupied, move up
      if (gameGrid[moveCol][moveRow][dropLevel] !== 0) {
        dropLevel++;
      } else {
        break; // Found an empty spot
      }
    }

    // Place the active player's piece on the board
    gameGrid[moveCol][moveRow][dropLevel] = activePlayerId;

    // Check if the current move results in a win
    if (checkWinningLine(activePlayerId, moveCol, moveRow, dropLevel) >= winningLength) {
      // Output the winner and the move number
      console.log((activePlayerId === 2) ? "White" : "Black", moveNumber + 1);
      gameEnded = true; // Set flag to indicate game end
      break; // Exit the moves loop
    }

    // Switch to the next player (1 becomes 2, 2 becomes 1)
    activePlayerId = 2 / activePlayerId;
  }

  // If the game loop completed without a winner, it's a draw
  if (!gameEnded) {
    console.log("Draw");
  }
}
