function clearComponent(rowCoord, colCoord, componentValue) {
  // Define relative offsets for checking adjacent cells (up, down, left, right)
  const rowOffsets = [0, 0, -1, 1];
  const colOffsets = [-1, 1, 0, 0];

  // Iterate through the four possible directions
  for (let idx = 0; idx < 4; idx++) {
    const nextRow = rowCoord + rowOffsets[idx];
    const nextCol = colCoord + colOffsets[idx];

    // Check if the adjacent cell is within the grid boundaries
    if (nextRow < 0 || nextRow >= gridDims[0] || nextCol < 0 || nextCol >= gridDims[1]) {
      continue; // Skip if out of bounds
    }

    // If the adjacent cell's value matches the component value, clear it and recurse
    if (componentValue === gameGrid[nextRow][nextCol]) {
      gameGrid[nextRow][nextCol] = 0; // Mark as visited/cleared
      clearComponent(nextRow, nextCol, componentValue); // Recursively clear connected cells
    }
  }
}

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into an array of lines, trimming any leading/trailing whitespace
const inputLines = (rawData.trim()).split("\n");

// Main loop to process multiple test cases
while (true) {
  // Get grid dimensions from the first line of the current test case
  // Split by space and convert to numbers
  var gridDims = (inputLines.shift()).split(" ").map(Number);

  // Check for termination condition (0 0 indicates end of input)
  if (gridDims[0] === 0 && gridDims[1] === 0) {
    break;
  }

  // Initialize the game grid for the current test case
  var gameGrid = [];
  for (let gridRowIdx = 0; gridRowIdx < gridDims[0]; gridRowIdx++) {
    // Read each row of the grid as a string and split into individual characters
    const currentRowChars = (inputLines.shift()).split("");
    gameGrid.push(currentRowChars);
  }

  // Initialize a counter for distinct components (bombs)
  let componentCount = 0;

  // Iterate through each cell of the grid
  for (let rowIndex = 0; rowIndex < gridDims[0]; rowIndex++) {
    for (let colIndex = 0; colIndex < gridDims[1]; colIndex++) {
      const currentCellVal = gameGrid[rowIndex][colIndex];

      // If the cell contains a "bomb" character ('@', '#', or '*')
      if (currentCellVal === "@" || currentCellVal === "#" || currentCellVal === "*") {
        componentCount++; // Increment the component counter
        gameGrid[rowIndex][colIndex] = 0; // Mark the current cell as cleared
        clearComponent(rowIndex, colIndex, currentCellVal); // Clear the entire connected component
      }
    }
  }

  // Output the total count of distinct components for the current test case
  console.log(componentCount);
}
