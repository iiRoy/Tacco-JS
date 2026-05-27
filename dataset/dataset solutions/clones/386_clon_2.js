function pathfinder(rowCoord, colCoord, directionIndex) {
  // Check if the current cell is already part of the path or out of bounds.
  // If it's not an unvisited cell ('+'), then terminate this path segment.
  if (gridMap[rowCoord][colCoord] !== "+") {
    return;
  }

  // Define the row and column offsets for the four cardinal directions:
  // Up, Right, Down, Left (corresponding to directionIndex 0, 1, 2, 3)
  const rowOffsets = [-1, 0, 1, 0];
  const colOffsets = [0, 1, 0, -1];

  // Calculate the coordinates of the potential next cell.
  let nextRow = rowCoord + rowOffsets[directionIndex];
  let nextCol = colCoord + colOffsets[directionIndex];

  // Determine if the next cell is outside the grid boundaries.
  if (nextRow < 0 || nextCol < 0 || nextRow >= gridSize || nextCol >= gridSize) {
    // If out of bounds, change the current direction (rotate clockwise)
    // and attempt to move from the current cell again with the new direction.
    directionIndex = (directionIndex + 1) % 4;
    pathfinder(rowCoord, colCoord, directionIndex);
  } else {
    // If the next cell is within bounds, check its content.
    if (gridMap[nextRow][nextCol] === "#") {
      // If the next cell is already marked as part of the path ('#'),
      // then the cell *before* it (which was the current cell's previous state)
      // should be marked as unvisited ('+'). This is part of the spiral logic.
      gridMap[nextRow - rowOffsets[directionIndex]][nextCol - colOffsets[directionIndex]] = "+";

      // Based on the current direction, make a specific recursive call
      // to continue the path from an adjusted position and a new starting direction.
      if (directionIndex === 3) { // Was moving Left, now turn Up (0)
        pathfinder(nextRow - 2 * rowOffsets[directionIndex] - 1, nextCol - 2 * colOffsets[directionIndex], 0);
      } else if (directionIndex === 0) { // Was moving Up, now turn Right (1)
        pathfinder(nextRow - 2 * rowOffsets[directionIndex], nextCol - 2 * colOffsets[directionIndex] + 1, 1);
      } else if (directionIndex === 1) { // Was moving Right, now turn Down (2)
        pathfinder(nextRow - 2 * rowOffsets[directionIndex] + 1, nextCol - 2 * colOffsets[directionIndex], 2);
      } else if (directionIndex === 2) { // Was moving Down, now turn Left (3)
        pathfinder(nextRow - 2 * rowOffsets[directionIndex], nextCol - 2 * colOffsets[directionIndex] - 1, 3);
      }
    } else {
      // If the next cell is not '#' (meaning it's '+', an unvisited cell),
      // mark the current cell as part of the path ('#').
      gridMap[rowCoord][colCoord] = "#";
      // Store the coordinates of this newly marked cell as the last visited position.
      finalPosition = [rowCoord, colCoord];
      // Recursively continue the path from the next cell in the same direction.
      pathfinder(nextRow, nextCol, directionIndex);
    }
  }
}

// Declare global variables that will be used across test cases.
let gridMap;
let gridSize;
let finalPosition;

// Read the entire input from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process the input: remove leading/trailing whitespace, split into lines,
// and convert each line to a number.
const numericData = rawData.trim().split("\n").map(Number);

// The first number in the input is the total count of test cases.
let testCaseCount = numericData.shift();

// Iterate through each test case.
while (testCaseCount--) {
  // Get the grid size for the current test case.
  gridSize = numericData.shift();

  // Handle specific edge cases for very small grid sizes.
  if (gridSize === 0) {
    console.log(""); // Output an empty line for a grid of size 0.
    continue;
  }
  if (gridSize === 1) {
    console.log("#"); // Output a single '#' for a grid of size 1.
    continue;
  }
  if (gridSize === 2) {
    // Output a predefined pattern for a grid of size 2.
    const outputString = "##" + "\n" + "# ";
    console.log(outputString);
    continue;
  }

  // Initialize the 2D grid for the current test case.
  // All cells are initially marked as unvisited ('+').
  gridMap = [];
  for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
    gridMap[rowIndex] = [];
    for (let colIndex = 0; colIndex < gridSize; colIndex++) {
      gridMap[rowIndex][colIndex] = "+";
    }
  }

  // Initialize the tracker for the last position visited.
  finalPosition = [];
  // Start the pathfinding algorithm from the bottom-left corner (gridSize-1, 0),
  // initially moving upwards (directionIndex 0).
  pathfinder(gridSize - 1, 0, 0);

  // Apply a correction for even-sized grids:
  // The last cell marked by the algorithm needs to be reset to unvisited ('+').
  if (gridSize % 2 === 0) {
    gridMap[finalPosition[0]][finalPosition[1]] = "+";
  }

  // Format the final grid for output:
  // 1. Join the rows of the grid with newline characters.
  // 2. Remove any commas that might appear from joining inner arrays (e.g., ["#", "+"].join() -> "#,+").
  // 3. Replace all '+' characters (unvisited cells) with spaces for the final visual representation.
  console.log(gridMap.join("\n").replace(/,/g, "").replace(/\+/g, " "));
}
