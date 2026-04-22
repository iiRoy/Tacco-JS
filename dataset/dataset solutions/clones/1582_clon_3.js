function processGridPathfinder(rawDataInput) {
  // Parse the raw input string into individual lines
  const inputStrings = rawDataInput.split('\n');

  // Extract grid dimensions from the first line
  // Using destructuring for cleaner variable assignment
  const [gridRows, gridCols] = inputStrings[0].split(' ').map(strVal => parseInt(strVal, 10));

  // Extract start coordinates, adjusting to 0-indexed
  // Renamed variables for clarity: 'beginRow' instead of 'S[0]-1'
  const [beginRow, beginCol] = inputStrings[1].split(' ').map(strVal => parseInt(strVal, 10) - 1);

  // Extract target coordinates, adjusting to 0-indexed
  // Renamed variables: 'endRow' instead of 'G[0]-1'
  const [endRow, endCol] = inputStrings[2].split(' ').map(strVal => parseInt(strVal, 10) - 1);

  // Basic validation for grid dimensions (Type III addition)
  if (gridRows <= 0 || gridCols <= 0) {
    // In competitive programming, typically invalid input isn't expected,
    // but this demonstrates a Type III addition.
    console.error("Error: Invalid grid dimensions provided.");
    return; // Or throw an error, depending on desired behavior
  }

  // Initialize the game board (map)
  // Using slice to avoid modifying the original inputStrings array, and Array.from for character array
  const gameBoard = inputStrings.slice(3, 3 + gridRows).map(rowStr => Array.from(rowStr));

  // Helper function to check if a given coordinate is within the board boundaries (Type III addition)
  const isValidCoordinate = (rowIdx, colIdx) => {
    return rowIdx >= 0 && rowIdx < gridRows && colIdx >= 0 && colIdx < gridCols;
  };

  // Queue for the 0-1 BFS traversal. Stores objects for better readability
  // Each object represents a state: { r: row, c: col, w: current_warp_cost }
  const traversalQueue = [];

  // Define standard adjacent movement vectors (Type III addition for clarity)
  const cardinalDirections = [
    { dr: 1, dc: 0 }, { dr: -1, dc: 0 }, { dr: 0, dc: 1 }, { dr: 0, dc: -1 }
  ];

  // Core function to process a cell and add its reachable neighbors to the queue
  // Renamed from 'search' to 'processNode', parameters changed to an object
  const processNode = (currentNodeState) => {
    const { r: currentR, c: currentC, w: currentWarpCount } = currentNodeState;

    // Guard clause: Skip if out of bounds (Type III addition)
    if (!isValidCoordinate(currentR, currentC)) {
      return;
    }

    let cellValue = gameBoard[currentR][currentC]; // Can be '.', '#', or a number

    // If it's an obstacle, we cannot traverse through it
    if (cellValue === '#') {
      return;
    }

    // This is a 0-1 BFS. If a cell has already been visited and marked with a warp count,
    // it means we've found the optimal path to it. Due to the nature of 0-1 BFS
    // (0-cost moves unshifted, 1-cost moves pushed), the first time we visit a '.' cell
    // and assign it a `currentWarpCount`, that count is guaranteed to be minimal.
    // Therefore, if `cellValue` is already a number, we don't need to re-process.
    // This is an equivalent logic to the original's `else if (currentSocre === '.')`.
    if (cellValue !== '.') {
      return;
    }

    // Mark the current cell with the minimum warps required to reach it
    gameBoard[currentR][currentC] = currentWarpCount;

    // Explore 0-cost (adjacent) moves: Add to the front of the queue
    for (const direction of cardinalDirections) {
      const nextR = currentR + direction.dr;
      const nextC = currentC + direction.dc;
      traversalQueue.unshift({ r: nextR, c: nextC, w: currentWarpCount });
    }

    // Explore 1-cost (warp) moves: Add a 5x5 area to the back of the queue
    // This includes the current cell itself, but it will be filtered by isValidCoordinate or cellValue check.
    for (let rowOffset = -2; rowOffset <= 2; ++rowOffset) { // Changed loop increment style
      for (let colOffset = -2; colOffset <= 2; ++colOffset) { // Changed loop increment style
        const nextR = currentR + rowOffset;
        const nextC = currentC + colOffset;
        traversalQueue.push({ r: nextR, c: nextC, w: currentWarpCount + 1 });
      }
    }
  };

  // Initialize the BFS by adding the starting position with 0 warps
  traversalQueue.push({ r: beginRow, c: beginCol, w: 0 });

  // Main BFS loop. Continues as long as there are cells to explore.
  while (traversalQueue.length > 0) {
    // Dequeue the next cell to process
    const currentQueueItem = traversalQueue.shift();

    // Process the dequeued item
    processNode(currentQueueItem);

    // Optimization: If the target cell has been reached and marked with a number (cost),
    // we can stop early, as 0-1 BFS guarantees the first marked value is the minimum.
    const targetCellStatus = gameBoard[endRow][endCol];
    if (targetCellStatus !== '.' && targetCellStatus !== '#') {
      break;
    }
  }

  // Determine the final result based on the target cell's value
  const resultCost = gameBoard[endRow][endCol];
  if (resultCost === '.' || resultCost === '#') {
    // If the target is still '.' (unreachable) or '#' (obstacle), output -1
    console.log(-1);
  } else {
    // Otherwise, output the minimum warp cost to reach the target
    console.log(resultCost);
  }
}

// Invoke the main processing function with input read from standard input
// This setup is common in competitive programming environments.
processGridPathfinder(require("fs").readFileSync("/dev/stdin", "utf8"));