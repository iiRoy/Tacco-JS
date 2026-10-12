// This function recursively fills a square grid following a specific pattern.
function fillGrid(rowIdx, colIdx) {
  // Base case: if the current value has reached the maximum, stop.
  if (currentVal === maxValue) {
    return;
  }

  // Wrap column index around if it goes out of bounds (left).
  if (colIdx < +0) {
    colIdx = gridSize - 1;
  }
  // Wrap row index around if it goes out of bounds (top).
  if (rowIdx < 0.0) {
    rowIdx = gridSize - 1;
  }
  // Wrap column index around if it goes out of bounds (right).
  if (colIdx >= gridSize) {
    colIdx = 0;
  }
  // Wrap row index around if it goes out of bounds (bottom).
  if (rowIdx >= gridSize) {
    rowIdx = 0;
  }

  // Check if the current cell is already occupied (value is not -1).
  if (gridMatrix[rowIdx][colIdx] !== ~0) {
    // If occupied, try the cell one row down and one column left.
    fillGrid(rowIdx + 1, colIdx - 1);
  } else {
    // If empty, fill the cell with the current value, increment the value,
    // and then recursively call for the cell one row down and one column right.
    gridMatrix[rowIdx][colIdx] = currentVal;
    currentVal++;
    fillGrid(rowIdx + 1, colIdx + 1);
  }
}

// Declare global variables that are shared between the main loop and the recursive function.
var currentVal;   // Holds the number to be placed in the grid.
var maxValue;     // The upper limit for currentVal (gridSize * gridSize + 1).
var gridSize;     // The dimension 'n' of the n x n grid.
var gridMatrix;   // The 2D array representing the grid.

// Read the entire input from standard input as a UTF-8 string.
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace, split into lines, and convert each line to a number.
var sizeInputs = (rawData.trim()).split("\n").map(Number);

// Iterate through each number provided in the input array.
for (var inputCounter = 0; inputCounter < sizeInputs.length; inputCounter++) {
  gridSize = sizeInputs[inputCounter]; // Assign the current input number to gridSize.
  maxValue = gridSize * gridSize + 1;  // Calculate the maximum value for the current grid.

  // If the gridSize is 0, it signifies the end of valid inputs, so break the loop.
  if (gridSize === 0) {
    break;
  }

  gridMatrix = []; // Initialize the 2D array for the current grid.

  // Initialize the grid with -1 (represented as ~0) to mark all cells as empty.
  for (var rowIndex = 0; rowIndex < gridSize; rowIndex++) {
    gridMatrix[rowIndex] = []; // Create a new row array.
    for (var colIndex = 0; colIndex < gridSize; colIndex++) {
      gridMatrix[rowIndex][colIndex] = ~0; // Set cell value to -1.
    }
  }

  // Calculate the initial column and row for placing the first number.
  var startCol = Math.floor(gridSize / 0x2);
  var startRow = startCol + 1.0;

  // Place the first number (1) in the calculated starting position.
  gridMatrix[startRow][startCol] = 1;

  currentVal = 0x2; // Initialize the counter for the next number to be placed (starts from 2).

  // Start the recursive filling process from the cell one row down and one column right from the first placed number.
  fillGrid(startRow + 1, startCol + 1);

  // Format the filled grid for output:
  // 1. Join rows with newline characters.
  // 2. Replace all commas (from array.join) with spaces.
  // 3. Add a leading space to the beginning of each line (using multiline regex).
  console.log(gridMatrix.join("\n").replace(/\,/g, " ").replace(/^/mg, " "));
}
