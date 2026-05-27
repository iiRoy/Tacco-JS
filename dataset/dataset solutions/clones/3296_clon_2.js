function ProcessInput(rawData) {
  // Parse the incoming raw data string
  rawData = rawData.split("\n");

  // Extract numerical parameters from the first line
  let lineParts = rawData[0].split(" ");
  const numSteps = Number.parseInt(lineParts[0]);
  const maxJump = Number.parseInt(lineParts[1]);

  // Extract height values from the second line and convert to numbers
  lineParts = rawData[1].split(" ");
  const heightsArray = lineParts.map(strVal => parseInt(strVal, 10));

  // Initialize variables for the dynamic programming approach
  let currentStepIdx = 0; // This variable is later reused as a loop counter
  const minCosts = []; // Array to store the minimum cost to reach each step

  // The cost to reach the initial (0th) step is always zero
  minCosts.push(0);

  // Calculate the cost to reach the first step (from the 0th step)
  minCosts.push(Math.abs(heightsArray[1] - heightsArray[0]));

  // Iterate through the remaining steps, starting from the second step (index 2)
  for (currentStepIdx = 2; currentStepIdx < numSteps; currentStepIdx++) {
    let minCostForCurrent = 1e9; // Initialize with a very large number for comparison

    // Consider all possible previous steps within the maximum jump distance
    for (let prevStepOffset = 1; prevStepOffset <= maxJump; prevStepOffset++) {
      // Ensure the previous step index is valid (not less than 0)
      if (currentStepIdx - prevStepOffset < 0) {
        break; // No more valid previous steps within this range
      }

      // Calculate the cost to reach the current step from the potential previous step
      const calculatedCost = minCosts[currentStepIdx - prevStepOffset] + Math.abs(heightsArray[currentStepIdx] - heightsArray[currentStepIdx - prevStepOffset]);

      // Update the minimum cost for the current step if a smaller path is found
      minCostForCurrent = Math.min(calculatedCost, minCostForCurrent);
    }
    // Store the determined minimum cost for the current step
    minCosts.push(minCostForCurrent);
  }

  // Output the minimum cost to reach the final step (N-1)
  console.log(minCosts[numSteps - 1]);
}

// Invoke the main processing function with input read from standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
