/*
 * This configuration object sets up the input source and newline character.
 * It provides options for both Windows and Linux environments.
 * The Windows configuration is currently commented out, making the Linux setup active.
 */
// config = { input: 'tmp', newline: '\r\n' }; // Configuration for Windows systems, currently inactive.
config = { input: '/dev/stdin', newline: '\n' }; // Standard input configuration for Linux/Unix-like systems.


// The 'assert' module is included, typically used for testing or debugging.
// In this specific script, it's imported but not explicitly invoked.
const assert = require('assert');


// Define a constant 'SIZE' which represents the total number of tiles in the puzzle.
// For a 15-puzzle, this value is 16 (representing a 4x4 grid).
const SIZE = 16;


// Initialize an array named 'boxedNumber'.
// This array will store each number from 0 to SIZE-1,
// with each number wrapped in its own single-element array.
boxedNumber = []; // 'boxedNumber' is declared as an implicitly global variable.
for (i = 0; i < SIZE; i++) { // Loop iterates from 0 up to (but not including) SIZE.
  boxedNumber.push([i]);     // Each integer 'i' is pushed as an array '[i]' into 'boxedNumber'.
}


/*
 * This block reads the initial state of the puzzle from the configured input source.
 * It uses the 'fs' module to read the file synchronously.
 * The content is then processed: trimmed, split into lines, and each line is parsed.
 */
init = require('fs').readFileSync(config.input, 'ascii') // Read file content as an ASCII string.
  .trim()                                                 // Remove any leading or trailing whitespace.
  .split(config.newline)                                  // Split the string into an array of lines using the configured newline.
  .map(function (line) {                                  // For each line in the array:
    return line.split(' ').map(Number);                   // Split the line by spaces and convert each part to a number.
  });

// Flatten the 'init' 2D array (expected to be 4 rows for a 4x4 puzzle) into a single 1D array.
init = [].concat(init[0], init[1], init[2], init[3]);

// Map the numerical values in the 'init' array to their corresponding 'boxedNumber' objects.
// This converts the board state from numbers to references to the boxed objects.
init = init.map(function (num) { return boxedNumber[num]; });


// Initialize the 'goal' array, which represents the solved state of the puzzle.
// For a 15-puzzle, this sequence is typically 1, 2, ..., 15, followed by the empty space (0).
goal = []; // 'goal' is declared as an implicitly global variable.
for (i = 1; i < SIZE; i++) { // Loop from 1 to SIZE-1 to add numbered tiles.
  goal.push(boxedNumber[i]); // Add the boxed numbers 1 through 15 in ascending order.
}
goal.push(boxedNumber[0]); // Finally, add the boxed empty space (0) at the very end.


// Initialize the 'board' array with a shallow copy of the 'init' (initial) state.
// This 'board' array will be modified during the search process.
board = [].concat(init); // 'board' is declared as an implicitly global variable.


/*
 * 'near' is an adjacency list representing the possible moves for each tile position.
 * For a 4x4 grid (positions 0-15), each sub-array lists the indices of directly adjacent tiles.
 * This is crucial for determining valid tile swaps with the empty space.
 */
near = [
  [1, 4],            // Neighbors for position 0
  [0, 2, 5],         // Neighbors for position 1
  [1, 3, 6],         // Neighbors for position 2
  [2, 7],            // Neighbors for position 3
  [0, 5, 8],         // Neighbors for position 4
  [1, 4, 6, 9],      // Neighbors for position 5 (a central position)
  [2, 5, 7, 10],     // Neighbors for position 6
  [3, 6, 11],        // Neighbors for position 7
  [4, 9, 12],        // Neighbors for position 8
  [5, 8, 10, 13],    // Neighbors for position 9
  [6, 9, 11, 14],    // Neighbors for position 10
  [7, 10, 15],       // Neighbors for position 11
  [8, 13],           // Neighbors for position 12
  [9, 12, 14],       // Neighbors for position 13
  [10, 13, 15],      // Neighbors for position 14
  [11, 14]           // Neighbors for position 15
];


/*
 * 'distance' is a 2D array used to pre-compute and store the Manhattan distance
 * between any two positions on the grid. This pre-calculation optimizes the
 * heuristic function used in the search algorithm.
 */
distance = []; // 'distance' is declared as an implicitly global variable.
for (i = 0; i < SIZE; i++) { // Loop to initialize the rows of the distance matrix.
  distance.push(new Array(Math.sqrt(SIZE))); // Each row is initialized as an array of length sqrt(SIZE).
}

// Nested loops to calculate and store Manhattan distances between all pairs of grid positions.
for (i = 0; i < Math.sqrt(SIZE); i++) {     // Outer loop for row coordinate 'i' of the first position.
  for (j = 0; j < Math.sqrt(SIZE); j++) {   // Inner loop for column coordinate 'j' of the first position.
    for (k = 0; k < Math.sqrt(SIZE); k++) { // Loop for row coordinate 'k' of the second position.
      for (l = 0; l < Math.sqrt(SIZE); l++) { // Loop for column coordinate 'l' of the second position.
        // Calculate the 1D index for both positions from their 2D coordinates.
        // Then, compute the Manhattan distance (sum of absolute differences in coordinates).
        distance[Math.sqrt(SIZE) * i + j][Math.sqrt(SIZE) * k + l]
          = Math.abs(i - k) + Math.abs(j - l); // Manhattan distance formula.
      }
    }
  }
}


/*
 * The `iddfs` function implements an Iterative Deepening Depth-First Search algorithm
 * to solve the 15-puzzle. It searches for a solution path within a specified maximum depth.
 *
 * @param {Array} board - The current configuration of the puzzle board.
 * @param {number} step - The number of moves made to reach the current board state (current depth).
 * @param {number} max - The maximum allowed depth for the current iteration of IDDFS.
 * @param {number} space - The index (position) of the empty tile (boxedNumber[0]) on the board.
 * @returns {boolean} - Returns `true` if a solution is found within `max` steps, `false` otherwise.
 */
function iddfs(board, step, max, space) {
  var i, d, next; // Declare local variables used within this function.

  // Base case: If the current search depth (`step`) has reached the maximum allowed depth (`max`).
  if (step === max) {
    // Check if the current board state matches the goal state.
    for (i in board) { // Iterate through each tile on the board.
      if (board[i] !== goal[i]) { // If any tile does not match its goal position.
        return false; // This path does not lead to the goal at this depth.
      }
    }
    return true; // All tiles match; the goal state has been reached at `max` depth.
  }

  // Calculate the heuristic estimate (sum of Manhattan distances) to prune the search space.
  d = 0; // Initialize the total Manhattan distance.
  for (i in boxedNumber) { // Iterate through each boxed number (tile).
    // Sum the Manhattan distances from each tile's current position to its goal position.
    d += distance[board.indexOf(boxedNumber[i])][goal.indexOf(boxedNumber[i])];
  }
  d = Math.floor(d / 2); // Heuristic value is typically divided by 2 for the 15-puzzle.

  // Pruning condition: If the sum of current steps and the estimated remaining steps
  // exceeds the maximum allowed depth, then this path cannot lead to a solution within `max`.
  if (step + d > max) {
    return false; // Prune this branch of the search tree.
  }

  // Explore possible moves from the current empty `space`.
  for (i in near[space]) { // Iterate through all positions adjacent to the current `space`.
    next = near[space][i]; // Get the index of an adjacent tile.

    // Perform the move: Swap the empty tile with the `next` tile.
    board[space] = board[next];    // The tile at `next` position moves into the `space`.
    board[next] = boxedNumber[0];  // The `next` position now becomes the new empty `space`.

    // Recursively call `iddfs` with the new board state, incremented step, and new empty space position.
    if (iddfs(board, step + 1, max, next)) {
      return true; // If a solution is found in this recursive call, propagate `true` upwards.
    }

    // Backtrack: Undo the move to restore the board to its state before the current move.
    // This allows the algorithm to explore other possible moves from the current `space`.
    board[next] = board[space];    // Move the tile back from the current empty `space` to its original `next` position.
    board[space] = boxedNumber[0]; // Restore the empty `space` to its original position for this `step`.
  }

  return false; // No solution found from this board state within the given `max` depth.
}


/*
 * Main execution loop for the Iterative Deepening search.
 * It progressively increases the maximum search depth (`i`) from 0 to 45.
 * The `iddfs` function is called at each depth to attempt to find a solution.
 * The loop terminates as soon as a solution is discovered.
 */
for (i = 0; i <= 45; i++) { // The loop iterates, increasing the maximum depth `i`.
  // Call `iddfs` with the initial board state, starting at step 0,
  // the current maximum depth `i`, and the initial position of the empty tile.
  if (iddfs(board, 0, i, init.indexOf(boxedNumber[0]))) {
    break; // If `iddfs` returns `true`, a solution is found at depth `i`, so exit the loop.
  }
}

// Output the minimum number of moves (the depth `i` at which the solution was found) to the console.
console.log(i); // This prints the result, which is the optimal solution length.