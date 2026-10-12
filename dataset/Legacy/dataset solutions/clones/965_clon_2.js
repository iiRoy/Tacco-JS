// Configuration settings for input and line endings.
// cfgSettings = { input: 'tmp', newline: '\r\n' }; // For Windows environments
cfgSettings = { input: '/dev/stdin', newline: '\n' }; // For Linux/Unix environments

const assert = require('assert'); // This module is imported but not utilized in the provided logic.

const BOARD_DIMENSION = 16; // Defines the total number of cells on the puzzle board.

// The desired final state of the 15-puzzle, represented as a single string.
targetState = '123456789ABCDEF0';

// Read the initial puzzle configuration from the specified input source.
initialBoard = require('fs').readFileSync(cfgSettings.input, 'ascii')
  .trim() // Remove any leading or trailing whitespace from the raw input.
  .split(cfgSettings.newline) // Divide the input string into an array of lines based on the newline character.
  .map(function (inputLine) { // Process each individual line of the input.
    return inputLine.split(' ').map(function (numberVal) { // Split the line by spaces and convert each part.
      return Number(numberVal).toString(16); // Convert the numeric value to its hexadecimal string representation.
    }).join(''); // Concatenate the hexadecimal strings from the current line into a single string.
  })
  .join('') // Combine all processed lines into one continuous string representing the entire board.
  .toUpperCase(); // Convert the final board string to uppercase for consistent comparison.

// Arrays defining the possible movements for the '0' (empty) tile.
// Each array maps the current index of '0' to the index of the tile it can swap with in that direction.
// A 'null' value indicates that a move in that direction is not possible from that specific position.
upMoves = [null, null, null, null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
downMoves = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null, null, null, null];
leftMoves = [null, 0, 1, 2, null, 4, 5, 6, null, 8, 9, 10, null, 12, 13, 14];
rightMoves = [1, 2, 3, null, 5, 6, 7, null, 9, 10, 11, null, 13, 14, 15, null];

/**
 * Implements an Iterative Deepening Depth-First Search (IDDFS) to solve the 15-puzzle.
 * This function performs a depth-limited search for a solution.
 *
 * @param {number} currentDepth - The maximum depth allowed for the current search iteration.
 * @param {string} puzzleState - The current configuration of the puzzle board as a string.
 * @returns {boolean} - True if a solution is found within the current depth limit, false otherwise.
 */
function iterativeDeepeningSearch(currentDepth, puzzleState) {
  var zeroIndex, neighborIndex, nextState; // Declare variables used within this function.

  // Base case for the recursion: if the depth limit is reached.
  if (currentDepth === 0) {
    // Check if the current puzzle arrangement matches the target solution.
    return puzzleState === targetState;
  }

  // Locate the position of the empty tile ('0') on the board.
  zeroIndex = puzzleState.indexOf('0');

  // Attempt to move a tile from the 'up' direction into the empty space.
  neighborIndex = upMoves[zeroIndex];
  if (neighborIndex !== null) { // If a move is possible from the 'up' direction.
    // Generate the next puzzle state by swapping the '0' with the tile at 'neighborIndex'.
    // Temporary characters 'x' and 'y' are used to ensure correct swapping even if '0' or the swapped tile value are 'x' or 'y'.
    nextState = puzzleState.replace(puzzleState[neighborIndex], 'x')
                           .replace('0', 'y')
                           .replace('x', '0')
                           .replace('y', puzzleState[neighborIndex]);
    // Recursively call the search function with the new state and reduced depth.
    if (iterativeDeepeningSearch(currentDepth - 1, nextState)) {
      return true; // A solution was found in this path.
    }
  }

  // Attempt to move a tile from the 'down' direction.
  neighborIndex = downMoves[zeroIndex];
  if (neighborIndex !== null) { // If a move is possible from the 'down' direction.
    nextState = puzzleState.replace(puzzleState[neighborIndex], 'x')
                           .replace('0', 'y')
                           .replace('x', '0')
                           .replace('y', puzzleState[neighborIndex]);
    if (iterativeDeepeningSearch(currentDepth - 1, nextState)) {
      return true; // A solution was found.
    }
  }

  // Attempt to move a tile from the 'left' direction.
  neighborIndex = leftMoves[zeroIndex];
  if (neighborIndex !== null) { // If a move is possible from the 'left' direction.
    nextState = puzzleState.replace(puzzleState[neighborIndex], 'x')
                           .replace('0', 'y')
                           .replace('x', '0')
                           .replace('y', puzzleState[neighborIndex]);
    if (iterativeDeepeningSearch(currentDepth - 1, nextState)) {
      return true; // A solution was found.
    }
  }

  // Attempt to move a tile from the 'right' direction.
  neighborIndex = rightMoves[zeroIndex];
  if (neighborIndex !== null) { // If a move is possible from the 'right' direction.
    nextState = puzzleState.replace(puzzleState[neighborIndex], 'x')
                           .replace('0', 'y')
                           .replace('x', '0')
                           .replace('y', puzzleState[neighborIndex]);
    if (iterativeDeepeningSearch(currentDepth - 1, nextState)) {
      return true; // A solution was found.
    }
  }

  // If no solution is found from the current state within the given depth limit.
  return false;
}

// Main loop to perform iterative deepening search.
// It gradually increases the depth limit until a solution is found.
for (depthCounter = 0; depthCounter <= 45; depthCounter++) {
  // Call the IDDFS function with the current depth limit and the initial board state.
  if (iterativeDeepeningSearch(depthCounter, initialBoard)) {
    break; // If a solution is found, exit the loop.
  }
}
// Output the minimum number of moves (depth) required to solve the puzzle.
console.log(depthCounter);
