function ProcessInput(rawData) {
  // Parse the incoming raw data into individual lines
  const linesOfData = rawData.split('\n');

  // Extract numerical parameters from the first line
  const firstLineItems = linesOfData[0].split(' ');
  const numSteps = Number.parseInt(firstLineItems[0], 10);
  const maxJump = Number.parseInt(firstLineItems[1], 10);

  // Retrieve the step height values from the second line
  const secondLineItems = linesOfData[1].split(' ');
  const stepHeights = secondLineItems.map(str => Number.parseInt(str, 10));

  // Initialize an array to store the minimal energy cost to reach each platform
  const minimalCosts = [];

  // The energy expenditure to be at the starting platform (index 0) is zero
  minimalCosts.push(0);

  // Calculate the energy cost to reach the next platform (index 1)
  // This is the absolute difference in height between platform 0 and platform 1
  minimalCosts.push(Math.abs(stepHeights[1] - stepHeights[0]));

  // Iterate through platforms starting from the third one (index 2)
  for (let currentPlatformIndex = 2; currentPlatformIndex < numSteps; currentPlatformIndex++) {
    let bestCurrentCost = Number.MAX_SAFE_INTEGER; // Set an initial high value for comparison

    // Evaluate all possible preceding platforms from which a jump could be made
    for (let prevPlatformOffset = 1; prevPlatformOffset <= maxJump; prevPlatformOffset++) {
      const priorPlatformIndex = currentPlatformIndex - prevPlatformOffset;

      // If the calculated prior platform index is invalid (less than zero), stop
      if (priorPlatformIndex < 0) {
        break;
      }

      // Compute the total energy cost if arriving from 'priorPlatformIndex'
      const candidateCost = minimalCosts[priorPlatformIndex] + Math.abs(stepHeights[currentPlatformIndex] - stepHeights[priorPlatformIndex]);

      // Update the minimum cost found for the 'currentPlatformIndex'
      bestCurrentCost = Math.min(candidateCost, bestCurrentCost);
    }
    // Record the lowest energy cost to reach the current platform
    minimalCosts.push(bestCurrentCost);
  }

  // Output the final minimal energy cost to reach the last platform
  console.log(minimalCosts[numSteps - 1]);
}

// Execute the processing function using data acquired from the standard input stream
ProcessInput(require('node:fs').readFileSync('/dev/fd/0', 'utf-8'));