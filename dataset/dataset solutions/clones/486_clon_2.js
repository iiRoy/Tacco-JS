function detonate() {
  // Stores visited cell coordinates to prevent redundant processing.
  let exploredCells = {};
  // Variable to hold the final path length, initialized to "NA".
  let finalResult = "NA";
  // Queue for breadth-first search (BFS) traversal.
  // Each element is [row, column, steps_taken].
  let pathSegments = [[0, 0, 0], [1, 0, 0]];

  while (true) {
    // If the queue is empty, no more paths to explore.
    if (pathSegments.length === 0) {
      break;
    }

    // Retrieve the next path segment from the front of the queue.
    let currentPathSegment = pathSegments.shift();
    let rowIdx = currentPathSegment[0]; // Current row index.
    let colIdx = currentPathSegment[1]; // Current column index.

    // Create a unique key for the current cell.
    const cellKey = `${rowIdx},${colIdx}`;

    // If this cell has already been visited, skip it.
    if (exploredCells.hasOwnProperty(cellKey)) {
      continue;
    } else {
      // Mark the current cell as visited.
      exploredCells[cellKey] = true;
    }

    let pathLength = currentPathSegment[2]; // Number of steps taken to reach this cell.

    // Check if the goal is reached: last column and not a '2' type cell.
    if (colIdx === gridWidth - 1 && gridMap[rowIdx][colIdx] !== 2) {
      finalResult = pathLength; // Set the result.
      break; // Exit the main loop.
    }

    let currentCellType = gridMap[rowIdx][colIdx]; // Get the type of the current cell.

    // Handle cell type '1': move right until a non-'1' cell or boundary is hit.
    if (currentCellType === 1) {
      let reachedBoundary = false; // Flag to indicate if the end boundary was reached.
      while (true) {
        colIdx++; // Move one step to the right.
        if (colIdx >= gridWidth - 1) { // Check if the rightmost boundary is reached.
          reachedBoundary = true;
          break; // Exit inner loop.
        }
        if (gridMap[rowIdx][colIdx] !== 1) { // If the next cell is not '1'.
          colIdx--; // Move back one step (to the last '1' cell).
          break; // Exit inner loop.
        }
      }
      if (reachedBoundary) { // If the boundary was reached during the '1' movement.
        finalResult = pathLength; // Set the result.
        break; // Exit the main loop.
      }
    }
    // Handle cell type '2': move left until a non-'2' cell is hit.
    else if (currentCellType === 2) {
      while (true) {
        colIdx--; // Move one step to the left.
        if (gridMap[rowIdx][colIdx] !== 2) { // If the next cell is not '2'.
          break; // Exit inner loop.
        }
      }
    }

    // Add potential next states to the queue.
    // These are cells in the opposite row, at current column, current column + 1, and current column + 2.
    for (let loopVar = 0; loopVar <= 2; loopVar++) {
      pathSegments.push([1 - rowIdx, colIdx + loopVar, pathLength + 1]);
    }
  }
  return finalResult; // Return the computed result.
}

// Read input from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process input: trim whitespace and split into lines.
let lineData = rawData.trim().split("\n");

let gridWidth; // Global variable for grid width.
let gridMap;   // Global variable for the grid data.

// Main program loop to process multiple test cases.
while (true) {
  // Read the grid width for the current test case.
  gridWidth = parseInt(lineData.shift(), 10); // Convert string to number.

  // If grid width is 0, it's the termination signal.
  if (gridWidth === 0) {
    break;
  }

  gridMap = []; // Initialize grid map for the current test case.
  // Read the first row of the grid.
  gridMap[0] = lineData.shift().split(" ").map(Number);
  // Read the second row of the grid.
  gridMap[1] = lineData.shift().split(" ").map(Number);

  // Call the main function and print its result to console.
  console.log(detonate());
}
