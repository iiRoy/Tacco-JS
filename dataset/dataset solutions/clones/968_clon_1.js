/* This file contains a solution for a 15-puzzle problem using Iterative Deepening Depth-First Search (IDDFS). */

// Configuration object for input/output paths.
// The 'win' option is commented out, indicating a preference for 'linux' environment.
// config = { input: 'tmp', newline: '\r\n' }; // Original Windows config, now ignored.
config = {
  input: '/dev/stdin', // Specifies the input source as standard input for Linux systems.
  newline: '\n'        // Defines the newline character for parsing input.
};

const assert = require('assert'); // Imports the Node.js 'assert' module for potential debugging or validation.

const SIZE = 16; // Defines the total number of tiles in the puzzle (15 actual tiles + 1 empty space).

// Initializes an array to store boxed numbers, which represent the tiles.
// Each number is converted to its hexadecimal string representation and wrapped in an array.
boxedNumber = [];
for (
  i = 0;  // Loop counter initialization.
  i < SIZE; // Loop condition: iterates from 0 up to (but not including) SIZE.
  i++       // Increment loop counter.
) {
  boxedNumber.push([
    i.toString(16) // Converts the number 'i' to its hexadecimal string.
  ]);
}

// Reads the initial puzzle state from the configured input source.
init = require('fs')
  .readFileSync(
    config.input, // Path to the input file (e.g., /dev/stdin).
    'ascii'       // Encoding for reading the file content.
  )
  .trim()         // Removes leading/trailing whitespace from the input.
  .split(
    config.newline // Splits the input string into an array of lines based on the newline character.
  )
  .map(
    function (line) {
      return line.split(' ') // Splits each line into an array of strings based on space.
        .map(Number);       // Converts each string in the array to a number.
    }
  );

// Flattens the 2D array of initial numbers into a single 1D array.
// Assumes 'init' contains exactly four rows (for a 4x4 puzzle).
init = [].concat(init[0], init[1], init[2], init[3]);

// Maps the numeric initial state to the 'boxedNumber' representations.
init = init.map(
  function (num) {
    return boxedNumber[num]; // Replaces each number with its corresponding boxed representation.
  }
);

// Defines the goal state of the puzzle.
// Tiles 1-15 in order, followed by the empty space (0).
goal = [];
for (
  i = 1;      // Starts with tile 1.
  i < SIZE;   // Continues until all 15 numbered tiles are added.
  i++         // Increments tile number.
) {
  goal.push(boxedNumber[i]); // Adds the boxed representation of the current tile to the goal state.
}
goal.push(boxedNumber[0]); // Adds the empty space (boxedNumber[0]) as the last element.

// The current state of the puzzle board, initialized with the 'init' state.
board = [].concat(init); // Creates a shallow copy of the initial board configuration.

// Lookup tables for possible moves (North, South, West, East) from a given tile position.
// 'null' indicates an edge where a move in that direction is not possible.
north = [
  null, null, null, null, // Top row (0-3) cannot move North.
  0, 1, 2, 3,             // Tiles 4-7 can move to 0-3 respectively.
  4, 5, 6, 7,             // Tiles 8-11 can move to 4-7 respectively.
  8, 9, 10, 11            // Tiles 12-15 can move to 8-11 respectively.
];
south = [
  4, 5, 6, 7,             // Tiles 0-3 can move to 4-7 respectively.
  8, 9, 10, 11,           // Tiles 4-7 can move to 8-11 respectively.
  12, 13, 14, 15,         // Tiles 8-11 can move to 12-15 respectively.
  null, null, null, null  // Bottom row (12-15) cannot move South.
];
west = [
  null, 0, 1, 2,           // Leftmost column (0, 4, 8, 12) cannot move West.
  null, 4, 5, 6,
  null, 8, 9, 10,
  null, 12, 13, 14
];
east = [
  1, 2, 3, null,          // Rightmost column (3, 7, 11, 15) cannot move East.
  5, 6, 7, null,
  9, 10, 11, null,
  13, 14, 15, null
];

// Pre-calculates the Manhattan distance heuristic for all possible tile positions.
// This is a 2D array where distance[pos1][pos2] stores the Manhattan distance between pos1 and pos2.
distance = [];
for (
  i = 0;
  i < SIZE;
  i++
) {
  distance.push(new Array(Math.sqrt(SIZE))); // Initialize inner arrays.
}

// Nested loops to calculate Manhattan distance for every pair of positions on the 4x4 grid.
const SQRT_SIZE = Math.sqrt(SIZE); // Pre-calculate square root for efficiency.
for (
  i = 0; // Row index for the first position (p1_row).
  i < SQRT_SIZE;
  i++
) {
  for (
    j = 0; // Column index for the first position (p1_col).
    j < SQRT_SIZE;
    j++
  ) {
    for (
      k = 0; // Row index for the second position (p2_row).
      k < SQRT_SIZE;
      k++
    ) {
      for (
        l = 0; // Column index for the second position (p2_col).
        l < SQRT_SIZE;
        l++
      ) {
        // Calculate the linear indices for the 1D distance array.
        // pos1 = p1_row * SQRT_SIZE + p1_col
        // pos2 = p2_row * SQRT_SIZE + p2_col
        distance[SQRT_SIZE * i + j][SQRT_SIZE * k + l] =
          Math.abs(i - k) + // Absolute difference in rows.
          Math.abs(j - l);  // Absolute difference in columns.
      }
    }
  }
}

// Constants representing directions for moves.
const INIT_DIRECTION = 0, // Initial state, no previous direction.
      N = 1,              // North direction.
      S = 2,              // South direction.
      W = 3,              // West direction.
      E = 4;              // East direction.

/**
 * Implements the Iterative Deepening Depth-First Search (IDDFS) algorithm.
 * This function explores possible moves up to a certain maximum depth ('max').
 *
 * @param {Array<Array<string>>} board - The current state of the puzzle board.
 * @param {number} step - The current depth of the search.
 * @param {number} max - The maximum depth to search in this iteration.
 * @param {number} space - The current position (index) of the empty tile (0).
 * @param {number} prevDir - The direction of the previous move, to prevent immediate reversals.
 * @returns {boolean} - True if the goal state is found within 'max' steps, false otherwise.
 */
function iddfs (
  board,    // Current board configuration.
  step,     // Current depth of search.
  max,      // Maximum allowed depth for this iteration.
  space,    // Index of the empty tile.
  prevDir   // Direction of the move that led to this state.
) {
  var i, d, next; // Declare local variables.

  // Base case: if current step equals maximum allowed depth.
  if (step === max) {
    // Check if the current board state matches the goal state.
    for (i in board) {
      if (board[i] !== goal[i]) {
        return false; // Mismatch found, not the goal state.
      }
    }
    return true; // All tiles match, goal state achieved.
  }

  /*
   * The following block represents a heuristic calculation
   * for an A*-like search or to prune branches in IDDFS.
   * It calculates the total Manhattan distance of all tiles from their goal positions.
   * If `step + d` (current steps + estimated remaining steps) exceeds `max`,
   * it suggests that this path cannot lead to a solution within the current `max` depth.
   * This heuristic is currently disabled, meaning the search is purely depth-limited.
   *
   d = 0; // Initialize total Manhattan distance.
   for (i in boxedNumber) {
   // Sum up Manhattan distances for each tile from its current position to its goal position.
   d += distance[board.indexOf(boxedNumber[i])][goal.indexOf(boxedNumber[i])];
   }
   d = Math.floor(d / 2); // Heuristic adjustment (often divided by 2 for 15-puzzle).
   if (step + d > max) {
   return false; // Prune this branch if heuristic estimate exceeds max depth.
   }
   */


  // Try moving the empty space North (if not coming from South and move is valid).
  if (
    prevDir !== S &&         // Prevent immediate reversal from a South move.
    (next = north[space])    // Check if moving North from 'space' is possible.
  ) {
    board[space] = board[next];    // Move tile from 'next' to 'space'.
    board[next] = boxedNumber[0];  // Set 'next' as the new empty space.

    // Recursive call: explore this new state.
    if (iddfs(board, step + 1, max, next, N)) {
      return true; // Solution found.
    }

    // Backtrack: undo the move to explore other paths.
    board[next] = board[space];    // Restore tile to 'next'.
    board[space] = boxedNumber[0]; // Restore 'space' as empty.
  }


  // Try moving the empty space South (if not coming from North and move is valid).
  if (
    prevDir !== N &&         // Prevent immediate reversal from a North move.
    (next = south[space])    // Check if moving South from 'space' is possible.
  ) {
    board[space] = board[next];
    board[next] = boxedNumber[0];

    if (iddfs(board, step + 1, max, next, S)) {
      return true; // Solution found.
    }

    board[next] = board[space];
    board[space] = boxedNumber[0];
  }


  // Try moving the empty space West (if not coming from East and move is valid).
  if (
    prevDir !== E &&         // Prevent immediate reversal from an East move.
    (next = west[space])     // Check if moving West from 'space' is possible.
  ) {
    board[space] = board[next];
    board[next] = boxedNumber[0];

    if (iddfs(board, step + 1, max, next, W)) {
      return true; // Solution found.
    }

    board[next] = board[space];
    board[space] = boxedNumber[0];
  }


  // Try moving the empty space East (if not coming from West and move is valid).
  if (
    prevDir !== W &&         // Prevent immediate reversal from a West move.
    (next = east[space])     // Check if moving East from 'space' is possible.
  ) {
    board[space] = board[next];
    board[next] = boxedNumber[0];

    if (iddfs(board, step + 1, max, next, E)) {
      return true; // Solution found.
    }

    board[next] = board[space];
    board[space] = boxedNumber[0];
  }

  return false; // No solution found from this state within the current depth limit.
}

// Main execution loop for Iterative Deepening.
// It gradually increases the maximum search depth from 0 to 45.
for (
  i = 0;  // Initialize current maximum depth.
  i <= 45; // Iterate up to a maximum depth of 45 (a common upper bound for 15-puzzle solutions).
  i++     // Increment the maximum depth for the next IDDFS iteration.
) {
  // Call IDDFS with the current board, starting at step 0, with the current max depth.
  // 'init.indexOf(boxedNumber[0])' finds the initial position of the empty tile.
  // The initial 'prevDir' is 0 (INIT_DIRECTION), indicating no previous move.
  if (
    iddfs(board, 0, i, init.indexOf(boxedNumber[0]), INIT_DIRECTION)
  ) {
    break; // If a solution is found at depth 'i', stop and report this depth.
  }
}

// Output the minimum depth 'i' at which a solution was found.
console.log(i); // This 'i' will be the solution depth.