/*
 * This script processes an 8x8 grid of characters read from standard input.
 * It performs a 90-degree clockwise rotation three times,
 * printing the grid after each rotation (90, 180, 270 degrees).
 */


// Function to perform a 90-degree clockwise rotation on a square 2D array.
// The array is assumed to be 8x8.
function spinArray(initialLayout) {
  // Define the grid size as a constant for clarity and consistency.
  const GRID_DIMENSION = 8;

  // Create a new 2D array to store the rotated result.
  // It will have the same dimensions as the input.
  let resultantLayout = [];

  // Initialize each row of the resultant array to be an empty array.
  for (let currRow = 0; currRow < GRID_DIMENSION; currRow++) {
    resultantLayout[currRow] = [];
  }

  // Iterate through the input grid to populate the rotated grid.
  // The rotation logic for a 90-degree clockwise turn is:
  // new_grid[y][x] = old_grid[DIMENSION - 1 - x][y]
  for (let currRow = 0; currRow < GRID_DIMENSION; currRow++) {
    for (let currCol = 0; currCol < GRID_DIMENSION; currCol++) {
      resultantLayout[currRow][currCol] = initialLayout[GRID_DIMENSION - 1 - currCol][currRow];
    }
  }

  // Return the newly formed rotated grid.
  return resultantLayout;
}


// --- Main execution flow starts here ---

// Load the necessary Node.js 'fs' module for file system operations.
let fileSystemModule = require('fs');

// Read all incoming data from the standard input stream.
// The data is expected to be UTF-8 encoded.
let dataSource = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input data:
// 1. Remove any leading/trailing whitespace.
// 2. Split the content into an array of strings, where each string is a line.
let inputLines = (dataSource.trim()).split("\n");

// Initialize a 2D array (grid) to hold the character data.
let activeGrid = [];

// Populate the activeGrid from the parsed input lines.
// Each line string is split into individual characters, forming a row in the grid.
for (let iterator = 0; iterator < 8; iterator++) {
  activeGrid.push(inputLines[iterator].split(""));
}

// Perform the first 90-degree rotation.
activeGrid = spinArray(activeGrid);
// Output the grid after 90 degrees of rotation.
// The grid is joined by newlines, and commas (from array.join) are removed.
console.log("90\n" + activeGrid.join("\n").replace(/\,/g, ""));


// Perform the second 90-degree rotation (total 180 degrees from original).
activeGrid = spinArray(activeGrid);
// Output the grid after 180 degrees of rotation.
console.log("180\n" + activeGrid.join("\n").replace(/\,/g, ""));


// Perform the third 90-degree rotation (total 270 degrees from original).
activeGrid = spinArray(activeGrid);
// Output the grid after 270 degrees of rotation.
console.log("270\n" + activeGrid.join("\n").replace(/\,/g, ""));