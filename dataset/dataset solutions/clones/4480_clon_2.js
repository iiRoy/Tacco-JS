// This function processes incoming raw string data
function processInputData(rawDataString) {
  // Split the entire input string into individual lines using the newline character
  const parsedLines = rawDataString.split("\n");

  // Extract the first line from the parsed input and split it by spaces
  const firstLineTokens = parsedLines[0].split(" ");
  // Convert the first token of the first line to an integer, representing the total count of elements
  const elementCount = parseInt(firstLineTokens[0], 10);
  // Get the second line from the parsed input and split it into string tokens
  const numericalValues = parsedLines[1].split(" ");

  // Iterate through the string tokens and convert each one to a floating-point number
  for (let idx = 0; idx < elementCount; idx++) {
    numericalValues[idx] = parseFloat(numericalValues[idx]);
  }

  // Calculate an integer midpoint index for potential division (though not directly used for splitting here)
  const midpointIndex = Math.floor(elementCount / 2);
  // Initialize boundary variables; these are declared but not actively used in the main logic flow.
  const startBoundary = 0;
  const endBoundary = elementCount;

  // Initialize accumulators for segment sums and the minimum difference found
  let currentLeftSegmentTotal = 0;
  let currentRightSegmentTotal = 0;
  let minimumDifference = Infinity; // Using JavaScript's Infinity for a large initial value
  let finalSplitPoint = 0; // This variable is declared but its value isn't utilized later.
  let totalSumOfElements = 0;

  // First pass: Compute the grand total sum of all numerical values
  for (let k = 0; k < elementCount; k++) {
    totalSumOfElements += numericalValues[k];
  }

  // Second pass: Iterate through all possible split points to evaluate segment differences
  for (let iterationPoint = 1; iterationPoint < elementCount; iterationPoint++) {
    // Calculate the sum of the left segment up to the current iteration point
    for (let j = 0; j < iterationPoint; j++) {
      currentLeftSegmentTotal += numericalValues[j];
    }

    // Calculate the sum of the right segment by subtracting the left sum from the grand total
    currentRightSegmentTotal = totalSumOfElements - currentLeftSegmentTotal;

    // Previous versions included commented-out console logs for debugging segment sums.

    // Compare the absolute difference between the two segments with the current minimum difference
    if (minimumDifference > Math.abs(currentLeftSegmentTotal - currentRightSegmentTotal)) {
      minimumDifference = Math.abs(currentLeftSegmentTotal - currentRightSegmentTotal);
    }

    // Reset the segment sums for the next iteration
    currentRightSegmentTotal = 0;
    currentLeftSegmentTotal = 0;

    // A separator for previous debugging output was located here.
  }

  // Output the smallest absolute difference found between any two segment sums
  console.log(minimumDifference);
}

// Invoke the primary processing function with data read from standard input using Node.js fs module
processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));