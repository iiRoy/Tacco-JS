let cfg = { input: '/dev/stdin', newline: '\n' }; // Configuration for input source and line ending

const assert = require('assert'); // Standard Node.js assertion module

const GRID_DIM = 0x10; // Defines the total number of cells in the puzzle (e.g., 16 for a 4x4 grid)

// Prepares an array where each element is a single-element array containing the hex string representation of its index.
// This is used to represent the puzzle tiles.
let tileValues = [];
for (let tileIndex = 0x0; tileIndex < GRID_DIM; tileIndex++) {
  tileValues.push([tileIndex.toString(0x10)]);
}

// Reads the initial puzzle state from the configured input source.
// It parses the input into a 2D array of numbers, then flattens it, and finally maps
// these numbers to their corresponding 'boxed' tile representations from `tileValues`.
let initialState = require('fs').readFileSync(cfg.input, 'ascii')
  .trim()
  .split(cfg.newline)
  .map(function (inputLine) {
    return inputLine.split(' ').map(Number);
  });

// Flattens the 2D array of numbers into a single 1D array.
initialState = [].concat(initialState[0x0], initialState[0x1], initialState[0x2], initialState[0x3]);

// Converts the numerical initial state into the 'boxed' tile representation.
initialState = initialState.map(function (parsedNumber) {
  return tileValues[parsedNumber];
});

// Defines the target (goal) state of the puzzle.
// It's typically tiles 1-15 in order, followed by the empty tile (0).
let targetState = [];
for (let tileIndex = 0x1; tileIndex < GRID_DIM; tileIndex++) {
  targetState.push(tileValues[tileIndex]);
}
targetState.push(tileValues[0x0]); // The empty tile (0) is at the last position in the goal state.

// Initializes the current puzzle board with the `initialState`.
let currentPuzzle = [].concat(initialState);

// Arrays defining possible moves for the empty tile.
// Each index represents a tile position, and the value at that index is the new position
// of the empty tile if it moves in that direction from the original position.
// `null` indicates no valid move in that direction from that position.
const upMoves = [null, null, null, null, 0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xA, 0xB];
const downMoves = [0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xA, 0xB, 0xC, 0xD, 0xE, 0xF, null, null, null, null];
const leftMoves = [null, 0x0, 0x1, 0x2, null, 0x4, 0x5, 0x6, null, 0x8, 0x9, 0xA, null, 0xC, 0xD, 0xE];
const rightMoves = [0x1, 0x2, 0x3, null, 0x5, 0x6, 0x7, null, 0x9, 0xA, 0xB, null, 0xD, 0xE, 0xF, null];

// Pre-calculates Manhattan distances between all possible grid positions.
// This data structure is initialized but its values are not used in the provided `iddfs` function
// because the heuristic calculation is commented out.
let manhattanDistances = [];
for (let currentPosIndex = 0x0; currentPosIndex < GRID_DIM; currentPosIndex++) {
  manhattanDistances.push(new Array(Math.sqrt(GRID_DIM))); // Creates an array of 4 empty slots for a 4x4 grid
}

for (let currentRow = 0x0; currentRow < Math.sqrt(GRID_DIM); currentRow++) {
  for (let currentCol = 0x0; currentCol < Math.sqrt(GRID_DIM); currentCol++) {
    for (let targetRow = 0x0; targetRow < Math.sqrt(GRID_DIM); targetRow++) {
      for (let targetCol = 0x0; targetCol < Math.sqrt(GRID_DIM); targetCol++) {
        // Calculates the Manhattan distance between two grid coordinates.
        manhattanDistances[Math.sqrt(GRID_DIM) * currentRow + currentCol][Math.sqrt(GRID_DIM) * targetRow + targetCol] =
          Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
      }
    }
  }
}

// Constants representing directions, used to prevent immediate reversal of moves.
const NO_PREV_MOVE = 0x0;
const MOVE_UP = 0x1;
const MOVE_DOWN = 0x2;
const MOVE_LEFT = 0x3;
const MOVE_RIGHT = 0x4;

/**
 * Implements an Iterative Deepening Depth-First Search (IDDFS) algorithm
 * to find the shortest path to solve the 15-puzzle.
 *
 * @param {Array<Array<string>>} puzzleState The current configuration of the puzzle board.
 * @param {number} currentDepth The number of moves made to reach the current state.
 * @param {number} maxDepth The maximum depth to explore in the current IDDFS iteration.
 * @param {number} emptyTilePos The current index of the empty tile (0) on the board.
 * @param {number} previousMove The direction of the last move, used to avoid redundant reversals.
 * @returns {boolean} True if the goal state is found within `maxDepth`, false otherwise.
 */
function iterativeDeepeningDFS(puzzleState, currentDepth, maxDepth, emptyTilePos, previousMove) {
  let tileIterator, heuristicVal, nextEmptyPos; // Local variables for iteration, heuristic, and next position.

  // Base case: If the current search depth equals the maximum allowed depth for this iteration.
  if (currentDepth === maxDepth) {
    // Check if the current puzzle state matches the target goal state.
    for (tileIterator in puzzleState) {
      if (puzzleState[tileIterator] !== targetState[tileIterator]) {
        return false; // Not the goal state at max depth.
      }
    }
    return true; // Goal state reached at max depth.
  }

  /*
  // Heuristic pruning (commented out in the original code, so it remains commented here).
  heuristicVal = 0x0;
  for (tileIterator in tileValues) {
    heuristicVal += manhattanDistances[puzzleState.indexOf(tileValues[tileIterator])][targetState.indexOf(tileValues[tileIterator])];
  }
  heuristicVal = Math.floor(heuristicVal / 0x2); // Divide by 2 for the 15-puzzle heuristic.
  if (currentDepth + heuristicVal > maxDepth) {
    return false; // Prune this branch if it's impossible to reach the goal within maxDepth.
  }
  */

  // Attempt to move the empty tile Up (North).
  // Only proceed if the previous move was not Down (South) to prevent immediate backtracking.
  if (previousMove !== MOVE_DOWN && (nextEmptyPos = upMoves[emptyTilePos])) {
    // Perform the move: swap the empty tile with the tile above it.
    puzzleState[emptyTilePos] = puzzleState[nextEmptyPos];
    puzzleState[nextEmptyPos] = tileValues[0x0]; // The empty tile moves to `nextEmptyPos`.

    // Recursively call IDDFS for the new state.
    if (iterativeDeepeningDFS(puzzleState, currentDepth + 0x1, maxDepth, nextEmptyPos, MOVE_UP)) {
      return true; // Solution found.
    }

    // Backtrack: Undo the move to restore the board to its state before the current move.
    puzzleState[nextEmptyPos] = puzzleState[emptyTilePos];
    puzzleState[emptyTilePos] = tileValues[0x0]; // Empty tile returns to its original position.
  }

  // Attempt to move the empty tile Down (South).
  if (previousMove !== MOVE_UP && (nextEmptyPos = downMoves[emptyTilePos])) {
    puzzleState[emptyTilePos] = puzzleState[nextEmptyPos];
    puzzleState[nextEmptyPos] = tileValues[0x0];
    if (iterativeDeepeningDFS(puzzleState, currentDepth + 0x1, maxDepth, nextEmptyPos, MOVE_DOWN)) {
      return true;
    }
    puzzleState[nextEmptyPos] = puzzleState[emptyTilePos];
    puzzleState[emptyTilePos] = tileValues[0x0];
  }

  // Attempt to move the empty tile Left (West).
  if (previousMove !== MOVE_RIGHT && (nextEmptyPos = leftMoves[emptyTilePos])) {
    puzzleState[emptyTilePos] = puzzleState[nextEmptyPos];
    puzzleState[nextEmptyPos] = tileValues[0x0];
    if (iterativeDeepeningDFS(puzzleState, currentDepth + 0x1, maxDepth, nextEmptyPos, MOVE_LEFT)) {
      return true;
    }
    puzzleState[nextEmptyPos] = puzzleState[emptyTilePos];
    puzzleState[emptyTilePos] = tileValues[0x0];
  }

  // Attempt to move the empty tile Right (East).
  if (previousMove !== MOVE_LEFT && (nextEmptyPos = rightMoves[emptyTilePos])) {
    puzzleState[emptyTilePos] = puzzleState[nextEmptyPos];
    puzzleState[nextEmptyPos] = tileValues[0x0];
    if (iterativeDeepeningDFS(puzzleState, currentDepth + 0x1, maxDepth, nextEmptyPos, MOVE_RIGHT)) {
      return true;
    }
    puzzleState[nextEmptyPos] = puzzleState[emptyTilePos];
    puzzleState[emptyTilePos] = tileValues[0x0];
  }

  return false; // No solution found from this state at the current depth.
}

// Main loop for the Iterative Deepening Depth-First Search.
// It incrementally increases the maximum search depth until a solution is found.
let solutionDepth = 0x0;
for (solutionDepth = 0x0; solutionDepth <= 0x2D; solutionDepth++) { // Max depth set to 45 (0x2D).
  // Call the IDDFS function. The initial empty tile position is determined from the `initialState`.
  if (iterativeDeepeningDFS(currentPuzzle, 0x0, solutionDepth, initialState.indexOf(tileValues[0x0]), NO_PREV_MOVE)) {
    break; // A solution was found at `solutionDepth`, so exit the loop.
  }
}

// Outputs the minimum number of moves required to solve the puzzle.
console.log(solutionDepth);
