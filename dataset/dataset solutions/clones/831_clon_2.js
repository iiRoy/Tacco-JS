let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input file
let lineBuffer = rawData.trim().split("\n"); // Process raw input: remove leading/trailing whitespace and split into lines

while (true) { // Begin main loop for processing multiple test cases
  let dimensions = lineBuffer.shift().split(" "); // Extract N and M for the current test case
  
  // Check for the termination condition (N=0, M=0)
  if (dimensions.join(" ") === "0 0") {
    break; // Exit the loop if both N and M are zero
  }

  let numRows = parseInt(dimensions[0]); // Parse N, the number of rows
  let numCols = parseInt(dimensions[1]); // Parse M, the number of columns

  let colValues = []; // Initialize an array to store M values
  // Populate the colValues array by shifting and parsing lines from the buffer
  for (let vIdx = 0; vIdx < numCols; vIdx++) {
    colValues.push(parseInt(lineBuffer.shift()));
  }

  let rowValues = []; // Initialize an array to store N values
  // Populate the rowValues array by shifting and parsing lines from the buffer
  for (let rIdx = 0; rIdx < numRows; rIdx++) {
    rowValues.push(parseInt(lineBuffer.shift()));
  }

  // IMPORTANT: The 'continue' statement below causes the program to skip
  // the entire dynamic programming calculation and output for every test case.
  // This preserves the exact observable behavior of the original code,
  // which would not produce any console output due to this statement.
  continue; 

  // The following code block (DP calculation and console.log) is unreachable
  // due to the 'continue;' statement above. It is included here to maintain
  // the exact structural integrity of the original code as per Type II cloning rules.

  let dynamicProgTable = []; // Declare the dynamic programming table
  // Initialize the DP table with Infinity values
  for (let rIdx = 0; rIdx <= numRows; rIdx++) {
    dynamicProgTable[rIdx] = []; // Create inner array for each row
    for (let cIdx = 0; cIdx <= 255; cIdx++) {
      dynamicProgTable[rIdx][cIdx] = Infinity; // Set initial cost to a very large number
    }
  }

  dynamicProgTable[0][128] = 0; // Set the base case: cost is 0 for starting pixel value 128

  // Iterate through the DP table to fill it
  for (let rIdx = 1; rIdx <= numRows; rIdx++) {
    for (let cIdx = 0; cIdx <= 255; cIdx++) {
      // Only proceed if the previous state (dynamicProgTable[rIdx-1][cIdx]) is reachable
      if (dynamicProgTable[rIdx - 1][cIdx] !== Infinity) {
        // Iterate through all possible M values
        for (let vIdx = 0; vIdx < numCols; vIdx++) {
          let adjustedCol = cIdx + colValues[vIdx]; // Calculate the new pixel value

          // Clamp the new pixel value to the valid range [0, 255]
          if (adjustedCol < 0) {
            adjustedCol = 0;
          }
          if (adjustedCol > 255) {
            adjustedCol = 255;
          }

          // Update the minimum cost for the current state
          dynamicProgTable[rIdx][adjustedCol] = Math.min(
            dynamicProgTable[rIdx][adjustedCol],
            dynamicProgTable[rIdx - 1][cIdx] + Math.pow(rowValues[rIdx - 1] - adjustedCol, 2)
          );
        }
      }
    }
  }

  let minimumCost = Infinity; // Initialize variable to find the overall minimum cost
  // Iterate through the last row of the DP table to find the minimum cost
  dynamicProgTable[numRows].forEach(function(currentCost) {
    minimumCost = Math.min(minimumCost, currentCost); // Update minimumCost if a smaller value is found
  });

  console.log(minimumCost); // Output the final calculated minimum cost
}
