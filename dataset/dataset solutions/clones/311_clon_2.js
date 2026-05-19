const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from the standard input stream

let lineData = rawData.trim().split("\n"); // Process the raw input: remove leading/trailing whitespace and split into an array of lines

let gridSize = lineData.shift() - 0; // Extract the initial grid dimension from the first line and convert to a number

const matrixValues = []; // Initialize an array to hold the parsed matrix data
const initialRow = []; // Create a temporary array for padding the first row

// Populate the initialRow with zeros, one more than the original grid size
for (let r = 0; r < gridSize + 1; r++) {
  initialRow.push(0);
}

matrixValues.push(initialRow); // Add the zero-padded row as the first element of the matrix

// Parse the remaining lines into numerical rows for the matrix
for (let r = 0; r < gridSize; r++) {
  matrixValues.push(("0 " + lineData.shift()).split(" ").map(Number)); // Prepend "0 " to each line for padding, then split and convert to numbers
}

gridSize = gridSize + 1; // Increment the grid size to account for the added padding row/column

const prefixSumGrid = []; // Declare an array to store the 2D prefix sums

// Initialize the first column of the prefix sum grid
for (let r = 0; r < gridSize; r++) {
  prefixSumGrid[r] = [];
  prefixSumGrid[r][0] = matrixValues[r][0];
}

// Calculate row-wise prefix sums
for (let r = 0; r < gridSize; r++) {
  for (let c = 1; c < gridSize; c++) {
    prefixSumGrid[r][c] = prefixSumGrid[r][c - 1] + matrixValues[r][c];
  }
}

// Calculate column-wise prefix sums to complete the 2D prefix sum grid
for (let r = 1; r < gridSize; r++) {
  for (let c = 0; c < gridSize; c++) {
    prefixSumGrid[r][c] = prefixSumGrid[r - 1][c] + prefixSumGrid[r][c];
  }
}

let maximumSum = -Infinity; // Initialize the variable to track the largest sub-rectangle sum

// Iterate through all possible top-left corners (r, c) and bottom-right corners (er, ec)
// to find the sub-rectangle with the maximum sum
for (let r = 0; r < gridSize; r++) {
  for (let c = 0; c < gridSize; c++) {
    for (let er = r; er < gridSize; er++) { // 'er' stands for end row
      for (let ec = c; ec < gridSize; ec++) { // 'ec' stands for end column
        // Apply the 2D prefix sum formula to get the sum of the current sub-rectangle
        maximumSum = Math.max(maximumSum, prefixSumGrid[er][ec] - prefixSumGrid[r][ec] - prefixSumGrid[er][c] + prefixSumGrid[r][c]);
      }
    }
  }
}

console.log(maximumSum); // Print the computed maximum sub-rectangle sum to standard output
