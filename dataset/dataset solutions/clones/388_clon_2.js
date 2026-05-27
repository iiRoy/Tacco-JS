function explode(rowCoord, colCoord, directionIdx) {
  // If the current cell is not a path marker, stop.
  if (gridMap[rowCoord][colCoord] !== "+") return;

  // Define changes in row and column for each direction (Up, Right, Down, Left)
  const deltaRows = [-1, 0, 1, 0];
  const deltaCols = [0, 1, 0, -1];

  // Calculate the coordinates of the next cell in the current direction
  let nextRow = rowCoord + deltaRows[directionIdx];
  let nextCol = colCoord + deltaCols[directionIdx];

  // Check if the next cell is out of bounds
  if (nextRow < 0 || nextCol < 0 || nextRow >= gridSize || nextCol >= gridSize) {
    // If out of bounds, change direction (clockwise) and try again from the current cell
    directionIdx = (directionIdx + 1) % 4;
    explode(rowCoord, colCoord, directionIdx);
  } else {
    // If the next cell is a wall ('#')
    if (gridMap[nextRow][nextCol] === "#") {
      // Mark the cell before the wall as a path
      gridMap[nextRow - deltaRows[directionIdx]][nextCol - deltaCols[directionIdx]] = "+";

      // Recursive call to continue the path, adjusting starting position based on current direction
      if (directionIdx === 3) explode(nextRow - 2 * deltaRows[directionIdx] - 1, nextCol - 2 * deltaCols[directionIdx], 0);
      else if (directionIdx === 0) explode(nextRow - 2 * deltaRows[directionIdx], nextCol - 2 * deltaCols[directionIdx] + 1, 1);
      else if (directionIdx === 1) explode(nextRow - 2 * deltaRows[directionIdx] + 1, nextCol - 2 * deltaCols[directionIdx], 2);
      else if (directionIdx === 2) explode(nextRow - 2 * deltaRows[directionIdx], nextCol - 2 * deltaCols[directionIdx] - 1, 3);
    } else {
      // If the next cell is not a wall, mark the current cell as a wall
      gridMap[rowCoord][colCoord] = "#";
      // Store the current cell's coordinates as the last visited wall
      finalPosition = [rowCoord, colCoord];
      // Move to the next cell in the same direction
      explode(nextRow, nextCol, directionIdx);
    }
  }
}

// Read input from stdin
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process input: trim whitespace, split by newlines, convert to numbers
const numericData = rawData.trim().split("\n").map(Number);

// Get the number of test cases
let testCases = numericData.shift();

// Process each test case
while (testCases--) {
  // Get the grid size for the current test case
  let gridSize = numericData.shift();

  // Special case for a 1x1 grid
  if (gridSize === 1) {
    console.log("#");
    continue; // Move to the next test case
  }

  // Initialize the grid with path markers ('+')
  let gridMap = [];
  for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
    gridMap[rowIndex] = [];
    for (let colIndex = 0; colIndex < gridSize; colIndex++) {
      gridMap[rowIndex][colIndex] = "+";
    }
  }

  // Variable to store the last position marked as '#'
  let finalPosition = [];
  // Start the path generation from the bottom-left corner, facing up (direction 0)
  explode(gridSize - 1, 0, 0);

  // If the grid size is even, the last marked '#' should be a path marker instead
  if (gridSize % 2 === 0) gridMap[finalPosition[0]][finalPosition[1]] = "+";

  // Print the resulting grid:
  // 1. Join rows with newlines.
  // 2. Remove commas introduced by join (from array elements).
  // 3. Replace path markers ('+') with spaces for final output.
  console.log(gridMap.join("\n").replace(/,/g, "").replace(/\+/g, " "));
}
