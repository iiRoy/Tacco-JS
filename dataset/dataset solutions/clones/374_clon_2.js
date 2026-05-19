function rotateMatrix(inputGrid) {
  let rotatedGrid = []; // Initialize a new array for the rotated output.

  // Create 8 empty arrays within the main array to represent rows.
  for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
    rotatedGrid[rowIdx] = [];
  }

  // Iterate through the grid to perform the 90-degree clockwise rotation.
  for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
    for (let colIdx = 0; colIdx < 8; colIdx++) {
      // The element at (rowIdx, colIdx) in the new grid comes from
      // (7 - colIdx, rowIdx) in the original grid.
      rotatedGrid[rowIdx][colIdx] = inputGrid[7 - colIdx][rowIdx];
    }
  }
  return rotatedGrid; // Return the transformed grid.
}

// Import the file system module to read input.
const fileSystem = require('fs');
let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Clean up the input: remove leading/trailing whitespace and split into lines.
let lineArray = rawData.trim().split("\n");

// Prepare the initial 8x8 grid from the input lines.
let currentGrid = [];
for (let idx = 0; idx < 8; idx++) {
  currentGrid.push(lineArray[idx].split("")); // Split each line string into an array of characters.
}

// Perform the first rotation and display the result.
currentGrid = rotateMatrix(currentGrid);
console.log(currentGrid.join("\n"));

// Perform the second rotation and display the result.
currentGrid = rotateMatrix(currentGrid);
console.log(currentGrid.join("\n"));

// Perform the third rotation and display the result.
currentGrid = rotateMatrix(currentGrid);
console.log(currentGrid.join("\n"));
