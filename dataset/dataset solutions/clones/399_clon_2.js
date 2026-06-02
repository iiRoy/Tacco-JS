function measureLine(rowCoord, colCoord) {
  // Define directional offsets for rows
  const rowOffsets = [0, 1, 1, 1];
  // Define directional offsets for columns
  const colOffsets = [1, -1, 0, 1];

  let longestSegment = 1; // Initialize with a minimum length of 1 (the starting cell itself)

  // Iterate through the four possible directions
  for (let dirIdx = 0; dirIdx < 4; dirIdx++) {
    let currentLength = 1; // Reset current segment length for each direction

    // Extend the line in the current direction
    for (let stepNum = 1; stepNum <= gridSize; stepNum++) {
      const nextRow = rowCoord + (rowOffsets[dirIdx] * stepNum);
      const nextCol = colCoord + (colOffsets[dirIdx] * stepNum);

      // Check for boundary conditions
      if (nextRow < 0 || nextCol < 0 || nextRow >= gridSize || nextCol >= gridSize) {
        break; // Stop if out of bounds
      }

      // Check if the cell value is not 1
      if (binaryGrid[nextRow][nextCol] !== 1) {
        break; // Stop if the segment is broken
      }

      currentLength++; // Increment length if the cell is part of the segment
    }

    // Update the maximum segment length found so far
    longestSegment = Math.max(longestSegment, currentLength);
    currentLength = 1; // This line is redundant as currentLength is reset at the start of the outer loop, but preserving original structure.
  }

  return longestSegment; // Return the maximum length found from the starting point
}

// Read all input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process input: trim whitespace and split into an array of lines
const inputLines = (rawData.trim()).split("\n");

// Loop indefinitely until a termination condition is met
while (true) {
  // Read the grid size for the current test case and convert to a number
  var gridSize = inputLines.shift() - 0;

  // If the grid size is 0, terminate the program
  if (gridSize === 0) {
    break;
  }

  // Initialize a 2D array (matrix) to store the binary grid
  var binaryGrid = [];
  // Populate the grid based on the input lines
  for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
    binaryGrid[rowIndex] = (inputLines.shift()).split("").map(Number);
  }

  let overallMaxLine = 0; // Initialize the maximum line length for the current grid

  // Iterate through each cell of the grid
  for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
    for (let colIndex = 0; colIndex < gridSize; colIndex++) {
      // If the current cell contains a '1', check for lines starting from it
      if (binaryGrid[rowIndex][colIndex] === 1) {
        // Update the overall maximum line length
        overallMaxLine = Math.max(overallMaxLine, measureLine(rowIndex, colIndex));
      }
    }
  }

  // Print the maximum line length found for the current test case
  console.log(overallMaxLine);
}
