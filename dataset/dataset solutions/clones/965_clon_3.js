const appSettings = {
  dataSourcePath: '/dev/stdin',
  lineSeparator: '\n',
};

const fileSystemModule = require('fs');

const BOARD_TILE_COUNT = 16;

const targetConfiguration = '123456789ABCDEF0';

/**
 * Converts a decimal number (0-15) to its single-character hexadecimal string representation.
 * For example, 10 becomes 'A', 15 becomes 'F'.
 * @param {number} decimalValue The number to convert.
 * @returns {string} The uppercase hexadecimal character.
 */
function toSingleHexChar(decimalValue) {
  if (typeof decimalValue !== 'number' || decimalValue < 0 || decimalValue > 15) {
    return '';
  }
  return decimalValue.toString(16).toUpperCase();
}

/**
 * Generates a new string by swapping two characters at specified indices within an input string.
 * This is a common operation for puzzle states where tiles are moved.
 * @param {string} puzzleString The original string representing the puzzle state.
 * @param {number} indexA The index of the first character to swap.
 * @param {number} indexB The index of the second character to swap.
 * @returns {string} A new string with the characters at indexA and indexB swapped.
 */
function performTileSwap(puzzleString, indexA, indexB) {
  if (indexA < 0 || indexA >= puzzleString.length || indexB < 0 || indexB >= puzzleString.length) {
    return puzzleString; // Return original if indices are out of bounds.
  }
  const charA = puzzleString[indexA];
  const charB = puzzleString[indexB];

  const charArray = puzzleString.split('');
  charArray[indexA] = charB;
  charArray[indexB] = charA;

  return charArray.join('');
}

// Read the initial puzzle setup from the configured data source.
// This involves reading the file, parsing numbers, converting them to hex,
// and assembling them into a single string representing the starting state.
const startingPuzzleState = fileSystemModule.readFileSync(appSettings.dataSourcePath, 'ascii')
  .trim()
  .split(appSettings.lineSeparator)
  .filter(row => row.length > 0)
  .map(function (puzzleRowString) {
    return puzzleRowString.split(' ')
      .filter(cell => cell.length > 0)
      .map(function (numericTileValue) {
        const parsedNumber = parseInt(numericTileValue, 10);
        return toSingleHexChar(parsedNumber);
      })
      .join('');
  })
  .join('');

// Precomputed lookup tables for valid tile movements.
// Each array maps the current position of the blank tile ('0') to the index
// of the tile it would swap with for a specific direction.
// 'null' indicates an impossible move from that position.

const upwardMovementIndices = [
  null, null, null, null,
  0, 1, 2, 3,
  4, 5, 6, 7,
  8, 9, 10, 11
];

const downwardMovementIndices = [
  4, 5, 6, 7,
  8, 9, 10, 11,
  12, 13, 14, 15,
  null, null, null, null
];

const leftwardMovementIndices = [
  null, 0, 1, 2,
  null, 4, 5, 6,
  null, 8, 9, 10,
  null, 12, 13, 14
];

const rightwardMovementIndices = [
  1, 2, 3, null,
  5, 6, 7, null,
  9, 10, 11, null,
  13, 14, 15, null
];

// Consolidate all movement direction arrays for easier iteration.
const allPossibleMoveDirections = [
  upwardMovementIndices,
  downwardMovementIndices,
  leftwardMovementIndices,
  rightwardMovementIndices
];

/**
 * Performs a recursive Depth-First Search (DFS) for the 15-puzzle problem
 * within a specified depth limit. This function is part of an Iterative Deepening
 * Depth-First Search (IDDFS) strategy.
 * @param {number} currentDepthLimit The maximum remaining moves allowed for this search branch.
 * @param {string} currentPuzzleState The current arrangement of the puzzle tiles.
 * @returns {boolean} True if the target configuration is found within the depth limit, false otherwise.
 */
function solvePuzzleViaIDS(currentDepthLimit, currentPuzzleState) {
  // Early exit: If the depth limit becomes negative, this path is too long.
  if (currentDepthLimit < 0) {
    return false;
  }

  // Base case 1: If the current state matches the goal, a solution is found.
  if (currentPuzzleState === targetConfiguration) {
    return true;
  }

  // Base case 2: If no moves are left and the goal hasn't been reached, backtrack.
  if (currentDepthLimit === 0) {
    return false;
  }

  // Locate the blank tile ('0') to determine possible moves.
  const blankTilePosition = currentPuzzleState.indexOf('0');

  // Iterate through each possible direction (up, down, left, right).
  for (let directionIdx = 0; directionIdx < allPossibleMoveDirections.length; directionIdx++) {
    const currentDirectionMap = allPossibleMoveDirections[directionIdx];
    // Find the index of the tile that would be swapped with the blank tile.
    const tileToSwapIndex = currentDirectionMap[blankTilePosition];

    // If 'tileToSwapIndex' is a number, it means the move is valid.
    if (typeof tileToSwapIndex === 'number') {
      // Generate the new puzzle state after performing the swap.
      const nextPuzzleState = performTileSwap(currentPuzzleState, blankTilePosition, tileToSwapIndex);

      // Recursively call the search function for the new state with one less depth allowed.
      if (solvePuzzleViaIDS(currentDepthLimit - 1, nextPuzzleState)) {
        return true; // If the recursive call finds a solution, propagate true.
      }
    }
  }

  // If no solution is found from any possible move at this depth, return false.
  return false;
}

// Main program logic: Implement iterative deepening.
// This loop gradually increases the search depth limit until a solution is found.
let finalSolutionDepth = -1; // Stores the depth at which the first solution is found.

// The maximum depth for a 15-puzzle solution is typically bounded, 45 is a common practical limit.
for (let currentSearchDepth = 0; currentSearchDepth <= 45; currentSearchDepth++) {
  // Attempt to solve the puzzle at the current depth limit.
  if (solvePuzzleViaIDS(currentSearchDepth, startingPuzzleState)) {
    finalSolutionDepth = currentSearchDepth; // Solution found! Record the depth.
    break; // Exit the loop as the shortest path is found.
  }
}

// Output the minimum number of moves required to solve the puzzle.
// If no solution is found within the maximum depth, -1 will be printed.
console.info(finalSolutionDepth);