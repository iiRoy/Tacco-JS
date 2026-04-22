const RIGHT_DIR_CHAR = 'R';
const LEFT_DIR_CHAR = 'L';
const UP_DIR_CHAR = 'U';
const DOWN_DIR_CHAR = 'D';

const GRID_VALID_PATH_VALUE = 1;
// GRID_INVALID_PATH_VALUE could be 0, not explicitly used but for completeness.

/**
 * Defines the possible movements and their order for each direction.
 * Each entry in the array:
 * {
 *   pathChar: string,   // Character to append to the path string for this move
 *   deltaCol: number,   // Change in column position (x-coordinate)
 *   deltaRow: number,   // Change in row position (y-coordinate)
 *   nextDir: string     // The new direction after this move
 * }
 * The last entry in each array is considered the 'fallback' move if prior options are invalid.
 */
const MOVEMENT_STRATEGIES = new Map([
  [RIGHT_DIR_CHAR, [
    { pathChar: UP_DIR_CHAR, deltaCol: 1, deltaRow: -1, nextDir: UP_DIR_CHAR },
    { pathChar: RIGHT_DIR_CHAR, deltaCol: 1, deltaRow: 0, nextDir: RIGHT_DIR_CHAR },
    { pathChar: DOWN_DIR_CHAR, deltaCol: 1, deltaRow: 1, nextDir: DOWN_DIR_CHAR },
    { pathChar: LEFT_DIR_CHAR, deltaCol: 0, deltaRow: 0, nextDir: LEFT_DIR_CHAR } // Fallback: Stay, change direction
  ]],
  [LEFT_DIR_CHAR, [
    { pathChar: DOWN_DIR_CHAR, deltaCol: 0, deltaRow: 1, nextDir: DOWN_DIR_CHAR },
    { pathChar: LEFT_DIR_CHAR, deltaCol: -1, deltaRow: 0, nextDir: LEFT_DIR_CHAR },
    { pathChar: UP_DIR_CHAR, deltaCol: 0, deltaRow: -1, nextDir: UP_DIR_CHAR },
    { pathChar: RIGHT_DIR_CHAR, deltaCol: 0, deltaRow: 0, nextDir: RIGHT_DIR_CHAR } // Fallback: Stay, change direction
  ]],
  [DOWN_DIR_CHAR, [
    { pathChar: RIGHT_DIR_CHAR, deltaCol: 0, deltaRow: 1, nextDir: RIGHT_DIR_CHAR },
    { pathChar: DOWN_DIR_CHAR, deltaCol: 0, deltaRow: 2, nextDir: DOWN_DIR_CHAR }, // Original had y+2
    { pathChar: LEFT_DIR_CHAR, deltaCol: -1, deltaRow: 1, nextDir: LEFT_DIR_CHAR },
    { pathChar: UP_DIR_CHAR, deltaCol: 0, deltaRow: 0, nextDir: UP_DIR_CHAR } // Fallback: Stay, change direction
  ]],
  [UP_DIR_CHAR, [
    { pathChar: LEFT_DIR_CHAR, deltaCol: -1, deltaRow: -1, nextDir: LEFT_DIR_CHAR },
    { pathChar: UP_DIR_CHAR, deltaCol: 0, deltaRow: -2, nextDir: UP_DIR_CHAR }, // Original had y-2
    { pathChar: RIGHT_DIR_CHAR, deltaCol: 0, deltaRow: -1, nextDir: RIGHT_DIR_CHAR },
    { pathChar: DOWN_DIR_CHAR, deltaCol: 0, deltaRow: 0, nextDir: DOWN_DIR_CHAR } // Fallback: Stay, change direction
  ]]
]);

/**
 * A memoization cache to store results of `traverseGrid` for previously visited states.
 * This prevents redundant computations for the same (column, row, direction) state.
 */
const pathSegmentCache = new Map();

/**
 * Determines if a specified grid cell coordinate is within the grid boundaries
 * and if its value signifies a traversable path.
 *
 * @param {Array<Array<number>>} activeGrid The 2D array representing the grid structure.
 * @param {number} xCoord The column index (0-based) to evaluate.
 * @param {number} yCoord The row index (0-based) to evaluate.
 * @returns {boolean} True if the cell is a valid and traversable path segment, false otherwise.
 */
function isValidPathSegment(activeGrid, xCoord, yCoord) {
  // Guard clauses for potential empty or malformed grid input.
  if (!Array.isArray(activeGrid) || activeGrid.length === 0 || !Array.isArray(activeGrid[0])) {
    // If the grid itself is invalid (empty or first row is not an array), no segment is valid.
    return false;
  }

  const numRows = activeGrid.length;
  const numCols = activeGrid[0].length; // Assumes a rectangular grid where all rows have the same length.

  // Check if the given coordinates fall outside the grid's defined boundaries.
  const isRowOutOfBounds = (yCoord < 0 || yCoord >= numRows);
  const isColOutOfBounds = (xCoord < 0 || xCoord >= numCols);

  if (isRowOutOfBounds || isColOutOfBounds) {
    return false; // Coordinates are out of bounds.
  }

  // Finally, check if the value at the valid coordinate signifies a path (e.g., value 1).
  return activeGrid[yCoord][xCoord] === GRID_VALID_PATH_VALUE;
}

/**
 * Recursively explores the grid to construct a path string based on specific movement rules.
 * The path is built by appending characters representing each move.
 *
 * @param {Array<Array<number>>} currentGrid The 2D array representing the grid.
 * @param {number} currentX The current column position of the traversal.
 * @param {number} currentY The current row position of the traversal.
 * @param {string} currentDirection The current orientation/direction ('R', 'L', 'U', 'D').
 * @returns {string} A string representing the sequence of moves from the current state to the end,
 *                   or an empty string if the termination condition is met. Returns 'ERR!' on critical error.
 */
function traverseGrid(currentGrid, currentX, currentY, currentDirection) {
  // Generate a unique identifier for the current state to use with memoization.
  const stateIdentifier = `${currentX},${currentY},${currentDirection}`;

  // Check if the result for this state has already been computed and cached.
  if (pathSegmentCache.has(stateIdentifier)) {
    return pathSegmentCache.get(stateIdentifier);
  }

  // Base case for recursion: The original problem terminates when at (0,0) and facing 'L'.
  // This signifies the successful completion of the pathfinding logic.
  if (currentX === 0 && currentY === 0 && currentDirection === LEFT_DIR_CHAR) {
    return ''; // Return an empty string, indicating no further moves are needed.
  }

  // Retrieve the set of specific movement rules applicable to the current direction.
  const applicableMoves = MOVEMENT_STRATEGIES.get(currentDirection);

  // Critical error check: If no rules are defined for the current direction, something is fundamentally wrong.
  if (!applicableMoves) {
    console.error(`Runtime Error: No movement strategy defined for current direction: ${currentDirection}`);
    return 'ERR!'; // Return an error indicator.
  }

  let resultingPath = '';

  // Iterate through the primary movement options (all except the last one, which is the fallback).
  for (let i = 0; i < applicableMoves.length - 1; i++) {
    const potentialMove = applicableMoves[i];
    const nextX = currentX + potentialMove.deltaCol;
    const nextY = currentY + potentialMove.deltaRow;

    // If the potential next segment is valid according to the grid, take this path.
    if (isValidPathSegment(currentGrid, nextX, nextY)) {
      // Recursively find the rest of the path and prepend the character for the current move.
      resultingPath = potentialMove.pathChar + traverseGrid(currentGrid, nextX, nextY, potentialMove.nextDir);
      pathSegmentCache.set(stateIdentifier, resultingPath); // Cache the result before returning.
      return resultingPath;
    }
  }

  // If none of the primary moves were valid, execute the fallback move (the last one in the strategy array).
  // The original logic implies that the fallback move is always taken if others fail, without further validation
  // of its target cell being a '1'. It's a way to change state to potentially find a path later.
  const fallbackMove = applicableMoves[applicableMoves.length - 1];
  const nextX = currentX + fallbackMove.deltaCol;
  const nextY = currentY + fallbackMove.deltaRow;

  resultingPath = fallbackMove.pathChar + traverseGrid(currentGrid, nextX, nextY, fallbackMove.nextDir);
  pathSegmentCache.set(stateIdentifier, resultingPath); // Cache the result before returning.
  return resultingPath;
}

/**
 * The primary entry point for the application. It processes raw input data,
 * transforms it into a grid, and then initiates the pathfinding algorithm.
 *
 * @param {string} rawInputData The raw string content read from the input source (e.g., stdin).
 */
function initiatePathfinding(rawInputData) {
  // Input validation: Ensure the input data is a non-empty string.
  if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
    console.error("Error: Input data is empty or not a valid string. Cannot proceed with pathfinding.");
    return; // Exit the function if input is invalid.
  }

  // Pre-process the raw input: remove any trailing newline characters and split into lines.
  const lineSegments = rawInputData.trim().split('\n');

  // Transform the array of line strings into a 2D array (gridMap) of numbers.
  // Each character in a line is converted to its numeric equivalent.
  const gridMap = [];
  for (let rowIdx = 0; rowIdx < lineSegments.length; rowIdx++) {
    const currentLine = lineSegments[rowIdx].trim();
    // Skip any empty lines to avoid errors when trying to split and map an empty string.
    if (currentLine === '') {
      continue;
    }
    gridMap.push(currentLine.split('').map(Number));
  }

  // Ensure the grid isn't empty after parsing.
  if (gridMap.length === 0) {
      console.error("Error: Grid map is empty after parsing input. No path to find.");
      return;
  }

  // Begin the pathfinding process from the initial state: (0,0) and facing 'R'.
  // The problem statement implies an initial 'R' is prepended to the result of the recursive function.
  const computedPathSegment = traverseGrid(gridMap, 0, 0, RIGHT_DIR_CHAR);

  // Output the final path string, including the initial 'R'.
  console.log(RIGHT_DIR_CHAR + computedPathSegment);
}

// Execute the main pathfinding logic by reading data from standard input.
// This is the common way to handle input in competitive programming environments for Node.js.
initiatePathfinding(require('fs').readFileSync('/dev/stdin', 'utf8'));