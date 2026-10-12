var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into lines
var lineData = (rawData.trim()).split("\n");

// Define vertical movement offsets for neighbors
var deltaY = [-1, 0, 0, 1];

// Define horizontal movement offsets for neighbors
var deltaX = [0, -1, 1, 0];

// Iterate over each line of input data
lineData.forEach(function(currentLine, lineIndex) {
   // Parse the current line into an array of numbers representing the initial board state
   var initialState = currentLine.split(" ").map(Number);

   // Initialize a set to keep track of visited board configurations (as strings)
   var visitedStates = {};

   // Initialize a queue for Breadth-First Search (BFS)
   // Each element in the queue is an array: [board configuration, number of moves]
   var queue = [[initialState, 0]];

   // Perform BFS until the queue is empty
   while (queue.length > 0) {
      // Dequeue the first element
      var currentEntry = queue.shift();
      var boardConfig = currentEntry[0]; // The current board configuration
      var moveCount = currentEntry[1];   // The number of moves to reach this configuration

      // Check if the current board configuration is the target state
      if (boardConfig.join("") === "01234567") {
         console.log(moveCount); // If so, print the move count and exit for this line
         break;
      }

      // Find the index of the '0' (empty space) tile
      var zeroIndex = boardConfig.indexOf(0);

      // Calculate the row and column of the '0' tile
      var row = Math.floor(zeroIndex / 4);
      var col = zeroIndex % 4;

      // Create a 2x4 grid representation of the board for easier neighbor calculations
      var boardGrid = [boardConfig.slice(0, 4), boardConfig.slice(4, 8)];

      // Explore possible moves (up, left, right, down)
      for (var directionIdx = 0; directionIdx < 4; directionIdx++) {
         var newRow = row + deltaY[directionIdx]; // Calculate new row for the '0' tile
         var newCol = col + deltaX[directionIdx]; // Calculate new column for the '0' tile

         // Check if the new position is within the board boundaries (2 rows, 4 columns)
         if (newRow < 0 || newCol < 0 || newRow >= 2 || newCol >= 4) {
            continue; // If out of bounds, skip this direction
         }

         // Simulate swapping the '0' tile with the tile at the new position
         boardGrid[row][col] = boardGrid[newRow][newCol]; // Move the tile into the '0's original spot
         var swappedTile = boardGrid[newRow][newCol];     // Store the value of the tile that was moved
         boardGrid[newRow][newCol] = 0;                   // Place '0' in the new spot

         // Convert the modified 2x4 grid back into a 1D array
         var nextBoardConfig = boardGrid[0].concat(boardGrid[1]);
         // Convert the 1D array to a string for efficient lookup in the visited set
         var configString = nextBoardConfig.join("");

         // If this configuration has not been visited before
         if (visitedStates.hasOwnProperty(configString) === false) {
               visitedStates[configString] = true; // Mark it as visited
               queue.push([nextBoardConfig, moveCount + 1]); // Add it to the queue with an incremented move count
         }

         // Backtrack: restore the boardGrid to its state before the swap for the next iteration
         boardGrid[newRow][newCol] = swappedTile; // Put the swapped tile back
         boardGrid[row][col] = 0;                 // Put '0' back in its original spot
      }
   }
});
