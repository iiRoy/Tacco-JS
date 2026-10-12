function ProcessInputData(rawInputString) {
  // Split the entire input string into individual lines for processing.
  const inputLines = rawInputString.split('\n');

  // Parse grid height and width from the first line.
  const gridDimensions = inputLines[0].split(' ').map(numStr => parseInt(numStr, 10));

  // Parse starting coordinates (row, column) from the second line.
  const startCoordinates = inputLines[1].split(' ').map(numStr => parseInt(numStr, 10));

  // Parse goal coordinates (row, column) from the third line.
  const goalCoordinates = inputLines[2].split(' ').map(numStr => parseInt(numStr, 10));

  // Extract the grid map, converting each character into an array element.
  // The splice method modifies inputLines, removing the first 3 elements.
  const gridState = inputLines.splice(3, gridDimensions[0]).map(lineContent => {
    return lineContent.split('');
  });

  // Initialize a queue for Breadth-First Search (BFS) or similar traversal.
  const bfsQueue = [];

  // This function appears to be an unused helper or an alternative exploration strategy.
  // It checks adjacent cells and updates their warp count if conditions are met.
  const checkAndMarkAdjacent = (currentCellPosition, currentWarpCount) => {
    const rowIndex = currentCellPosition[0];
    const colIndex = currentCellPosition[1];

    // Boundary check: if the position is outside the grid, do nothing.
    if (rowIndex < 0 || gridDimensions[0] - 1 < rowIndex || colIndex < 0 || gridDimensions[1] - 1 < colIndex) {
      return;
    }

    const cellValue = gridState[rowIndex][colIndex];

    // If the cell is an obstacle ('#') or already has a lower or equal warp count, do nothing.
    if (cellValue === '#' || cellValue <= currentWarpCount) {
      return;
    } else { // If cellValue is '.' (unvisited)
      // Mark the cell with the current warp count.
      gridState[rowIndex][colIndex] = currentWarpCount;
      // Add adjacent cells to the queue for further exploration with the same warp count.
      bfsQueue.push([[rowIndex + 1, colIndex], currentWarpCount]);
      bfsQueue.push([[rowIndex - 1, colIndex], currentWarpCount]);
      bfsQueue.push([[rowIndex, colIndex + 1], currentWarpCount]);
      bfsQueue.push([[rowIndex, colIndex - 1], currentWarpCount]);
    }
  };

  // Main cell exploration function.
  const exploreCell = (currentCellPosition, currentWarpCount) => {
    const rowIndex = currentCellPosition[0];
    const colIndex = currentCellPosition[1];

    // Boundary check: if the position is outside the grid, do nothing.
    if (rowIndex < 0 || gridDimensions[0] - 1 < rowIndex || colIndex < 0 || gridDimensions[1] - 1 < colIndex) {
      return;
    }

    const cellValue = gridState[rowIndex][colIndex];

    // If the cell is an obstacle, stop.
    if (cellValue === '#') {
      return;
    } else if (cellValue === '.') { // If the cell is unvisited ('.')
      // Mark the cell with the current warp count.
      gridState[rowIndex][colIndex] = currentWarpCount;

      // Add immediate neighbors to the front of the queue (BFS-like for same warp count).
      bfsQueue.unshift([[rowIndex + 1, colIndex], currentWarpCount]);
      bfsQueue.unshift([[rowIndex - 1, colIndex], currentWarpCount]);
      bfsQueue.unshift([[rowIndex, colIndex + 1], currentWarpCount]);
      bfsQueue.unshift([[rowIndex, colIndex - 1], currentWarpCount]);

      // Add cells within a 5x5 square (2 units in each direction) to the end of the queue.
      // These represent potential warp destinations, increasing the warp count by 1.
      for (let rowOffset = -2; rowOffset < 3; rowOffset++) {
        for (let colOffset = -2; colOffset < 3; colOffset++) {
          bfsQueue.push([[rowIndex + rowOffset, colIndex + colOffset], currentWarpCount + 1]);
        }
      }
    }
  };

  // Initialize the queue with the starting position and zero warps.
  // Adjust coordinates from 1-based to 0-based indexing.
  bfsQueue.push([[startCoordinates[0] - 1, startCoordinates[1] - 1], 0]);

  // Process the queue until it's empty or the goal is reached.
  while (bfsQueue.length !== 0) {
    // Dequeue the next item (position and warp count).
    const queueEntry = bfsQueue.shift();
    // Explore the cell.
    exploreCell(queueEntry[0], queueEntry[1]);

    // If the goal cell has been visited (its value is no longer '.'), break the loop.
    if (gridState[goalCoordinates[0] - 1][goalCoordinates[1] - 1] !== '.') break;
  }

  // Output the minimum warp count to reach the goal.
  // If the goal is still '.', it means it's unreachable, so output -1.
  console.log(gridState[goalCoordinates[0] - 1][goalCoordinates[1] - 1] !== '.' ? gridState[goalCoordinates[0] - 1][goalCoordinates[1] - 1] : -1);
}

// Read input from standard input and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
