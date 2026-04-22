function processInput(rawData) {
  // Parse the initial configuration values from the first line of input.
  // 'totalElements' represents N, 'totalSteps' represents K, both as BigInt.
  let [totalElements, totalSteps] = rawData[0] .trim() .split(" ") .map(valStr => BigInt(valStr));

  // Parse the array of destination indices from the second line of input.
  // Each element indicates the next jump target, parsed as an integer.
  let destinationIndices = rawData[1] .trim() .split(" ") .map(numStr => parseInt(numStr));

  // Initialize a record array to keep track of visited positions and their corresponding step counts.
  // A value of -1 signifies an unvisited position.
  let visitRecord = [];
  for (let idx = 0; idx < totalElements; idx++) {
    visitRecord[idx] = -1; // Mark all positions as initially unvisited
    destinationIndices[idx]--; // Adjust all indices to be 0-based for array access
  }

  // Variables to manage the traversal process and detect any cycles within the sequence.
  let stepCount = 0; // Accumulates the total number of steps taken so far.
  let currentPosition = 0; // Represents the current location in the sequence, starting from 0.
  let cycleDetected = false; // A boolean flag to indicate if a loop has been discovered.

  // Traverse the sequence to identify any repeating patterns or cycles.
  while (true) {
    let nextHop = destinationIndices[currentPosition]; // Determine the next position based on current location.

    if (visitRecord[nextHop] === -1) {
      // If the determined next position has not been visited before:
      visitRecord[nextHop] = stepCount; // Record the current step count when this position is first entered.
      stepCount++; // Increment the total steps taken.
      currentPosition = nextHop; // Move to the newly visited position.
    } else {
      // If the next position has already been visited, a cycle has been found.
      cycleDetected = true; // Set the flag to true.
      break; // Exit the traversal loop as the cycle is characterized.
    }
  }

  // Calculate parameters essential for determining the final position given 'totalSteps'.
  // 'preCycleSteps' is the number of steps from the start until the first entry into the cycle.
  let preCycleSteps = BigInt(visitRecord[destinationIndices[currentPosition]]);
  // 'cycleLength' is the total number of steps within the detected loop itself.
  let cycleLength = BigInt(stepCount - visitRecord[destinationIndices[currentPosition]]);

  // Variable to hold the effective number of steps we actually need to traverse.
  let effectiveSteps = 0n; // Initialized as a BigInt.

  // Conditional logic to calculate 'effectiveSteps' based on 'totalSteps' and cycle properties.
  // If 'totalSteps' is less than the steps required to reach the cycle, or if no cycle was found:
  if (((totalSteps - preCycleSteps) < 0n) || (!cycleDetected)) {
    effectiveSteps = totalSteps; // The effective steps are simply 'totalSteps' as no cycle effect applies.
  } else {
    // If 'totalSteps' is large enough to enter and potentially loop through the cycle:
    // Calculate the effective steps within the cycle using modulo arithmetic to account for repetitions.
    effectiveSteps = (totalSteps - preCycleSteps) % cycleLength + preCycleSteps;
  }

  // Reset the current position back to the starting point for the final traversal.
  currentPosition = 0;

  // Perform the final traversal based on the 'effectiveSteps' calculated.
  for (let counter = 0n; counter < effectiveSteps; counter++) {
    currentPosition = destinationIndices[currentPosition]; // Move to the next index according to the sequence.
  }

  // Output the final position, adjusted back to 1-indexed for the result.
  console.log((currentPosition + 1) + "");
}

// Read input from standard input, process it, and then invoke the main processing function.
processInput( require('fs') .readFileSync( '/dev/stdin', 'utf8' ) .trim() .split("\n") );