function detonate(rowCoord, colCoord, directionIndex) {
  // If the current cell is not a placeholder, terminate this recursive path.
  if (gridMatrix[rowCoord][colCoord] !== "+") {
    return;
  }

  // Define arrays for changes in row and column coordinates for four directions:
  // 0: Up, 1: Right, 2: Down, 3: Left
  const deltaRows = [-1, 0, 1, 0]; // Row offsets
  const deltaCols = [0, 1, 0, -1]; // Column offsets

  // Calculate the coordinates of the next potential cell.
  let nextRow = rowCoord + deltaRows[directionIndex];
  let nextCol = colCoord + deltaCols[directionIndex];

  // Check if the calculated next coordinates are outside the grid boundaries.
  if (nextRow < 0 || nextCol < 0 || nextRow >= gridDimension || nextCol >= gridDimension) {
    // If out of bounds, change the direction (rotate clockwise).
    directionIndex = (directionIndex + 1) % 4;
    // Recursively call the function from the current cell with the new direction.
    detonate(rowCoord, colCoord, directionIndex);
  } else {
    // If the next cell is already marked as filled ('#'), it means we've hit a wall.
    // This indicates the completion of a spiral segment.
    if (gridMatrix[nextRow][nextCol] === "#") {
      // Reset the cell *before* the wall to a placeholder. This is a crucial step
      // in the specific spiral generation algorithm.
      gridMatrix[nextRow - deltaRows[directionIndex]][nextCol - deltaCols[directionIndex]] = "+";

      // Based on the current direction, determine the new starting point and initial direction
      // for the subsequent spiral segment. This logic is highly specific to the algorithm.
      if (directionIndex === 3) { // If the previous movement was 'Left'
        detonate(nextRow - 2 * deltaRows[directionIndex] - 1, nextCol - 2 * deltaCols[directionIndex], 0); // New segment starts, facing 'Up'
      } else if (directionIndex === 0) { // If the previous movement was 'Up'
        detonate(nextRow - 2 * deltaRows[directionIndex], nextCol - 2 * deltaCols[directionIndex] + 1, 1); // New segment starts, facing 'Right'
      } else if (directionIndex === 1) { // If the previous movement was 'Right'
        detonate(nextRow - 2 * deltaRows[directionIndex] + 1, nextCol - 2 * deltaCols[directionIndex], 2); // New segment starts, facing 'Down'
      } else if (directionIndex === 2) { // If the previous movement was 'Down'
        detonate(nextRow - 2 * deltaRows[directionIndex], nextCol - 2 * deltaCols[directionIndex] - 1, 3); // New segment starts, facing 'Left'
      }
    } else {
      // If the next cell is not a wall, mark the current cell as filled.
      gridMatrix[rowCoord][colCoord] = "#";
      // Store the coordinates of the current cell as the last visited position.
      finalPosition = [rowCoord, colCoord];
      // Recursively call the function to move to the next cell in the same direction.
      detonate(nextRow, nextCol, directionIndex);
    }
  }
}

// Read the entire content from standard input, assuming UTF-8 encoding.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input:
// 1. Remove any leading or trailing whitespace.
// 2. Split the string into an array of lines based on newline characters.
// 3. Convert each element of the array (which represents a number) to a numeric type.
let numericData = fileContent.trim().split("\n").map(Number);

// The first number in the processed data indicates the total number of test cases.
let testCaseCount = numericData.shift();

// Iterate through each test case.
while (testCaseCount--) {
  // The next number in the data is the dimension (N) for the current N x N grid.
  let gridDimension = numericData.shift();

  // Handle specific edge cases for small grid dimensions to simplify logic.
  if (gridDimension === 0) {
    console.log(""); // For a 0x0 grid, output an empty line.
    continue; // Proceed to the next test case.
  }
  if (gridDimension === 1) {
    console.log("#"); // For a 1x1 grid, output a single filled cell.
    continue; // Proceed to the next test case.
  }
  if (gridDimension === 2) {
    console.log("##\n# "); // For a 2x2 grid, output a predefined pattern.
    continue; // Proceed to the next test case.
  }

  // Declare variables that will be shared with the 'detonate' function through closure.
  // 'gridMatrix' will represent the 2D grid, initialized for each test case.
  let gridMatrix = [];
  // 'finalPosition' will track the last cell modified by the spiral algorithm.
  let finalPosition = [];

  // Initialize the 'gridMatrix' with placeholder characters ('+') for all cells.
  // This represents an empty grid before the spiral is drawn.
  for (let rowIndex = 0; rowIndex < gridDimension; rowIndex++) {
    gridMatrix[rowIndex] = []; // Create a new row array.
    for (let colIndex = 0; colIndex < gridDimension; colIndex++) {
      gridMatrix[rowIndex][colIndex] = "+"; // Fill each cell with the placeholder.
    }
  }

  // Start the recursive spiral generation process.
  // The algorithm begins from the bottom-left corner (gridDimension-1, 0)
  // and initially moves upwards (directionIndex 0).
  detonate(gridDimension - 1, 0, 0);

  // Apply a specific correction for grids with an even dimension:
  // The last cell marked by the 'detonate' function needs to be reset to a placeholder.
  // This adjustment is necessary for the correct visual output of the spiral pattern on even-sized grids.
  if (gridDimension % 2 === 0) {
    gridMatrix[finalPosition[0]][finalPosition[1]] = "+";
  }

  // Format the final output string for printing:
  // 1. Join all rows of the 'gridMatrix' with newline characters to form a multi-line string.
  // 2. Remove any commas that might have been introduced by the array's default 'join' behavior.
  // 3. Replace all placeholder characters ('+') with spaces to represent empty cells in the final output.
  console.log(gridMatrix.join("\n").replace(/,/g, "").replace(/\+/g, " "));
}
