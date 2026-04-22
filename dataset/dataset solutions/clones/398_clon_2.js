function calculateMaxSequence(rowCoord, colCoord, gridDimension, matrixData) {
   // Define an array of row offsets for four directions (horizontal, diagonal-up, vertical, diagonal-down)
   var rowOffsets = [0, 1, 1, 1];
   // Define an array of column offsets corresponding to the row offsets
   var colOffsets = [1, -1, 0, 1];
   var overallMax = 0; // Initialize the maximum sequence length found from this starting point

   // Iterate through each of the four predefined directions
   for (var dirIndex = 0; dirIndex < 4; dirIndex++) {
      var currentCount = 0; // Reset the counter for the current direction
      // Iterate outwards from the starting coordinate in the current direction
      for (var stepNum = 0; stepNum <= gridDimension; stepNum++) {
         // Calculate the current row and column coordinates
         var currentY = rowCoord + (rowOffsets[dirIndex] * stepNum);
         var currentX = colCoord + (colOffsets[dirIndex] * stepNum);

         // Check if the calculated coordinates are outside the grid boundaries
         if (currentY < 0 || currentX < 0 || currentY >= gridDimension || currentX >= gridDimension) {
            break; // If out of bounds, stop extending in this direction
         }
         // Check if the value at the current coordinate is not the target value (1)
         if (matrixData[currentY][currentX] !== 1) {
            break; // If the value doesn't match, stop extending
         }
         currentCount++; // Increment the count if the cell matches the target value
      }
      // Update the overall maximum sequence length if the current direction's count is higher
      overallMax = Math.max(overallMax, currentCount);
      currentCount = 0; // Reset the counter for the next direction (redundant but matches original structure)
   }
   return overallMax; // Return the maximum sequence length found from the initial coordinates
}

// Read the entire standard input as a UTF-8 string
var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Trim leading/trailing whitespace and split the input into an array of lines
var lineSegments = (rawInputData.trim()).split("\n");

// Main loop to process multiple test cases from the input
while (true) {
   // Extract the grid dimension from the first line segment and convert it to a number
   var gridDimension = lineSegments.shift() - 0;

   // If the dimension is 0, it signifies the end of the input, so break the loop
   if (gridDimension === 0) break;

   // Initialize a 2D array (matrix) to hold the grid data for the current test case
   var matrixData = [];
   // Populate the matrix with data from the subsequent input lines
   for (var rowIndex = 0; rowIndex < gridDimension; rowIndex++) {
      // For each row, split the string into characters and convert each to a number
      matrixData[rowIndex] = (lineSegments.shift()).split("").map(Number);
   }

   var finalMaxResult = 0; // Initialize the overall maximum sequence length for the current grid

   // Iterate through each cell in the grid
   for (var rowIndex = 0; rowIndex < gridDimension; rowIndex++) {
      for (var colIndex = 0; colIndex < gridDimension; colIndex++) {
         // If the current cell contains the target value (1), calculate potential sequences
         if (matrixData[rowIndex][colIndex] === 1) {
            // Call the sequence calculation function and update the overall maximum result
            finalMaxResult = Math.max(finalMaxResult, calculateMaxSequence(rowIndex, colIndex, gridDimension, matrixData));
         }
      }
   }
   // Output the final maximum sequence length found for the current grid
   console.log(finalMaxResult);
}