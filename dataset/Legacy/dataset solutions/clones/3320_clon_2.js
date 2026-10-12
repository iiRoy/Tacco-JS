'use strict';

// Function to process the raw input data and compute path counts
function processInput(rawData) {
  // Split the entire input string into an array of individual lines
  const inputLines = rawData.split('\n');

  // Extract the grid dimensions (Height and Width) from the first line
  // The 'shift()' method removes the first element from the array and returns it
  const dimensions = inputLines.shift().split(' ').map(valStr => parseInt(valStr, 10));
  const heightVal = dimensions[0]; // Store the height of the grid
  const widthVal = dimensions[1];   // Store the width of the grid

  // Initialize an array to represent the grid map
  const gridMap = [];
  // Populate the grid map with characters from the remaining input lines
  for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    gridMap.push(inputLines.shift().split('')); // Each line becomes an array of characters
  }

  // Define the modulo value to prevent integer overflow during calculations
  const moduloVal = 10e8 + 7;

  // Initialize a 2D array (DP table) to store the number of paths to each cell
  const pathCounts = [];
  for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    pathCounts.push(Array(widthVal).fill(0)); // Fill each row with zeros initially
  }

  // The starting cell (0,0) has exactly one path to itself
  pathCounts[0][0] = 1;

  // Iterate through each cell of the grid to fill the DP table
  for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    for (let colIdx = 0; colIdx < widthVal; colIdx++) {
      // If the current cell is a blocked cell ('#'), no paths can go through it,
      // so its path count remains 0 (or is not updated from previous calculations).
      // The problem implies we only add paths if the *previous* cell is not '#'.
      // The current cell itself can be '#', in which case it won't contribute to future cells.
      // However, the problem statement implies we only consider paths *to* a cell.
      // If gridMap[rowIdx][colIdx] === '#', then pathCounts[rowIdx][colIdx] should effectively be 0.
      // The current logic correctly handles this by not adding to pathCounts[rowIdx][colIdx] if it's '#'.
      // But the problem is about paths *to* a cell. If gridMap[rowIdx][colIdx] is '#', then pathCounts[rowIdx][colIdx] should be 0.
      // Let's ensure this. If the current cell is '#', we should skip adding paths to it.
      if (gridMap[rowIdx][colIdx] === '#') {
          continue; // No paths can reach a blocked cell
      }

      // Add paths from the cell directly above (if it exists and is not blocked)
      if (rowIdx > 0) {
        pathCounts[rowIdx][colIdx] += pathCounts[rowIdx - 1][colIdx];
      }
      // Add paths from the cell directly to the left (if it exists and is not blocked)
      if (colIdx > 0) {
        pathCounts[rowIdx][colIdx] += pathCounts[rowIdx][colIdx - 1];
      }
      // Apply modulo operation to keep the number within bounds
      pathCounts[rowIdx][colIdx] %= moduloVal;
    }
  }

  // The final result is the number of paths to the bottom-right cell of the grid
  let finalCount = pathCounts[heightVal - 1][widthVal - 1];

  // Output the final path count, ensuring it's still modulo the defined value
  console.log(finalCount % moduloVal);
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
