function detonate(rowCoord, colCoord, targetChar) {
  // Define relative offsets for checking adjacent cells (up, down, left, right)
  const rowOffsets = [0, 0, -1, 1]; // Changes in row index
  const colOffsets = [-1, 1, 0, 0]; // Changes in column index

  // Iterate over the four possible directions
  for (let idx = 0; idx < 4; idx++) {
    // Calculate coordinates of the neighboring cell
    const nextRow = rowCoord + rowOffsets[idx];
    const nextCol = colCoord + colOffsets[idx];

    // Check if the neighboring cell is within the grid boundaries
    // currentGridDims and currentGridMap are effectively global, updated in the main loop
    if (nextRow < 0 || nextRow >= currentGridDims[0] || nextCol < 0 || nextCol >= currentGridDims[1]) {
      continue; // Skip if out of bounds
    }

    // If the neighbor's character matches the target character,
    // mark it as 'm' (visited/processed) and recursively call detonate
    if (targetChar === currentGridMap[nextRow][nextCol]) {
      currentGridMap[nextRow][nextCol] = 'm'; // Mark as processed
      detonate(nextRow, nextCol, targetChar); // Recurse
    }
  }
}

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into an array of lines, removing any leading/trailing whitespace
const lineSegments = rawData.trim().split('\n');

// Declare variables that will hold grid dimensions and the grid map.
// These are declared outside the loop to mimic the global-like behavior of 'var'
// in the original script, allowing the 'detonate' function to access them.
let currentGridDims;
let currentGridMap;

// Main processing loop
while (true) {
  // Get grid dimensions from the first line of the current segment
  // and convert them to numbers. Reassigns the 'currentGridDims' global-like variable.
  currentGridDims = (lineSegments.shift()).split(' ').map(Number);

  // Check for termination condition (0 0)
  if (currentGridDims[0] === 0 && currentGridDims[1] === 0) {
    break; // Exit the loop
  }

  // Initialize the 2D character grid. Reassigns the 'currentGridMap' global-like variable.
  currentGridMap = [];
  for (let rowIndex = 0; rowIndex < currentGridDims[0]; rowIndex++) {
    // Read a line, split it into individual characters, and add to the grid
    const currentLineChars = (lineSegments.shift()).split('');
    currentGridMap.push(currentLineChars);
  }

  // Initialize a counter for distinct clusters
  let clusterCount = 0;

  // Iterate through each cell of the grid to find new clusters
  for (let rowIndex = 0; rowIndex < currentGridDims[0]; rowIndex++) {
    for (let colIndex = 0; colIndex < currentGridDims[1]; colIndex++) {
      const currentCellVal = currentGridMap[rowIndex][colIndex];

      // If the cell contains a 'bomb' character ('@', '#', or '*')
      // and hasn't been visited yet (not 'm')
      if (currentCellVal === '@' || currentCellVal === '#' || currentCellVal === '*') {
        clusterCount++; // Increment the cluster count
        currentGridMap[rowIndex][colIndex] = 'm'; // Mark the current cell as processed
        detonate(rowIndex, colIndex, currentCellVal); // Start recursive exploration
      }
    }
  }

  // Output the total number of distinct clusters found for the current grid
  console.log(clusterCount);
}
