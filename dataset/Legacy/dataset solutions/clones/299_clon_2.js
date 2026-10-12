function computeCellVal(rowIdx, colIdx) {
  // If the current cell contains an obstacle, mark it as 0 and return.
  if (gridData[rowIdx][colIdx] === "*") {
    gridData[rowIdx][colIdx] = 0;
    return;
  }

  // Define relative offsets for checking previous cells (top-left, top, left).
  const rowOffsets = [-1, -1, 0];
  const colOffsets = [-1, 0, -1];

  // Initialize minimum value with the grid dimension (a large enough value).
  let minimumNeighborVal = gridDimension;

  // Iterate through the three relevant neighboring cells.
  for (let idx = 0; idx < 3; idx++) {
    const prevRow = rowIdx + rowOffsets[idx];
    const prevCol = colIdx + colOffsets[idx];

    // Check if the neighbor is out of bounds.
    // If any neighbor is out of bounds, this cell is considered to have a value of 1.
    if (prevRow < 0 || prevRow >= gridDimension || prevCol < 0 || prevCol >= gridDimension) {
      gridData[rowIdx][colIdx] = 1;
      return;
    }

    // Update the minimum value found among valid neighbors.
    minimumNeighborVal = Math.min(minimumNeighborVal, gridData[prevRow][prevCol]);
  }

  // The current cell's value is one more than the minimum of its valid neighbors.
  gridData[rowIdx][colIdx] = minimumNeighborVal + 1;
}

// Read all input from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into an array of lines, removing any leading/trailing whitespace.
const lineSegments = rawData.trim().split("\n");

// Main processing loop.
while (true) {
  // Read the grid dimension from the first line of the current test case.
  // Convert it to a number.
  let gridDimension = lineSegments.shift() - 0;

  // If the dimension is 0, it signifies the end of input.
  if (gridDimension === 0) {
    break;
  }

  // Initialize the maximum value found in the current grid.
  let overallMaximum = 0;

  // Initialize the 2D array to store grid data.
  const gridData = [];

  // Populate the gridData array from input lines.
  for (let idx = 0; idx < gridDimension; idx++) {
    const currentLine = lineSegments.shift();
    gridData.push(currentLine.split(""));
  }

  // Iterate through each cell of the grid to compute its value.
  for (let rowIdx = 0; rowIdx < gridDimension; rowIdx++) {
    for (let colIdx = 0; colIdx < gridDimension; colIdx++) {
      // Calculate the value for the current cell.
      computeCellVal(rowIdx, colIdx);
      // Update the overall maximum value encountered so far.
      overallMaximum = Math.max(overallMaximum, gridData[rowIdx][colIdx]);
    }
  }

  // Output the maximum value for the current grid.
  console.log(overallMaximum);
}
