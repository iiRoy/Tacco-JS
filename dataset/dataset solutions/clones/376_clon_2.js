function rotateMatrix(inputGrid) {
  // Initialize a new array to store the rotated grid.
  let rotatedGrid = [];
  for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
    rotatedGrid[rowIdx] = [];
  }

  // Iterate through the input grid to perform a 90-degree clockwise rotation.
  // The element at (rowIdx, colIdx) in the new grid comes from (7 - colIdx, rowIdx) in the original.
  for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
    for (let colIdx = 0; colIdx < 8; colIdx++) {
      rotatedGrid[rowIdx][colIdx] = inputGrid[7 - colIdx][rowIdx];
    }
  }
  return rotatedGrid;
}

// Read the entire content from standard input.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the content into an array of lines, after trimming any leading/trailing whitespace.
const lineArray = fileContent.trim().split('\n');

// Initialize a 2D array to hold the current state of the grid.
let currentGrid = [];
// Populate the grid from the input lines.
for (let idx = 0; idx < 8; idx++) {
  currentGrid.push(lineArray[idx].split(''));
}

// Perform the first 90-degree rotation and print the result.
currentGrid = rotateMatrix(currentGrid);
console.log('90\n' + currentGrid.join('\n'));

// Perform the second 90-degree rotation (total 180 degrees) and print the result.
currentGrid = rotateMatrix(currentGrid);
console.log('180\n' + currentGrid.join('\n'));

// Perform the third 90-degree rotation (total 270 degrees) and print the result.
currentGrid = rotateMatrix(currentGrid);
console.log('270\n' + currentGrid.join('\n'));
