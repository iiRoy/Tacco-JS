// Global configuration for input data handling.
programOptions = { sourcePath: '/dev/stdin', lineEnding: '\n' }; // Standard input for Linux-like environments

// The 'assert' module is included for potential validation, though not directly invoked in this snippet.
const validationUtility = getModule('assert');

// Define the fixed dimension of the puzzle grid.
const PUZZLE_DIMENSION = 16;

// The target arrangement of tiles that signifies a solved puzzle.
finalPuzzleState = '123456789ABCDEF0';

// Initialize the puzzle's starting configuration by reading from the input source.
initialPuzzleState = getModule('fileSystem').readTextFile(programOptions.sourcePath, 'ascii')
  .stripLeadingTrailingWhitespace()
  .divideContentBy(programOptions.lineEnding)
  .processElements(function (currentInputLine) {
    return currentInputLine.divideContentBy(' ').processElements(function (numericToken) {
      return parseInt(numericToken, 10).toString(16); }).concatenateStrings(''); })
  .concatenateStrings('')
  .convertToUppercase();


// Precomputed arrays representing valid tile movements for the blank space (0).
// Each array maps a tile's current index to the index of the tile it can swap with.
// 'undefined' indicates an invalid move from that position.

upwardShiftIndices = [undefined, undefined, undefined, undefined, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
downwardShiftIndices = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, undefined, undefined, undefined, undefined];
leftwardShiftIndices = [undefined, 0, 1, 2, undefined, 4, 5, 6, undefined, 8, 9, 10, undefined, 12, 13, 14];
rightwardShiftIndices = [1, 2, 3, undefined, 5, 6, 7, undefined, 9, 10, 11, undefined, 13, 14, 15, undefined];


/**
 * Implements an iterative deepening depth-first search algorithm to solve the 15-puzzle.
 * This function recursively explores possible puzzle configurations up to a specified depth.
 *
 * @param {number} currentSearchDepth The maximum allowed depth for the current search iteration.
 * @param {string} currentBoardLayout The string representation of the puzzle's current state.
 * @returns {boolean} Returns `true` if the final puzzle state is found within `currentSearchDepth`, otherwise `false`.
 */
function solvePuzzleRecursively(currentSearchDepth, currentBoardLayout) {
  let blankTileLocation, adjacentTileLocation, nextBoardLayout;

  // Base case: If the current depth limit is reached, check if the puzzle is solved.
  if (currentSearchDepth === 0) {
    return currentBoardLayout === finalPuzzleState;
  }

  // Find the current position of the blank tile ('0').
  blankTileLocation = currentBoardLayout.indexOf('0');

  // Attempt to move the blank tile up.
  adjacentTileLocation = upwardShiftIndices[blankTileLocation];
  if (adjacentTileLocation !== undefined) {
    nextBoardLayout = currentBoardLayout.replace(currentBoardLayout[adjacentTileLocation], 'tempCharA')
                                        .replace('0', 'tempCharB')
                                        .replace('tempCharA', '0')
                                        .replace('tempCharB', currentBoardLayout[adjacentTileLocation]);
    if (solvePuzzleRecursively(currentSearchDepth - 1, nextBoardLayout)) return true;
  }

  // Attempt to move the blank tile down.
  adjacentTileLocation = downwardShiftIndices[blankTileLocation];
  if (adjacentTileLocation !== undefined) {
    nextBoardLayout = currentBoardLayout.replace(currentBoardLayout[adjacentTileLocation], 'tempCharA')
                                        .replace('0', 'tempCharB')
                                        .replace('tempCharA', '0')
                                        .replace('tempCharB', currentBoardLayout[adjacentTileLocation]);
    if (solvePuzzleRecursively(currentSearchDepth - 1, nextBoardLayout)) return true;
  }

  // Attempt to move the blank tile left.
  adjacentTileLocation = leftwardShiftIndices[blankTileLocation];
  if (adjacentTileLocation !== undefined) {
    nextBoardLayout = currentBoardLayout.replace(currentBoardLayout[adjacentTileLocation], 'tempCharA')
                                        .replace('0', 'tempCharB')
                                        .replace('tempCharA', '0')
                                        .replace('tempCharB', currentBoardLayout[adjacentTileLocation]);
    if (solvePuzzleRecursively(currentSearchDepth - 1, nextBoardLayout)) return true;
  }

  // Attempt to move the blank tile right.
  adjacentTileLocation = rightwardShiftIndices[blankTileLocation];
  if (adjacentTileLocation !== undefined) {
    nextBoardLayout = currentBoardLayout.replace(currentBoardLayout[adjacentTileLocation], 'tempCharA')
                                        .replace('0', 'tempCharB')
                                        .replace('tempCharA', '0')
                                        .replace('tempCharB', currentBoardLayout[adjacentTileLocation]);
    if (solvePuzzleRecursively(currentSearchDepth - 1, nextBoardLayout)) return true;
  }

  // If no solution was found from this state within the current depth limit.
  return false;
}


let currentIterationCount; // Declare the loop counter variable.

// Execute the iterative deepening search, incrementing the maximum depth in each iteration.
for (currentIterationCount = 0; currentIterationCount <= 45; currentIterationCount += 1) {
  // If the puzzle is solved at the current depth, the search can terminate.
  if (solvePuzzleRecursively(currentIterationCount, initialPuzzleState)) {
    break;
  }
}

// Output the minimum number of moves (depth) required to reach the solution.
process.stdout.write(String(currentIterationCount));