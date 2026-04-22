function SolveGridPath(puzzleDataStr) {
  // --- Constants and Helper Definitions ---
  const OBSTACLE_MARKER = '#'; // Denotes an impassable cell on the grid map
  const UNREACHABLE_PATH_COST = -1; // Specific value to indicate no valid path was found
  const MAX_POSSIBLE_COST = Infinity; // Initial cost for all grid cells, signifying unvisited or unreachable

  /**
   * Helper function to parse a line containing two space-separated numbers.
   * Uses the unary plus operator for concise string-to-number conversion.
   * @param {string} lineInput - The string line to parse, e.g., "10 20".
   * @returns {number[]} An array containing the two parsed numeric values.
   */
  const parseNumericPair = (lineInput) => {
    return lineInput.split(' ').map(val => +val);
  };

  /**
   * Determines if a given grid coordinate pair falls outside the defined grid boundaries.
   * @param {number} r - The row index to check.
   * @param {number} c - The column index to check.
   * @param {number} h - The total height of the grid.
   * @param {number} w - The total width of the grid.
   * @returns {boolean} True if the coordinates are out of bounds, false otherwise.
   */
  const isOutsideGridBounds = (r, c, h, w) => {
    return r < 0 || r >= h || c < 0 || c >= w;
  };

  // --- Input Parsing and Grid Initialization ---
  // Split the entire input string into individual lines.
  const rawInputLines = puzzleDataStr.split('\n');

  // Extract and parse the grid's dimensions (Height and Width) from the first line.
  const [gridHeight, gridWidth] = parseNumericPair(rawInputLines[0]);

  // Implement a basic guard clause for invalid grid dimensions.
  if (gridHeight <= 0 || gridWidth <= 0) {
    console.log(UNREACHABLE_PATH_COST);
    return;
  }

  // Parse starting coordinates and immediately convert to 0-indexed values.
  const [startY_1indexed, startX_1indexed] = parseNumericPair(rawInputLines[1]);
  const startRow = startY_1indexed - 1;
  const startCol = startX_1indexed - 1;

  // Parse goal coordinates and immediately convert to 0-indexed values.
  const [goalY_1indexed, goalX_1indexed] = parseNumericPair(rawInputLines[2]);
  const goalRow = goalY_1indexed - 1;
  const goalCol = goalX_1indexed - 1;

  // Construct the immutable grid layout from the input lines,
  // slicing to get only the map rows and splitting each into characters.
  const mapLayoutMatrix = rawInputLines.slice(3, 3 + gridHeight).map(rowString => rowString.split(''));

  // Initialize a separate 2D array to store the minimum warp cost to reach each cell.
  // All cells are initialized with MAX_POSSIBLE_COST (Infinity) to signify they haven't been visited yet.
  const minimumWarpCostGrid = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(MAX_POSSIBLE_COST)
  );

  // --- Pathfinding Algorithm Core (Breadth-First Search variant) ---
  // The queue will hold elements as `[[row_coordinate, col_coordinate], current_warp_cost]`.
  const traversalQueue = [];

  /**
   * Processes a cell by checking its validity, updating its minimum warp cost if a better path is found,
   * and then enqueuing its reachable neighbors for subsequent exploration.
   * This function acts as the core logic executed for each dequeued item in the BFS loop.
   * @param {number[]} currentCellCoords - The [row, col] coordinates of the cell currently being processed.
   * @param {number} pathWarpCost - The accumulated warp cost to arrive at `currentCellCoords`.
   */
  const visitAndEnqueueNeighbors = (currentCellCoords, pathWarpCost) => {
    const [row, col] = currentCellCoords;

    // --- Essential Guard Clauses for Efficient Traversal ---
    // 1. Skip if the cell is outside the grid boundaries.
    if (isOutsideGridBounds(row, col, gridHeight, gridWidth)) {
      return;
    }

    // 2. Skip if the cell is an obstacle (wall).
    if (mapLayoutMatrix[row][col] === OBSTACLE_MARKER) {
      return;
    }

    // 3. Skip if a path with an equal or lower warp cost has already been discovered for this cell.
    // This optimization prevents redundant processing and ensures the "minimum cost" property of BFS.
    if (pathWarpCost >= minimumWarpCostGrid[row][col]) {
      return;
    }

    // --- Update Cost and Enqueue Subsequent Moves ---
    // If we reach this point, it means a new or improved path to this cell has been found.
    minimumWarpCostGrid[row][col] = pathWarpCost;

    // --- Enqueue Direct (Non-Warp) Neighbors (Cost: `pathWarpCost + 0`) ---
    // These represent standard moves (up, down, left, right) without using a warp.
    const directMovementOffsets = [
      [0, 1],  // Move Right
      [0, -1], // Move Left
      [1, 0],  // Move Down
      [-1, 0]  // Move Up
    ];
    for (const [dr, dc] of directMovementOffsets) {
      const nextRow = row + dr;
      const nextCol = col + dc;
      // Enqueue the neighbor; its validity and cost will be assessed when it's dequeued later.
      traversalQueue.push([[nextRow, nextCol], pathWarpCost]);
    }

    // --- Enqueue Warp-Enabled Neighbors (Cost: `pathWarpCost + 1`) ---
    // These moves cover all cells within a 5x5 square centered on the current cell,
    // each costing one additional warp. The original problem statement implicitly
    // includes the current cell and direct neighbors in this 5x5 range.
    // The guard clauses at the beginning of this function handle filtering.
    for (let deltaRow = -2; deltaRow <= 2; deltaRow++) {
      for (let deltaCol = -2; deltaCol <= 2; deltaCol++) {
        const nextRow = row + deltaRow;
        const nextCol = col + deltaCol;
        // Enqueue with an incremented warp cost.
        traversalQueue.push([[nextRow, nextCol], pathWarpCost + 1]);
      }
    }
  };

  // --- Initialize BFS with the starting point ---
  // Pre-check the start coordinates for validity.
  if (isOutsideGridBounds(startRow, startCol, gridHeight, gridWidth) ||
      mapLayoutMatrix[startRow][startCol] === OBSTACLE_MARKER) {
    console.log(UNREACHABLE_PATH_COST);
    return;
  }
  // Add the initial starting position to the queue with a warp cost of 0.
  traversalQueue.push([[startRow, startCol], 0]);

  // --- Main BFS Traversal Loop ---
  // Continue processing cells from the queue until it becomes empty.
  while (traversalQueue.length > 0) {
    // Dequeue the next cell entry (FIFO behavior).
    const [currentPosition, currentCost] = traversalQueue.shift();
    // Invoke the helper function to process this cell and add its neighbors.
    visitAndEnqueueNeighbors(currentPosition, currentCost);
  }

  // --- Final Result Determination and Output ---
  // Retrieve the minimum warp cost found for the goal cell.
  let finalPathCost = minimumWarpCostGrid[goalRow][goalCol];

  // If the goal cell's cost is still MAX_POSSIBLE_COST, it means it was never reached.
  if (finalPathCost === MAX_POSSIBLE_COST) {
    console.log(UNREACHABLE_PATH_COST);
  } else {
    // Otherwise, print the calculated minimum warp cost.
    console.log(finalPathCost);
  }
}

// Standard competitive programming entry point: read input from stdin and execute the solver.
SolveGridPath(require("fs").readFileSync("/dev/stdin", "utf8"));