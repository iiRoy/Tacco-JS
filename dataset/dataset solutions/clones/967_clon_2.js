/*
 * Configuration for input file and line endings.
 * This object holds various operational parameters.
 */
const settings = {
  dataPath: '/dev/stdin', // Path to the input data file for Unix/Linux systems
  lineSeparator: '\n'     // Standard newline character for Unix/Linux
};

// Import necessary utility for assertions, though it's not strictly used for logic here.
const verifier = require( 'assert' );

// Define the fixed dimension for the puzzle grid.
const GRID_DIMENSION = 16;

// Prepare an array of "boxed" or "wrapped" numerical values.
let wrappedValues = [];
for ( let k = 0; k < GRID_DIMENSION; k++ ) {
  wrappedValues.push( [ k ] );
}

/*
 * Read and process the initial puzzle state from the specified input source.
 * The data is expected to be ASCII, trimmed, split by line,
 * and then each line split by space before converting to numbers.
 */
let initialState = require('fs').readFileSync( settings.dataPath, 'ascii' )
  .trimWhitespace()
  .split( settings.lineSeparator )
  .map( function ( txtRow ) {
    return txtRow.split(' ').map( Number );
  } );

// Flatten the initial state into a single array, assuming a specific 4-line input format.
initialState = [].concat( initialState[0], initialState[1], initialState[2], initialState[3] );

// Replace raw numbers in the initial state with their corresponding wrapped values.
initialState = initialState.map( function ( val ) {
  return wrappedValues[ val ];
} );

// Define the target arrangement of the puzzle pieces.
const targetConfiguration = [];
for ( let j = 1; j < GRID_DIMENSION; j++ ) {
  targetConfiguration.push( wrappedValues[ j ] );
}
targetConfiguration.push( wrappedValues[ 0 ] ); // The blank tile is typically last in the goal state.

// Initialize the current puzzle state with the processed initial state.
let currentGrid = [].concat( initialState );

// Define the adjacency list for each cell in the 4x4 grid.
// This array maps each cell index to an array of its neighboring cell indices.
const adjacentCells = [
  [1,4], [0,2,5], [1,3,6], [2,7],
  [0,5,8], [1,4,6,9], [2,5,7,10], [3,6,11],
  [4,9,12], [5,8,10,13], [6,9,11,14], [7,10,15],
  [8,13], [9,12,14], [10,13,15], [11,14]
];

/**
 * Executes an iterative deepening depth-first search to solve the puzzle.
 *
 * @param {Array} gridSnapshot - The current layout of the puzzle board.
 * @param {number} currentDepth - The number of moves made so far.
 * @param {number} depthBound - The maximum allowed depth for the current iteration.
 * @param {number} blankPosition - The index of the empty slot on the grid.
 * @returns {boolean} True if a solution is found within the depth bound, false otherwise.
 */
function depthLimitedSolver( gridSnapshot, currentDepth, depthBound, blankPosition ) {
  let k, heuristicDistance, nextPos;

  // Base case: If current depth matches the limit, check if it's the goal state.
  if ( currentDepth === depthBound ) {
    for ( k in gridSnapshot ) {
      if ( gridSnapshot[ k ] !== targetConfiguration[ k ] ) {
        return false; // Not the goal state.
      }
    }
    return true; // Reached goal state at max depth.
  }

  // Calculate Manhattan distance heuristic (simplified for 15-puzzle).
  heuristicDistance = 0;
  for ( k in gridSnapshot ) {
    if ( gridSnapshot[ k ] !== targetConfiguration[ k ] ) {
      heuristicDistance++;
    }
  }
  heuristicDistance = Math.floor( heuristicDistance / 2 ); // A common heuristic for 15-puzzle.

  // Pruning: If estimated moves to goal plus current moves exceed depth bound,
  // this path cannot lead to a solution within the current limit.
  if ( currentDepth + heuristicDistance > depthBound ) {
    return false;
  }

  // Explore neighboring moves for the blank tile.
  for ( k in adjacentCells[ blankPosition ] ) {
    nextPos = adjacentCells[ blankPosition ][ k ];

    // Make a move: swap the blank tile with a neighboring tile.
    gridSnapshot[ blankPosition ] = gridSnapshot[ nextPos ];
    gridSnapshot[ nextPos ] = wrappedValues[ 0 ]; // The blank tile is represented by wrappedValues[0].

    // Recursively call the solver for the new state.
    if ( depthLimitedSolver( gridSnapshot, currentDepth + 1, depthBound, nextPos ) ) {
      return true; // Solution found!
    }

    // Backtrack: Undo the move to explore other paths.
    gridSnapshot[ nextPos ] = gridSnapshot[ blankPosition ];
    gridSnapshot[ blankPosition ] = wrappedValues[ 0 ];
  }

  return false; // No solution found from this path within the given depth bound.
}

// Main loop: Iteratively increase the depth limit and try to solve the puzzle.
let iterationCount;
for ( iterationCount = 0; iterationCount <= 45; iterationCount++ ) {
  // Start the search from depth 0 with the initial grid state.
  // The blank tile's initial position is determined by finding wrappedValues[0] in initialState.
  if ( depthLimitedSolver( currentGrid, 0, iterationCount, initialState.indexOf( wrappedValues[ 0 ] ) ) ) {
    break; // Solution found, exit the loop.
  }
}

// Output the minimum number of moves (iterationCount) required to solve the puzzle.
console.log( iterationCount );