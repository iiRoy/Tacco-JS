function explorePath(rowIdx, colIdx, currentTotal) {
  // Store the current path sum in the memoization grid
  memoGrid[rowIdx][colIdx] = currentTotal;

  // Check if we've reached the last row of the grid
  if (rowIdx === valueGrid.length - 1) {
    // If so, update the overall maximum sum found so far
    overallMax = Math.max(overallMax, currentTotal);
  } else if ((valueGrid.length - 1) / 2 > rowIdx) {
    // If we are in the upper half of the grid (excluding the middle row if odd length)
    // Explore moving straight down
    if (memoGrid[rowIdx + 1][colIdx] < currentTotal + valueGrid[rowIdx + 1][colIdx]) {
      explorePath(rowIdx + 1, colIdx, currentTotal + valueGrid[rowIdx + 1][colIdx]);
    }
    // Explore moving diagonally down-right
    if (memoGrid[rowIdx + 1][colIdx + 1] < currentTotal + valueGrid[rowIdx + 1][colIdx + 1]) {
      explorePath(rowIdx + 1, colIdx + 1, currentTotal + valueGrid[rowIdx + 1][colIdx + 1]);
    }
  } else if ((valueGrid.length - 1) / 2 <= rowIdx) {
    // If we are in the lower half of the grid (including the middle row if odd length)
    // Explore moving diagonally down-left, if within bounds
    if (colIdx - 1 >= 0) {
      if (memoGrid[rowIdx + 1][colIdx - 1] < currentTotal + valueGrid[rowIdx + 1][colIdx - 1]) {
        explorePath(rowIdx + 1, colIdx - 1, currentTotal + valueGrid[rowIdx + 1][colIdx - 1]);
      }
    }
    // Explore moving straight down, if within bounds
    if (colIdx < valueGrid[rowIdx].length - 1) {
      if (memoGrid[rowIdx + 1][colIdx] < currentTotal + valueGrid[rowIdx + 1][colIdx]) {
        explorePath(rowIdx + 1, colIdx, currentTotal + valueGrid[rowIdx + 1][colIdx]);
      }
    }
  }
}

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input string into an array of lines
const lineArray = (rawData.trim()).split("\n");

// Initialize grids for values and memoization
let valueGrid = [];
let memoGrid = [];

// Populate the grids based on input
lineArray.forEach(function(lineStr) {
  // Convert each line string to an array of numbers
  const numArr = lineStr.split(",").map(Number);
  // Create a corresponding array of zeros for memoization
  const zeroArr = numArr.map(function(_) {
    return 0;
  });

  valueGrid.push(numArr);
  memoGrid.push(zeroArr);
});

// Initialize the maximum sum found
let overallMax = 0;

// Start the path exploration from the top-left element
explorePath(0, 0, valueGrid[0][0]);

// Output the final maximum sum
console.log(overallMax);
