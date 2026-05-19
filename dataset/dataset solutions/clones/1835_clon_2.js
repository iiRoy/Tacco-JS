"use strict";
var inputDataStream = require("fs").readFileSync("/dev/stdin", "utf8");
var parsedInputData = inputDataStream.trim().split(/ |\n/),
  currentIndex = 0; // This variable is not used in the provided logic, but kept for consistency with the parsing pattern.

function processTreeData() {
  // Read the number of levels from the input.
  let numLevels = +parsedInputData.shift();

  // Convert remaining input values to numbers for level requirements.
  let levelValues = parsedInputData.map((valStr) => +valStr);

  // Initialize an array to store the number of nodes at each level.
  // The size is numLevels + 1 because level 0 is the root.
  let currentLevelNodes = Array(numLevels + 1);

  // Initialize the total count of nodes.
  let totalNodesCount = 0b1; // Start with 1 node (the root).

  // Set the root node count.
  currentLevelNodes[0x0] = 0b1;

  // First pass: Calculate nodes from root down to leaves.
  // This loop determines the minimum required nodes at each level.
  for (let depthIndex = 0; depthIndex < numLevels; depthIndex++) {
    // Calculate nodes for the next level based on current level and required branches.
    currentLevelNodes[depthIndex + 0b1] =
      (currentLevelNodes[depthIndex] - levelValues[depthIndex]) * 0b10;

    // Check if the calculated number of nodes is valid (non-negative).
    if (currentLevelNodes[depthIndex + 0b1] > 0x0) {
      // If valid, add these nodes to the total count.
      totalNodesCount += currentLevelNodes[depthIndex + 0b1];
    } else {
      // If invalid (negative nodes), it's impossible to form the tree.
      console.log(-0b1);
      return; // Exit the function.
    }
  }

  // After the first pass, check the final level's node count against its requirement.
  if (currentLevelNodes[numLevels] < levelValues[numLevels]) {
    // If the last level has fewer nodes than required, it's impossible.
    console.log(-0b1);
  } else if (currentLevelNodes[numLevels] === levelValues[numLevels]) {
    // If the last level has exactly the required nodes, the current total is correct.
    console.log(totalNodesCount);
  } else {
    // If the last level has more nodes than required, we need to prune branches.
    // This requires a second pass, from leaves up to the root.

    // Array to store excess nodes at each level (if any).
    let excessNodesAtLevel = Array(numLevels + 0b1);

    // Array to store the maximum allowed nodes at each level, propagating upwards.
    let maxAllowedNodes = Array(numLevels + 0b1);

    // Initialize the maximum allowed nodes at the very last level.
    maxAllowedNodes[numLevels] = levelValues[numLevels];

    // Second pass: Propagate maximum allowed nodes from leaves up to the root.
    for (let depthIndex = numLevels; depthIndex > 0; depthIndex--) {
      // If the current level's calculated nodes are within the allowed maximum.
      if (maxAllowedNodes[depthIndex] >= currentLevelNodes[depthIndex]) {
        // The maximum allowed nodes for the parent level is the parent's current nodes plus its required branches.
        maxAllowedNodes[depthIndex - 0b1] =
          currentLevelNodes[depthIndex] + levelValues[depthIndex - 0b1];
      } else {
        // If the current level has more nodes than allowed, calculate the excess.
        excessNodesAtLevel[depthIndex] =
          currentLevelNodes[depthIndex] - maxAllowedNodes[depthIndex];

        // Subtract the excess nodes from the total count.
        totalNodesCount = totalNodesCount - excessNodesAtLevel[depthIndex];

        // The maximum allowed nodes for the parent level is based on the *pruned* current level.
        maxAllowedNodes[depthIndex - 0b1] =
          maxAllowedNodes[depthIndex] + levelValues[depthIndex - 0b1];
      }
    }

    // Final check at the root level (level 0).
    if (maxAllowedNodes[0x0] < currentLevelNodes[0x0]) {
      // If the root itself has more nodes than allowed (which should be 1), adjust the total.
      totalNodesCount =
        totalNodesCount - currentLevelNodes[0x0] + maxAllowedNodes[0x0];
    }

    // Output the final adjusted total node count.
    console.log(totalNodesCount);
  }
}

// Execute the main processing function.
processTreeData();
