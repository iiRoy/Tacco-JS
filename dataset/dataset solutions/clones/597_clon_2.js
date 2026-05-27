function exploreGrid(initialCol, initialRow) {
  // Mark the starting position as visited in the initial grid state
  gridState[initialRow][initialCol] = ".";

  // Define movement vectors for 4 directions (up, left, right, down)
  const deltaCols = [0, -1, 1, 0];
  const deltaRows = [-1, 0, 0, 1];

  let stepCount = 0; // Initialize the step counter

  // Initialize the Breadth-First Search queue
  // Each element: [current_col, current_row, steps_taken, current_strength, current_grid_state]
  const searchQueue = [[initialCol, initialRow, stepCount, 1, gridState]];

  // Use an object to keep track of visited states to avoid cycles and redundant computations
  // Key format: "col row grid_state_as_string"
  const visitedStates = {};
  visitedStates[initialCol + " " + initialRow + " " + gridState.join("")] = true;

  // Main BFS loop
  while (true) {
    // If the queue is empty, no path was found
    if (searchQueue.length === 0) {
      stepCount = -1; // Indicate failure
      break;
    }

    // Dequeue the next node to process
    const currentNode = searchQueue.shift();
    const currentCol = currentNode[0];
    const currentRow = currentNode[1];
    const currentSteps = currentNode[2];
    const currentStrength = currentNode[3];
    const currentGrid = currentNode[4]; // The grid state associated with this node

    // Check if the target strength has been reached
    if (currentStrength === maxStrength + 1) {
      stepCount = currentSteps; // Found the minimum steps
      break;
    }

    // Explore all four possible directions from the current position
    for (let idx = 0; idx < 4; idx++) {
      const nextCol = currentCol + deltaCols[idx];
      const nextRow = currentRow + deltaRows[idx];
      let nextStrength = currentStrength; // Strength for the next state

      // Boundary checks: ensure the next position is within the grid limits
      if (nextCol < 0 || nextRow < 0 || nextCol >= dimensions[1] || nextRow >= dimensions[0]) {
        continue; // Skip if out of bounds
      }

      // Obstacle check: 'X' represents an impassable wall
      if (gridState[nextRow][nextCol] === "X") {
        continue; // Skip if it's a wall
      }

      // Create a deep copy of the current grid state for the next step
      // This is crucial because the grid state can change based on strength consumption
      const gridCopy = currentGrid.map(function (rowContent) {
        return rowContent.slice();
      });

      // Check if the next cell contains a strength requirement
      // If the cell value matches the current strength, consume it and increment strength
      if (gridCopy[nextRow][nextCol] === "" + nextStrength) {
        nextStrength++; // Increment strength after consuming
        gridCopy[nextRow][nextCol] = "."; // Mark the cell as visited/consumed
      }

      // Generate a unique key for the next state to check if it has been visited
      const stateKey = nextCol + " " + nextRow + " " + gridCopy.join("");
      if (visitedStates.hasOwnProperty(stateKey)) {
        continue; // Skip if this state has already been visited
      }

      // Mark the new state as visited
      visitedStates[stateKey] = true;

      // Enqueue the new state
      searchQueue.push([nextCol, nextRow, currentSteps + 1, nextStrength, gridCopy]);
    }
  }
  return stepCount; // Return the minimum steps or -1 if no path
}

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process input: trim whitespace and split into lines
const inputLines = (rawData.trim()).split("\n");

// Parse the first line for grid dimensions and maximum strength
// dimensions[0] = height, dimensions[1] = width, dimensions[2] = maxStrength
const dimensions = (inputLines.shift()).split(" ").map(Number);
const maxStrength = dimensions[2]; // Extract the maximum strength value

// Initialize the grid and starting coordinates
const gridState = [];
const startCoords = [];

// Populate the grid and find the starting position 'S'
for (let idx = 0; idx < dimensions[0]; idx++) {
  const lineChars = (inputLines.shift()).split(""); // Get characters for the current row
  // If 'S' is found in the current row, record its coordinates
  if (lineChars.indexOf("S") !== -1) {
    startCoords[0] = lineChars.indexOf("S"); // Column
    startCoords[1] = idx; // Row
  }
  gridState.push(lineChars); // Add the row to the grid
}

// Call the BFS function with the starting coordinates
const finalResult = exploreGrid(startCoords[0], startCoords[1]);

// Output the result to the console
console.log(finalResult);
