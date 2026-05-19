function ProcessInput(rawData) {
  // Split the entire input string into an array of individual lines.
  const inputLines = rawData.split('\n');

  // Parse the grid's height and width from the first line.
  // Each value is converted from string to integer.
  const gridDimensions = inputLines[0].split(' ').map(valStr => parseInt(valStr, 10));

  // Extract and parse the starting coordinates (row and column) from the second line.
  const startCoords = inputLines[1].split(' ').map(valStr => parseInt(valStr, 10));

  // Extract and parse the target coordinates (row and column) from the third line.
  const goalCoords = inputLines[2].split(' ').map(valStr => parseInt(valStr, 10));

  // Process the remaining lines to construct the grid map.
  // The `splice` method removes the first three lines and returns the rest.
  // Each remaining line (representing a row) is then split into an array of characters.
  const gridMap = inputLines.splice(3, gridDimensions[0]).map(rowStr => {
    return rowStr.split('');
  });

  // Initialize a queue for managing cells to be visited during the search.
  const processingQueue = [];

  // Define a nested function to explore a given cell and update the grid/queue.
  const exploreCell = (currentPosition, warpCount) => {
    const rowIdx = currentPosition[0]; // Current row index of the cell.
    const colIdx = currentPosition[1]; // Current column index of the cell.

    // Check if the current cell's coordinates are within the grid boundaries.
    // If outside, this path is invalid, so we return.
    if (rowIdx < 0 || gridDimensions[0] - 1 < rowIdx || colIdx < 0 || gridDimensions[1] - 1 < colIdx) {
      return;
    }

    // Retrieve the current content or recorded warp count for this cell.
    const cellValue = gridMap[rowIdx][colIdx];

    // If the cell is an obstacle ('#'), it cannot be traversed.
    if (cellValue === '#') {
      return;
    }
    // If the cell is an unvisited path ('.') or we found a more efficient path
    // (i.e., current `warpCount` is less than the previously recorded `cellValue`).
    else if (cellValue === '.' || cellValue > warpCount) {
      // Update the grid map at this cell with the new minimum warp count.
      gridMap[rowIdx][colIdx] = warpCount;

      // Add adjacent cells for "walk" moves (cost 0 warps).
      // These moves maintain the current warp count.
      processingQueue.push([[rowIdx + 1, colIdx], warpCount]);
      processingQueue.push([[rowIdx - 1, colIdx], warpCount]);
      processingQueue.push([[rowIdx, colIdx + 1], warpCount]);
      processingQueue.push([[rowIdx, colIdx - 1], warpCount]);

      // Add cells within a 5x5 square (2 units in each direction) for "warp" moves.
      // These moves incur an additional warp cost of 1.
      for (let rowOffset = -2; rowOffset < 3; rowOffset++) {
        for (let colOffset = -2; colOffset < 3; colOffset++) {
          processingQueue.push([[rowIdx + rowOffset, colIdx + colOffset], warpCount + 1]);
        }
      }
    }
  };

  // Initialize the search by adding the starting position to the queue.
  // Coordinates are adjusted from 1-based (input) to 0-based (array indexing).
  // The initial warp count is 0.
  processingQueue.push([[startCoords[0] - 1, startCoords[1] - 1], 0]);

  // Continue the breadth-first search as long as there are cells in the queue to process.
  while (processingQueue.length !== 0) {
    // Dequeue the next cell and its associated warp count.
    const queueEntry = processingQueue.shift();
    // Call the exploration function for the dequeued entry.
    exploreCell(queueEntry[0], queueEntry[1]);
  }

  // After the search completes, retrieve the final warp count at the goal position.
  // Adjust goal coordinates from 1-based to 0-based indexing.
  const finalWarpCount = gridMap[goalCoords[0] - 1][goalCoords[1] - 1];

  // Output the result: if the goal was reached (not '.'), print the warp count;
  // otherwise, print -1 indicating it's unreachable.
  console.log(finalWarpCount !== '.' ? finalWarpCount : -1);
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
