function checkFeasibility(currentValue) {
  // This function determines if the given 'currentValue' is a feasible maximum sum for segments.
  let isPossible = true; // Flag to track feasibility
  let segmentCount = 0; // Counts the number of segments formed
  let currentSum = 0; // Accumulates sum for the current segment

  // Iterate through each element in the global data array
  for (let idx = 0; idx < dataElements.length; idx++) {
    // If an element itself is greater than the allowed 'currentValue', it's not possible.
    if (currentValue < dataElements[idx]) {
      isPossible = false;
      break; // Exit early as it's impossible
    } else if (currentSum + dataElements[idx] === currentValue) {
      // If adding the current element exactly matches 'currentValue', start a new segment.
      currentSum = 0; // Reset sum for the next segment
      // Increment segment count, unless it's the very last element and it perfectly fits.
      if (idx !== dataElements.length - 1) {
        segmentCount++;
      }
    } else if (currentSum + dataElements[idx] > currentValue) {
      // If adding the current element exceeds 'currentValue', start a new segment with the current element.
      currentSum = dataElements[idx]; // The current element becomes the start of the new segment
      segmentCount++; // Increment segment count
    } else if (currentSum + dataElements[idx] < currentValue) {
      // If adding the current element is still within 'currentValue', continue accumulating.
      currentSum += dataElements[idx];
    }

    // If the number of segments exceeds the maximum allowed, it's not possible.
    if (segmentCount === maxSegments) {
      isPossible = false;
      break; // Exit early
    }
  }

  // Return the feasibility flag.
  return isPossible;
}

// Read input from standard input.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into an array of lines.
const inputLines = fileContent.trim().split("\n");

// Process test cases until "0 0" is encountered.
while (true) {
  let configLine = inputLines.shift(); // Get the first line of the current test case

  // Check for termination condition.
  if (configLine === "0 0") {
    break;
  }

  // Parse the 'm' and 'n' values from the configuration line.
  const configValues = configLine.split(" ").map(Number);
  let maxSegments = configValues[0]; // Maximum allowed segments (m)
  let numElements = configValues[1]; // Number of elements in the data array (n)

  // Populate the data array for the current test case.
  const dataElements = [];
  while (numElements--) {
    dataElements.push(inputLines.shift() - 0); // Convert string to number
  }

  // Initialize binary search bounds.
  let lowerBound = 0; // Minimum possible maximum sum
  let upperBound = 1500000; // Maximum possible maximum sum (given constraint)

  // Perform binary search to find the smallest feasible maximum sum.
  while (true) {
    const midPoint = Math.floor((lowerBound + upperBound) / 2); // Calculate midpoint
    const currentFeasibility = checkFeasibility(midPoint); // Check feasibility for midpoint

    if (currentFeasibility) {
      // If 'midPoint' is feasible, try a smaller value.
      upperBound = midPoint - 1;
    } else {
      // If 'midPoint' is not feasible, try a larger value.
      lowerBound = midPoint + 1;
    }

    // Termination condition for binary search.
    if (lowerBound > upperBound) {
      break;
    }
  }

  // The result is 'upperBound + 1' after the loop terminates.
  console.log(upperBound + 1);
}
