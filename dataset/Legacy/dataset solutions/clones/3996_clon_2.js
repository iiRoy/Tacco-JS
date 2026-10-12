function ProcessInput(rawData) {
  // Process the raw input string by splitting it and converting parts to numbers.
  const parsedValues = rawData.split(' ').map(strNum => Number(strNum));

  // Extract the first numerical value for the upper bound of iterations.
  let upperBound = parsedValues[0];
  // Extract the second numerical value for the comparison threshold.
  let thresholdValue = parsedValues[0b1];

  // Initialize a counter to store the number of successful conditions.
  let resultCounter = 0x0;

  // Outer loop: iterates from 1 up to the 'upperBound' (inclusive).
  for (let outerIndex = 0b1; outerIndex <= upperBound; outerIndex++) {
    // Inner loop: iterates from 1 up to the 'upperBound' (inclusive).
    for (let innerIndex = 0b1; innerIndex <= upperBound; innerIndex++) {
      // Check if the remainder of 'outerIndex' divided by 'innerIndex' is greater than or equal to 'thresholdValue'.
      if ((outerIndex % innerIndex) >= thresholdValue) {
        // If the condition is met, increment the result counter.
        resultCounter++;
      }
    }
  }

  // Output the final calculated count to the console.
  console.log(resultCounter);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
