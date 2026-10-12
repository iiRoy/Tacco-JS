var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineSegments = rawData.trim().split("\n");

// Main processing loop for multiple test cases
while (true) {
  // Extract dimensions and height for the current test case
  var dimensionsAndHeight = lineSegments.shift();

  // Check for termination condition
  if (dimensionsAndHeight === "0 0") {
    break;
  }

  // Parse dimensions and height into numbers
  dimensionsAndHeight = dimensionsAndHeight.split(" ").map(Number);

  // Assign parsed values to descriptive variables
  var gridSize = dimensionsAndHeight[0];
  var numOperations = dimensionsAndHeight[1];

  // Initialize a 3D grid with all cells set to 0
  var threeDGrid = [];
  for (var idxA = 0; idxA < gridSize; idxA++) {
    threeDGrid[idxA] = [];
    for (var idxB = 0; idxB < gridSize; idxB++) {
      threeDGrid[idxA][idxB] = [];
      for (var idxC = 0; idxC < gridSize; idxC++) {
        threeDGrid[idxA][idxB][idxC] = 0;
      }
    }
  }

  // Process each operation
  for (var opIndex = 0; opIndex < numOperations; opIndex++) {
    var operationParams = lineSegments.shift().split(" ");
    var operationType = operationParams.shift(); // Get the operation type string

    // Adjust coordinates by subtracting 1 (0-indexed)
    operationParams = operationParams.map(function(val) {
      return val - 1;
    });

    /*
    // The following block is commented out in the original code.
    // It represents potential logic for marking cells based on operation type.
    // For a Type II clone, we preserve its commented-out status and content.
    if (operationType === "xy") {
      for (var iter = 0; iter < gridSize; iter++) {
        threeDGrid[operationParams[0]][operationParams[1]][iter] = 1;
      }
    } else if (operationType === "xz") {
      for (var iter = 0; iter < gridSize; iter++) {
        threeDGrid[operationParams[0]][iter][operationParams[1]] = 1;
      }
    } else if (operationType === "yz") {
      for (var iter = 0; iter < gridSize; iter++) {
        threeDGrid[iter][operationParams[0]][operationParams[1]] = 1;
      }
    }
    */
  }

  // Count the number of cells that remain 0 (unmarked)
  var emptyCellsCount = 0;
  for (var idxA = 0; idxA < gridSize; idxA++) {
    for (var idxB = 0; idxB < gridSize; idxB++) {
      for (var idxC = 0; idxC < gridSize; idxC++) {
        if (threeDGrid[idxA][idxB][idxC] === 0) {
          emptyCellsCount++;
        }
      }
    }
  }

  // Output the final count for the current test case
  console.log(emptyCellsCount);
}
