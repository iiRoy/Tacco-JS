function ProcessInput(sourceText) {
  // Split the entire input block into individual text rows
  const textRows = sourceText.split('\n');

  // Parse the first line to get grid height and width
  // Using parseInt for integer conversion, base 10
  const gridSize = textRows[0].split(' ').map(strVal => parseInt(strVal, 10));

  // Extract starting coordinates from the second line
  const initialPoint = textRows[1].split(' ').map(strVal => parseInt(strVal, 10));

  // Determine the target coordinates from the third line
  const targetPoint = textRows[2].split(' ').map(strVal => parseInt(strVal, 10));

  // The maze layout itself starts from the fourth line
  // It's a 2D array representing the grid state
  const mazeLayout = textRows
    .splice(3, gridSize[0]) // Get 'H' rows for the grid
    .map(rowStr => {
      return rowStr.split(''); // Convert each row string into an array of characters
    });

  // Initialize a queue for our breadth-first search (BFS) operations
  const traversalQueue = [];

  /**
   * Helper function to explore direct (non-warp) adjacent cells.
   * Updates the maze state if a shorter path is found.
   * @param {number[]} cellLocation - The [row, col] coordinates of the current cell.
   * @param {number} currentWarpCount - The number of warps used to reach this cell.
   */
  const traverseDirect = (cellLocation, currentWarpCount) => {
    const rowCoord = cellLocation[0];
    const colCoord = cellLocation[1];

    // Check boundary conditions: if out of bounds, do nothing
    if (
      rowCoord < 0 ||
      gridSize[0] - 1 < rowCoord ||
      colCoord < 0 ||
      gridSize[1] - 1 < colCoord
    ) {
      return;
    }

    // Get the current status/value of the cell in the maze
    const cellStatus = mazeLayout[rowCoord][colCoord];

    // If the cell is an obstacle '#' or we've already found a path with fewer or equal warps,
    // then there's no need to proceed from this cell directly.
    if (cellStatus === '#' || cellStatus <= currentWarpCount) {
      return;
    } else {
      // This means cellStatus is '.' (unvisited) and currentWarpCount is better
      // Update the cell's value with the current warp count
      mazeLayout[rowCoord][colCoord] = currentWarpCount;

      // Enqueue all four direct neighbors for further exploration
      traversalQueue.push([[rowCoord + 1, colCoord], currentWarpCount]);
      traversalQueue.push([[rowCoord - 1, colCoord], currentWarpCount]);
      traversalQueue.push([[rowCoord, colCoord + 1], currentWarpCount]);
      traversalQueue.push([[rowCoord, colCoord - 1], currentWarpCount]);
    }
  };


  /**
   * Main search function, handles both direct movement and warp jumps.
   * Prioritizes direct moves by using unshift for same-warp-count paths.
   * @param {number[]} cellLocation - The [row, col] coordinates.
   * @param {number} currentWarpCount - Warps used to reach this point.
   */
  const performExploration = (cellLocation, currentWarpCount) => {
    const rowCoord = cellLocation[0];
    const colCoord = cellLocation[1];

    // Out-of-bounds check for the current cell
    if (
      rowCoord < 0 ||
      gridSize[0] - 1 < rowCoord ||
      colCoord < 0 ||
      gridSize[1] - 1 < colCoord
    ) {
      return;
    }

    const cellStatus = mazeLayout[rowCoord][colCoord];

    // If it's an obstacle, we can't move here
    if (cellStatus === '#') {
      return;
    } else if (cellStatus === '.') {
      // If it's an unvisited path, mark it with the current warp count
      mazeLayout[rowCoord][colCoord] = currentWarpCount;

      // Add direct neighbors to the front of the queue (higher priority for 0-cost moves)
      traversalQueue.unshift([[rowCoord + 1, colCoord], currentWarpCount]);
      traversalQueue.unshift([[rowCoord - 1, colCoord], currentWarpCount]);
      traversalQueue.unshift([[rowCoord, colCoord + 1], currentWarpCount]);
      traversalQueue.unshift([[rowCoord, colCoord - 1], currentWarpCount]);

      // Explore all possible 5x5 warp destinations (cost +1 warp)
      for (let yDelta = -2; yDelta <= 2; yDelta++) {
        for (let xDelta = -2; xDelta <= 2; xDelta++) {
          traversalQueue.push([
            [rowCoord + yDelta, colCoord + xDelta],
            currentWarpCount + 1,
          ]);
        }
      }
    }
  };

  // Initialize the queue with the starting point and zero warps used
  // Adjust coordinates from 1-based to 0-based
  traversalQueue.push([[initialPoint[0] - 1, initialPoint[1] - 1], 0]);

  // Main loop for the BFS algorithm
  while (traversalQueue.length !== 0) {
    // Dequeue the next element to process
    const dequeuedElement = traversalQueue.shift();

    // Perform the exploration from this point
    // dequeuedElement[0] is the position, dequeuedElement[1] is the warp count
    performExploration(dequeuedElement[0], dequeuedElement[1]);

    // Check if the target cell has been reached (i.e., its value is no longer '.')
    // If it has, we can stop the search.
    if (mazeLayout[targetPoint[0] - 1][targetPoint[1] - 1] !== '.') break;
  }

  // Output the result:
  // If the target cell has a numeric value (meaning it was reached), print that value.
  // Otherwise, print -1, indicating it's unreachable.
  const finalCellValue = mazeLayout[targetPoint[0] - 1][targetPoint[1] - 1];
  console.log(finalCellValue !== '.' ? finalCellValue : -1);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));