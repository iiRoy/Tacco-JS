var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from standard input
var lineBuffer = rawData.trim().split("\n"); // Split input into lines and remove leading/trailing whitespace

// Main processing loop for multiple test cases
while (true) {
   // Extract width and height for the current grid
   var dimensions = lineBuffer.shift().split(" ").map(Number);
   var widthVal = dimensions[0];
   var heightVal = dimensions[1];

   // If both dimensions are zero, terminate the program
   if (widthVal === 0 && heightVal === 0) {
      break;
   }

   // Initialize a 2D array to store grid cell states
   var gridData = [];
   for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
      gridData.push(lineBuffer.shift().split(" ").map(Number));
   }

   // Initialize a 2D array for dynamic programming, filled with zeros
   var pathCounts = [];
   for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
      pathCounts[rowIdx] = [];
      for (var colIdx = 0; colIdx < widthVal; colIdx++) {
         pathCounts[rowIdx][colIdx] = 0;
      }
   }

   // Populate the dynamic programming table
   for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
      for (var colIdx = 0; colIdx < widthVal; colIdx++) {
         // Base case: First row, if cell is traversable (0), set path count to 1
         if (rowIdx === 0 && gridData[rowIdx][colIdx] === 0) {
            pathCounts[rowIdx][colIdx] = 1;
         }
         // For subsequent rows
         else if (rowIdx >= 1) {
            // Calculate contributions from previous cells based on rules
            // Contribution from top-left (diagonal)
            var valA = (colIdx === 0 || gridData[rowIdx - 1][colIdx - 1] === 2) ? 0 : pathCounts[rowIdx - 1][colIdx - 1];
            // Contribution from directly above
            var valB = (gridData[rowIdx - 1][colIdx] === 2) ? 0 : pathCounts[rowIdx - 1][colIdx];
            // Contribution from top-right (diagonal)
            var valC = (colIdx === widthVal - 1 || gridData[rowIdx - 1][colIdx + 1] === 2) ? 0 : pathCounts[rowIdx - 1][colIdx + 1];
            // Contribution from two rows above (special case)
            var valD = (rowIdx >= 2 && gridData[rowIdx - 2][colIdx] === 2) ? pathCounts[rowIdx - 2][colIdx] : 0;

            // Update current cell's path count based on its type
            if (gridData[rowIdx][colIdx] === 0) { // Normal traversable cell
               pathCounts[rowIdx][colIdx] += valA + valB + valC + valD;
            } else if (gridData[rowIdx][colIdx] === 1) { // Blocked cell
               pathCounts[rowIdx][colIdx] = 0;
            } else if (gridData[rowIdx][colIdx] === 2) { // Special cell type
               pathCounts[rowIdx][colIdx] += valB + valD;
            }
         }
      }
   }

   // Calculate the total number of paths ending in the last two rows
   var totalPaths = 0;
   for (var rowIdx = heightVal - 2; rowIdx < heightVal; rowIdx++) {
      for (var colIdx = 0; colIdx < widthVal; colIdx++) {
         // If it's the second to last row and the cell is type 2
         if (heightVal >= 2 && rowIdx === heightVal - 2 && gridData[rowIdx][colIdx] === 2) {
            totalPaths += pathCounts[rowIdx][colIdx];
         }
         // If it's the last row and the cell is type 0 or 2
         if (heightVal >= 1 && rowIdx === heightVal - 1 && (gridData[rowIdx][colIdx] === 0 || gridData[rowIdx][colIdx] === 2)) {
            totalPaths += pathCounts[rowIdx][colIdx];
         }
      }
   }
   // Output the calculated total paths for the current test case
   console.log(totalPaths);
}
