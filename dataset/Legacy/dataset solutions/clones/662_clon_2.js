var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string: remove leading/trailing whitespace and split into an array of lines.
var lineBuffer = rawData.trim().split("\n");

// Main processing loop, continues until a specific termination condition is met.
while (true) {
   // Retrieve the next line from the buffer, which should contain N and H values.
   var dimensionsStr = lineBuffer.shift();

   // Check for the termination sentinel value.
   if (dimensionsStr === "0 0") {
      break; // Exit the loop if "0 0" is encountered.
   }

   // Parse the dimensions string into an array of numbers.
   var parsedDims = dimensionsStr.split(" ").map(Number);

   // Extract the grid size (N).
   var gridSize = parsedDims[0];

   // Extract the number of operations (H).
   var numOperations = parsedDims[1];

   // Initialize an object to store blocked cells. Keys will be "x,y,z" strings.
   var blockedCells = {};

   // Loop through each of the H operations.
   for (var opIndex = 0; opIndex < numOperations; opIndex++) {
      // Get the next operation line and split it into parts.
      var operationParts = lineBuffer.shift().split(" ");

      // The type of plane to block (e.g., "xy", "xz", "yz").
      var planeType = operationParts[0];

      // The first coordinate for the plane. Convert to number explicitly.
      var coordA = operationParts[1] - 0;

      // The second coordinate for the plane. Convert to number explicitly.
      var coordB = operationParts[2] - 0;

      // If it's an "xy" plane, block all cells where x=coordA, y=coordB, and z varies from 1 to gridSize.
      if (planeType === "xy") {
         for (var iterCoord = 1; iterCoord <= gridSize; iterCoord++) {
            blockedCells[coordA + "," + coordB + "," + iterCoord] = true;
         }
      }
      // If it's an "xz" plane, block all cells where x=coordA, z=coordB, and y varies from 1 to gridSize.
      else if (planeType === "xz") {
         for (var iterCoord = 1; iterCoord <= gridSize; iterCoord++) {
            blockedCells[coordA + "," + iterCoord + "," + coordB] = true;
         }
      }
      // If it's a "yz" plane, block all cells where y=coordA, z=coordB, and x varies from 1 to gridSize.
      else if (planeType === "yz") {
         for (var iterCoord = 1; iterCoord <= gridSize; iterCoord++) {
            blockedCells[iterCoord + "," + coordA + "," + coordB] = true;
         }
      }
   }
   // Calculate the total number of cells in the N*N*N grid and subtract the count of unique blocked cells.
   // Then, print the result to the console.
   console.log(gridSize * gridSize * gridSize - Object.keys(blockedCells).length);
}
