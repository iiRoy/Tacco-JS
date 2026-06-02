const appSettings = {
  // This configuration points to standard input for data acquisition.
  // For alternative input methods (e.g., file system), adjust 'sourcePath' and 'lineSeparator'.
  sourcePath: '/dev/stdin',
  lineSeparator: '\n'
};

// Retrieve all lines from the specified input source, treating them as ASCII text.
let rawInputRows = require('fs').readFileSync(appSettings.sourcePath, 'ascii')
  .split(appSettings.lineSeparator);

// The initial line contains the dimensions of the primary grid.
rawInputRows[0] = rawInputRows[0].split(' ').map(Number);
let primaryGridHeight = rawInputRows[0][0];
let primaryGridWidth = rawInputRows[0][1];

// Extract the actual grid data based on the determined height.
let mainGridContent = rawInputRows.slice(1, 1 + primaryGridHeight);

// The line immediately following the main grid data specifies the dimensions of the pattern.
rawInputRows[1 + primaryGridHeight] = rawInputRows[1 + primaryGridHeight].split(' ').map(Number);
let patternHeight = rawInputRows[1 + primaryGridHeight][0];
let patternWidth = rawInputRows[1 + primaryGridHeight][1];

// Extract the pattern data itself.
let searchPatternData = rawInputRows.slice(1 + primaryGridHeight + 1, 1 + primaryGridHeight + 1 + patternHeight);

// If the pattern's dimensions exceed the main grid's, no match is possible.
// Exit the process immediately to save computation.
if (primaryGridHeight < patternHeight || primaryGridWidth < patternWidth) {
  process.exit();
}

// Transform the main grid into a collection of all possible horizontal segments
// that match the pattern's width. This pre-computation optimizes the search.
let horizontalSegments = mainGridContent.map(function (gridRowString) {
  let rowSlices = []; // Array to hold all width-C slices for the current row.
  let currentSliceIndex; // Iterator for column positions.
  for (currentSliceIndex = 0; currentSliceIndex <= primaryGridWidth - patternWidth; currentSliceIndex++) {
    rowSlices.push(gridRowString.slice(currentSliceIndex, currentSliceIndex + patternWidth));
  }
  return rowSlices;
});

// Begin the search for the pattern within the main grid.
// Iterate through all possible top-left starting positions for the pattern.
let currentGridRow;
let currentGridCol;
let currentPatternRowIndex;

for (currentGridRow = 0; currentGridRow <= primaryGridHeight - patternHeight; currentGridRow++) {
  for (currentGridCol = 0; currentGridCol <= primaryGridWidth - patternWidth; currentGridCol++) {
    let isMatchFound = true; // Assume a match until a discrepancy is found.
    // Compare each row of the pattern with the corresponding segment of the main grid.
    for (currentPatternRowIndex = 0; currentPatternRowIndex < patternHeight; currentPatternRowIndex++) {
      // If a segment of the main grid does not match the pattern's row,
      // then this starting position is not a match.
      if (horizontalSegments[currentGridRow + currentPatternRowIndex][currentGridCol] !== searchPatternData[currentPatternRowIndex]) {
        isMatchFound = false; // Mark as no match.
        break; // No need to check further rows for this specific starting point.
      }
    }
    // If 'isMatchFound' remains true after checking all pattern rows,
    // it means the pattern was successfully located.
    if (isMatchFound) {
      console.log(currentGridRow, currentGridCol); // Output the top-left coordinates.
    }
  }
}
