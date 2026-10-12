var deltaXCoords = [-1, 0, 1, -1];
var deltaYCoords = [-1, -1, -1, 0];
var deltaZCoords = [0, 0, 0, 0];

// Extend the direction vectors for 3D traversal
deltaYCoords = deltaYCoords.concat([-1, 0, 1, -1]);
deltaZCoords = deltaZCoords.concat([-1, -1, -1, 0]);
deltaXCoords = deltaXCoords.concat([0, 0, 0, 0]);

deltaZCoords = deltaZCoords.concat([-1, 0, 1, -1]);
deltaXCoords = deltaXCoords.concat([-1, -1, -1, 0]);
deltaYCoords = deltaYCoords.concat([0, 0, 0, 0]);

deltaXCoords = deltaXCoords.concat([1, -1, 1, -1]);
deltaYCoords = deltaYCoords.concat([-1, -1, -1, -1]);
deltaZCoords = deltaZCoords.concat([-1, -1, 1, 1]);

/**
 * Checks for a winning line of 'm' consecutive pieces after a piece is placed.
 * @param {number} currentPlayerIdentifier - The ID of the player whose piece was just placed (1 or 2).
 * @param {number} currentXPos - The X coordinate of the newly placed piece.
 * @param {number} currentYPos - The Y coordinate of the newly placed piece.
 * @param {number} currentZPos - The Z coordinate of the newly placed piece.
 * @returns {number} The maximum number of consecutive pieces found in any direction.
 */
function checkWinCondition(currentPlayerIdentifier, currentXPos, currentYPos, currentZPos) {
   let maximumConsecutive = 0; // Stores the highest count of consecutive pieces
   // Iterate through all possible 3D directions
   for (let directionIndex = 0; directionIndex < deltaXCoords.length; directionIndex++) {
      let tempXCoord = currentXPos;
      let tempYCoord = currentYPos;
      let tempZCoord = currentZPos;

      // First, move backwards along the current direction until out of bounds or a different piece is found
      while (true) {
         tempXCoord -= deltaXCoords[directionIndex];
         tempYCoord -= deltaYCoords[directionIndex];
         tempZCoord -= deltaZCoords[directionIndex];

         // Check if coordinates are out of bounds
         if (tempXCoord < 0 || tempYCoord < 0 || tempZCoord < 0) break;
         if (tempXCoord >= gridDimensionN || tempYCoord >= gridDimensionN || tempZCoord >= totalMovesP) break;
      }

      let consecutiveCount = 0; // Counter for consecutive pieces in the current line
      // Now, move forwards along the current direction, counting consecutive pieces
      while (true) {
         tempXCoord += deltaXCoords[directionIndex];
         tempYCoord += deltaYCoords[directionIndex];
         tempZCoord += deltaZCoords[directionIndex];

         // Check if coordinates are out of bounds
         if (tempXCoord < 0 || tempYCoord < 0 || tempZCoord < 0) break;
         if (tempXCoord >= gridDimensionN || tempYCoord >= gridDimensionN || tempZCoord >= totalMovesP) break;

         // If the piece belongs to the current player, increment count
         if (gameBoardState[tempXCoord][tempYCoord][tempZCoord] === currentPlayerIdentifier) {
            consecutiveCount++;
         } else {
            // Reset count if a different piece or empty spot is encountered
            consecutiveCount = 0;
         }
         // Update the maximum consecutive count found so far
         maximumConsecutive = Math.max(maximumConsecutive, consecutiveCount);
      }
   }
   return maximumConsecutive;
}

// Read input from stdin
var fileInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLineArray = fileInputContent.trim().split("\n");

// Process game rounds until "0 0 0" is encountered
while (true) {
   var dimensionsString = inputLineArray.shift();
   if (dimensionsString === "0 0 0") break; // Termination condition

   // Parse N, M, P for the current game
   dimensionsString = dimensionsString.split(" ").map(Number);
   var gridDimensionN = dimensionsString[0];    // Size of the N x N grid
   var winLengthM = dimensionsString[1];        // Number of consecutive pieces for a win
   var totalMovesP = dimensionsString[2];       // Total number of moves in the game (max Z-depth)

   // Initialize the 3D game board
   var gameBoardState = [];
   for (let loopIndex = 0; loopIndex < gridDimensionN; loopIndex++) {
      gameBoardState[loopIndex] = [];
      for (let nestedLoopIndexJ = 0; nestedLoopIndexJ < gridDimensionN; nestedLoopIndexJ++) {
         gameBoardState[loopIndex][nestedLoopIndexJ] = [];
         for (let nestedLoopIndexK = 0; nestedLoopIndexK < totalMovesP; nestedLoopIndexK++) {
            gameBoardState[loopIndex][nestedLoopIndexJ][nestedLoopIndexK] = 0; // 0 for empty
         }
      }
   }

   // Read all player moves for this game
   var playerMoveCoordinates = [];
   for (let loopIndex = 0; loopIndex < totalMovesP; loopIndex++) {
      playerMoveCoordinates.push(inputLineArray.shift().split(" ").map(Number));
   }

   var activePlayerId = 1; // Player 1 starts (Black)
   var isGameDraw = true;  // Assume draw until a win occurs

   // Simulate each move
   for (let loopIndex = 0; loopIndex < totalMovesP; loopIndex++) {
      var currentMovePair = playerMoveCoordinates[loopIndex];
      var placedXCoord = currentMovePair[0] - 1; // Adjust to 0-indexed
      var placedYCoord = currentMovePair[1] - 1; // Adjust to 0-indexed
      var placementDepth = 0; // Z-coordinate for placing the piece

      // Find the lowest available Z-depth for the current (X, Y) column
      while (true) {
         if (gameBoardState[placedXCoord][placedYCoord][placementDepth] !== 0) {
            placementDepth++; // Move up if current spot is occupied
         } else {
            break; // Found an empty spot
         }
      }

      // Place the piece on the board
      gameBoardState[placedXCoord][placedYCoord][placementDepth] = activePlayerId;

      // Check if the current player has won
      if (checkWinCondition(activePlayerId, placedXCoord, placedYCoord, placementDepth) >= winLengthM) {
         // Output winner and move number
         console.log((activePlayerId === 2) ? "White" : "Black", loopIndex + 1);
         isGameDraw = false; // Game is not a draw
         break; // End the game
      }

      // Switch to the next player (1 -> 2, 2 -> 1)
      activePlayerId = 2 / activePlayerId;
   }

   // If no winner was found after all moves, it's a draw
   if (isGameDraw) {
      console.log("Draw");
   }
}
