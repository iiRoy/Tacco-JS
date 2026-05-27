function computeSquareSize(rowIdx, colIdx) {
  // If the current cell contains an obstacle ('*'), its square size is 0.
  if (gridData[rowIdx][colIdx] === "*") {
    gridData[rowIdx][colIdx] = 0;
    return;
  }

  // Define offsets for checking the top-left, top, and left neighbors.
  // These are the three cells that determine the size of the square ending at (rowIdx, colIdx).
  const rowOffsets = [-1, -1, 0]; // Relative row positions: top-left, top, left
  const colOffsets = [-1, 0, -1]; // Relative column positions: top-left, top, left

  // Initialize minimum neighbor square size with a value larger than any possible square size.
  // The gridDimension itself is a safe upper bound.
  let minNeighborSize = gridDimension;

  // Iterate through the three relevant neighbors.
  for (let iter = 0; iter < 3; ++iter) {
    const prevRow = rowIdx + rowOffsets[iter]; // Calculate neighbor's row index
    const prevCol = colIdx + colOffsets[iter]; // Calculate neighbor's column index

    // Check if the neighbor is out of bounds.
    // If any required neighbor is out of bounds, it means a square of size 1 is the maximum possible
    // at the current cell, as it cannot extend further in that direction.
    if (prevRow < 0 || prevRow >= gridDimension || prevCol < 0 || prevCol >= gridDimension) {
      gridData[rowIdx][colIdx] = 1; // Set current cell's square size to 1
      return; // No need to check other neighbors, size is determined
    }

    // Update the minimum neighbor square size.
    // The size of the square ending at (rowIdx, colIdx) is limited by the smallest square
    // among its top-left, top, and left neighbors.
    minNeighborSize = Math.min(minNeighborSize, gridData[prevRow][prevCol]);
  }

  // The size of the square ending at (rowIdx, colIdx) is one more than the minimum of its neighbors.
  // This is the core dynamic programming step.
  gridData[rowIdx][colIdx] = minNeighborSize + 1;
}

// Read all input from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Trim whitespace and split the input into an array of lines.
let lineBuffer = rawData.trim().split("\n");

// Loop indefinitely to process multiple test cases until a specific termination condition is met.
while (true) {
  // Extract the grid dimension from the first line of the current test case.
  // The `- 0` converts the string to a number.
  let gridDimension = lineBuffer.shift() - 0;

  // If the grid dimension is 0, it signifies the end of input.
  if (gridDimension === 0) break;

  // Initialize the maximum square size found for the current grid to 0.
  let maxSquareFound = 0;
  // Initialize an empty array to store the grid data.
  let gridData = [];

  // Populate the grid with input characters.
  for (let iter = 0; iter < gridDimension; ++iter) {
    const rowString = lineBuffer.shift(); // Get the string for the current row.
    gridData.push(rowString.split("")); // Split the row string into an array of characters and add to grid.
  }

  // Iterate through each cell of the grid to compute the maximum square size.
  // This uses a dynamic programming approach, filling the grid with square sizes.
  for (let rowIdx = 0; rowIdx < gridDimension; ++rowIdx) {
    for (let colIdx = 0; colIdx < gridDimension; ++colIdx) {
      // Calculate the square size for the current cell (rowIdx, colIdx).
      computeSquareSize(rowIdx, colIdx);
      // Update the overall maximum square size found so far.
      maxSquareFound = Math.max(maxSquareFound, gridData[rowIdx][colIdx]);
    }
  }

  // Output the maximum square size found for the current test case.
  console.log(maxSquareFound);
}
