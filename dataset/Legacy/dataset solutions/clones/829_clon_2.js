var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineSegments = rawData.trim().split("\n"); // Split input into lines and remove leading/trailing whitespace

while (true) {
  // Process each test case until "0 0" is encountered
  var dimensions = lineSegments.shift().split(" "); // Get N and M for the current test case

  if (dimensions.join(" ") === "0 0") {
    // Check for termination condition
    break;
  }

  var numItems = dimensions[0]; // N: number of items
  var numOperations = dimensions[1]; // M: number of operations

  var operationValues = []; // Array to store M values
  for (var opIdx = 0; opIdx < numOperations; opIdx++) {
    operationValues.push(+lineSegments.shift()); // Convert to number and add to array
  }

  var itemValues = []; // Array to store N values
  for (var itemIdx = 0; itemIdx < numItems; itemIdx++) {
    itemValues.push(+lineSegments.shift()); // Convert to number and add to array
  }

  // Initialize dynamic programming table
  var dynamicProgTable = [];
  for (var itemIdx = 0; itemIdx <= numItems; itemIdx++) {
    dynamicProgTable[itemIdx] = [];
    for (var currentVal = 0; currentVal <= 255; currentVal++) {
      dynamicProgTable[itemIdx][currentVal] = -1; // Initialize with -1 (unreachable state)
    }
  }

  // Base case: starting state at item 0, value 128, cost 0
  dynamicProgTable[0][128] = 0;

  // Fill the DP table
  for (var itemIdx = 1; itemIdx <= numItems; itemIdx++) {
    for (var currentVal = 0; currentVal <= 255; currentVal++) {
      for (var opIdx = 0; opIdx < numOperations; opIdx++) {
        var modifiedVal = currentVal + operationValues[opIdx]; // Apply operation

        // Clamp modified value to [0, 255] range
        if (modifiedVal < 0) {
          modifiedVal = 0;
        }
        if (modifiedVal > 255) {
          modifiedVal = 255;
        }

        // If the previous state was reachable
        if (dynamicProgTable[itemIdx - 1][currentVal] !== -1) {
          // Calculate cost for the current state
          var currentCost = dynamicProgTable[itemIdx - 1][currentVal] + Math.pow(itemValues[itemIdx - 1] - modifiedVal, 2);

          // Update DP table entry
          if (dynamicProgTable[itemIdx][modifiedVal] !== -1) {
            dynamicProgTable[itemIdx][modifiedVal] = Math.min(dynamicProgTable[itemIdx][modifiedVal], currentCost);
          } else {
            dynamicProgTable[itemIdx][modifiedVal] = currentCost;
          }
        }
      }
    }
  }

  // Find the minimum cost in the last row of the DP table
  var minimumCost = Infinity;
  dynamicProgTable[numItems].forEach(function (tableEntry) {
    if (tableEntry !== -1) { // Only consider reachable states
      minimumCost = Math.min(minimumCost, tableEntry);
    }
  });

  console.log(minimumCost); // Output the result for the current test case
}
