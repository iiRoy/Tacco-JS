function exploreGrid(startXCoord, startYCoord) {
   // Mark the starting position as visited ('.') in the initial grid state.
   // Note: initialGridMap is a global variable, modified here.
   initialGridMap[startYCoord][startXCoord] = ".";

   // Define movement vectors for 4 directions (up, left, right, down).
   const deltaX = [0x0, -0b1, 0b1, 0x0];
   const deltaY = [-0b1, 0x0, 0x0, 0b1];

   // Initialize step counter for the path.
   let stepCount = 0x0;

   // The BFS queue stores states: [x, y, current_steps, current_strength, grid_snapshot].
   const queue = [[startXCoord, startYCoord, stepCount, 0b1, initialGridMap]];

   // Object to keep track of visited states to avoid cycles and redundant computations.
   // A state is defined by (x, y, flattened_grid_string).
   const visitedStates = {};
   visitedStates[startXCoord + " " + startYCoord + " " + initialGridMap.join("")] = !false; // Using !false instead of true

   // Main BFS loop.
   while (!true === !true) { // Equivalent to while(true)
      // If the queue is empty, no path was found.
      if (queue.length === 0x0) {
         stepCount = -0b1; // Using -0b1 instead of -1
         break;
      }

      // Dequeue the first element (current state).
      const currentPath = queue.shift();

      // Extract components from the current state.
      const currentX = currentPath[0x0];
      const currentY = currentPath[0b1];
      const pathSteps = currentPath[2];
      const currentStrength = currentPath[3];
      const gridState = currentPath[4]; // The grid configuration at this state

      // Check if we have reached the required power level.
      if (currentStrength === requiredPowerLevel + 0b1) {
         stepCount = pathSteps;
         break;
      }

      // Explore all 4 possible directions.
      for (let directionIndex = 0x0; directionIndex < 4; directionIndex++) {
         const nextX = currentX + deltaX[directionIndex];
         const nextY = currentY + deltaY[directionIndex];
         let nextStrength = currentStrength;

         // Boundary check: ensure next position is within grid limits.
         if (nextX < 0x0 || nextY < 0x0 || nextX >= gridDimensionsAndPower[0b1] || nextY >= gridDimensionsAndPower[0x0]) {
            continue; // Skip if out of bounds
         }

         // Obstacle check: 'X' denotes an impassable block.
         // This uses the global initialGridMap, assuming 'X' obstacles are static.
         if (initialGridMap[nextY][nextX] === "X") {
            continue;
         }

         // Create a deep copy of the current grid state for the next step.
         // This is crucial because the grid state can change (consuming power levels).
         const gridCopy = gridState.map(function(row) {
            return row.slice(); // Slice creates a shallow copy of the inner array
         });

         // Check if the next cell contains the power level required for the current strength.
         // If it does, consume it and increment strength.
         if (gridCopy[nextY][nextX] === String(nextStrength)) { // Using String() instead of ""+
            nextStrength++;
            gridCopy[nextY][nextX] = "."; // Mark as consumed
         }

         // Generate a unique key for the current state (coordinates + flattened grid).
         const stateKey = nextX + " " + nextY + " " + gridCopy.join("");

         // If this state has already been visited, skip it.
         if (visitedStates.hasOwnProperty(stateKey)) {
            continue;
         }

         // Mark the new state as visited.
         visitedStates[stateKey] = !false;

         // Add the new state to the queue.
         queue.push([nextX, nextY, pathSteps + 0b1, nextStrength, gridCopy]);
      }
   }
   return stepCount; // Return the minimum steps or -1 if no path.
}

// --- Main execution part ---

// Read input from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into lines and trim any leading/trailing whitespace.
const inputLines = (rawData.trim()).split("\n");

// Parse the first line: grid dimensions (rows, columns) and required power level.
// gridDimensionsAndPower[0] = rows, gridDimensionsAndPower[1] = columns, gridDimensionsAndPower[2] = required power.
const gridDimensionsAndPower = (inputLines.shift()).split(" ").map(Number);

// Extract the required power level.
const requiredPowerLevel = gridDimensionsAndPower[2];

// Initialize the 2D array representing the grid.
const initialGridMap = [];

// Initialize the starting position [x, y].
const startPosition = [];

// Loop through the remaining input lines to populate the grid and find the 'S' (start).
for (let rowIdx = 0x0; rowIdx < gridDimensionsAndPower[0x0]; rowIdx++) {
   const currentLineChars = (inputLines.shift()).split(""); // Get characters for the current row.
   // If 'S' is found in this row, record its coordinates.
   if (currentLineChars.indexOf("S") !== -0b1) {
      startPosition[0x0] = currentLineChars.indexOf("S"); // X-coordinate
      startPosition[0b1] = rowIdx; // Y-coordinate
   }
   initialGridMap.push(currentLineChars); // Add the row to the grid map.
}

// Call the BFS function with the starting coordinates.
const finalResult = exploreGrid(startPosition[0x0], startPosition[0b1]);

// Output the result to the console.
console.log(finalResult);
