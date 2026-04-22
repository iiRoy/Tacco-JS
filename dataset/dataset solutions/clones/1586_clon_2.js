const fileSystemUtil = require('node:fs');

// Acquire raw data from a specified input source.
// This line would typically read from standard input in a competitive programming context.
// let initialStringData = fileSystemUtil.readInputFile('/dev/stdin', 'utf-8');
let initialStringData = fileSystemUtil
  .readFileSync('./data_sample.txt', 'utf-8') // Read content from a local data file.
  .split(/\s+|\n/) // Divide the string into tokens using spaces or newlines as delimiters.
  .slice(0, -1); // Exclude the very last element, which is often an empty string.

// Deconstruct the initial data to extract grid dimensions and raw coordinate pairs.
const [matrixRows, matrixCols, ...preliminaryCoordinates] = initialStringData;

// Further process the coordinate list, discarding an initial, unused count.
const processedPoints = preliminaryCoordinates.slice(1);

// Declare a two-dimensional array (grid) to store calculated scores.
let scoreGrid = [];

// Section: Grid Initialization
// Dynamically construct the scoring grid with initial zero values.
for (
  let rIdx = 0; // Initialize row index for grid construction.
  rIdx < matrixRows; // Iterate until all rows are created.
  rIdx++ // Advance to the next row.
) {
  scoreGrid.push([]); // Append a new, empty row array to the grid.

  // Populate the current row with zero values for each column.
  for (
    let cIdx = 0; // Initialize column index for the current row.
    cIdx < matrixCols; // Iterate until all columns in the row are filled.
    cIdx++ // Advance to the next column.
  ) {
    scoreGrid[rIdx].push(0); // Set the default score for the cell to zero.
  }
}

// Determine the total count of coordinate pairs to process.
const coordPairCount = processedPoints.length / 2;

// Section: Coordinate Processing and Grid Update
// Iterate through each pair of coordinates provided in the input.
for (
  let pairIdx = 0; // Start with the first coordinate pair.
  pairIdx < coordPairCount; // Continue until all pairs have been processed.
  pairIdx++ // Move to the next coordinate pair.
) {
  // Extract the string representations of the Y and X coordinates for the current pair.
  const [rawY, rawX] = processedPoints.slice(pairIdx * 2, (pairIdx * 2) + 2);

  // Convert string coordinates to zero-indexed integer coordinates.
  const adjustedY = parseInt(rawY) - 1; // Convert Y to 0-based index.
  const adjustedX = parseInt(rawX) - 1; // Convert X to 0-based index.

  // Increment values across the entire row corresponding to adjustedY.
  for (
    let colIter = 0; // Start from the first column.
    colIter < matrixCols; // Iterate through all columns in the grid.
    colIter++ // Move to the next column.
  ) {
    scoreGrid[adjustedY][colIter]++; // Increase the score for each cell in the row.
  }

  // Increment values down the entire column corresponding to adjustedX.
  for (
    let rowIter = 0; // Start from the first row.
    rowIter < matrixRows; // Iterate through all rows in the grid.
    rowIter++ // Move to the next row.
  ) {
    scoreGrid[rowIter][adjustedX]++; // Increase the score for each cell in the column.
  }

  // Correct the score at the intersection point, which was double-counted.
  scoreGrid[adjustedY][adjustedX]--; // Decrement the score at (adjustedY, adjustedX).
}

// Section: Finding the Maximum Score
// Initialize a variable to keep track of the highest score found.
let peakScore = 0;

// Traverse the entire scoring grid to identify the maximum individual cell score.
for (
  let rowScan = 0; // Begin scanning from the first row.
  rowScan < matrixRows; // Continue until all rows have been examined.
  rowScan++ // Advance to the subsequent row.
) {
  for (
    let colScan = 0; // Begin scanning from the first column within the current row.
    colScan < matrixCols; // Continue until all columns in the row are checked.
    colScan++ // Advance to the subsequent column.
  ) {
    // Compare the current cell's score with the highest score found so far.
    if (peakScore < scoreGrid[rowScan][colScan]) {
      peakScore = scoreGrid[rowScan][colScan]; // Update if a new maximum is discovered.
    }
  }
}

// Output the final maximum score to the console.
console.log(peakScore);