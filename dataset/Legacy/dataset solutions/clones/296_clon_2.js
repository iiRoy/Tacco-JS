function traverseGrid(currentRow, currentCol, currentTotal) {
  // This function recursively explores paths in a grid-like structure
  // to find the maximum possible sum along a valid path.

  // Base case: If we have reached the last row of the grid.
  if (currentRow === gridData.length - 1) {
    // Update the global maximum path sum if the current path's total is greater.
    maximumPathSum = Math.max(maximumPathSum, currentTotal);
  }
  // Recursive step 1: If we are in the upper half of the grid (before or at the middle row).
  // The condition checks if the current row index is less than half of the total rows.
  else if ((gridData.length - 1) / 2 > currentRow) {
    // From the current position, we can move to the next row at the same column.
    traverseGrid(currentRow + 1, currentCol + 0, currentTotal + gridData[currentRow + 1][currentCol]);
    // Or, we can move to the next row at the next column (one to the right).
    traverseGrid(currentRow + 1, currentCol + 1, currentTotal + gridData[currentRow + 1][currentCol + 1]);
  }
  // Recursive step 2: If we are in the lower half of the grid (after the middle row).
  // The condition checks if the current row index is greater than or equal to half of the total rows.
  else if ((gridData.length - 1) / 2 <= currentRow) {
    // From the current position, we can move to the next row at the previous column (one to the left),
    // but only if it's a valid column index (not less than 0).
    if (currentCol - 1 >= 0) {
      traverseGrid(currentRow + 1, currentCol - 1, currentTotal + gridData[currentRow + 1][currentCol - 1]);
    }
    // We can also move to the next row at the same column,
    // but only if it's a valid column index (within the bounds of the current row's length).
    if (currentCol < gridData[currentRow].length - 1) {
      traverseGrid(currentRow + 1, currentCol + 0, currentTotal + gridData[currentRow + 1][currentCol]);
    }
  }
}

// Read the entire input from standard input, assuming it's UTF-8 encoded.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace from the input and split it into an array of lines.
const lineArray = rawData.trim().split("\n");

// Initialize an empty array to store the parsed numerical grid data.
let gridData = [];

// Iterate over each line obtained from the input.
lineArray.forEach(function(lineContent) {
  // For each line, split it by commas, and then convert each resulting string part to a number.
  const parsedRow = lineContent.split(",").map(Number);
  // Add the array of numbers (representing a row) to our grid data.
  gridData.push(parsedRow);
});

// Initialize a variable to keep track of the maximum path sum found during traversal.
let maximumPathSum = 0;

// Start the recursive traversal from the very first element of the grid (row 0, column 0).
// The initial sum is the value of this starting element.
traverseGrid(0, 0, gridData[0][0]);

// Print the final maximum path sum to the console.
console.log(maximumPathSum);
