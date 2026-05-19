// Type III Clone

// Configuration for input source and newline character
const appConfig = { input: '/dev/stdin', newline: '\n' }; // linux configuration

// Define the grid size constant
const GRID_SIZE = 16;
const GRID_DIMENSION = Math.sqrt(GRID_SIZE); // 4

// Initialize an array to hold boxed number representations (e.g., [[0], [1], ..., [15]])
// These are used as unique object references for board tiles.
const tileValueWrappers = Array.from({ length: GRID_SIZE }, (_, idx) => [idx.toString(16)]);

// Read and process the initial board state from the input file
const rawInputContent = require('fs').readFileSync(appConfig.input, 'ascii');
const trimmedInput = rawInputContent.trim();
const inputLines = trimmedInput.split(appConfig.newline);

// Parse each line into an array of numbers
const parsedLines = inputLines.map(function (lineContent) {
  return lineContent.split(' ').map(Number);
});

// Flatten the 2D array into a 1D array representing the initial board
// The original uses [].concat(arr[0], arr[1], arr[2], arr[3]) which is specific to 4 lines.
const flatInitialNumbers = [].concat(parsedLines[0], parsedLines[1], parsedLines[2], parsedLines[3]);

// Map the numerical board state to the boxed number references
const initialPuzzleBoard = flatInitialNumbers.map(function (numValue) {
  return tileValueWrappers[numValue];
});

// Define the target (goal) board state
// The goal is 1, 2, ..., 15, 0
const targetPuzzleBoard = tileValueWrappers.slice(1); // Get [1] through [15]
targetPuzzleBoard.push(tileValueWrappers[0]); // Add [0] at the end

// The current state of the puzzle board, initialized from the input
const currentPuzzleBoard = [...initialPuzzleBoard]; // Use spread for a shallow copy

// Define movement lookup tables for the empty tile (space)
// Each array maps a current position to the next position if moving in that direction.
// null indicates an invalid move (edge of the board).
const moveNorthMap = [null,null,null,null,0,1,2,3,4,5,6,7,8,9,10,11];
const moveSouthMap = [4,5,6,7,8,9,10,11,12,13,14,15,null,null,null,null];
const moveWestMap = [null,0,1,2,null,4,5,6,null,8,9,10,null,12,13,14];
const moveEastMap = [1,2,3,null,5,6,7,null,9,10,11,null,13,14,15,null];

// Pre-calculate Manhattan distances between all grid positions
// This part is computed but not used in the provided iddfs function (it's commented out).
// We keep it for behavioral equivalence (computation time, memory usage).
const manhattanDistances = [];
for (let r1 = 0; r1 < GRID_SIZE; r1++) {
  manhattanDistances.push(new Array(GRID_SIZE));
}

for (let r1 = 0; r1 < GRID_DIMENSION; r1++) {
  for (let c1 = 0; c1 < GRID_DIMENSION; c1++) {
    for (let r2 = 0; r2 < GRID_DIMENSION; r2++) {
      for (let c2 = 0; c2 < GRID_DIMENSION; c2++) {
        const pos1 = GRID_DIMENSION * r1 + c1;
        const pos2 = GRID_DIMENSION * r2 + c2;
        manhattanDistances[pos1][pos2] = Math.abs(r1 - r2) + Math.abs(c1 - c2);
      }
    }
  }
}

// Constants for move directions to avoid magic numbers
const NO_PREV_MOVE = 0;
const MOVE_NORTH = 1;
const MOVE_SOUTH = 2;
const MOVE_WEST = 3;
const MOVE_EAST = 4;

/**
 * Performs an Iterative Deepening Depth-First Search (IDDFS) to solve the 15-puzzle.
 *
 * @param {Array<Array<string>>} currentBoard The current state of the puzzle board.
 * @param {number} currentDepth The current depth of the search.
 * @param {number} maxDepthLimit The maximum depth to search in this iteration.
 * @param {number} emptyTilePosition The current index of the empty tile (0).
 * @param {number} previousMoveDirection The direction of the move that led to this state, to prevent immediate reversals.
 * @returns {boolean} True if a solution is found within maxDepthLimit, false otherwise.
 */
function iterativeDeepeningDFS(currentBoard, currentDepth, maxDepthLimit, emptyTilePosition, previousMoveDirection) {
  // Base case: If current depth equals max depth, check if the board is solved.
  if (currentDepth === maxDepthLimit) {
    // Compare board states by reference for the boxed numbers
    for (let tileIdx = 0; tileIdx < GRID_SIZE; tileIdx++) {
      if (currentBoard[tileIdx] !== targetPuzzleBoard[tileIdx]) {
        return false; // Board does not match goal
      }
    }
    return true; // Board matches goal
  }

  // Heuristic check (commented out in original, so keep it commented out)
  /*
  let heuristicVal = 0;
  for (let tileValIdx = 0; tileValIdx < GRID_SIZE; tileValIdx++) {
    heuristicVal += manhattanDistances[currentBoard.indexOf(tileValueWrappers[tileValIdx])][targetPuzzleBoard.indexOf(tileValueWrappers[tileValIdx])];
  }
  heuristicVal = Math.floor(heuristicVal / 2);
  if (currentDepth + heuristicVal > maxDepthLimit) return false;
  */

  // Define possible moves and their opposite directions
  const potentialMoves = [
    { direction: MOVE_NORTH, map: moveNorthMap, opposite: MOVE_SOUTH },
    { direction: MOVE_SOUTH, map: moveSouthMap, opposite: MOVE_NORTH },
    { direction: MOVE_WEST, map: moveWestMap, opposite: MOVE_EAST },
    { direction: MOVE_EAST, map: moveEastMap, opposite: MOVE_WEST }
  ];

  // Iterate through each possible move
  for (const moveOption of potentialMoves) {
    // Avoid immediately reversing the previous move
    if (previousMoveDirection !== moveOption.opposite) {
      const nextEmptyPosition = moveOption.map[emptyTilePosition];

      // Check if the move is valid (not off the board)
      if (nextEmptyPosition !== null) {
        // Store the tile that will be moved into the empty spot
        const tileToMove = currentBoard[nextEmptyPosition];

        // Perform the move: swap the empty tile with the adjacent tile
        currentBoard[emptyTilePosition] = tileToMove;
        currentBoard[nextEmptyPosition] = tileValueWrappers[0]; // The empty tile wrapper

        // Recursively call IDDFS with the new board state and increased depth
        if (iterativeDeepeningDFS(currentBoard, currentDepth + 1, maxDepthLimit, nextEmptyPosition, moveOption.direction)) {
          return true; // Solution found in this path
        }

        // Backtrack: Undo the move to restore the board to its previous state
        currentBoard[nextEmptyPosition] = tileToMove; // Restore the moved tile to its original spot
        currentBoard[emptyTilePosition] = tileValueWrappers[0]; // Restore the empty tile to its original spot
      }
    }
  }

  return false; // No solution found from this state within the current maxDepthLimit
}

// Main loop for iterative deepening
let solutionDepth = 0;
const initialEmptyTileIndex = initialPuzzleBoard.indexOf(tileValueWrappers[0]);

for (let currentMaxDepth = 0; currentMaxDepth <= 45; currentMaxDepth++) {
  if (iterativeDeepeningDFS(currentPuzzleBoard, 0, currentMaxDepth, initialEmptyTileIndex, NO_PREV_MOVE)) {
    solutionDepth = currentMaxDepth;
    break; // Solution found at this depth
  }
}

// Output the minimum depth at which a solution was found
console.log(solutionDepth);
