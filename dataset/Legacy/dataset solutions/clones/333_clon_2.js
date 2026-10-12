// This script processes a grid-based puzzle from standard input.
// It simulates movement through a grid, detecting loops or finding an exit point.

/**
 * Recursively navigates a grid based on directional markers.
 * Marks visited cells and determines the final outcome message.
 *
 * @param {number} rowCoord The current row coordinate within the grid.
 * @param {number} colCoord The current column coordinate within the grid.
 */
function traverseGrid(rowCoord, colCoord) {
  // Check if the current cell has already been visited.
  // A '#' character indicates a previously visited cell, signifying a loop.
  if (gridMap[rowCoord][colCoord] === '#') {
    outcomeMessage = 'LOOP'; // Set the global outcome to indicate a loop.
    return; // Terminate this recursive path.
  }

  // Check if the current cell is an exit point.
  // A '.' character indicates a successful exit.
  if (gridMap[rowCoord][colCoord] === '.') {
    outcomeMessage = colCoord + ' ' + rowCoord; // Record the exit coordinates.
    return; // Terminate this recursive path.
  }

  // Initialize variables to store changes in coordinates (delta).
  let deltaX = 0; // Change in column coordinate.
  let deltaY = 0; // Change in row coordinate.

  // Determine the direction of movement based on the character in the current cell.
  if (gridMap[rowCoord][colCoord] === '>') {
    deltaX++; // Move one step to the right.
  }
  if (gridMap[rowCoord][colCoord] === '<') {
    deltaX--; // Move one step to the left.
  }
  if (gridMap[rowCoord][colCoord] === '^') {
    deltaY--; // Move one step upwards.
  }
  if (gridMap[rowCoord][colCoord] === 'v') {
    deltaY++; // Move one step downwards.
  }

  // Mark the current cell as visited to prevent infinite loops and detect cycles.
  gridMap[rowCoord][colCoord] = '#';

  // Recursively call the function for the next cell based on the calculated deltas.
  traverseGrid(rowCoord + deltaY, colCoord + deltaX);
}

// Declare global variables to hold the grid structure and the result string.
let gridMap; // Stores the 2D array representing the grid for the current test case.
let outcomeMessage; // Stores the final message ('LOOP' or coordinates).

// Read all input data from the standard input stream as a UTF-8 string.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into an array of lines.
const lineSegments = rawData.trim().split('\n');

// Main loop to process multiple test cases from the input.
while (true) {
  // Extract grid dimensions (rows and columns) from the first line of the current test case.
  // The line is shifted from the array, split by space, and converted to numbers.
  const dimensions = lineSegments.shift().split(' ').map(Number);

  // Check for the termination condition: both dimensions are zero.
  if (dimensions[0] === 0 && dimensions[1] === 0) {
    break; // Exit the processing loop if the termination signal is found.
  }

  // Initialize the grid for the current test case as an empty array.
  gridMap = [];
  // Populate the grid with character rows based on the specified number of rows.
  for (let rowIndex = 0; rowIndex < dimensions[0]; rowIndex++) {
    // Shift the next line, split it into individual characters, and add it as a row to the grid.
    const currentRowChars = lineSegments.shift().split('');
    gridMap.push(currentRowChars);
  }

  // Reset the outcome message for the new test case before starting traversal.
  outcomeMessage = '';
  // Initiate the grid traversal from the starting point (top-left corner, 0,0).
  traverseGrid(0, 0);

  // Output the determined outcome message for the current test case to the console.
  console.log(outcomeMessage);
}
