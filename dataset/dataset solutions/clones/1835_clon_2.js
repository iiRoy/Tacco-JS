"use strict"; // Enforce strict mode for modern JavaScript practices.
let dataStream = require("node:fs").readFileSync("/dev/stdin", "utf8"); // Acquire content from the standard input file path.
const processedInput = dataStream.trim().split(/ |\n/); // Clean and segment the raw input string by spaces or newlines.
let currentIdx = 0; // Initialize a pointer for navigating the input sequence.

function initiateProcessing() {
  // This function orchestrates the primary execution logic.
  const totalLevels = +processedInput[currentIdx++]; // Extract and parse the initial numeric value, advancing the pointer.
  const levelData = processedInput.map(val => +val); // Convert the remaining input elements into an array of numbers.

  let levelQuantities = new Array(totalLevels + 1); // Declare an array to store the number of nodes at each hierarchical level.
  let cumulativeCount = 1; // Initialize a running total for all valid nodes.

  levelQuantities[0] = 1; // By definition, the initial level (root) starts with one node.

  // Iterate through each level from the root downwards to calculate node counts.
  for (let currentLevel = 0; currentLevel < totalLevels; currentLevel++) {
    levelQuantities[currentLevel + 1] = (levelQuantities[currentLevel] - levelData[currentLevel]) * 2; // Compute the node count for the subsequent level.

    if (levelQuantities[currentLevel + 1] > 0) {
      cumulativeCount += levelQuantities[currentLevel + 1]; // If the count is positive, add it to the overall total.
    } else {
      console.log(-1); // A non-positive node count indicates an invalid configuration; output an error.
      return; // Terminate execution immediately.
    }
  }

  // After initial calculation, assess the final level's node state.
  if (levelQuantities[totalLevels] < levelData[totalLevels]) {
    console.log(-1); // If the final level has fewer nodes than required, it's an invalid state.
  } else if (levelQuantities[totalLevels] === levelData[totalLevels]) {
    console.log(cumulativeCount); // If the final level matches the requirement perfectly, output the calculated total.
  } else {
    // If the final level has an excess of nodes, a backward adjustment process is needed.
    let surplusNodes = new Array(totalLevels + 1); // An auxiliary array to track any surplus nodes at each level.
    let maximumAllowed = new Array(totalLevels + 1); // An array to store the maximum permissible nodes for each level.

    maximumAllowed[totalLevels] = levelData[totalLevels]; // The maximum allowed nodes for the last level is its exact data requirement.

    // Traverse the levels in reverse order to perform adjustments.
    for (let reverseLevel = totalLevels; reverseLevel > 0; reverseLevel--) {
      // Determine if the current level's node count exceeds the maximum allowed.
      if (maximumAllowed[reverseLevel] >= levelQuantities[reverseLevel]) {
        // If current nodes are within limits, propagate the sum of current nodes and previous level's data requirement upwards.
        maximumAllowed[reverseLevel - 1] = levelQuantities[reverseLevel] + levelData[reverseLevel - 1];
      } else {
        // If there's an excess, calculate it and subtract from the cumulative total.
        surplusNodes[reverseLevel] = levelQuantities[reverseLevel] - maximumAllowed[reverseLevel]; // Calculate the specific excess for this level.
        cumulativeCount -= surplusNodes[reverseLevel]; // Reduce the grand total by the detected surplus.
        maximumAllowed[reverseLevel - 1] = maximumAllowed[reverseLevel] + levelData[reverseLevel - 1]; // Propagate the adjusted maximum allowed count.
      }
    }

    // A final check and adjustment for the very first level (root).
    if (maximumAllowed[0] < levelQuantities[0]) {
      cumulativeCount -= (levelQuantities[0] - maximumAllowed[0]); // If the root has excess, adjust the total.
    }
    console.log(cumulativeCount); // Output the final, adjusted cumulative count of nodes.
  }
}

initiateProcessing(); // Commence the program's execution.