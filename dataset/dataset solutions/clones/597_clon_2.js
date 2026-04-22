// This function performs a Breadth-First Search (BFS) to find the shortest path
// through a grid, considering strength consumption and specific target cells.
function exploreGrid(startCol, startRow) {
  // Mark the starting position as visited (or consumed) on the initial map state.
  gameMap[startRow][startCol] = ".";

  // Define offsets for moving in 4 cardinal directions (Up, Left, Right, Down).
  const colOffsets = [0, -1, 1, 0];
  const rowOffsets = [-1, 0, 0, 1];

  // Initialize the path length counter.
  let pathLength = 0;

  // The queue for our BFS, each element is [column, row, current_path_length, current_strength, current_grid_state].
  const searchQueue = [[startCol, startRow, pathLength, 1, gameMap]];

  // A set (object used as a hash set) to keep track of visited states to prevent cycles and redundant computations.
  // A state is defined by "column row grid_state_string".
  const visitedStates = {};
  visitedStates[startCol + " " + startRow + " " + gameMap.map(r => r.join('')).join('')] = true;

  // Main BFS loop.
  while (true) {
    // If the queue is empty, no path was found.
    if (searchQueue.length === 0) {
      pathLength = -1; // Indicate no solution.
      break;
    }

    // Dequeue the next point to explore.
    const currentPoint = searchQueue.shift();

    // Extract details from the current point.
    const currCol = currentPoint[0];
    const currRow = currentPoint[1];
    const currLen = currentPoint[2];
    const currStr = currentPoint[3];
    const currentMapState = currentPoint[4];

    // Check if we have reached the target strength.
    if (currStr === maxStrength + 1) {
      pathLength = currLen; // We found the shortest path length.
      break;
    }

    // Explore all 4 adjacent directions.
    for (let dirIdx = 0; dirIdx < 4; dirIdx++) {
      const nextCol = currCol + colOffsets[dirIdx];
      const nextRow = currRow + rowOffsets[dirIdx];
      let nextStr = currStr; // Strength for the next step, might increase.

      // Boundary checks: ensure the next position is within the grid limits.
      if (nextCol < 0 || nextRow < 0 || nextCol >= gridDimensions[1] || nextRow >= gridDimensions[0]) {
        continue; // Skip out-of-bounds positions.
      }

      // Obstacle check: 'X' denotes an impassable cell.
      if (currentMapState[nextRow][nextCol] === "X") {
        continue; // Skip obstacles.
      }

      // Create a deep copy of the current grid state for the next step.
      // This is crucial because the grid state can change based on 'strength' cells.
      const mapClone = currentMapState.map(r => r.slice());

      // If the next cell contains a number matching the current strength,
      // it means we consume that strength cell, and our strength increases.
      if (mapClone[nextRow][nextCol] === "" + nextStr) {
        nextStr++; // Increment strength.
        mapClone[nextRow][nextCol] = "."; // Mark the cell as consumed.
      }

      // Generate a unique key for the current state (coordinates + map configuration).
      const stateKey = nextCol + " " + nextRow + " " + mapClone.map(r => r.join('')).join('');

      // If this state has already been visited, skip it to avoid redundant work and cycles.
      if (visitedStates.hasOwnProperty(stateKey)) {
        continue;
      }

      // Mark the new state as visited.
      visitedStates[stateKey] = true;

      // Add the new state to the queue for further exploration.
      searchQueue.push([nextCol, nextRow, currLen + 1, nextStr, mapClone]);
    }
  }

  return pathLength; // Return the calculated path length.
}

// --- Main script execution starts here ---

// Use Node.js 'fs' module to read input from a specified file path.
const fileSystem = require('node:fs');
const rawData = fileSystem.readFileSync('/app/input.txt', 'utf8');

// Process the raw input: trim whitespace and split into lines.
const lineData = rawData.trim().split("\n");

// The first line contains grid height, width, and max strength.
// Parse these values as numbers.
const gridDimensions = (lineData.shift()).split(" ").map(Number);
const maxStrength = gridDimensions[2];

// Initialize the game map and the starting position array.
let gameMap = [];
let initialPosition = [];

// Iterate through the remaining lines to build the game map.
// The first element of gridDimensions is the height (number of rows).
for (let rowIndex = 0; rowIndex < gridDimensions[0]; rowIndex++) {
  const rowString = (lineData.shift()).split(""); // Split row into individual characters.

  // If the 'S' (start) character is found in this row, record its position.
  if (rowString.indexOf("S") !== -1) {
    initialPosition = [rowString.indexOf("S"), rowIndex]; // [column, row]
  }
  gameMap.push(rowString); // Add the processed row to the game map.
}

// Call the BFS function with the determined starting coordinates.
const finalResult = exploreGrid(initialPosition[0], initialPosition[1]);

// Output the final path length to the console.
console.log(finalResult);