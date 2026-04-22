// This function recursively traces a path, marking cells in a grid.
function detonatePath(currentY, currentX, directionIndex) {
  // If the current cell is not marked with '+', stop processing this path.
  if (gridMap[currentY][currentX] !== "+") {
    return;
  }

  // Define offsets for movement in Y (row) and X (column) directions.
  const yDirections = [-1, 0, 1, 0]; // Up, Right, Down, Left for Y
  const xDirections = [0, 1, 0, -1]; // Up, Right, Down, Left for X

  // Calculate the coordinates of the next cell based on the current direction.
  let nextY = currentY + yDirections[directionIndex];
  let nextX = currentX + xDirections[directionIndex];

  // Check if the next cell is out of bounds.
  if (nextY < 0 || nextX < 0 || nextY >= boardSize || nextX >= boardSize) {
    // If out of bounds, rotate the direction clockwise and retry from the current cell.
    directionIndex = (directionIndex + 1) % 4;
    detonatePath(currentY, currentX, directionIndex);
  } else {
    // If the next cell is already marked with '#', it means we've hit an obstacle.
    if (gridMap[nextY][nextX] === "#") {
      // Mark the cell *before* the obstacle as '+'.
      gridMap[nextY - yDirections[directionIndex]][nextX - xDirections[directionIndex]] = "+";
      // Based on the current direction, recursively call detonatePath with adjusted coordinates.
      // These adjustments seem to skip cells or re-position for the next segment of the path.
      if (directionIndex === 3) {
        detonatePath(nextY - 2 * yDirections[directionIndex] - 1, nextX - 2 * xDirections[directionIndex], 0);
      } else if (directionIndex === 0) {
        detonatePath(nextY - 2 * yDirections[directionIndex], nextX - 2 * xDirections[directionIndex] + 1, 1);
      } else if (directionIndex === 1) {
        detonatePath(nextY - 2 * yDirections[directionIndex] + 1, nextX - 2 * xDirections[directionIndex], 2);
      } else if (directionIndex === 2) {
        detonatePath(nextY - 2 * yDirections[directionIndex], nextX - 2 * xDirections[directionIndex] - 1, 3);
      }
    } else {
      // If the next cell is not an obstacle, mark the current cell with '#'.
      gridMap[currentY][currentX] = "#";
      // Store the current position as the last visited cell.
      finalCell = [currentY, currentX];
      // Recursively move to the next cell in the same direction.
      detonatePath(nextY, nextX, directionIndex);
    }
  }
}

// Read input from standard input.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace, split by newline, and convert to numbers.
const numericDataSequence = rawInputData.trim().split("\n").map(Number);

// Extract the total number of test cases.
let totalCases = numericDataSequence.shift();

// Iterate through each test case.
while (totalCases--) {
  // Get the size of the grid for the current test case.
  let boardSize = numericDataSequence.shift();

  // Handle specific edge cases for board size.
  if (boardSize === 0) {
    console.log("");
    continue;
  }
  if (boardSize === 1) {
    console.log("#");
    continue;
  }
  if (boardSize === 2) {
    // Special pattern for a 2x2 grid.
    const outputString = "##" + "\n" + "# ";
    console.log(outputString);
    continue;
  }

  // Initialize the grid with '+' characters.
  let gridMap = [];
  for (let rowIterator = 0; rowIterator < boardSize; rowIterator++) {
    gridMap[rowIterator] = [];
    for (let colIterator = 0; colIterator < boardSize; colIterator++) {
      gridMap[rowIterator][colIterator] = "+";
    }
  }

  // Variable to store the last modified cell's coordinates.
  let finalCell = [];

  // Start the path tracing from the bottom-left corner, facing upwards (direction 0).
  detonatePath(boardSize - 1, 0, 0);

  // If the board size is even, the last cell visited should be reset to '+'.
  if (boardSize % 2 === 0) {
    gridMap[finalCell[0]][finalCell[1]] = "+";
  }

  // Print the final grid, joining rows with newlines, removing commas, and replacing '+' with spaces.
  console.log(
    gridMap.join("\n").replace(/,/g, "").replace(/\+/g, " ")
  );
}