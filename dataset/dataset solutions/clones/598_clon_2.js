function PathFinder(startXCoord, startYCoord) {
  // Define movement vectors for 4 directions: up, left, right, down
  const deltaX = [0, -1, 1, 0];
  const deltaY = [-1, 0, 0, 1];

  // Initialize the step counter for the path
  let stepCount = 0;

  // The BFS queue stores nodes as [x_coordinate, y_coordinate, current_steps, current_power_level]
  const queueOfNodes = [[startXCoord, startYCoord, stepCount, 1]];

  // This object was present in the original code but unused.
  // It remains unused here to maintain structural equivalence.
  const unusedObject = {};

  // Memoization table to store the maximum power level achieved when reaching a specific cell.
  // Initialized to 0, indicating no power collected yet for any cell.
  // The grid is assumed to be at most 1001x1001 (indices 0-1000).
  const minPowerReached = [];
  for (let rowIterator = 0; rowIterator <= 1000; rowIterator++) {
    minPowerReached[rowIterator] = [];
    for (let colIterator = 0; colIterator <= 1000; colIterator++) {
      minPowerReached[rowIterator][colIterator] = 0;
    }
  }

  // Mark the starting cell's power level as 0 (before collecting any power-ups)
  minPowerReached[startXCoord][startYCoord] = 0;

  // Pointer to the current element in the BFS queue
  let queuePointer = 0;

  // Main loop for the Breadth-First Search
  while (true) {
    // Dequeue the current node from the front of the queue
    const currentNode = queueOfNodes[queuePointer];
    queuePointer++;

    // Extract coordinates, steps, and power level from the current node
    const currentX = currentNode[0];
    const currentY = currentNode[1];
    const currentSteps = currentNode[2];
    const currentPower = currentNode[3];

    // Check if the target power level has been reached (maxPowerLevel + 1 indicates completion)
    if (currentPower === maxPowerLevel + 1) {
      stepCount = currentSteps; // Store the total steps
      break; // Exit the BFS loop as the goal is found
    }

    // Explore all four possible adjacent cells
    for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
      const nextX = currentX + deltaX[directionIndex];
      const nextY = currentY + deltaY[directionIndex];
      let nextPower = currentPower; // Assume power level doesn't change initially

      // Boundary checks: ensure the next cell is within the grid limits
      if (nextX < 0 || nextY < 0 || nextX >= gridDimensions[1] || nextY >= gridDimensions[0]) {
        continue; // Skip if out of bounds
      }

      // Obstacle check: 'X' denotes an impassable cell
      if (gridLayout[nextY][nextX] === "X") {
        continue; // Skip if it's an obstacle
      }

      // Power-up check: if the cell contains a number matching the current power,
      // it's a power-up station, so increment the power level for the next step.
      if (gridLayout[nextY][nextX] === String(nextPower)) {
        nextPower++;
      }

      // Memoization check: if we've already visited this cell with an equal or higher power level,
      // there's no need to explore this path further as it won't be an improvement.
      if (minPowerReached[nextX][nextY] >= nextPower) {
        continue; // Skip if a better or equal path to this power level was already found
      }

      // Update the memoization table with the new highest power level achieved for this cell
      minPowerReached[nextX][nextY] = nextPower;

      // Enqueue the next node with updated steps and power level
      queueOfNodes[queueOfNodes.length] = [nextX, nextY, currentSteps + 1, nextPower];
    }
  }

  // Return the total number of steps required to reach the final power level
  return stepCount;
}

// Read the entire input from standard input
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into individual lines and remove leading/trailing whitespace
const inputLines = (rawInputData.trim()).split("\n");

// Parse the first line to get grid dimensions (height, width) and the target power level
// gridDimensions[0] = height, gridDimensions[1] = width, gridDimensions[2] = target_power
const gridDimensions = (inputLines.shift()).split(" ").map(Number);
const maxPowerLevel = gridDimensions[2];

// Initialize arrays to store the grid layout and the starting position
const gridLayout = [];
const initialPosition = []; // Stores [x_coordinate, y_coordinate]

// Process each subsequent line to build the grid and find the 'S' (start) position
for (let currentGridRow = 0; currentGridRow < gridDimensions[0]; currentGridRow++) {
  const currentRowChars = (inputLines.shift()).split("");
  // Check if the current row contains the starting point 'S'
  if (currentRowChars.indexOf("S") !== -1) {
    initialPosition[0] = currentRowChars.indexOf("S"); // X-coordinate of 'S'
    initialPosition[1] = currentGridRow; // Y-coordinate of 'S'
  }
  gridLayout.push(currentRowChars); // Add the processed row to the grid layout
}

// Call the PathFinder function with the determined starting coordinates
const finalPathSteps = PathFinder(initialPosition[0], initialPosition[1]);

// Output the calculated number of steps to the console
console.log(finalPathSteps);
