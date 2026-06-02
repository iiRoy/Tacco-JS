const fileSystem = require('fs');

// Function to iteratively find connected blocks of the same color using DFS.
// It returns an array of coordinates [[r1, c1], [r2, c2], ...] for the detected chain.
// Cells visited during this detection pass are temporarily marked on the gameBoard
// by appending '0' to their color (e.g., "R" becomes "R0").
function detectConnectedChain(currRow, currCol, targetColor, gameBoard) {
   const rowOffsets = [-1, 0, 0, 1];
   const colOffsets = [0, -1, 1, 0];
   const chainCells = [];
   const explorationStack = [[currRow, currCol]];

   // Mark the starting cell as visited and add it to the chain
   gameBoard[currRow][currCol] = targetColor + '0';
   chainCells.push([currRow, currCol]);

   while (explorationStack.length > 0) {
      const [r, c] = explorationStack.pop();

      for (let i = 0; i < 4; i++) {
         const nextRow = r + rowOffsets[i];
         const nextCol = c + colOffsets[i];

         // Boundary check for the next cell
         if (nextRow < 0 || nextCol < 0 || nextRow >= 12 || nextCol >= 6) {
            continue;
         }

         // If the neighbor is the target color and has not yet been visited in this chain detection pass
         if (gameBoard[nextRow][nextCol] === targetColor) {
            gameBoard[nextRow][nextCol] = targetColor + '0'; // Mark as visited
            chainCells.push([nextRow, nextCol]);
            explorationStack.push([nextRow, nextCol]); // Add to stack for further exploration
         }
      }
   }
   return chainCells;
}

// Function to recursively clear a chain of blocks and any 'O' blocks connected to them.
// Cleared cells are marked as ".".
function removeChainElements(currRow, currCol, targetColor, gameBoard) {
   const rowOffsets = [-1, 0, 0, 1];
   const colOffsets = [0, -1, 1, 0];

   // Check if the current cell is already cleared or not relevant for this removal
   if (gameBoard[currRow][currCol] !== targetColor && gameBoard[currRow][currCol] !== "O") {
       return;
   }

   // Clear the current cell
   gameBoard[currRow][currCol] = ".";

   for (let i = 0; i < 4; i++) {
      const nextRow = currRow + rowOffsets[i];
      const nextCol = currCol + colOffsets[i];

      // Boundary check for the next cell
      if (nextRow < 0 || nextCol < 0 || nextRow >= 12 || nextCol >= 6) {
         continue;
      }

      // Recurse if the neighbor is the target color or an 'O' block
      // The recursive call will handle clearing the neighbor if it matches
      if (gameBoard[nextRow][nextCol] === targetColor || gameBoard[nextRow][nextCol] === "O") {
         removeChainElements(nextRow, nextCol, targetColor, gameBoard);
      }
   }
}

// Function to apply gravity to a specific column, moving one block down to fill an empty spot.
// It searches upwards from the empty spot to find the first non-empty block to move.
function applyGravityToColumn(emptyRow, colIndex, gameBoard) {
   let destinationRow = emptyRow;
   // Search upwards from the row directly above the empty spot
   for (let sourceRow = emptyRow - 1; sourceRow >= 0; sourceRow--) {
      if (gameBoard[sourceRow][colIndex] !== ".") {
         // Move the block down to the empty spot
         gameBoard[destinationRow][colIndex] = gameBoard[sourceRow][colIndex];
         gameBoard[sourceRow][colIndex] = "."; // Clear the original spot of the moved block
         return; // Only move one block to fill the current empty spot
      }
   }
}

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split("\n");

const numTestCases = Number(inputLines.shift());

for (let testCaseIndex = 0; testCaseIndex < numTestCases; testCaseIndex++) {
   const gameBoard = [];
   for (let r = 0; r < 12; r++) {
      const rowChars = inputLines.shift().split("");
      gameBoard.push(rowChars);
   }

   let totalChainReactions = 0;

   // Main game loop for processing chain reactions until no more chains can be formed
   while (true) {
      const cellsToExplode = []; // This array will collect all cells that are part of qualifying chains (4 or more blocks)

      // Step 1: Iterate through the board to detect all chains of 4 or more blocks
      for (let r = 0; r < 12; r++) {
         for (let c = 0; c < 6; c++) {
            const cellContent = gameBoard[r][c];
            // Only process if it's a colored block and not already marked as visited for this detection pass
            if (cellContent !== "." && cellContent !== "O" && !cellContent.endsWith('0')) {
               const initialColor = cellContent;
               const currentChain = detectConnectedChain(r, c, initialColor, gameBoard);

               if (currentChain.length >= 4) {
                  // If the detected chain has 4 or more blocks, add all its cells to the explosion list
                  cellsToExplode.push(...currentChain);
               }
            }
         }
      }

      // Step 2: Revert temporary marks (e.g., "R0" back to "R") on the game board
      for (let r = 0; r < 12; r++) {
         for (let c = 0; c < 6; c++) {
            if (gameBoard[r][c].endsWith('0')) {
               gameBoard[r][c] = gameBoard[r][c].slice(0, 1);
            }
         }
      }

      // If no chains of 4+ were found in this pass, the reaction sequence ends
      if (cellsToExplode.length === 0) {
         break;
      }

      totalChainReactions++; // Increment the count of chain reactions

      // Step 3: Remove the exploded cells from the game board
      // Using a Set to store unique coordinates (as stringified arrays) ensures that
      // `removeChainElements` is called only once for each distinct cell, even if it was
      // added multiple times to `cellsToExplode` (e.g., due to overlapping chain detections).
      const uniqueExplosionCoords = new Set(cellsToExplode.map(coord => JSON.stringify(coord)));
      for (const coordStr of uniqueExplosionCoords) {
          const [r, c] = JSON.parse(coordStr);
          const cellColor = gameBoard[r][c]; // Get the color before it might be cleared by a previous call
          if (cellColor !== ".") { // Only attempt to clear if it's still a colored block
              removeChainElements(r, c, cellColor, gameBoard);
          }
      }

      // Step 4: Apply gravity to make blocks fall and fill empty spaces
      // Iterate through columns from left to right, and rows from bottom to top
      for (let c = 0; c < 6; c++) {
         for (let r = 11; r >= 0; r--) {
            if (gameBoard[r][c] === ".") { // If an empty spot is found
               applyGravityToColumn(r, c, gameBoard); // Call gravity function to fill it from above
            }
         }
      }
   }
   console.log(totalChainReactions);
}
