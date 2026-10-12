function solveSlidingPuzzle() {
  // This object will store the minimum number of moves to reach each puzzle state.
  // Keys are string representations of the 2x4 tile arrangement, values are move counts.
  let stateDistances = {};

  // Initialize the starting state: "01234567" (empty tile at index 0) with 0 moves.
  stateDistances["01234567"] = 0;

  // Define row offsets for moving the empty tile (up, left, right, down)
  const rowOffsets = [-1, 0, 0, 1];
  // Define column offsets for moving the empty tile (up, left, right, down)
  const colOffsets = [0, -1, 1, 0];

  // Initial configuration of the 2x4 puzzle tiles.
  const initialTiles = [0, 1, 2, 3, 4, 5, 6, 7];

  // Queue for Breadth-First Search (BFS).
  // Each element is an array: [current_tile_arrangement_array, moves_to_reach_this_state].
  let queueOfStates = [[initialTiles, 0]];

  // Perform BFS to find the shortest path to all reachable states.
  while (queueOfStates.length > 0) {
    // Dequeue the next state to process.
    let currentStateInfo = queueOfStates.shift();

    let currentTileArr = currentStateInfo[0]; // The 1D array representing the current tile arrangement.
    let moveCount = currentStateInfo[1];     // The number of moves to reach this state.

    // Find the index of the empty tile (represented by 0).
    let zeroIndex = currentTileArr.indexOf(0);

    // Convert the 1D index to 2D coordinates (row, column) for a 2x4 grid.
    let currentRow = Math.floor(zeroIndex / 4);
    let currentCol = zeroIndex % 4;

    // Create a 2D grid representation from the 1D array for easier manipulation.
    // This is a temporary working copy.
    let gridRepresentation = [
      currentTileArr.slice(0, 4),
      currentTileArr.slice(4, 8),
    ];

    // Iterate through the four possible directions (up, left, right, down).
    for (let directionIdx = 0; directionIdx < 4; directionIdx++) {
      // Calculate the coordinates of the tile adjacent to the empty tile in the current direction.
      let nextRow = currentRow + rowOffsets[directionIdx];
      let nextCol = currentCol + colOffsets[directionIdx];

      // Check if the calculated coordinates are within the grid boundaries (2 rows, 4 columns).
      if (nextRow < 0 || nextCol < 0 || nextRow >= 2 || nextCol >= 4) {
        continue; // If out of bounds, skip this direction.
      }

      // Simulate moving the adjacent tile into the empty spot.
      // First, store the value of the tile being moved.
      let movedTileValue = gridRepresentation[nextRow][nextCol];

      // Move the tile from (nextRow, nextCol) to the empty spot (currentRow, currentCol).
      gridRepresentation[currentRow][currentCol] = movedTileValue;
      // Set the original position of the moved tile to empty.
      gridRepresentation[nextRow][nextCol] = 0;

      // Convert the modified 2D grid back into a 1D array.
      let nextTileArr = gridRepresentation[0].concat(gridRepresentation[1]);
      // Convert the 1D array into a string to use as a key in the stateDistances map.
      let stateString = nextTileArr.join("");

      // If this new state has not been visited before (or found with a shorter path).
      if (stateDistances.hasOwnProperty(stateString) === false) {
        // Record the minimum moves to reach this state.
        stateDistances[stateString] = moveCount + 1;
        // Enqueue the new state for further exploration.
        queueOfStates.push([nextTileArr, moveCount + 1]);
      }

      // Backtrack: Undo the move to restore the grid to its state before the current iteration.
      // This is crucial because the `gridRepresentation` is reused for other directions.
      gridRepresentation[nextRow][nextCol] = movedTileValue; // Put the tile back.
      gridRepresentation[currentRow][currentCol] = 0;       // Put the empty tile back.
    }
  }
  // Return the map containing all reachable states and their minimum move counts.
  return stateDistances;
}

// Read input from standard input.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace and split into an array of lines.
const inputLines = (rawInputData.trim()).split("\n");

// Pre-calculate all possible puzzle states and their minimum moves.
const solvedPuzzleMap = solveSlidingPuzzle();

// For each line of input, find the corresponding move count and print it.
inputLines.forEach(function(lineContent) {
  // Each input line represents a puzzle state with spaces between numbers.
  // Remove spaces to form the state string key, then look up in the pre-calculated map.
  console.log(solvedPuzzleMap[lineContent.split(" ").join("")]);
});
