/**
 * Rotates a given 8x8 character grid 90 degrees clockwise.
 *
 * @param {Array<Array<string>>} inputGrid The 2D array representing the grid to be rotated.
 * @returns {Array<Array<string>>} A new 2D array representing the grid after a 90-degree clockwise rotation.
 */
function rotateMatrix(inputGrid) {
  // Initialize a new 8x8 grid to store the rotated result.
  let rotatedGrid = [];
  for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
    rotatedGrid[rowIdx] = [];
  }

  // Perform the 90-degree clockwise rotation.
  // The element at (new_row, new_col) comes from (7 - new_col, new_row) in the original grid.
  for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
    for (let colIdx = 0; colIdx < 8; colIdx++) {
      rotatedGrid[rowIdx][colIdx] = inputGrid[7 - colIdx][rowIdx];
    }
  }
  return rotatedGrid;
}

// Import the file system module to read input.
const fileSystem = require('fs');

// Read the entire input from standard input as a UTF-8 string.
let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Trim whitespace from the input and split it into an array of lines.
let lineArray = rawData.trim().split("\n");

// Initialize a 2D array to hold the current grid state.
let currentGrid = [];

// Populate the initial 8x8 grid from the input lines.
for (let lineCounter = 0; lineCounter < 8; lineCounter++) {
  currentGrid.push(lineArray[lineCounter].split(""));
}

// First rotation: 90 degrees clockwise.
currentGrid = rotateMatrix(currentGrid);
// Print the "90" label followed by the rotated grid, removing commas from array joins.
console.log("90\n" + currentGrid.join("\n").replace(/\,/g, ""));

// Second rotation: another 90 degrees (total 180 from original).
currentGrid = rotateMatrix(currentGrid);
// Print the "180" label followed by the rotated grid.
console.log("180\n" + currentGrid.join("\n").replace(/\,/g, ""));

// Third rotation: another 90 degrees (total 270 from original).
currentGrid = rotateMatrix(currentGrid);
// Print the "270" label followed by the rotated grid.
console.log("270\n" + currentGrid.join("\n").replace(/\,/g, ""));
