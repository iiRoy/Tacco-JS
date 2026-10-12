function ProcessInput(rawData) {
  // Split the raw input into individual lines
  const lineSegments = rawData.split("\n");

  // Parse the first line for problem dimensions
  const dimensions = lineSegments[0].split(" ");
  const totalLength = parseInt(dimensions[0], 10); // Convert N to integer
  const maxJump = parseInt(dimensions[1], 10);     // Convert M to integer

  // Split the second line into an array of characters representing the terrain
  const terrainMap = lineSegments[1].split("");

  // Initialize an array to store the initial, longest path steps
  const initialPath = [];
  let currentPos = 0; // Current position on the terrain

  // Loop to find the longest possible steps to reach the end
  while (currentPos < totalLength - 1) {
    let stepSize; // Variable to hold the size of the current jump
    // Iterate backwards from maxJump to 1 to find the largest valid jump
    for (stepSize = maxJump; stepSize >= 1; stepSize--) {
      // Check if the landing spot is within bounds and is a valid '0' (safe) tile
      if (currentPos + stepSize < totalLength && terrainMap[currentPos + stepSize] === '0') {
        currentPos += stepSize; // Move to the new position
        initialPath.push(stepSize); // Record the step size
        break; // Found a valid jump, move to the next segment
      }
    }

    // If no valid jump was found within maxJump distance, it's impossible
    if (stepSize < 1) {
      console.log(-1); // Output -1 indicating no solution
      return;          // Exit the function
    }
  }

  // This function is defined but not used in the original code's execution path.
  // It appears to be for exploring alternative path combinations.
  const exploreCombinations = function(currentPath) {
    let hasCombined = false; // Flag to track if any combination occurred in this iteration
    for (let idx = 0; idx < currentPath.length - 1; idx++) {
      // Check if two adjacent steps can be combined into a single jump within maxJump limit
      if (currentPath[idx] + currentPath[idx + 1] <= maxJump) {
        const modifiedPath = Array.from(currentPath); // Create a copy of the path
        modifiedPath[idx] += modifiedPath[idx + 1];   // Combine the steps
        modifiedPath.splice(idx + 1, 1);              // Remove the second step
        exploreCombinations(modifiedPath);            // Recursively explore new path
        hasCombined = true;                           // Mark that a combination happened
      }
    }
    // If no combinations were made and this path is shorter or equal to the 'simple' path,
    // it's considered an optimal path (though 'simple' is not yet defined here).
    if (!hasCombined && currentPath.length <= optimizedPath.length) {
      optimalPaths.push(Array.from(currentPath)); // Store this path
    }
  };

  // Initialize an array to store potential optimal paths (unused in final output)
  const optimalPaths = [];

  // Calculate the 'optimizedPath' by greedily combining steps from right to left
  let pathIndex = initialPath.length - 1; // Start from the end of the initial path
  const optimizedPath = [];               // Array to store the optimized steps

  while (pathIndex >= 0) {
    let combinedStep = initialPath[pathIndex]; // Start with the current step
    pathIndex--; // Move to the previous step

    // While there are previous steps and combining them doesn't exceed maxJump
    while (pathIndex >= 0 && combinedStep + initialPath[pathIndex] <= maxJump) {
      combinedStep += initialPath[pathIndex]; // Add the previous step to the current combined step
      pathIndex--;                            // Move further back
    }
    optimizedPath.unshift(combinedStep); // Add the combined step to the beginning of the optimized path
  }

  // Output the optimized path as a concatenated string of step sizes
  console.log(optimizedPath.join(""));
}

// Read input from standard input and pass it to the Main function
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
