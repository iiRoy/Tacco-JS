function solveMaze() {
  // This object tracks visited cells to prevent redundant processing.
  // Keys are formatted as "row,column".
  let visitedCells = {};

  // Stores the final result, initialized to "NA" if no path is found.
  let resultValue = "NA";

  // A queue for Breadth-First Search (BFS), storing [row, column, steps] tuples.
  // Starts at (0,0) and (1,0) with 0 steps.
  let processingQueue = [
    [0, 0, 0],
    [1, 0, 0]
  ];

  // Main BFS loop. Continues until the queue is empty or a solution is found.
  while (true) {
    // If the queue is empty, no more paths to explore.
    if (processingQueue.length === 0) {
      break;
    }

    // Dequeue the next state to process.
    let currentPath = processingQueue.shift();

    // Extract current row, column, and step count.
    let currentRow = currentPath[0];
    let currentCol = currentPath[1];
    let stepCount = currentPath[2];

    // Form a unique key for the current cell.
    let cellKey = currentRow + "," + currentCol;

    // If this cell has already been visited, skip it to avoid cycles and redundant work.
    if (visitedCells.hasOwnProperty(cellKey)) {
      continue;
    } else {
      // Mark the current cell as visited.
      visitedCells[cellKey] = true;
    }

    // Check if the target column (n-1) has been reached and the cell type is not '2'.
    // If so, a solution is found.
    if (currentCol === gridWidth - 1 && gridData[currentRow][currentCol] !== 2) {
      resultValue = stepCount; // Store the number of steps.
      break; // Exit the main loop as the shortest path is found.
    }

    // Get the type of the current cell from the grid.
    let cellType = gridData[currentRow][currentCol];

    // Handle movement based on cell type.
    if (cellType === 1) {
      // Cell type '1': Move right as long as cells are '1' or until the end of the row.
      let reachedEnd = false;
      while (true) {
        currentCol++; // Move one step right.
        // If the end of the row is reached, set flag and break.
        if (currentCol === gridWidth - 1) {
          reachedEnd = true;
          break;
        }
        // If the next cell is not '1', stop moving right and backtrack one step.
        if (gridData[currentRow][currentCol] !== 1) {
          currentCol--;
          break;
        }
      }
      // If the end of the row was reached during '1' movement, it's a solution.
      if (reachedEnd) {
        resultValue = stepCount;
        break;
      }
    } else if (cellType === 2) {
      // Cell type '2': Move left as long as cells are '2'.
      while (true) {
        currentCol--; // Move one step left.
        // If the next cell is not '2', stop moving left.
        if (gridData[currentRow][currentCol] !== 2) {
          break;
        }
      }
    }

    // After potential special movements, add next possible states to the queue.
    // This involves switching rows (1-currentRow) and exploring three adjacent columns (currentCol, currentCol+1, currentCol+2).
    for (let offsetIndex = 0; offsetIndex <= 2; offsetIndex++) {
      processingQueue.push([1 - currentRow, currentCol + offsetIndex, stepCount + 1]);
    }
  }

  return resultValue; // Return the calculated result.
}

// Read input from standard input.
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace and split into lines.
let inputLines = rawData.trim().split("\n");

// Loop through test cases until 'n' is 0.
while (true) {
  // Read the grid width (n) for the current test case and convert to number.
  let gridWidth = inputLines.shift() - 0;

  // If n is 0, it's the end of input.
  if (gridWidth === 0) {
    break;
  }

  // Initialize the grid data structure.
  let gridData = [];

  // Read the first row of the grid, split by spaces, and convert to numbers.
  gridData[0] = inputLines.shift().split(" ").map(Number);

  // Read the second row of the grid, split by spaces, and convert to numbers.
  gridData[1] = inputLines.shift().split(" ").map(Number);

  // Call the maze solver function and print its result to console.
  console.log(solveMaze());
}
