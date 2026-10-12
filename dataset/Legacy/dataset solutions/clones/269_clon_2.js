// This script processes a list of numerical dimensions to generate a specific pattern
// within square grids, often referred to as a "magic square" or "Siamese method" variant.
// It reads input from standard input, where each line represents a grid dimension.

/**
 * Recursively fills cells in a grid following a specific pattern.
 * The pattern involves moving diagonally and wrapping around the grid edges.
 *
 * @param {number} rowCoord The current row coordinate.
 * @param {number} colCoord The current column coordinate.
 */
function fillGrid(rowCoord, colCoord) {
  // Termination condition: if the current value to be placed exceeds the maximum allowed,
  // the filling process for this grid is complete.
  if (currentValue === maxValue) {
    return;
  }

  // Adjust column coordinate if it goes out of bounds (wraps around horizontally).
  if (colCoord < 0) {
    colCoord = gridDimension - 1;
  }
  if (colCoord >= gridDimension) {
    colCoord = 0;
  }

  // Adjust row coordinate if it goes out of bounds (wraps around vertically).
  if (rowCoord < 0) {
    rowCoord = gridDimension - 1;
  }
  if (rowCoord >= gridDimension) {
    rowCoord = 0;
  }

  // Check if the target cell is already occupied (not equal to the sentinel value -1).
  if (gridMatrix[rowCoord][colCoord] !== -1) {
    // If the cell is occupied, move one step down and one step left from the *previous* position
    // (which is effectively rowCoord+1, colCoord-1 relative to the current call's parameters)
    // and attempt to fill that cell instead.
    fillGrid(rowCoord + 1, colCoord - 1);
  } else {
    // If the cell is empty, place the current number into it.
    // The number is formatted to always take 4 characters, padded with spaces if necessary.
    gridMatrix[rowCoord][colCoord] = ("   " + currentValue).slice(-4);
    // Increment the number for the next placement.
    currentValue++;
    // Recursively call the function to fill the next cell, moving one step down and one step right.
    fillGrid(rowCoord + 1, colCoord + 1);
  }
}

// Utilize Node.js 'fs' module to synchronously read all input from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input:
// 1. Remove leading/trailing whitespace.
// 2. Split the string into an array of strings by newline characters.
// 3. Convert each string element in the array to a number.
const dimensionList = rawData.trim().split("\n").map(Number);

// Declare variables that will hold the state for each grid generation.
// These are declared outside the loop to be accessible by the `fillGrid` function
// and to be re-assigned for each new grid dimension.
let gridDimension;
let maxValue;
let gridMatrix;
let currentValue;

// Iterate through each dimension provided in the input list.
for (let idx = 0; idx < dimensionList.length; idx++) {
  gridDimension = dimensionList[idx]; // Assign the current dimension for the grid.
  maxValue = gridDimension * gridDimension + 1; // Calculate the total number of cells + 1 for termination.

  // If a dimension of 0 is encountered, it signifies the end of input processing.
  if (gridDimension === 0) {
    break;
  }

  // Initialize the 2D array (matrix) that will represent the grid.
  gridMatrix = [];
  for (let rowIndex = 0; rowIndex < gridDimension; rowIndex++) {
    gridMatrix[rowIndex] = []; // Create an empty row array.
    for (let colIndex = 0; colIndex < gridDimension; colIndex++) {
      gridMatrix[rowIndex][colIndex] = -1; // Initialize each cell with a sentinel value (-1).
    }
  }

  // Determine the initial column and row coordinates for placing the first number.
  // The starting column is the middle column.
  const initialCol = Math.floor(gridDimension / 2);
  // The starting row is one below the middle column's index.
  const initialRow = initialCol + 1;

  // Place the first number (1) into its initial position in the grid.
  // It's formatted similarly to how subsequent numbers will be.
  gridMatrix[initialRow][initialCol] = "   " + 1;

  // Initialize the counter for the numbers to be placed, starting from 2.
  currentValue = 2;

  // Begin the recursive filling process from the position diagonally down-right from the first number.
  fillGrid(initialRow + 1, initialCol + 1);

  // After the grid is filled, format it for output:
  // 1. Join all rows with newline characters.
  // 2. Replace any commas (which `join()` might introduce when joining inner arrays) with empty strings.
  // 3. Print the formatted grid to the console.
  console.log(gridMatrix.join("\n").replace(/\,/g, ""));
}
