// Function to determine the longest sequence of a player's pieces in any 3D direction
function checkLine(playerMark, coordX, coordY, coordZ) {
   // Initialize arrays for directional changes in X, Y, and Z coordinates
   var deltaX = [-1, 0, 1, -1];
   var deltaY = [-1, -1, -1, 0];
   var deltaZ = [0, 0, 0, 0];

   // Extend the directional arrays to cover more 3D movement vectors
   deltaY = deltaY.concat([-1, 0, 1, -1]);
   deltaZ = deltaZ.concat([-1, -1, -1, 0]);
   deltaX = deltaX.concat([0, 0, 0, 0]);
   deltaZ = deltaZ.concat([-1, 0, 1, -1]);
   deltaX = deltaX.concat([-1, -1, -1, 0]);
   deltaY = deltaY.concat([0, 0, 0, 0]);
   deltaX = deltaX.concat([1, -1, 1, -1]);
   deltaY = deltaY.concat([-1, -1, -1, -1]);
   deltaZ = deltaZ.concat([-1, -1, 1, 1]);

   var maximumLength = 0; // Variable to store the maximum consecutive length found

   // Iterate through each defined 3D direction
   for (var directionIndex = 0; directionIndex < deltaX.length; directionIndex++) {
      var currentX = coordX;
      var currentY = coordY;
      var currentZ = coordZ;

      // Traverse backward along the current direction until out of bounds
      while (true) {
         currentX -= deltaX[directionIndex];
         currentY -= deltaY[directionIndex];
         currentZ -= deltaZ[directionIndex];

         // Break if coordinates fall outside the board dimensions
         if (currentX < 0 || currentY < 0 || currentZ < 0) break;
         if (currentX >= boardSizeN || currentY >= boardSizeN || currentZ >= boardSizeP) break;
      }

      var currentCount = 0; // Counter for consecutive pieces of the current player

      // Traverse forward along the current direction, counting player's pieces
      while (true) {
         currentX += deltaX[directionIndex];
         currentY += deltaY[directionIndex];
         currentZ += deltaZ[directionIndex];

         // Break if coordinates fall outside the board dimensions
         if (currentX < 0 || currentY < 0 || currentZ < 0) break;
         if (currentX >= boardSizeN || currentY >= boardSizeN || currentZ >= boardSizeP) break;

         // If the cell contains the current player's mark, increment the count
         if (gameBoard[currentX][currentY][currentZ] === playerMark) {
            currentCount++;
         } else {
            // Reset count if an opponent's piece or an empty cell is encountered
            currentCount = 0;
         }
         // Update the overall maximum length found
         maximumLength = Math.max(maximumLength, currentCount);
      }
   }
   return maximumLength; // Return the longest sequence of pieces for the given player
}

// Read all input data from standard input
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = rawData.trim().split("\n");

// Main game simulation loop
while (true) {
   var dimensionString = lineData.shift(); // Get the line containing board dimensions
   if (dimensionString === "0 0 0") break; // Terminate loop if "0 0 0" is encountered

   var parsedDimensions = dimensionString.split(" ").map(Number);
   var boardSizeN = parsedDimensions[0]; // N for N x N board (width and height)
   var winConditionM = parsedDimensions[1]; // M pieces in a row to win
   var boardSizeP = parsedDimensions[2]; // P for P layers (depth)

   // Initialize the 3D game board with all cells set to 0 (empty)
   var gameBoard = [];
   for (var boardRow = 0; boardRow < boardSizeN; boardRow++) {
      gameBoard[boardRow] = [];
      for (var boardCol = 0; boardCol < boardSizeN; boardCol++) {
         gameBoard[boardRow][boardCol] = [];
         for (var boardDepth = 0; boardDepth < boardSizeP; boardDepth++) {
            gameBoard[boardRow][boardCol][boardDepth] = 0;
         }
      }
   }

   // Read all player moves for the current game
   var playerMoves = [];
   for (var moveInputIndex = 0; moveInputIndex < boardSizeP; moveInputIndex++) {
      playerMoves.push(lineData.shift().split(" ").map(Number));
   }

   var activePlayer = 1; // Player 1 (Black) starts the game
   var isDrawCondition = true; // Flag to track if the game ends in a draw

   // Process each turn of the game
   for (var turnIndex = 0; turnIndex < boardSizeP; turnIndex++) {
      var currentMoveCoordinates = playerMoves[turnIndex];
      var moveCol = currentMoveCoordinates[0] - 1; // Convert to 0-indexed column
      var moveRow = currentMoveCoordinates[1] - 1; // Convert to 0-indexed row

      var stackLevel = 0; // Determine the lowest available slot in the chosen column
      while (true) {
         // If the current slot is occupied, move up to the next level
         if (gameBoard[moveCol][moveRow][stackLevel] !== 0) {
            stackLevel++;
         } else {
            // Found an empty slot, break the loop
            break;
         }
      }

      // Place the current player's piece on the board
      gameBoard[moveCol][moveRow][stackLevel] = activePlayer;

      // Check if the current move results in a win for the active player
      if (checkLine(activePlayer, moveCol, moveRow, stackLevel) >= winConditionM) {
         // Output the winner and the turn number
         console.log((activePlayer === 2) ? "White" : "Black", turnIndex + 1);
         isDrawCondition = false; // Game is no longer a draw
         break; // End the game as a winner is found
      }

      // Switch to the other player (1 becomes 2, 2 becomes 1)
      activePlayer = 2 / activePlayer;
   }

   // If the game loop finishes without a winner, it's a draw
   if (isDrawCondition) {
      console.log("Draw");
   }
}
