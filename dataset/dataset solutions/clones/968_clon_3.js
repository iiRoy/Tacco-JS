// A Type III clone of a 15-puzzle solver using Iterative Deepening Depth-First Search (IDDFS).
// This version includes substantial refactoring, dynamic generation of movement rules,
// and removal of unused components, while preserving the core algorithm.

// --- Application Configuration and Constants ---

// Configuration for input/output operations
const appConfig = {
  sourceFilePath: '/dev/stdin', // Default for Linux environments
  lineDelimiter: '\n', // Standard newline for Linux
  // The original code commented out a Windows config, so we'll maintain the Linux default.
  // For a more robust Type III, one could add platform detection:
  // sourceFilePath: (process.platform === 'win32' ? 'puzzle_input.txt' : '/dev/stdin'),
  // lineDelimiter: (process.platform === 'win32' ? '\r\n' : '\n'),
};

// Core puzzle parameters, making the grid dimensions explicit
const puzzleConstants = {
  TOTAL_TILES: 16, // The total number of squares on the board (e.g., 15 tiles + 1 empty space)
  GRID_SIDE: Math.sqrt(16), // The side length of the square grid (e.g., 4 for a 16-tile puzzle)
  EMPTY_TILE_ID: 0, // The numeric identifier for the empty space tile
};

// Enum-like object to represent possible movement directions, improving readability
const moveDirections = {
  NONE: 0, // Used for the initial state where no move has occurred
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
};

// --- Tile Representation ---

// Generates an array of tile objects. Each tile has an 'id' (its numeric value)
// and a 'label' (its string representation for display). The empty tile has 'id: 0'.
// This replaces the original `boxedNumber` array with a more descriptive object structure.
const tileObjects = Array.from({ length: puzzleConstants.TOTAL_TILES }, (_, i) => ({
  id: i,
  label: (i === puzzleConstants.EMPTY_TILE_ID ? ' ' : String(i)), // Empty tile label is a space
}));

// A direct reference to the empty tile object for easier comparison
const emptyTileReference = tileObjects[puzzleConstants.EMPTY_TILE_ID];

// --- Movement Mapping Generation (Type III: dynamic creation and refactoring) ---

// Pre-calculates valid neighbor indices for each tile position for each direction.
// This is a significant Type III change: it replaces the hardcoded `north`, `south`,
// `west`, `east` arrays with dynamically generated ones, making the solver
// adaptable to different `GRID_SIDE` values.
const adjacentTileIndices = {
  [moveDirections.UP]: new Array(puzzleConstants.TOTAL_TILES).fill(null),
  [moveDirections.DOWN]: new Array(puzzleConstants.TOTAL_TILES).fill(null),
  [moveDirections.LEFT]: new Array(puzzleConstants.TOTAL_TILES).fill(null),
  [moveDirections.RIGHT]: new Array(puzzleConstants.TOTAL_TILES).fill(null),
};

// Populate the movement maps based on grid dimensions
for (let currentPos = 0; currentPos < puzzleConstants.TOTAL_TILES; currentPos++) {
  const row = Math.floor(currentPos / puzzleConstants.GRID_SIDE);
  const col = currentPos % puzzleConstants.GRID_SIDE;

  // Calculate UP move target
  if (row > 0) {
    adjacentTileIndices[moveDirections.UP][currentPos] = currentPos - puzzleConstants.GRID_SIDE;
  }
  // Calculate DOWN move target
  if (row < puzzleConstants.GRID_SIDE - 1) {
    adjacentTileIndices[moveDirections.DOWN][currentPos] = currentPos + puzzleConstants.GRID_SIDE;
  }
  // Calculate LEFT move target
  if (col > 0) {
    adjacentTileIndices[moveDirections.LEFT][currentPos] = currentPos - 1;
  }
  // Calculate RIGHT move target
  if (col < puzzleConstants.GRID_SIDE - 1) {
    adjacentTileIndices[moveDirections.RIGHT][currentPos] = currentPos + 1;
  }
}

// A more direct mapping from move direction enum to corresponding array for cleaner access
const moveMaps = {
  [moveDirections.UP]: adjacentTileIndices[moveDirections.UP],
  [moveDirections.DOWN]: adjacentTileIndices[moveDirections.DOWN],
  [moveDirections.LEFT]: adjacentTileIndices[moveDirections.LEFT],
  [moveDirections.RIGHT]: adjacentTileIndices[moveDirections.RIGHT],
};

// Map opposite directions to easily prevent immediate reversals in the search
const oppositeMove = {
  [moveDirections.UP]: moveDirections.DOWN,
  [moveDirections.DOWN]: moveDirections.UP,
  [moveDirections.LEFT]: moveDirections.RIGHT,
  [moveDirections.RIGHT]: moveDirections.LEFT,
  [moveDirections.NONE]: moveDirections.NONE, // No opposite for the initial 'NONE' state
};

// --- Input Processing Helper (Type III: new helper function with validation) ---

/**
 * Reads and parses the puzzle input from a file, converting raw numbers into tile objects.
 * This helper encapsulates the file reading and initial data transformation,
 * and adds robust validation checks.
 * @param {string} filePath - Path to the input file.
 * @param {string} delimiter - Line delimiter used in the input file.
 * @param {number} expectedGridSide - The expected side length of the grid (e.g., 4).
 * @returns {Array<Object>} An array of tile objects representing the initial board state.
 * @throws {Error} If the input format is incorrect or invalid tile IDs are found.
 */
function readAndParsePuzzleInput(filePath, delimiter, expectedGridSide) {
  // Moved 'fs' require to local scope as it's only used here
  const fileSystem = require('fs');
  const rawInputContent = fileSystem.readFileSync(filePath, 'ascii').trim();
  const rawRows = rawInputContent.split(delimiter);

  // Type III: Input validation - check number of rows
  if (rawRows.length !== expectedGridSide) {
    throw new Error(`Input format error: Expected ${expectedGridSide} rows, but got ${rawRows.length}.`);
  }

  // Flatten and parse all numbers, adding validation for row length
  const parsedNumbers = rawRows.flatMap(textRow => {
    const rowNumbers = textRow.split(' ').map(Number);
    // Type III: Input validation - check number of elements per row
    if (rowNumbers.length !== expectedGridSide) {
      throw new Error(`Input format error: A row has ${rowNumbers.length} elements, expected ${expectedGridSide}.`);
    }
    return rowNumbers;
  });

  // Type III: Input validation - check total number of elements
  if (parsedNumbers.length !== expectedGridSide * expectedGridSide) {
    throw new Error(`Input format error: Total elements ${parsedNumbers.length}, expected ${expectedGridSide * expectedGridSide}.`);
  }

  // Convert numeric values from input into our predefined tile objects
  const boardTiles = parsedNumbers.map(tileId => {
    // Type III: Input validation - check if tile ID is within valid range
    if (tileId < 0 || tileId >= puzzleConstants.TOTAL_TILES) {
      throw new Error(`Input data error: Invalid tile ID ${tileId} found. Must be between 0 and ${puzzleConstants.TOTAL_TILES - 1}.`);
    }
    return tileObjects[tileId];
  });

  return boardTiles;
}

// --- Board State Initialization ---

// Initialize the starting board configuration by reading and parsing the input file
const initialBoardSetup = readAndParsePuzzleInput(
  appConfig.sourceFilePath,
  appConfig.lineDelimiter,
  puzzleConstants.GRID_SIDE
);

// Determine the initial position of the empty tile (the 'space' in the original code)
const startingEmptyTilePosition = initialBoardSetup.indexOf(emptyTileReference);
if (startingEmptyTilePosition === -1) {
  throw new Error("Critical error: Initial board setup does not contain the empty tile (ID 0)!");
}

// Initialize the target (solved) board configuration.
// This creates the standard solved state: 1, 2, 3, ..., 15, then the empty tile (0).
const solvedBoardTarget = Array.from({ length: puzzleConstants.TOTAL_TILES }, (_, i) => {
  const tileId = (i + 1) % puzzleConstants.TOTAL_TILES; // Generates 1, 2, ..., 15, then 0
  return tileObjects[tileId];
});

// --- Puzzle Solving Helper Functions (Type III: new helpers) ---

/**
 * Checks if the current board state matches the target solved state.
 * @param {Array<Object>} currentBoard - The current state of the puzzle board.
 * @param {Array<Object>} targetBoard - The solved state to compare against.
 * @returns {boolean} True if the board is solved, false otherwise.
 */
function isBoardSolved(currentBoard, targetBoard) {
  // Type III: Using Array.every for a more concise and readable check
  return currentBoard.every((tile, index) => tile === targetBoard[index]);
}

/**
 * Swaps two tile objects within a board array. This is a utility function
 * to simplify board manipulation during the search.
 * @param {Array<Object>} board - The board array.
 * @param {number} idx1 - Index of the first tile.
 * @param {number} idx2 - Index of the second tile.
 */
function swapTiles(board, idx1, idx2) {
  const temp = board[idx1];
  board[idx1] = board[idx2];
  board[idx2] = temp;
}

// --- Puzzle Solving Logic (Iterative Deepening Depth-First Search) ---

/**
 * Performs a recursive Depth-First Search for a solution within a given depth limit.
 * This function is the core of the Iterative Deepening Depth-First Search (IDDFS) algorithm.
 *
 * @param {Array<Object>} currentBoardState - The current configuration of the puzzle board. This array is modified during the search.
 * @param {number} currentSearchDepth - The number of moves made from the initial state to reach `currentBoardState`.
 * @param {number} maximumAllowedDepth - The maximum depth (number of moves) to explore in this specific IDDFS iteration.
 * @param {number} emptySpaceIndex - The current index (position) of the empty tile on the board.
 * @param {number} lastMovePrevented - The direction of the move that led to this `currentBoardState`.
 *                                     Used to prevent immediately reversing the last move (e.g., cannot move
 *                                     UP if the previous move was DOWN), which avoids redundant search paths.
 * @returns {boolean} True if a solution is found within the `maximumAllowedDepth` from this state, false otherwise.
 */
function exploreDepthFirst(
  currentBoardState,
  currentSearchDepth,
  maximumAllowedDepth,
  emptySpaceIndex,
  lastMovePrevented
) {
  // Type III: Guard clause for invalid depth limits, ensuring robustness
  if (maximumAllowedDepth < 0) {
    console.warn("Warning: exploreDepthFirst called with a negative maximumAllowedDepth.");
    return false;
  }

  // Base case for the recursion: If the current search depth equals the maximum allowed depth,
  // we check if the board is solved. If it is, we've found a solution within this depth limit.
  if (currentSearchDepth === maximumAllowedDepth) {
    return isBoardSolved(currentBoardState, solvedBoardTarget);
  }

  // Iterate through all four possible move directions (UP, DOWN, LEFT, RIGHT)
  // This refactors the original code's four repetitive `if` blocks into a loop.
  for (const moveDirection of [
    moveDirections.UP,
    moveDirections.DOWN,
    moveDirections.LEFT,
    moveDirections.RIGHT,
  ]) {
    // Type III: Prevent immediately undoing the previous move to avoid cycles and redundant paths
    if (moveDirection === lastMovePrevented) {
      continue;
    }

    // Determine the index of the tile that would be swapped with the empty space
    const tileToSwapIndex = moveMaps[moveDirection][emptySpaceIndex];

    // Check if the potential move is valid (i.e., not moving off the board)
    if (tileToSwapIndex !== null) {
      // Perform the move: swap the empty tile with the adjacent tile
      swapTiles(currentBoardState, emptySpaceIndex, tileToSwapIndex);

      // Recursively call `exploreDepthFirst` for the new board state
      const solutionFound = exploreDepthFirst(
        currentBoardState,
        currentSearchDepth + 1, // Increment depth
        maximumAllowedDepth,
        tileToSwapIndex, // The empty tile is now at `tileToSwapIndex`
        oppositeMove[moveDirection] // Pass the opposite of the current move to prevent immediate reversal
      );

      // If a solution is found in any deeper recursive call, propagate 'true' up the call stack
      if (solutionFound) {
        return true;
      }

      // Undo the move (backtrack) to restore the board to its state before this move,
      // allowing exploration of other possible moves from the current `emptySpaceIndex`.
      swapTiles(currentBoardState, emptySpaceIndex, tileToSwapIndex);
    }
  }

  // If no solution is found from this state within the `maximumAllowedDepth` after trying all valid moves
  return false;
}

// --- Main Iterative Deepening Loop ---

let minimumSolutionDepth = -1; // Initialize with an indicator that no solution has been found
const maximumSearchLimit = 45; // An arbitrary upper bound for the search depth, common for 15-puzzle.
                               // This prevents infinite loops in cases with no solution or very deep ones.

// Type III: Add a preliminary check to see if the initial board is already solved (depth 0)
if (isBoardSolved(initialBoardSetup, solvedBoardTarget)) {
  minimumSolutionDepth = 0;
} else {
  // Start the Iterative Deepening Depth-First Search from depth 1 up to the defined limit
  for (
    let currentDepthLimit = 1; // Start from 1, as depth 0 was checked above
    currentDepthLimit <= maximumSearchLimit;
    currentDepthLimit++
  ) {
    // Type III: Optional console log for progress tracking during long searches
    // console.log(`Searching for solution with depth limit: ${currentDepthLimit}`);

    // Create a mutable copy of the initial board for each IDDFS iteration.
    // This ensures that each depth limit search starts from the original configuration.
    const workingBoardCopy = [...initialBoardSetup];

    const found = exploreDepthFirst(
      workingBoardCopy,
      0, // The current search depth starts at 0 for each new `currentDepthLimit`
      currentDepthLimit,
      startingEmptyTilePosition,
      moveDirections.NONE // No previous move at the very start of a new depth-limited search
    );

    if (found) {
      minimumSolutionDepth = currentDepthLimit;
      break; // A solution was found at this depth, which means it's the minimum depth
    }
  }
}

// Output the result of the search
if (minimumSolutionDepth !== -1) {
  console.log(minimumSolutionDepth);
} else {
  // Type III: Provide a more informative message if no solution is found within the limit
  console.log(`No solution found within the maximum search depth of ${maximumSearchLimit}.`);
}