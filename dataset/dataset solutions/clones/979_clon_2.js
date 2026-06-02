const cfg = { input: '/dev/stdin', newline: '\n' }; // Configuration for input source and line ending

// Read the entire input file, decode as ASCII, and split into an array of strings by newline.
let dataLines = require('fs').readFileSync(cfg.input, 'ascii')
  .split(cfg.newline);

// Parse the first line to extract the dimensions of the main grid.
dataLines[0] = dataLines[0].split(' ').map(Number);
const heightVal = dataLines[0][0]; // Stores the number of rows for the main grid.
const widthVal = dataLines[0][1];  // Stores the number of columns for the main grid.

// Extract the main grid data from the subsequent lines.
const mainGrid = dataLines.slice(1, 1 + heightVal);

// Parse the line immediately following the main grid to get the pattern dimensions.
dataLines[1 + heightVal] = dataLines[1 + heightVal].split(' ').map(Number);
const rowsPat = dataLines[1 + heightVal][0]; // Stores the number of rows for the pattern.
const colsPat = dataLines[1 + heightVal][1]; // Stores the number of columns for the pattern.

// Extract the pattern data from the lines after its dimensions.
const patternGrid = dataLines.slice(1 + heightVal + 1, 1 + heightVal + 1 + rowsPat);

// Initialize a 3D array to memoize the occurrences of each pattern row within each main grid row.
// Dimensions: [mainGridRowIndex][patternRowIndex][mainGridColumnStartIndex]
const memoizationTable = new Array(heightVal);
for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
  memoizationTable[rowIdx] = new Array(rowsPat);
  for (let patRowIdx = 0; patRowIdx < rowsPat; patRowIdx++) {
    memoizationTable[rowIdx][patRowIdx] = new Array(widthVal - colsPat + 1);
    // Initialize all possible starting column positions for this row pair to 'false'.
    for (let colOffset = 0; colOffset <= widthVal - colsPat; colOffset++) {
      memoizationTable[rowIdx][patRowIdx][colOffset] = false;
    }

    // Find all starting positions where the current pattern row matches a substring in the current main grid row.
    let currentMatchPos = mainGrid[rowIdx].indexOf(patternGrid[patRowIdx]);
    while (currentMatchPos !== -1) {
      memoizationTable[rowIdx][patRowIdx][currentMatchPos] = true; // Mark this position as a match.
      currentMatchPos = mainGrid[rowIdx].indexOf(patternGrid[patRowIdx], currentMatchPos + 1); // Search for the next occurrence.
    }
  }
}

// Iterate through all possible top-left starting coordinates in the main grid
// where the pattern could potentially fit without going out of bounds.
for (let startRow = 0; startRow <= heightVal - rowsPat; startRow++) {
  for (let startCol = 0; startCol <= widthVal - colsPat; startCol++) {
    let matchFound = true; // Assume the pattern matches at this (startRow, startCol) until proven otherwise.

    // Check each row of the pattern against the corresponding row in the main grid,
    // using the pre-computed memoization table.
    for (let patOffsetRow = 0; patOffsetRow < rowsPat; patOffsetRow++) {
      // If the current pattern row does not match the main grid row at the specified column offset,
      // then the entire pattern does not match at this (startRow, startCol).
      if (!memoizationTable[startRow + patOffsetRow][patOffsetRow][startCol]) {
        matchFound = false; // Set flag to false.
        break;              // No need to check further rows for this starting position.
      }
    }

    // If 'matchFound' is still true after checking all pattern rows,
    // it means the pattern was found at the current (startRow, startCol).
    if (matchFound) {
      console.log('%d %d', startRow, startCol); // Output the coordinates.
    }
  }
}
