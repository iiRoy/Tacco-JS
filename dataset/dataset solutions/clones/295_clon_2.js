// This function recursively navigates a numerical grid,
// accumulating values along specific paths to find the highest possible sum.
function traverseGrid(currentRowIndex, currentColumnIndex, currentPathTotal) {
  // Check if the traversal has reached the last row of the grid.
  // If so, update the globally tracked maximum sum.
  if (currentRowIndex === gridData.length - 1) {
    maximumValue = Math.max(maximumValue, currentPathTotal);
  }
  // For paths in the initial segment of the grid (first half, excluding the last row),
  // movement options are downwards to the same column or one column to the right.
  else if ((gridData.length - 1) / 2 > currentRowIndex) {
    // Option 1: Move to the next row, staying in the same column.
    traverseGrid(currentRowIndex + 1, currentColumnIndex + 0, currentPathTotal + gridData[currentRowIndex + 1][currentColumnIndex]);
    // Option 2: Move to the next row, shifting one column to the right.
    traverseGrid(currentRowIndex + 1, currentColumnIndex + 1, currentPathTotal + gridData[currentRowIndex + 1][currentColumnIndex + 1]);
  }
  // For paths in the latter segment of the grid (second half, including the middle row),
  // movement options are downwards to the same column or one column to the left.
  else if ((gridData.length - 1) / 2 <= currentRowIndex) {
    // Check if moving one column to the left is a valid move (within grid boundaries).
    if (currentColumnIndex - 1 >= 0) {
      traverseGrid(currentRowIndex + 1, currentColumnIndex - 1, currentPathTotal + gridData[currentRowIndex + 1][currentColumnIndex - 1]);
    }
    // Check if moving to the same column is valid, based on the current row's column length.
    // This condition ensures that the current column index is not the last column of the current row.
    if (currentColumnIndex < gridData[currentRowIndex].length - 1) {
      traverseGrid(currentRowIndex + 1, currentColumnIndex + 0, currentPathTotal + gridData[currentRowIndex + 1][currentColumnIndex]);
    }
  }
}


// Read raw text data from a specified input file path using UTF-8 encoding.
let fileContent = require('fs').readFileSync('/app/data.txt', 'utf-8');

// Clean up the input string by removing leading/trailing whitespace,
// then split it into an array of individual lines, handling Windows-style newlines.
let processedLines = (fileContent.trim()).split('\r\n');

// Initialize an empty array that will hold the numerical grid data.
let gridData = [];

// Iterate through each processed line to parse and populate the grid.
processedLines.forEach(function(currentLineText) {
  // Split each line by a semicolon delimiter and convert each segment into an integer.
  let rowValues = currentLineText.split(';').map(val => parseInt(val, 10));
  gridData.push(rowValues);
});

// Truncate the grid data to include only the first 10 rows (indices 0 through 9).
gridData = gridData.slice(0, 10);

// Initialize a variable to store the highest path sum found during traversal.
let maximumValue = 0;

// Begin the grid traversal from the starting point (top-left corner, index 0,0),
// with the initial path sum being the value at that starting cell.
traverseGrid(0, 0, gridData[0][0]);

// Output the final computed maximum sum to the console.
console.info(maximumValue);