function traverseGrid(rowCoord, colCoord, directionIndex) {
   // Check if the current cell is not a path marker; if so, terminate this branch.
   if (gridMatrix[rowCoord][colCoord] !== "+") {
      return;
   }

   // Define changes for row and column coordinates based on direction.
   // Directions: 0=Up, 1=Right, 2=Down, 3=Left
   const deltaRows = [-1, 0, 1, 0];
   const deltaCols = [0, 1, 0, -1];

   // Calculate the coordinates of the next cell in the current direction.
   let nextRow = rowCoord + deltaRows[directionIndex];
   let nextCol = colCoord + deltaCols[directionIndex];

   // Verify if the next cell is within the grid boundaries.
   if (nextRow < 0 || nextCol < 0 || nextRow >= gridDimension || nextCol >= gridDimension) {
      // If out of bounds, change direction (rotate clockwise) and retry from the same cell.
      directionIndex = (directionIndex + 1) % 4;
      traverseGrid(rowCoord, colCoord, directionIndex);
   } else {
      // If the next cell is a wall marker ('#').
      if (gridMatrix[nextRow][nextCol] === "#") {
         // Mark the cell immediately before the wall as a path marker ('+').
         gridMatrix[nextRow - deltaRows[directionIndex]][nextCol - deltaCols[directionIndex]] = "+";

         // Based on the current direction, initiate a recursive call to simulate a turn.
         if (directionIndex === 3) { // Was moving Left, now turn Up
            traverseGrid(nextRow - 2 * deltaRows[directionIndex] - 1, nextCol - 2 * deltaCols[directionIndex], 0);
         } else if (directionIndex === 0) { // Was moving Up, now turn Right
            traverseGrid(nextRow - 2 * deltaRows[directionIndex], nextCol - 2 * deltaCols[directionIndex] + 1, 1);
         } else if (directionIndex === 1) { // Was moving Right, now turn Down
            traverseGrid(nextRow - 2 * deltaRows[directionIndex] + 1, nextCol - 2 * deltaCols[directionIndex], 2);
         } else if (directionIndex === 2) { // Was moving Down, now turn Left
            traverseGrid(nextRow - 2 * deltaCols[directionIndex], nextCol - 2 * deltaCols[directionIndex] - 1, 3);
         }
      } else {
         // If the next cell is not a wall, mark the current cell as a wall ('#').
         gridMatrix[rowCoord][colCoord] = "#";
         // Store the coordinates of this newly marked wall cell.
         finalPosition = [rowCoord, colCoord];
         // Continue the traversal from the next cell in the same direction.
         traverseGrid(nextRow, nextCol, directionIndex);
      }
   }
}

// Read all input data from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process the input: remove leading/trailing whitespace, split by newlines, convert to numbers.
let numericData = rawData.trim().split("\n").map(Number);

// Extract the total number of test cases from the beginning of the numeric data.
let testCaseCount = numericData.shift();

// Iterate through each test case.
while (testCaseCount--) {
   // Get the dimension (N) for the current square grid.
   let gridDimension = numericData.shift();

   // Handle edge cases for grid dimensions.
   if (gridDimension === 0) {
      console.log(""); // Output an empty line for a 0x0 grid.
      continue;
   }
   if (gridDimension === 1) {
      console.log("#"); // Output a single '#' for a 1x1 grid.
      continue;
   }

   // Initialize the grid matrix with all cells as path markers ('+').
   let gridMatrix = [];
   for (let rowIndex = 0; rowIndex < gridDimension; rowIndex++) {
      gridMatrix[rowIndex] = [];
      for (let colIndex = 0; colIndex < gridDimension; colIndex++) {
         gridMatrix[rowIndex][colIndex] = "+";
      }
   }

   // Variable to keep track of the last cell marked as a wall.
   let finalPosition = [];
   // Start the recursive grid traversal from the bottom-left corner (N-1, 0), moving Up (direction 0).
   traverseGrid(gridDimension - 1, 0, 0);

   // If the grid dimension is even, the last marked wall cell should actually be a path marker.
   if (gridDimension % 2 === 0) {
      gridMatrix[finalPosition[0]][finalPosition[1]] = "+";
   }

   // Format and print the final grid: join rows with newlines, remove commas, replace '+' with spaces.
   console.log(gridMatrix.join("\n").replace(/,/g, "").replace(/\+/g, " "));
}
