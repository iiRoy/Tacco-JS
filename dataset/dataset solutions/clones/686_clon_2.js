let dataSourceContent = require('node:fs').readFileSync('/dev/stdin', 'utf-8');

// Process raw input data into an array of lines
let inputLines = dataSourceContent.trim().split("\n");

// Main processing loop for multiple test cases
while (true) {
   // Extract the line containing grid width and height
   let currentDimsString = inputLines.shift();

   // Check for termination condition
   if (currentDimsString === "0 0") {
      break;
   }

   // Parse the dimensions string into numbers
   let gridDimensions = currentDimsString.split(" ").map(val => parseInt(val, 10));

   // Assign width and height
   let gridWidth = gridDimensions[0];
   let gridHeight = gridDimensions[1];

   // Initialize robot state: [direction, x-coordinate, y-coordinate]
   // Direction: 0=North, 1=East, 2=South, 3=West
   let robotState = [0, 1, 1];

   // Loop for processing robot commands within the current grid
   while (true) {
      // Get the next command line and split it into tokens
      let commandTokens = inputLines.shift().split(' ');

      // Convert the second token to a number if it exists (for movement commands)
      if (commandTokens.length === 2) {
         commandTokens[1] = parseInt(commandTokens[1], 10);
      }

      // Check for command sequence termination
      if (commandTokens[0] === "STOP") {
         break;
      }

      // Handle 'RIGHT' command: rotate clockwise
      if (commandTokens[0] === "RIGHT") {
         robotState[0] = robotState[0] + 1;
         if (robotState[0] === 4) {
            robotState[0] = 0;
         }
      }

      // Handle 'LEFT' command: rotate counter-clockwise
      if (commandTokens[0] === "LEFT") {
         robotState[0] = robotState[0] - 1;
         if (robotState[0] === -1) {
            robotState[0] = 3;
         }
      }

      // Handle 'FORWARD' command: move in current direction
      if (commandTokens[0] === "FORWARD") {
         while (commandTokens[1]--) { // Decrement steps remaining
            if (robotState[0] === 0) { // North (Y increases)
               robotState[2] = robotState[2] + 1;
            }
            if (robotState[0] === 1) { // East (X increases)
               robotState[1] = robotState[1] + 1;
            }
            if (robotState[0] === 2) { // South (Y decreases)
               robotState[2] = robotState[2] - 1;
            }
            if (robotState[0] === 3) { // West (X decreases)
               robotState[2] = robotState[2] - 1;
            }
         }
      }

      // Handle 'BACKWARD' command: move opposite to current direction
      if (commandTokens[0] === "BACKWARD") {
         while (commandTokens[1]--) { // Decrement steps remaining
            if (robotState[0] === 0) { // South (Y decreases)
               robotState[2] = robotState[2] - 1;
            }
            if (robotState[0] === 1) { // West (X decreases)
               robotState[1] = robotState[1] - 1;
            }
            if (robotState[0] === 2) { // North (Y increases)
               robotState[2] = robotState[2] + 1;
            }
            if (robotState[0] === 3) { // East (X increases)
               robotState[1] = robotState[1] + 1;
            }
         }
      }

      // Enforce boundary constraints for X-coordinate
      if (robotState[1] < 1) {
         robotState[1] = 1;
      }
      if (robotState[1] > gridWidth) {
         robotState[1] = gridWidth;
      }

      // Enforce boundary constraints for Y-coordinate
      if (robotState[2] < 1) {
         robotState[2] = 1;
      }
      if (robotState[2] > gridHeight) {
         robotState[2] = gridHeight;
      }
   }

   // Remove the direction component, leaving only X and Y coordinates
   robotState.shift();

   // Output the final X and Y coordinates, separated by a space
   console.log(robotState.join(' '));
}