/**
 * Utility function to perform a deep copy of a 2D character array (grid).
 * Each inner array (row) is copied independently.
 * @param {string[][]} sourceGrid - The grid to copy.
 * @returns {string[][]} A new, independent copy of the grid.
 */
function duplicateGridState(sourceGrid) {
  return sourceGrid.map(function(rowArray) {
    return rowArray.slice(); // Creates a shallow copy of the row array, which is enough for array of primitives (chars)
  });
}

/**
 * Checks if a given coordinate (column, row) is within the grid boundaries.
 * @param {number} c - The column index.
 * @param {number} r - The row index.
 * @param {number} gridWidth - The total width of the grid.
 * @param {number} gridHeight - The total height of the grid.
 * @returns {boolean} True if the coordinate is within bounds, false otherwise.
 */
function isCoordinateValid(c, r, gridWidth, gridHeight) {
  return c >= 0 && r >= 0 && c < gridWidth && r < gridHeight;
}

/**
 * Calculates the minimum path length to collect a sequence of numbered items (1 to N)
 * in a grid, starting from a specified position.
 * This function uses a Breadth-First Search (BFS) approach, where the state
 * includes the current position, accumulated path length, the next item to collect,
 * and the current state of the grid (items collected are marked).
 *
 * @param {number} initialColPosition - The starting column index.
 * @param {number} initialRowPosition - The starting row index.
 * @param {string[][]} baseGridLayout - The immutable initial layout of the grid, including 'X' obstacles.
 * @param {number} maxCollectibleNumericalValue - The highest numbered item to collect (e.g., if 3, collect '1', '2', '3').
 * @param {number} totalGridWidth - The total width of the grid.
 * @param {number} totalGridHeight - The total height of the grid.
 * @returns {number} The shortest path length to collect all items, or -1 if no path exists.
 */
function calculateMinPathToCollectAll(
  initialColPosition,
  initialRowPosition,
  baseGridLayout,
  maxCollectibleNumericalValue,
  totalGridWidth,
  totalGridHeight
) {
  // Define possible movement directions (up, left, right, down)
  const movementVectors = [{
    dr: -1,
    dc: 0
  }, {
    dr: 0,
    dc: -1
  }, {
    dr: 0,
    dc: 1
  }, {
    dr: 1,
    dc: 0
  }, ];

  // The BFS queue will store state objects: { col, row, steps, nextTarget, currentGrid }
  const explorationQueue = [];
  // This set will store unique string representations of visited states to prevent cycles
  // Format: "col row nextTarget currentGridAsString"
  const visitedMapStates = new Set();

  // Create an initial mutable grid state for the first BFS node
  const startingGridState = duplicateGridState(baseGridLayout);
  // Mark the starting position in the dynamic grid state as empty/visited
  startingGridState[initialRowPosition][initialColPosition] = '.';

  // Construct the initial state object
  const initialState = {
    col: initialColPosition,
    row: initialRowPosition,
    steps: 0,
    nextTarget: 1, // Start by looking for item '1'
    grid: startingGridState,
  };

  // Generate a unique key for the initial state and add it to visited states
  const initialStateKey = `${initialState.col} ${initialState.row} ${initialState.nextTarget} ${initialState.grid.map(r => r.join('')).join('')}`;
  visitedMapStates.add(initialStateKey);
  explorationQueue.push(initialState);

  // Initialize the result variable; -1 indicates no path found
  let minimumSteps = -1;

  // Main BFS loop
  while (explorationQueue.length > 0) {
    const currentExplorationNode = explorationQueue.shift(); // Dequeue the next state to explore

    const {
      col: currCol,
      row: currRow,
      steps: pathLength,
      nextTarget: nextCollectibleTarget,
      grid: currentMapSnapshot
    } = currentExplorationNode;

    // Check if we have collected all required items
    if (nextCollectibleTarget > maxCollectibleNumericalValue) {
      minimumSteps = pathLength;
      break; // Goal reached, exit BFS
    }

    // Explore all four possible neighboring cells
    for (const move of movementVectors) {
      const neighborCol = currCol + move.dc;
      const neighborRow = currRow + move.dr;
      let targetForNeighbor = nextCollectibleTarget; // Assume the target remains the same initially

      // 1. Boundary check
      if (!isCoordinateValid(neighborCol, neighborRow, totalGridWidth, totalGridHeight)) {
        continue;
      }

      // 2. Obstacle check: 'X' are permanent obstacles (checked against the base layout)
      if (baseGridLayout[neighborRow][neighborCol] === 'X') {
        continue;
      }

      // Create a new grid snapshot for the potential next state
      const nextMapSnapshot = duplicateGridState(currentMapSnapshot);

      // Check if the neighbor cell contains the current target item
      // The cell content is a string, so compare with stringified number
      if (nextMapSnapshot[neighborRow][neighborCol] === String(targetForNeighbor)) {
        // If it's the target, increment the target level and mark the cell as collected
        targetForNeighbor++;
        nextMapSnapshot[neighborRow][neighborCol] = '.'; // Mark as empty/collected
      }

      // Create a unique identifier for this potential new state
      const stateKey = `${neighborCol} ${neighborRow} ${targetForNeighbor} ${nextMapSnapshot.map(r => r.join('')).join('')}`;

      // 3. Check if this state has already been visited
      if (visitedMapStates.has(stateKey)) {
        continue;
      }

      // Mark the new state as visited and add it to the queue
      visitedMapStates.add(stateKey);
      explorationQueue.push({
        col: neighborCol,
        row: neighborRow,
        steps: pathLength + 1, // Increment path length for this step
        nextTarget: targetForNeighbor,
        grid: nextMapSnapshot,
      });
    }
  }

  return minimumSteps;
}

// --- Main Program Execution ---

// Require the 'fs' module for file system operations
const fileSystem = require('fs');

// Read input from stdin, trim whitespace, and split into lines
const rawInputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Parse the first line for grid dimensions and maximum collectible value
// Expected format: "width height maxLevel"
const gridConfiguration = rawInputLines.shift().split(' ').map(Number);
const gridWidth = gridConfiguration[0];
const gridHeight = gridConfiguration[1];
const maxCollectibleNumericalValue = gridConfiguration[2];

// Initialize variables for the grid layout and starting position
const initialGridLayout = [];
let startingPointCoordinates = null; // [col, row]

// Process remaining lines to build the grid and find the 'S' position
for (let r = 0; r < gridHeight; r++) {
  const currentRowChars = rawInputLines.shift().split('');
  initialGridLayout.push(currentRowChars);

  // Check if 'S' is in the current row
  const startColIndex = currentRowChars.indexOf('S');
  if (startColIndex !== -1) {
    startingPointCoordinates = [startColIndex, r];
  }
}

// Perform validation before running the BFS
if (startingPointCoordinates === null) {
  console.error("Error: Starting point 'S' not found in the grid.");
  process.exit(1);
}
if (maxCollectibleNumericalValue <= 0) {
  console.error("Error: Maximum collectible value must be a positive integer.");
  process.exit(1);
}
if (gridWidth <= 0 || gridHeight <= 0) {
  console.error("Error: Grid dimensions must be positive.");
  process.exit(1);
}

// Execute the BFS to find the total path length
const finalResult = calculateMinPathToCollectAll(
  startingPointCoordinates[0],
  startingPointCoordinates[1],
  initialGridLayout,
  maxCollectibleNumericalValue,
  gridWidth,
  gridHeight
);

// Output the final calculated result
console.log(finalResult);