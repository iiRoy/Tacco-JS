var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

const TERMINATION_SEQUENCE = "0 0";
const MARKED_CELL_VALUE = 1;
const UNMARKED_CELL_VALUE = 0;

// Helper function to create and initialize a 3D array (cube)
function initialize3DCube(size, initialVal) {
    let cube = [];
    for (let d1 = 0; d1 < size; d1++) {
        cube[d1] = [];
        for (let d2 = 0; d2 < size; d2++) {
            cube[d1][d2] = new Array(size).fill(initialVal);
        }
    }
    return cube;
}

while (true) {
   var currentInputLine = inputLines.shift();
   if (currentInputLine === TERMINATION_SEQUENCE) {
      break;
   }

   var dimensionsAndOperations = currentInputLine.split(" ").map(Number);
   var cubeDimension = dimensionsAndOperations[0];
   var operationCount = dimensionsAndOperations[1];

   var volumeGrid = initialize3DCube(cubeDimension, UNMARKED_CELL_VALUE);

   for (var opIdx = 0; opIdx < operationCount; opIdx++) {
      var operationData = inputLines.shift().split(" ");
      var operationType = operationData.shift();
      
      // Helper for parsing coordinate strings to 0-indexed numbers
      const parseCoordinates = (coordStrings) => coordStrings.map(val => parseInt(val, 10) - 1);
      var targetCoordinates = parseCoordinates(operationData);

      switch (operationType) {
         case "xy":
            // Mark a slice along the z-axis (fixed x, y; iterate z)
            for (var zCoord = 0; zCoord < cubeDimension; zCoord++) {
               volumeGrid[targetCoordinates[0]][targetCoordinates[1]][zCoord] = MARKED_CELL_VALUE;
            }
            break;
         case "xz":
            // Mark a slice along the y-axis (fixed x, z; iterate y)
            for (var yCoord = 0; yCoord < cubeDimension; yCoord++) {
               volumeGrid[targetCoordinates[0]][yCoord][targetCoordinates[1]] = MARKED_CELL_VALUE;
            }
            break;
         case "yz":
            // Mark a slice along the x-axis (fixed y, z; iterate x)
            for (var xCoord = 0; xCoord < cubeDimension; xCoord++) {
               volumeGrid[xCoord][targetCoordinates[0]][targetCoordinates[1]] = MARKED_CELL_VALUE;
            }
            break;
         default:
            // No action for unknown operation types, preserving original behavior
            break;
      }
   }

   var totalUnmarkedCells = 0;
   for (var x = 0; x < cubeDimension; x++) {
      for (var y = 0; y < cubeDimension; y++) {
         for (var z = 0; z < cubeDimension; z++) {
            if (volumeGrid[x][y][z] === UNMARKED_CELL_VALUE) {
               totalUnmarkedCells++;
            }
         }
      }
   }
   console.log(totalUnmarkedCells);
}
