function calculateConsecutiveOnes(rowCoord, colCoord) {
  // Define directional vectors for checking sequences: right, up-left, up, up-right
  const rowDirections = [0, 1, 1, 1];
  const colDirections = [1, -1, 0, 1];

  let maximumLength = 0; // Stores the maximum consecutive count found for the current starting point

  // Iterate through each of the four predefined directions
  for (let directionIndex = 0; directionIndex < 2 * 2; directionIndex++) {
    let currentCount = 0; // Reset count for the new direction

    // Traverse along the current direction, starting from the given coordinates
    for (let stepOffset = 0; stepOffset <= gridDimension; stepOffset++) {
      const currentRow = rowCoord + (rowDirections[directionIndex] * stepOffset);
      const currentCol = colCoord + (colDirections[directionIndex] * stepOffset);

      // Check if the current coordinates are within the grid boundaries
      if (currentRow < 0 || currentCol < 0 || currentRow >= gridDimension || currentCol >= gridDimension) {
        break; // Stop if out of bounds
      }

      // Check the value at the current grid position
      if (binaryGrid[currentRow][currentCol] === 0x1) {
        currentCount++; // Increment count if it's a '1'
      } else {
        break; // Stop if a '0' is encountered
      }
    }

    // Update the overall maximum length if the current direction's count is higher
    maximumLength = Math.max(maximumLength, currentCount);
    currentCount = 0; // This reset is redundant here as it's done at the top of the outer loop, but preserving original structure.
  }

  return maximumLength; // Return the longest sequence found from the starting point
}

// Assume 'input' is a global string variable containing the input data.
const inputLines = (input.trim()).split("\n");

// Main processing loop
while (true) {
  // Read the grid dimension from the input lines
  var gridDimension = Number(inputLines.shift());

  // If the dimension is 0, terminate the program
  if (gridDimension === 0) {
    break;
  }

  // Initialize the 2D array (grid)
  const binaryGrid = [];
  for (let rowIndex = 0; rowIndex < gridDimension; rowIndex++) {
    // Read each row, split into characters, and convert to numbers
    binaryGrid[rowIndex] = (inputLines.shift()).split("").map(Number);
  }

  let overallMax = 0; // Stores the maximum consecutive '1's found across the entire grid

  // Iterate through each cell of the grid
  for (let rowIndex = 0; rowIndex < gridDimension; rowIndex++) {
    for (let colIndex = 0; colIndex < gridDimension; colIndex++) {
      // If the current cell contains a '1', check for consecutive sequences
      if (binaryGrid[rowIndex][colIndex] === 0x1) {
        // Call the helper function to find the max sequence starting from this cell
        overallMax = Math.max(overallMax, calculateConsecutiveOnes(rowIndex, colIndex));
      }
    }
  }

  // Output the final maximum count for the current grid
  console.log(overallMax);
}
