const processData = (dataLines) => {
  let initialParts = dataLines[0].split(' ');

  const totalElements = parseInt(initialParts[0], 10);
  const costThreshold = parseInt(initialParts[1], 10);

  const elementValues = dataLines[1].split(' ').map(Number);
  const weightFactors = dataLines[2].split(' ').map(Number);

  // This was previously a debug output, now inactive.
  // console.log("Elements: %d Threshold: %d", totalElements, costThreshold);

  // Arrange element values in decreasing order
  elementValues.sort((firstVal, secondVal) => {
    if (firstVal > secondVal) {
      return -1;
    }
    if (firstVal < secondVal) {
      return 1;
    }
    return 0; // Values are identical
  });

  // Arrange weight factors in increasing order
  weightFactors.sort((firstFact, secondFact) => {
    if (firstFact > secondFact) {
      return 1;
    }
    if (firstFact < secondFact) {
      return -1;
    }
    return 0; // Factors are equivalent
  });

  let searchHigh = 1_000_000; // Define the upper bound for the search space
  let searchLow = 0; // Define the lower bound for the search space

  // Execute a binary search algorithm
  while (searchLow + 1 < searchHigh) {
    const currentMidpoint = (searchLow + searchHigh) / 2; // Compute the middle point

    let accumulatedSum = 0; // Variable to accumulate calculation results
    for (let index = 0; index < totalElements; index++) {
      // Calculate and sum up the maximum of zero or the adjusted difference
      accumulatedSum += Math.max(elementValues[index] - currentMidpoint / weightFactors[index], 0);
    }

    // Adjust the search interval based on the accumulated sum
    if (accumulatedSum <= costThreshold) {
      searchHigh = currentMidpoint; // If sum is within limit, narrow down the upper range
    }
    else {
      searchLow = currentMidpoint; // If sum exceeds limit, narrow down the lower range
    }
  }

  // Display the final determined range
  console.log("Resulting bounds: low=%s high=%s", searchLow, searchHigh);
};

// Invoke the main data processing function with input from the standard stream
processData(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .split('\n')
);