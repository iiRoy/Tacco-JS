function calculateLongestSequence(rowCoord, colCoord) {
  // Define directional offsets for checking sequences
  const rowDirections = [0, 1, 1, 1]; // Changes in row for right, up-right, up, up-left
  const colDirections = [1, -1, 0, 1]; // Changes in column for right, up-right, up, up-left

  let maximumLength = 1; // Initialize the maximum sequence length found from this point

  // Iterate through each of the four predefined directions
  for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
    let currentCount = 0; // Reset count for the current direction

    // Traverse along the current direction
    for (let stepOffset = 0; stepOffset <= gridDimension; stepOffset++) {
      // Calculate the coordinates for the current step
      const currentRow = rowCoord + (rowDirections[directionIndex] * stepOffset);
      const currentCol = colCoord + (colDirections[directionIndex] * stepOffset);

      // Check for boundary conditions
      if (currentRow < 0 || currentCol < 0 || currentRow >= gridDimension || currentCol >= gridDimension) {
        break; // Stop if out of bounds
      }

      // Check if the cell value is not 1
      if (gridData[currentRow][currentCol] !== 1) {
        break; // Stop if the sequence is broken
      }

      currentCount++; // Increment count if the cell is part of the sequence
    }

    // Update the overall maximum length found so far
    maximumLength = Math.max(maximumLength, currentCount);
    currentCount = 0; // This reset is redundant as currentCount is re-initialized in the next loop iteration, but kept for structural equivalence.
  }

  return maximumLength; // Return the longest sequence found starting from (rowCoord, colCoord)
}

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process input: trim whitespace and split into lines
const inputLines = (rawData.trim()).split("\n");

let gridDimension; // Declare grid dimension globally for access in calculateLongestSequence
let gridData;      // Declare grid data globally for access in calculateLongestSequence

// Main loop to process multiple test cases
while (true) {
  // Get the grid dimension for the current test case
  gridDimension = inputLines.shift() - 0; // Convert string to number

  // If dimension is 0, terminate the program
  if (gridDimension === 0) {
    break;
  }

  gridData = []; // Initialize the 2D array for the current grid

  // Populate the grid with data from input lines
  for (let rowIndex = 0; rowIndex < gridDimension; rowIndex++) {
    gridData[rowIndex] = (inputLines.shift()).split("").map(Number); // Split string into characters and convert to numbers
  }

  let overallMaxSequence = 0; // Initialize the maximum sequence length for the current grid

  // Iterate through each cell of the grid
  for (let rowIndex = 0; rowIndex < gridDimension; rowIndex++) {
    for (let colIndex = 0; colIndex < gridDimension; colIndex++) {
      // If a cell contains '1', check for sequences starting from it
      if (gridData[rowIndex][colIndex] === 1) {
        // Update the overall maximum sequence length
        overallMaxSequence = Math.max(overallMaxSequence, calculateLongestSequence(rowIndex, colIndex));
      }
    }
  }

  // Output the maximum sequence length for the current test case
  console.log(overallMaxSequence);
}
