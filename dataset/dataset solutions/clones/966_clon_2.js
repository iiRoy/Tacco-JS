let cfg = { input: '/dev/stdin', newline: '\n' }; // Configuration for input source and line ending.

const assert = require('assert'); // The 'assert' module is included but not actively used in this script.

const GRID_DIM = 0x10; // Represents the total number of cells in the puzzle grid (e.g., 16 for a 4x4 puzzle).

let wrappedNums = []; // An array to store numbers, each wrapped in its own single-element array.
for (let idx = 0; idx < GRID_DIM; ++idx) {
  wrappedNums.push([idx]); // Each number is boxed to ensure unique object references for comparison.
}

// Read the initial puzzle state from the configured input source.
let initialState = require('fs').readFileSync(cfg.input, 'ascii')
  .trim() // Remove any leading or trailing whitespace from the input.
  .split(cfg.newline) // Split the input string into an array of lines.
  .map(function (inputLine) { return inputLine.split(' ').map(Number); }); // Parse each line into an array of numbers.

// Flatten the 2D array of numbers into a single 1D array, then map to wrapped number objects.
initialState = [].concat(initialState[0], initialState[1], initialState[2], initialState[3]);
initialState = initialState.map(function (val) { return wrappedNums[val]; });

let targetState = []; // Defines the desired final configuration of the puzzle.
for (let idx = 1; idx < GRID_DIM; ++idx) {
  targetState.push(wrappedNums[idx]); // Tiles 1 through 15 are placed in order.
}
targetState.push(wrappedNums[0]); // The empty tile (0) is placed at the very end.

let currentPuzzle = [].concat(initialState); // The mutable state of the puzzle board during search.

// A lookup table defining which tile positions are directly adjacent to each other.
const adjacentTiles = [
  [1,4], [0,2,5], [1,3,6], [2,7],
  [0,5,8], [1,4,6,9], [2,5,7,10], [3,6,11],
  [4,9,12], [5,8,10,13], [6,9,11,14], [7,10,15],
  [8,13], [9,12,14], [10,13,15], [11,14]
];

// Pre-calculate Manhattan distances between all possible pairs of tile positions.
let manhattanDistances = [];
const sideLength = Math.sqrt(GRID_DIM); // For a 4x4 grid, this value is 4.

for (let idx = 0; idx < GRID_DIM; ++idx) {
  manhattanDistances.push(new Array(sideLength)); // Initialize inner arrays with length 'sideLength'.
}

// Populate the manhattanDistances matrix.
for (let row1 = 0; row1 < sideLength; ++row1) {
  for (let col1 = 0; col1 < sideLength; ++col1) {
    for (let row2 = 0; row2 < sideLength; ++row2) {
      for (let col2 = 0; col2 < sideLength; ++col2) {
        const pos1 = sideLength * row1 + col1; // Calculate 1D index for (row1, col1).
        const pos2 = sideLength * row2 + col2; // Calculate 1D index for (row2, col2).
        // JavaScript arrays will automatically expand if an index beyond current length is accessed.
        manhattanDistances[pos1][pos2] = Math.abs(row1 - row2) + Math.abs(col1 - col2);
      }
    }
  }
}

/**
 * Implements an Iterative Deepening Depth-First Search (IDDFS) algorithm
 * to find the shortest path to solve the 15-puzzle.
 * @param {Array<Array<number>>} puzzleBoard The current state of the puzzle board.
 * @param {number} currentDepth The number of moves made so far.
 * @param {number} maxDepth The maximum depth to explore in the current IDDFS iteration.
 * @param {number} emptyTilePos The current 1D index of the empty tile (0).
 * @returns {boolean} True if a solution is found within `maxDepth`, false otherwise.
 */
function iterativeDeepeningDFS(puzzleBoard, currentDepth, maxDepth, emptyTilePos) {
  let tileIndex, heuristicEstimate, nextEmptyPos; // Declare local variables.

  // Check if the current depth has reached the maximum allowed depth for this iteration.
  if (currentDepth === maxDepth) {
    // If at max depth, verify if the current board state matches the target state.
    for (tileIndex in puzzleBoard) { // Iterate through the puzzle board's indices.
      if (puzzleBoard[tileIndex] !== targetState[tileIndex]) {
        return false; // Mismatch found, not the goal state.
      }
    }
    return true; // All tiles match, goal state reached.
  }
  
  // Calculate the Manhattan distance heuristic for the current board state.
  heuristicEstimate = 0;
  for (tileIndex in wrappedNums) { // Iterate through all possible tile values (0 to 15).
    // Sum the Manhattan distances for each tile from its current position to its target position.
    heuristicEstimate += manhattanDistances[puzzleBoard.indexOf(wrappedNums[tileIndex])][targetState.indexOf(wrappedNums[tileIndex])];
  }
  // Divide by 2 because each move changes the positions of two tiles, contributing to the sum.
  heuristicEstimate = Math.floor(heuristicEstimate / 2.0);

  // Pruning step: If current depth plus heuristic estimate exceeds max depth,
  // this path cannot lead to a solution within the current maxDepth.
  if (currentDepth + heuristicEstimate > maxDepth) {
    return false;
  }
  
  // Explore possible moves by swapping the empty tile with an adjacent tile.
  for (tileIndex in adjacentTiles[emptyTilePos]) { // Iterate through indices of adjacent positions.
    nextEmptyPos = adjacentTiles[emptyTilePos][tileIndex]; // Get the actual adjacent position.

    // Perform the swap: move the tile from `nextEmptyPos` into `emptyTilePos`.
    puzzleBoard[emptyTilePos] = puzzleBoard[nextEmptyPos];
    puzzleBoard[nextEmptyPos] = wrappedNums[0]; // The empty tile (0) now occupies `nextEmptyPos`.

    // Recursively call IDDFS for the new board state.
    if (iterativeDeepeningDFS(puzzleBoard, currentDepth + 1, maxDepth, nextEmptyPos)) {
      return true; // A solution was found in a deeper call.
    }

    // Backtrack: Undo the swap to restore the board for exploring other moves.
    puzzleBoard[nextEmptyPos] = puzzleBoard[emptyTilePos]; // Move the tile back.
    puzzleBoard[emptyTilePos] = wrappedNums[0]; // The empty tile returns to its original position.
  }
  return false; // No solution found from this branch within the current maxDepth.
}

// Main loop for the iterative deepening search.
let finalDepth;
for (finalDepth = 0; finalDepth <= 0x2D; ++finalDepth) { // Iterate through increasing depth limits (up to 45).
  // Find the initial position of the empty tile (0) to start the search.
  if (iterativeDeepeningDFS(currentPuzzle, 0, finalDepth, initialState.indexOf(wrappedNums[0]))) {
    break; // A solution was found at this `finalDepth`, so stop searching.
  }
}
console.log(finalDepth); // Output the minimum number of moves (depth) required to solve the puzzle.
