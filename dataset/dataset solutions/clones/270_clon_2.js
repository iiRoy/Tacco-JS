/**
 * This function recursively populates a 2D grid with sequential numbers
 * following a specific pattern, often used in magic square algorithms.
 * It handles boundary conditions by wrapping around the grid.
 * @param {number} rowCoord The current row index.
 * @param {number} colCoord The current column index.
 */
function populateMatrix(rowCoord, colCoord) {
  // Base case: If the current value has reached the maximum allowed, stop recursion.
  if (currentValue === maxValue) {
    return;
  }

  // Adjust column coordinate if it goes out of bounds (wraps around horizontally).
  if (colCoord < 0) {
    colCoord = dimension - 1;
  }
  // Adjust row coordinate if it goes out of bounds (wraps around vertically).
  if (rowCoord < 0) {
    rowCoord = dimension - 1;
  }
  // Adjust column coordinate if it exceeds bounds (wraps around horizontally).
  if (colCoord >= dimension) {
    colCoord = 0;
  }
  // Adjust row coordinate if it exceeds bounds (wraps around vertically).
  if (rowCoord >= dimension) {
    rowCoord = 0;
  }

  // Check if the current cell in the grid is already filled (not -1).
  if (dataArray[rowCoord][colCoord] !== -1) {
    // If occupied, move diagonally down-left and try again.
    populateMatrix(rowCoord + 1, colCoord - 1);
  } else {
    // If the cell is empty, fill it with the formatted current value.
    dataArray[rowCoord][colCoord] = ("   " + currentValue).slice(-4);
    // Increment the sequence number for the next cell.
    currentValue++;
    // Move diagonally down-right and continue filling.
    populateMatrix(rowCoord + 1, colCoord + 1);
  }
}

// Import the 'fs' module to read from the file system (stdin).
var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace, split by newline, and convert to numbers.
var dimensionList = (fileContent.trim()).split("\n").map(Number);

// Declare global variables used by the recursive function.
var dimension;      // Represents the size of the square grid (n).
var maxValue;       // The maximum value to be placed in the grid (n*n + 1).
var dataArray;      // The 2D array (grid) to store the numbers.
var currentValue;   // The current number being placed in the grid (N).

// Iterate through each dimension size provided in the input.
for (var loopCounter = 0; loopCounter < dimensionList.length; loopCounter++) {
  // Set the current grid dimension.
  dimension = dimensionList[loopCounter];
  // Calculate the maximum value for the sequence.
  maxValue = dimension * dimension + 1;

  // If the dimension is 0, terminate the processing loop.
  if (dimension === 0) {
    break;
  }

  // Initialize the 2D array (grid) with -1s.
  dataArray = [];
  for (var rowIterator = 0; rowIterator < dimension; rowIterator++) {
    dataArray[rowIterator] = [];
    for (var colIterator = 0; colIterator < dimension; colIterator++) {
      dataArray[rowIterator][colIterator] = -1;
    }
  }

  // Initialize the starting sequence number.
  currentValue = 1;
  // Call the recursive function to fill the grid, starting from a calculated center-ish position.
  populateMatrix(Math.floor(dimension / 2) + 1, Math.floor(dimension / 2));

  // Output the filled grid: join rows with newlines and remove commas between elements.
  console.log(dataArray.join("\n").replace(/\,/g, ""));
}
