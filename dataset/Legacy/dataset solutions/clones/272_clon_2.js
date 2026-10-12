function fillGrid(rowCoord, colCoord) {
  // Check if the maximum value has been placed, if so, terminate this branch
  if (currentNum === maxVal) {
    return;
  }

  // Adjust column coordinate for wrapping around the grid
  if (colCoord < 0) {
    colCoord = gridSize - 1;
  }
  // Adjust row coordinate for wrapping around the grid
  if (rowCoord < 0) {
    rowCoord = gridSize - 1;
  }
  // Adjust column coordinate if it exceeds grid bounds
  if (colCoord >= gridSize) {
    colCoord = 0;
  }
  // Adjust row coordinate if it exceeds grid bounds
  if (rowCoord >= gridSize) {
    rowCoord = 0;
  }

  // Check if the current cell is already filled
  if (gridMatrix[rowCoord][colCoord] !== -1) {
    // If filled, move diagonally up-left (relative to the previous move)
    fillGrid(rowCoord + 1, colCoord - 1);
  } else {
    // If empty, place the current number, increment, and move diagonally down-right
    gridMatrix[rowCoord][colCoord] = currentNum;
    currentNum++;
    fillGrid(rowCoord + 1, colCoord + 1);
  }
}

// Read input from standard input
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process input: trim whitespace, split by newline, and convert to numbers
var numSequence = rawData.trim().split("\n").map(Number);

// Iterate through each number in the sequence
for (var idx = 0; idx < numSequence.length; idx++) {
  // Get the current grid size
  var gridSize = numSequence[idx];
  // Calculate the maximum value to be placed in the grid (n*n + 1 for termination)
  var maxVal = gridSize * gridSize + 1;

  // If the grid size is 0, terminate the processing loop
  if (gridSize === 0) {
    break;
  }

  // Initialize the 2D array (grid matrix)
  var gridMatrix = [];
  for (var rowIdx = 0; rowIdx < gridSize; rowIdx++) {
    gridMatrix[rowIdx] = []; // Initialize each row as an empty array
    for (var colIdx = 0; colIdx < gridSize; colIdx++) {
      gridMatrix[rowIdx][colIdx] = -1; // Fill with -1 to indicate empty cells
    }
  }

  // Determine the starting column for the first number (center of the top row)
  var startCol = Math.floor(gridSize / 2);
  // Determine the starting row for the first number (one row below the center of the top row)
  var startRow = startCol + 1;

  // Place the first number (1) in its initial position
  gridMatrix[startRow][startCol] = 1;
  // Initialize the next number to be placed
  var currentNum = 2;

  // Start the recursive filling process from the next position
  fillGrid(startRow + 1, startCol + 1);

  // Output the filled grid, joining rows with newlines and replacing commas with spaces
  console.log(gridMatrix.join("\n").replace(/\,/g, " "));
}
