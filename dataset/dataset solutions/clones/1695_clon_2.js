'use strict';

function ProcessInput(inputData) {
  // Parse the incoming text data
  const processedLines = inputData.trim().split(/\r?\n/g);

  // Extract dimensions and target count from the first line
  const [heightVal, widthVal, targetCount] = processedLines.shift().split(' ').map(Number);

  // The remaining lines form the grid content
  const gridContent = processedLines;

  let finalTally = 0; // Initialize a counter for valid configurations

  // Iterate through all possible row selections using a bitmask
  for (let rowSelectionMask = 0; rowSelectionMask < (1 << heightVal); rowSelectionMask++) {
    // Iterate through all possible column selections using a bitmask
    for (let colSelectionMask = 0; colSelectionMask < (1 << widthVal); colSelectionMask++) {
      let currentBlackCount = 0; // Counter for '#' in the current selection

      // Iterate over each row of the grid
      for (let rowIndex = 0; rowIndex < heightVal; rowIndex++) {
        // If the current row is "selected" (bit is set in rowSelectionMask), skip it
        if ((rowSelectionMask >> rowIndex) & 1) {
          continue;
        }

        // Iterate over each column in the current row
        for (let colIndex = 0; colIndex < widthVal; colIndex++) {
          // If the current column is "selected" (bit is set in colSelectionMask), skip it
          if ((colSelectionMask >> colIndex) & 1) {
            continue;
          }

          // If the cell is '#' and not skipped, increment the count
          if (gridContent[rowIndex][colIndex] === "#") {
            currentBlackCount++;
          }
        }
      }

      // If the count of '#' in the unselected cells matches the target, increment the final tally
      if (currentBlackCount === targetCount) {
        finalTally++;
      }
    }
  }

  // Output the final result
  console.log(finalTally);
}

// Standard boilerplate for competitive programming in Node.js
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
