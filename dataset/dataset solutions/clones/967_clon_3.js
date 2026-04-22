// This module configures the application's environment settings.
// It determines the input source and line termination character based on the operating system.
const applicationConfiguration = {
  // inputPath: 'temporary_input.txt', // For Windows testing, uncomment and provide a file path.
  inputPath: '/dev/stdin', // Standard input stream for Linux/Unix systems, typically used in competitive programming.
  lineDelimiter: '\n' // Newline character for Linux/Unix. Use '\r\n' for Windows.
};

// Define core constants for the 15-puzzle board.
const GRID_SIDE = 4; // Represents a 4x4 puzzle grid.
const TOTAL_TILES = GRID_SIDE * GRID_SIDE; // Total number of tiles on the board (16 for a 4x4 grid).
const EMPTY_TILE_VALUE = 0; // The numerical value representing the empty slot in the puzzle.

// Import the file system module, necessary for reading input data.
const fileSystemAccess = require('fs');

// --- Utility Functions for Puzzle Management ---

/**
 * Initializes an array of unique tile objects. Each object encapsulates a tile's numerical value.
 * This approach allows for potential expansion with more tile properties in the future.
 * @returns {Array<Object>} An array where each element is an object like `{ value: number }`.
 */
function createTileReferenceObjects() {
  const tileObjectsCollection = [];
  for (let tileIdentifier = 0; tileIdentifier < TOTAL_TILES; tileIdentifier++) {
    tileObjectsCollection.push({ value: tileIdentifier }); // Store each tile as an object with its value.
  }
  return tileObjectsCollection;
}

// Global array holding reference objects for all possible tiles (0-15).
const tileReferenceObjects = createTileReferenceObjects();

/**
 * Provides direct access to the specific tile object that represents the empty slot.
 * @returns {Object} The tile object corresponding to the empty slot (i.e., `{ value: 0 }`).
 */
function getEmptySlotTileObject() {
  return tileReferenceObjects[EMPTY_TILE_VALUE];
}

/**
 * Reads and parses the initial puzzle configuration from the specified input source.
 * Includes robust error handling and validation for the input data format.
 * @param {Object} configuration - An object containing `inputPath` and `lineDelimiter`.
 * @returns {Array<Object>} An array of tile objects representing the puzzle's starting state.
 */
function parseInitialBoardConfiguration(configuration) {
  try {
    // Read the entire input file as a string using UTF-8 encoding.
    const rawInputData = fileSystemAccess.readFileSync(configuration.inputPath, 'utf8');

    // Process the raw input: trim whitespace, split into lines, and parse numbers.
    const parsedLineArrays = rawInputData
      .trim() // Remove any leading/trailing whitespace from the entire input.
      .split(configuration.lineDelimiter) // Split into an array of strings, one for each line.
      .map(lineText => lineText.split(' ').map(Number)); // Split each line by space and convert to numbers.

    // Validate the parsed input's dimensions.
    if (parsedLineArrays.length !== GRID_SIDE || parsedLineArrays.flat().length !== TOTAL_TILES) {
      console.error('Error: Input data format is incorrect. Expected 4 lines, each with 4 space-separated numbers.');
      process.exit(1); // Terminate execution due to invalid input.
    }

    // Flatten the 2D array of numbers into a single 1D array.
    const flatNumericalTiles = parsedLineArrays.flat();

    // Map each numerical value to its corresponding tile reference object.
    const startingArrangement = flatNumericalTiles.map(numericalValue => {
      // Validate that tile values are within the expected range (0 to 15).
      if (numericalValue < 0 || numericalValue >= TOTAL_TILES) {
        console.error(`Error: Invalid tile value '${numericalValue}' found in input data.`);
        process.exit(1);
      }
      return tileReferenceObjects[numericalValue]; // Return the pre-created tile object.
    });

    return startingArrangement; // Return the fully parsed and validated initial board state.

  } catch (error) {
    // Catch and report any errors during file reading or parsing.
    console.error(`Failed to read or parse input from ${configuration.inputPath}:`, error.message);
    process.exit(1);
  }
}

/**
 * Constructs the target solved state of the 15-puzzle (tiles 1-15 followed by the empty tile 0).
 * @returns {Array<Object>} An array of tile objects representing the solved board state.
 */
function generateSolvedBoardState() {
  const solvedArrangement = [];
  // Add tiles 1 through 15 in ascending order.
  for (let tileValue = 1; tileValue < TOTAL_TILES; tileValue++) {
    solvedArrangement.push(tileReferenceObjects[tileValue]);
  }
  // Place the empty tile (0) at the very end, which is the standard solved configuration.
  solvedArrangement.push(getEmptySlotTileObject());
  return solvedArrangement;
}

/**
 * Compares a given board layout with the target solved layout to determine if the puzzle is solved.
 * @param {Array<Object>} currentLayout - The current arrangement of tile objects on the board.
 * @param {Array<Object>} targetLayout - The desired solved arrangement of tile objects.
 * @returns {boolean} True if `currentLayout` exactly matches `targetLayout`, false otherwise.
 */
function checkIsBoardSolved(currentLayout, targetLayout) {
  // Iterate through each position on the board.
  for (let position = 0; position < TOTAL_TILES; position++) {
    // If any tile at `position` does not match its counterpart in the `targetLayout`, the board is not solved.
    if (currentLayout[position] !== targetLayout[position]) {
      return false;
    }
  }
  return true; // All tiles are in their correct positions.
}

/**
 * Calculates a simplified heuristic: the count of misplaced tiles divided by two.
 * This is an admissible heuristic for the 15-puzzle, providing an underestimate of moves.
 * @param {Array<Object>} currentLayout - The current arrangement of tile objects.
 * @param {Array<Object>} targetLayout - The target solved arrangement.
 * @returns {number} An estimate of the minimum number of additional moves required.
 */
function calculateMisplacedTilesHeuristic(currentLayout, targetLayout) {
  let misplacedTileCount = 0;
  for (let position = 0; position < TOTAL_TILES; position++) {
    // If a tile is not in its designated target position, increment the counter.
    if (currentLayout[position] !== targetLayout[position]) {
      misplacedTileCount++;
    }
  }
  // Divide by 2 as a basic approximation, since each move typically corrects at most two misplaced tiles.
  return Math.floor(misplacedTileCount / 2);
}

/**
 * A generic helper function to swap two elements within an array at specified indices.
 * This is used to simulate tile movements on the puzzle board.
 * @param {Array<any>} arrayToModify - The array on which the swap operation will be performed.
 * @param {number} indexOne - The index of the first element to swap.
 * @param {number} indexTwo - The index of the second element to swap.
 */
function swapElementsInArray(arrayToModify, indexOne, indexTwo) {
  const temporaryHolder = arrayToModify[indexOne];
  arrayToModify[indexOne] = arrayToModify[indexTwo];
  arrayToModify[indexTwo] = temporaryHolder;
}


// --- Main Puzzle Data Structures Initialization ---

const initialTileArrangement = parseInitialBoardConfiguration(applicationConfiguration);
const targetTileArrangement = generateSolvedBoardState();

// The mutable state of the puzzle board. It's initialized as a shallow copy
// of the initial arrangement to allow modifications during the search.
const currentPuzzleBoard = initialTileArrangement.slice();

// This adjacency list defines the possible moves for each tile position on a 4x4 grid.
// `validTileMovements[i]` contains an array of indices that are adjacent to position `i`.
const validTileMovements = [
  /* 0  */ [1, 4],
  /* 1  */ [0, 2, 5],
  /* 2  */ [1, 3, 6],
  /* 3  */ [2, 7],
  /* 4  */ [0, 5, 8],
  /* 5  */ [1, 4, 6, 9],
  /* 6  */ [2, 5, 7, 10],
  /* 7  */ [3, 6, 11],
  /* 8  */ [4, 9, 12],
  /* 9  */ [5, 8, 10, 13],
  /* 10 */ [6, 9, 11, 14],
  /* 11 */ [7, 10, 15],
  /* 12 */ [8, 13],
  /* 13 */ [9, 12, 14],
  /* 14 */ [10, 13, 15],
  /* 15 */ [11, 14]
];

/**
 * Implements the core logic for the Iterative Deepening Depth-First Search (IDDFS) algorithm.
 * This function explores possible puzzle states up to a specified maximum depth.
 *
 * @param {Array<Object>} layoutSnapshot - The current configuration of the puzzle board. This array is modified in place.
 * @param {number} currentDepth - The number of moves already made to reach `layoutSnapshot`.
 * @param {number} maxDepthLimit - The maximum allowed depth for the current iteration of the search.
 * @param {number} emptySlotPosition - The current index of the empty tile on the board.
 * @returns {boolean} True if a solution is found within `maxDepthLimit`, false otherwise.
 */
function explorePuzzleState(layoutSnapshot, currentDepth, maxDepthLimit, emptySlotPosition) {
  // --- Base Case: Maximum depth reached for this iteration ---
  if (currentDepth === maxDepthLimit) {
    // If we've hit the depth limit, check if the current state is the solved state.
    return checkIsBoardSolved(layoutSnapshot, targetTileArrangement);
  }

  // --- Pruning: Heuristic-based early exit ---
  // Estimate the minimum number of moves still needed to reach the goal.
  const misplacedTilesEstimate = calculateMisplacedTilesHeuristic(layoutSnapshot, targetTileArrangement);

  // If the sum of current depth and the estimated remaining moves exceeds the `maxDepthLimit`,
  // then this path cannot lead to a solution within the current depth constraint.
  if (currentDepth + misplacedTilesEstimate > maxDepthLimit) {
    return false; // Prune this branch of the search tree.
  }

  // --- Recursive Step: Explore neighboring states ---
  // Get all valid positions where the empty slot can move to.
  const possibleAdjacentMoves = validTileMovements[emptySlotPosition];

  // Iterate through each potential move.
  for (let moveCounter = 0; moveCounter < possibleAdjacentMoves.length; moveCounter++) {
    const neighborTileIndex = possibleAdjacentMoves[moveCounter];

    // Perform the move: swap the empty slot with the neighboring tile.
    // This effectively moves the neighbor tile into the empty slot's original position.
    swapElementsInArray(layoutSnapshot, emptySlotPosition, neighborTileIndex);

    // Recursively call `explorePuzzleState` for the new board configuration.
    // Increment the depth and update the empty slot's new position.
    if (explorePuzzleState(layoutSnapshot, currentDepth + 1, maxDepthLimit, neighborTileIndex)) {
      return true; // If a solution is found in this recursive call, propagate `true` upwards.
    }

    // --- Backtrack: Undo the move ---
    // If the recursive call did not find a solution, undo the swap to revert the board
    // to its state before the current move. This is crucial for exploring other paths.
    swapElementsInArray(layoutSnapshot, emptySlotPosition, neighborTileIndex);
  }

  return false; // No solution was found from this particular state within the given `maxDepthLimit`.
}


// --- Main Execution Block ---

// Record the starting time to measure the performance of the algorithm.
const executionStartTime = performance.now();

let finalSolutionDepth = -1; // Variable to store the depth of the first found solution.
const MAX_SEARCH_DEPTH_HARD_LIMIT = 50; // A practical upper bound for search depth in a 15-puzzle.
                                        // Solutions rarely exceed this for solvable instances.

// Locate the initial position of the empty tile on the board.
const initialEmptySlotIndex = initialTileArrangement.indexOf(getEmptySlotTileObject());
if (initialEmptySlotIndex === -1) {
  console.error("Error: The empty tile (value 0) was not found in the initial puzzle configuration.");
  process.exit(1);
}

// The Iterative Deepening loop: gradually increases the maximum allowed search depth.
for (let currentMaxDepth = 0; currentMaxDepth <= MAX_SEARCH_DEPTH_HARD_LIMIT; currentMaxDepth++) {
  // Call the depth-limited search function. `currentPuzzleBoard` is modified in place
  // but restored by backtracking within `explorePuzzleState`.
  if (explorePuzzleState(currentPuzzleBoard, 0, currentMaxDepth, initialEmptySlotIndex)) {
    finalSolutionDepth = currentMaxDepth; // A solution was found at this depth.
    break; // Exit the loop, as IDDFS guarantees the first found solution is the shortest.
  }
}

// Calculate the total time taken for execution.
const executionEndTime = performance.now();
const totalElapsedTimeMs = (executionEndTime - executionStartTime).toFixed(2);

// Output the result of the puzzle-solving attempt.
if (finalSolutionDepth !== -1) {
  console.log(finalSolutionDepth); // Print the minimum number of moves to solve the puzzle.
  // console.log(`Puzzle solved in ${finalSolutionDepth} moves. (Execution Time: ${totalElapsedTimeMs} ms)`);
} else {
  // If `finalSolutionDepth` is still -1, no solution was found within the hard limit.
  console.log(`No solution found within ${MAX_SEARCH_DEPTH_HARD_LIMIT} moves. (Execution Time: ${totalElapsedTimeMs} ms)`);
}