const cfg = { input: '/dev/stdin', newline: '\n' }; // Configuration for input source and line ending

const assert = require('assert'); // Standard assertion library, though not used in the main logic

const MATRIX_DIM = 16; // Defines the total number of tiles in the puzzle (e.g., 4x4 = 16)

// Prepare an array of single-element arrays, each containing a number from 0 to MATRIX_DIM-1.
// This is used to ensure object identity for tile comparisons later.
const numWrappers = [];
var idx; // Loop counter, mimicking original global 'i'
for (idx = 0; idx < MATRIX_DIM; idx++) {
  numWrappers.push([idx]);
}

// Read and parse the initial puzzle state from the configured input source.
// The input is expected to be 4 lines, each with 4 space-separated numbers.
let initialState = require('fs').readFileSync(cfg.input, 'ascii')
  .trim() // Remove leading/trailing whitespace
  .split(cfg.newline) // Split into lines
  .map(function (rowStr) { // Process each line
    return rowStr.split(' ').map(Number); // Split by space and convert to numbers
  });

// Flatten the 2D array into a single 1D array.
initialState = [].concat(initialState[0], initialState[1], initialState[2], initialState[3]);

// Replace each number in the initial state with its corresponding wrapper object.
initialState = initialState.map(function (val) {
  return numWrappers[val];
});

// Define the target (goal) state for the puzzle.
// It's typically 1, 2, ..., 15, then 0 (empty tile).
const targetState = [];
for (idx = 1; idx < MATRIX_DIM; idx++) {
  targetState.push(numWrappers[idx]);
}
targetState.push(numWrappers[0]); // The empty tile (0) goes last

// The current state of the puzzle, initialized from the input.
// Using concat to create a shallow copy, important for IDDFS backtracking.
let currentPuzzle = [].concat(initialState);

// Defines the adjacency list for each tile position in a 4x4 grid.
// For example, tile at index 0 (top-left) is adjacent to tiles at 1 and 4.
const adjacencies = [
  [1, 4], [0, 2, 5], [1, 3, 6], [2, 7],
  [0, 5, 8], [1, 4, 6, 9], [2, 5, 7, 10], [3, 6, 11],
  [4, 9, 12], [5, 8, 10, 13], [6, 9, 11, 14], [7, 10, 15],
  [8, 13], [9, 12, 14], [10, 13, 15], [11, 14]
];

/**
 * Performs an Iterative Deepening Depth-First Search (IDDFS) to find a solution.
 * This function is a recursive helper for a single depth limit.
 *
 * @param {Array<Array<number>>} puzzleBoard The current state of the puzzle board.
 * @param {number} currentDepth The current depth of the search.
 * @param {number} maxDepth The maximum depth allowed for this iteration.
 * @param {number} emptyTilePos The current index of the empty tile (0).
 * @returns {boolean} True if a solution is found within maxDepth, false otherwise.
 */
function iterativeDeepeningDFS(puzzleBoard, currentDepth, maxDepth, emptyTilePos) {
  var idx, heuristicDist, nextTilePos; // Declare variables at the top of the function scope

  // Base case: If current depth equals max depth, check if it's the goal state.
  if (currentDepth === maxDepth) {
    for (idx in puzzleBoard) {
      if (puzzleBoard[idx] !== targetState[idx]) {
        return false; // Not the goal state
      }
    }
    return true; // Reached goal state at maxDepth
  }

  // Heuristic pruning: Calculate Manhattan distance / 2 (simplified for 15-puzzle)
  // If current depth + heuristic estimate exceeds max depth, prune this branch.
  heuristicDist = 0;
  for (idx in puzzleBoard) {
    if (puzzleBoard[idx] !== targetState[idx]) {
      heuristicDist++; // Count misplaced tiles
    }
  }
  heuristicDist = Math.floor(heuristicDist / 2); // A very rough lower bound heuristic
  if (currentDepth + heuristicDist > maxDepth) {
    return false; // Prune: cannot reach goal within maxDepth
  }

  // Explore possible moves from the current empty tile position.
  for (idx in adjacencies[emptyTilePos]) {
    nextTilePos = adjacencies[emptyTilePos][idx]; // Get an adjacent tile's position

    // Simulate moving the adjacent tile into the empty space.
    // This effectively swaps the empty tile with the adjacent tile.
    puzzleBoard[emptyTilePos] = puzzleBoard[nextTilePos]; // Move adjacent tile to empty spot
    puzzleBoard[nextTilePos] = numWrappers[0]; // The adjacent spot becomes the new empty spot

    // Recursively call IDDFS for the new board state.
    if (iterativeDeepeningDFS(puzzleBoard, currentDepth + 1, maxDepth, nextTilePos)) {
      return true; // Solution found!
    }

    // Backtrack: Undo the move to explore other branches.
    puzzleBoard[nextTilePos] = puzzleBoard[emptyTilePos]; // Move tile back
    puzzleBoard[emptyTilePos] = numWrappers[0]; // Empty spot returns to original position
  }

  return false; // No solution found from this path within maxDepth
}

// Main loop for Iterative Deepening: gradually increase the maximum depth.
// The loop continues until a solution is found or a hard-coded max depth (45) is reached.
var finalStepsCount; // Loop counter, mimicking original global 'i'
for (finalStepsCount = 0; finalStepsCount <= 45; finalStepsCount++) {
  // Find the initial position of the empty tile (0).
  const initialEmptyPos = initialState.indexOf(numWrappers[0]);
  // Call the IDDFS function with the current depth limit.
  // Note: currentPuzzle is modified in place across iterations, preserving original behavior.
  if (iterativeDeepeningDFS(currentPuzzle, 0, finalStepsCount, initialEmptyPos)) {
    break; // Solution found, exit the loop.
  }
}

// Output the minimum number of moves required to solve the puzzle.
console.log(finalStepsCount);
