/**
 * Navigates a grid-based labyrinth to collect a sequence of numbered items.
 * Implements a Breadth-First Search (BFS) algorithm to find the shortest path
 * that visits all required items in order.
 *
 * @param {number} startCol - The starting column index (X-coordinate) of the journey.
 * @param {number} startRow - The starting row index (Y-coordinate) of the journey.
 * @param {string[][]} gridMap - A 2D array representing the labyrinth layout.
 *                               'S' for start, 'X' for obstacles, '1'...'N' for items.
 * @param {number} mapHeight - The height of the grid map (number of rows).
 * @param {number} mapWidth - The width of the grid map (number of columns).
 * @param {number} maxRequiredPower - The highest numbered item that must be collected.
 * @returns {number} The minimum number of steps required to collect all items,
 *                   or -1 if no such path exists (though problem constraints usually guarantee a path).
 */
const exploreLabyrinth = (startCol, startRow, gridMap, mapHeight, mapWidth, maxRequiredPower) => {
  // Define directional offsets for 4-way movement (up, down, left, right)
  // These arrays correspond to changes in [column, row] respectively.
  const deltaCols = [0, -1, 1, 0]; // Change in X (column)
  const deltaRows = [-1, 0, 0, 1]; // Change in Y (row)

  let totalStepsAccumulator = 0; // Stores the final path length

  // The exploration queue for BFS. Each entry is an object representing a state:
  // { col: current_column, row: current_row, distance: steps_taken, nextItemTarget: item_to_collect_next }
  const explorationQueue = [];
  let currentQueueIndex = 0; // Pointer for dequeuing elements (optimizes array.shift() performance)

  // A 2D array to keep track of the highest 'nextItemTarget' reached at each grid cell.
  // This helps in pruning redundant paths: if we arrive at a cell having already achieved
  // a higher or equal 'nextItemTarget' via another path, we don't need to explore this path further.
  // Initialized with 0, as '1' is typically the first item to collect.
  // The structure is minNextItemTargetReached[column][row].
  const minNextItemTargetReached = Array.from({ length: mapWidth }, () =>
    Array.from({ length: mapHeight }, () => 0)
  );

  // Initialize the starting position in the queue and the tracking grid.
  // At the start, we've taken 0 steps and the next item we're looking for is '1'.
  explorationQueue.push({ col: startCol, row: startRow, distance: 0, nextItemTarget: 1 });
  minNextItemTargetReached[startCol][startRow] = 1; // Mark as visited, aiming for item 1

  // Begin the BFS traversal
  while (currentQueueIndex < explorationQueue.length) {
    const currentNode = explorationQueue[currentQueueIndex++]; // Dequeue the next node
    const { col: currCol, row: currRow, distance: currentDistance, nextItemTarget: currentNextItemTarget } = currentNode;

    // Check if we have successfully collected all required items.
    // If 'nextItemTarget' has become 'maxRequiredPower + 1', it means we just collected 'maxRequiredPower'.
    if (currentNextItemTarget > maxRequiredPower) {
      totalStepsAccumulator = currentDistance; // Store the distance of this successful path
      break; // All items collected, terminate BFS
    }

    // Explore all four possible directions (up, down, left, right)
    for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
      const nextCol = currCol + deltaCols[directionIndex];
      const nextRow = currRow + deltaRows[directionIndex];
      let potentialNextItemTarget = currentNextItemTarget; // Assume next item target remains the same initially

      // --- Boundary and Obstacle Checks ---
      // Ensure the next position is within the grid boundaries
      if (nextCol < 0 || nextRow < 0 || nextCol >= mapWidth || nextRow >= mapHeight) {
        continue; // Out of bounds, skip this direction
      }

      // Check if the next position is an obstacle ('X')
      if (gridMap[nextRow][nextCol] === 'X') {
        continue; // Cannot move through obstacles, skip
      }

      // --- Item Collection Logic ---
      // Check if the current cell contains the item we are currently looking for.
      // If it does, we "collect" it, and the next item we'll target will be incremented.
      if (gridMap[nextRow][nextCol] === String(potentialNextItemTarget)) {
        potentialNextItemTarget++; // Increment the target as this item is collected
      }

      // --- Pruning and State Update ---
      // If we've already reached this cell (nextCol, nextRow) with an equal or better
      // 'nextItemTarget' achievement, there's no need to explore this path again.
      // 'Better' means we've already collected more items by the time we reached this cell.
      if (minNextItemTargetReached[nextCol][nextRow] >= potentialNextItemTarget) {
        continue; // This path is not optimal for item collection, skip
      }

      // Update the tracking grid: we've found a better path to (nextCol, nextRow)
      // in terms of item collection progress.
      minNextItemTargetReached[nextCol][nextRow] = potentialNextItemTarget;

      // Add the new valid and improved state to the exploration queue
      explorationQueue.push({
        col: nextCol,
        row: nextRow,
        distance: currentDistance + 1, // Increment distance for the new step
        nextItemTarget: potentialNextItemTarget,
      });
    }
  }

  // Return the accumulated total steps. If no path was found, it remains 0 (or could be -1 if initialized differently).
  return totalStepsAccumulator;
};

/**
 * Parses raw input data from stdin into structured grid and parameters.
 * @param {string} rawInput - The entire input string from stdin.
 * @returns {{
 *   gridMap: string[][],
 *   mapHeight: number,
 *   mapWidth: number,
 *   maxRequiredPower: number,
 *   startingPosition: [number, number] // [col, row]
 * }} Parsed data.
 */
const parseInputData = (rawInput) => {
  const inputLines = rawInput.trim().split('\n');

  // Parse the first line for height, width, and target power level.
  const [heightStr, widthStr, powerStr] = inputLines.shift().split(' ');
  const mapHeight = parseInt(heightStr, 10);
  const mapWidth = parseInt(widthStr, 10);
  const maxRequiredPower = parseInt(powerStr, 10);

  // Basic validation for parsed dimensions and power
  if (isNaN(mapHeight) || isNaN(mapWidth) || isNaN(maxRequiredPower) || mapHeight <= 0 || mapWidth <= 0 || maxRequiredPower < 0) {
    throw new Error('Invalid map dimensions or target power level provided in input.');
  }

  const gridMapData = [];
  let startingPos = [-1, -1]; // Initialize with invalid coordinates

  // Iterate through the remaining lines to build the grid map and find the 'S' (start) position.
  for (let rowIndex = 0; rowIndex < mapHeight; rowIndex++) {
    const currentRowChars = inputLines.shift().split('');
    if (currentRowChars.length !== mapWidth) {
      throw new Error(`Row ${rowIndex} has incorrect width. Expected ${mapWidth}, got ${currentRowChars.length}.`);
    }

    const startColIndex = currentRowChars.indexOf('S');
    if (startColIndex !== -1) {
      startingPos = [startColIndex, rowIndex]; // Store as [column, row]
    }
    gridMapData.push(currentRowChars);
  }

  // Ensure a starting position 'S' was found
  if (startingPos[0] === -1 || startingPos[1] === -1) {
    throw new Error('Starting position "S" not found in the grid map.');
  }

  return {
    gridMap: gridMapData,
    mapHeight: mapHeight,
    mapWidth: mapWidth,
    maxRequiredPower: maxRequiredPower,
    startingPosition: startingPos,
  };
};

// --- Main Execution Block ---
try {
  // Read all input from standard input
  const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

  // Parse the input data into a structured format
  const { gridMap, mapHeight, mapWidth, maxRequiredPower, startingPosition } = parseInputData(rawInputContent);

  // Extract starting coordinates
  const [initialXCoordinate, initialYCoordinate] = startingPosition;

  // Execute the labyrinth exploration algorithm
  const finalPathResult = exploreLabyrinth(
    initialXCoordinate,
    initialYCoordinate,
    gridMap,
    mapHeight,
    mapWidth,
    maxRequiredPower
  );

  // Output the final result to standard output
  console.log(finalPathResult);

} catch (error) {
  // Log any errors encountered during input parsing or execution
  console.error('An error occurred:', error.message);
  // Optionally exit with a non-zero status code to indicate failure
  process.exit(1);
}