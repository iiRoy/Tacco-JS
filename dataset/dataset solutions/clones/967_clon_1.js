/*
 * Configuration object for input and newline character.
 * The commented line is for Windows, the active one for Linux/Unix systems.
 */
config = {
    input: '/dev/stdin', /* Path to the standard input device */
    newline: '\n'        // Standard Unix newline character
};

// Assert module is not actually used in this script, but it's required.
const assert = require('assert');

// Define the constant for the size of the puzzle (e.g., 4x4 grid means 16 tiles).
const SIZE = 16;

/*
 * Initialize an array to hold "boxed" numbers.
 * Each number 'i' is represented as an array [i].
 * This is useful for object identity comparison later.
 */
boxedNumber = [];
for (let i = 0; i < SIZE; i++) {
    boxedNumber.push([i]); // Push a new array containing 'i'
}

/*
 * Read the initial state of the puzzle from the configured input source.
 * The input is expected to be ASCII, trimmed, split by newlines,
 * and then each line split by spaces and converted to numbers.
 */
init = require('fs')
    .readFileSync(config.input, 'ascii') /* Read file synchronously as ASCII */
    .trim()                              /* Remove leading/trailing whitespace */
    .split(config.newline)               /* Split into lines */
    .map(function(line) {                 /* Process each line */
        return line.split(' ').map(Number); // Split by space, convert to numbers
    });

// Flatten the 2D array into a single 1D array.
init = [].concat(init[0], init[1], init[2], init[3]);

// Map the numerical values to their "boxed" number representations.
init = init.map(function(num) {
    return boxedNumber[num];
});

/*
 * Define the goal state of the puzzle.
 * For a 15-puzzle, this is typically numbers 1 through 15, then 0 (empty space).
 */
goal = [];
for (let i = 1; i < SIZE; i++) { // Numbers 1 to 15
    goal.push(boxedNumber[i]);
}
goal.push(boxedNumber[0]); // The empty space (0) at the end

// The current state of the board, initialized with the input.
board = [].concat(init);

/*
 * Defines the adjacency list for each tile position on a 4x4 grid.
 * For example, tile at index 0 (top-left) can move to positions 1 (right) and 4 (down).
 */
near = [
    [1, 4],           // Position 0 neighbors
    [0, 2, 5],        // Position 1 neighbors
    [1, 3, 6],        // Position 2 neighbors
    [2, 7],           // Position 3 neighbors

    [0, 5, 8],        // Position 4 neighbors
    [1, 4, 6, 9],     // Position 5 neighbors
    [2, 5, 7, 10],    // Position 6 neighbors
    [3, 6, 11],       // Position 7 neighbors

    [4, 9, 12],       // Position 8 neighbors
    [5, 8, 10, 13],   // Position 9 neighbors
    [6, 9, 11, 14],   // Position 10 neighbors
    [7, 10, 15],      // Position 11 neighbors

    [8, 13],          // Position 12 neighbors
    [9, 12, 14],      // Position 13 neighbors
    [10, 13, 15],     // Position 14 neighbors
    [11, 14]          // Position 15 neighbors
];


/**
 * Iterative Deepening Depth-First Search (IDDFS) for solving the 15-puzzle.
 *
 * @param {Array<Array<number>>} board  The current state of the puzzle board.
 * @param {number}               step   The current depth/number of moves made.
 * @param {number}               max    The maximum depth to search in this iteration.
 * @param {number}               space  The current index of the empty tile (0).
 * @returns {boolean} True if a solution is found within 'max' steps, false otherwise.
 */
function iddfs(board, step, max, space) {
    var i, d, next; // Declare local variables

    // Base case: If current step equals max depth
    if (step === max) {
        // Check if the current board state matches the goal state
        for (i in board) {
            if (board[i] !== goal[i]) {
                return false; // Not a solution
            }
        }
        return true; // Solution found!
    }

    // Heuristic check: Estimate remaining distance (Manhattan distance / 2)
    d = 0;
    for (i in board) {
        if (board[i] !== goal[i]) {
            d++; // Count misplaced tiles
        }
    }
    d = Math.floor(d / 2); // A simple lower bound heuristic

    // Pruning: If estimated steps + current steps exceed max depth, prune this branch
    if (step + d > max) {
        return false;
    }

    // Explore possible moves from the current empty space
    for (i in near[space]) {
        next = near[space][i]; // Get the index of a tile adjacent to the empty space

        // Make a move: Swap the empty space with the adjacent tile
        board[space] = board[next];
        board[next] = boxedNumber[0]; // The tile at 'next' is now the empty space

        // Recursively call iddfs for the new board state
        if (iddfs(board, step + 1, max, next)) {
            return true; // Solution found in a deeper call
        }

        // Backtrack: Undo the move to explore other possibilities
        board[next] = board[space];
        board[space] = boxedNumber[0]; // Restore the empty space to its original position
    }

    return false; // No solution found from this path within the given max depth
}

// Main loop for Iterative Deepening.
// Tries increasing depth limits (i) starting from 0 up to 45.
// 45 is a common upper bound for 15-puzzle solutions.
for (let i = 0; i <= 45; i++) {
    // Call IDDFS with current depth limit 'i'
    // The initial empty space position is found using indexOf
    if (iddfs(board, 0, i, init.indexOf(boxedNumber[0]))) {
        break; // Solution found, exit the loop
    }
}

// Output the minimum number of steps required to solve the puzzle.
console.log(i);