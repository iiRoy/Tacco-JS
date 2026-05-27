function processInput(rawData) {
  // Parse the first line for the number of elements and total iterations.
  let [countElements, iterationsCount] = rawData[0]
    .trim()
    .split(" ")
    .map((val) => BigInt(val));

  // Parse the second line for the sequence array, converting to integers.
  let sequenceArray = rawData[1]
    .trim()
    .split(" ")
    .map((val) => parseInt(val));

  // Initialize an array to keep track of visited steps and their order.
  let visitedSteps = [];
  // Adjust array values to be 0-indexed and initialize visitedSteps.
  for (let idx = 0; idx < countElements; idx++) {
    visitedSteps[idx] = -1; // -1 indicates not yet visited
    sequenceArray[idx]--; // Convert 1-based index to 0-based
  }

  // Variables to track the current step count and position.
  let currentStep = 0;
  let currentPosition = 0;
  // Flag to indicate if a loop (cycle) has been detected.
  let loopDetected = false;

  // Simulate steps until a cycle is found.
  while (true) {
    // Check if the next position in the sequence has been visited.
    if (visitedSteps[sequenceArray[currentPosition]] === -1) {
      // If not visited, record the current step count for this position.
      visitedSteps[sequenceArray[currentPosition]] = currentStep;
      currentStep++; // Increment the step counter.
      currentPosition = sequenceArray[currentPosition]; // Move to the next position.
    } else {
      // A cycle has been detected.
      loopDetected = true;
      break; // Exit the simulation loop.
    }
  }

  // Calculate the length of the path before entering the loop.
  let initialPathLength = BigInt(visitedSteps[sequenceArray[currentPosition]]);
  // Calculate the length of the detected cycle.
  let cycleLength = BigInt(currentStep - visitedSteps[sequenceArray[currentPosition]]);

  // Variable to store the effective number of iterations.
  let finalIteration = BigInt(0);

  // Determine the final iteration count based on whether k falls within the initial path or the loop.
  if ((iterationsCount - initialPathLength < BigInt(0)) || (!loopDetected)) {
    // If k is less than the path to the loop, or no loop was found (shouldn't happen with infinite loop),
    // the effective iterations are simply k.
    finalIteration = iterationsCount;
  } else {
    // If k is greater than or equal to the path to the loop, calculate the position within the loop.
    finalIteration = (iterationsCount - initialPathLength) % cycleLength + initialPathLength;
  }

  // Reset the current position to the start.
  currentPosition = 0;
  // Simulate the sequence for the calculated effective number of iterations.
  for (let idx = 0; idx < finalIteration; idx++) {
    currentPosition = sequenceArray[currentPosition]; // Move through the sequence.
  }

  // Output the final position (converted back to 1-based index) as a string.
  console.log((currentPosition + 1) + "");
}

// Read input from standard input, process it, and pass to the main function.
processInput(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split("\n")
);
