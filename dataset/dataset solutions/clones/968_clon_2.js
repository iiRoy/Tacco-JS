var settings = {sourcePath: '/dev/stdin', lineSeparator: '\n'}; // System configuration for data input.

const verifier = require('assert'); // Assertion library, though not utilized in this specific script.

const TOTAL_TILES = 16; // The total count of individual puzzle pieces (e.g., for a 4x4 grid).
const SIDE_LENGTH = Math.sqrt(TOTAL_TILES); // The number of tiles along one edge of the square grid.

// Initialize an array to hold string representations of each tile's value.
var tileRepresentations = [];
for (var idx = 0; idx < TOTAL_TILES; idx++) {
  tileRepresentations.push([idx.toString(16)]); // Each tile's numeric value as a hexadecimal string in an array.
}

// Read the initial puzzle setup from the specified input source.
var startingConfiguration = require('fs').readFileSync(settings.sourcePath, 'ascii')
  .trim()
  .split(settings.lineSeparator)
  .map(function(inputLine) {
    return inputLine.split(' ').map(Number); // Parse each line into an array of numbers.
  });

// Flatten the 2D array of input numbers into a single 1D array.
startingConfiguration = [].concat(
  startingConfiguration[0],
  startingConfiguration[1],
  startingConfiguration[2],
  startingConfiguration[3]
);

// Convert the numeric starting configuration into the tile object representations.
startingConfiguration = startingConfiguration.map(function(numericVal) {
  return tileRepresentations[numericVal];
});

// Define the desired final arrangement of the puzzle pieces.
var targetArrangement = [];
for (var index = 1; index < TOTAL_TILES; index++) {
  targetArrangement.push(tileRepresentations[index]);
}
targetArrangement.push(tileRepresentations[0]); // The blank piece (0) is traditionally at the end in the solved state.

// Create the current game board, initialized with the starting setup.
var currentPuzzle = [].concat(startingConfiguration);

// Lookup tables for valid moves for the blank tile in each direction.
// A 'null' entry signifies an impossible move from that board position.
var upwardMoves = [null, null, null, null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
var downwardMoves = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null, null, null, null];
var leftwardMoves = [null, 0, 1, 2, null, 4, 5, 6, null, 8, 9, 10, null, 12, 13, 14];
var rightwardMoves = [1, 2, 3, null, 5, 6, 7, null, 9, 10, 11, null, 13, 14, 15, null];

// Pre-compute Manhattan distances between all pairs of grid positions.
var manhattanDistances = [];
for (var outerIdx = 0; outerIdx < TOTAL_TILES; outerIdx++) {
  manhattanDistances.push(new Array(SIDE_LENGTH)); // Replicates original array sizing, even if it leads to sparse arrays.
}

for (var row1 = 0; row1 < SIDE_LENGTH; row1++) {
  for (var col1 = 0; col1 < SIDE_LENGTH; col1++) {
    for (var row2 = 0; row2 < SIDE_LENGTH; row2++) {
      for (var col2 = 0; col2 < SIDE_LENGTH; col2++) {
        manhattanDistances[SIDE_LENGTH * row1 + col1][SIDE_LENGTH * row2 + col2] =
          Math.abs(row1 - row2) + Math.abs(col1 - col2);
      }
    }
  }
}

// Enumeration for movement directions.
const NO_PREVIOUS_MOVE = 0;
const MOVE_UP = 1;
const MOVE_DOWN = 2;
const MOVE_LEFT = 3;
const MOVE_RIGHT = 4;

// Function to perform a recursive depth-first search for a puzzle solution.
function solvePuzzleDFS(currentBoardLayout, movesMade, depthLimit, emptyTilePosition, lastMoveDirection) {
  var loopIndex, heuristicValue, nextPosition;

  // Check if the current depth matches the maximum allowed for this iteration.
  if (movesMade === depthLimit) {
    // If at max depth, verify if the puzzle is solved.
    for (loopIndex in currentBoardLayout) {
      if (currentBoardLayout[loopIndex] !== targetArrangement[loopIndex])
        return false; // Not yet solved.
    }
    return true; // Puzzle is in the target state.
  }

  /*
   * // Heuristic evaluation (commented out, as in the original code).
   * // This part would estimate remaining moves and prune paths that exceed the depth limit.
   *
   * heuristicValue = 0;
   * for (loopIndex in tileRepresentations) {
   *   heuristicValue += manhattanDistances[currentBoardLayout.indexOf(tileRepresentations[loopIndex])][targetArrangement.indexOf(tileRepresentations[loopIndex])];
   * }
   * heuristicValue = Math.floor(heuristicValue / 2);
   * if (movesMade + heuristicValue > depthLimit) return false;
   */

  // Attempt to move the blank tile in all valid directions.

  // Move North (Up)
  if (lastMoveDirection !== MOVE_DOWN && (nextPosition = upwardMoves[emptyTilePosition])) {
    currentBoardLayout[emptyTilePosition] = currentBoardLayout[nextPosition];
    currentBoardLayout[nextPosition] = tileRepresentations[0]; // Update new blank tile position.
    if (solvePuzzleDFS(currentBoardLayout, movesMade + 1, depthLimit, nextPosition, MOVE_UP))
      return true; // Solution found.
    // Backtrack: Undo the move.
    currentBoardLayout[nextPosition] = currentBoardLayout[emptyTilePosition];
    currentBoardLayout[emptyTilePosition] = tileRepresentations[0];
  }

  // Move South (Down)
  if (lastMoveDirection !== MOVE_UP && (nextPosition = downwardMoves[emptyTilePosition])) {
    currentBoardLayout[emptyTilePosition] = currentBoardLayout[nextPosition];
    currentBoardLayout[nextPosition] = tileRepresentations[0];
    if (solvePuzzleDFS(currentBoardLayout, movesMade + 1, depthLimit, nextPosition, MOVE_DOWN))
      return true;
    // Backtrack.
    currentBoardLayout[nextPosition] = currentBoardLayout[emptyTilePosition];
    currentBoardLayout[emptyTilePosition] = tileRepresentations[0];
  }

  // Move West (Left)
  if (lastMoveDirection !== MOVE_RIGHT && (nextPosition = leftwardMoves[emptyTilePosition])) {
    currentBoardLayout[emptyTilePosition] = currentBoardLayout[nextPosition];
    currentBoardLayout[nextPosition] = tileRepresentations[0];
    if (solvePuzzleDFS(currentBoardLayout, movesMade + 1, depthLimit, nextPosition, MOVE_LEFT))
      return true;
    // Backtrack.
    currentBoardLayout[nextPosition] = currentBoardLayout[emptyTilePosition];
    currentBoardLayout[emptyTilePosition] = tileRepresentations[0];
  }

  // Move East (Right)
  if (lastMoveDirection !== MOVE_LEFT && (nextPosition = rightwardMoves[emptyTilePosition])) {
    currentBoardLayout[emptyTilePosition] = currentBoardLayout[nextPosition];
    currentBoardLayout[nextPosition] = tileRepresentations[0];
    if (solvePuzzleDFS(currentBoardLayout, movesMade + 1, depthLimit, nextPosition, MOVE_RIGHT))
      return true;
    // Backtrack.
    currentBoardLayout[nextPosition] = currentBoardLayout[emptyTilePosition];
    currentBoardLayout[emptyTilePosition] = tileRepresentations[0];
  }
  return false; // No solution found from this path at current depth.
}

// Main loop for iterative deepening search, increasing the depth limit progressively.
var depthAttempt;
for (depthAttempt = 0; depthAttempt <= 45; depthAttempt++) {
  if (solvePuzzleDFS(currentPuzzle, 0, depthAttempt, startingConfiguration.indexOf(tileRepresentations[0]), NO_PREVIOUS_MOVE))
    break; // A solution was found at this depth.
}
// Output the minimum number of moves (depth) required to solve the puzzle.
console.log(depthAttempt);