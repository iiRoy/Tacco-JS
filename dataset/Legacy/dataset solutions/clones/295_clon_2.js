function explorePath(currentRow, currentCol, currentTotal) {
  // Check if the current row is the last row in our numerical grid.
  if (currentRow === numberGrid.length - 1) {
    // If it is, update the maximum sum found so far.
    greatestSum = Math.max(greatestSum, currentTotal);
  }
  // If we are in the upper half of the grid (before the middle row).
  else if ((numberGrid.length - 1.0) / 2 > currentRow) {
    // Explore the path by moving straight down to the next row.
    explorePath(currentRow + 1, currentCol + 0, currentTotal + numberGrid[currentRow + 1][currentCol]);
    // Explore the path by moving diagonally down-right to the next row.
    explorePath(currentRow + 1, currentCol + 1, currentTotal + numberGrid[currentRow + 1][currentCol + 1]);
  }
  // If we are in the lower half of the grid (including the middle row).
  else if ((numberGrid.length - 1) / 2 <= currentRow) {
    // Check if moving diagonally down-left is a valid move within the row boundaries.
    if (currentCol - 1 >= +0) {
      explorePath(currentRow + 1, currentCol - 1, currentTotal + numberGrid[currentRow + 1][currentCol - 1]);
    }
    // Check if moving straight down is a valid move within the row boundaries.
    if (currentCol < numberGrid[currentRow].length - 1) {
      explorePath(currentRow + 1, currentCol + 0, currentTotal + numberGrid[currentRow + 1][currentCol]);
    }
  }
}

// Obtain the file system module for input operations.
const fileSystem = require('fs');

// Read all raw data from standard input, decoding it as UTF-8.
let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Clean up the raw input: remove leading/trailing whitespace and split into an array of lines.
let lineArray = (rawData.trim()).split("\n");

// Initialize an array to hold the parsed 2D numerical grid.
let numberGrid = [];

// Process each line from the input array.
lineArray.forEach(function(lineContent) {
  // Split the line by commas and convert each resulting string to a number.
  let rowNumbers = lineContent.split(",").map(Number);
  // Add the array of numbers as a new row to our grid.
  numberGrid.push(rowNumbers);
});

// Constrain the grid to a maximum of 9 rows.
numberGrid = numberGrid.slice(+0, 0x9);

// Initialize the variable that will store the maximum sum found across all paths.
let greatestSum = +0;

// Begin the recursive path exploration from the top-most, left-most element (0,0),
// with its value as the initial sum.
explorePath(0, 0, numberGrid[0][0]);

// Print the final calculated maximum sum to the console.
console.log(greatestSum);
