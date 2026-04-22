function ProcessInput(rawData) {
  const lines = rawData.split('\n');
  const [totalElements, windowSize] = lines[0].split(' ').map(Number);
  const itemValues = lines[1].split(' ').map(Number);

  let finalResult = 0;

  // The goal is to find the maximum sum of elements within a sliding window.
  // First, compute the sum for the initial set of 'windowSize' elements.
  let currentWindowSum = 0;
  for (let counter = 0; counter < windowSize; counter++) {
    currentWindowSum += itemValues[counter];
  }

  // Now, iterate through the rest of the array, updating the window sum and tracking the maximum.
  for (let counter = windowSize; counter < itemValues.length; counter++) {
    // For debugging, one might inspect itemValues[counter], itemValues[counter - windowSize], and counter.
    // Add the new element entering the window and subtract the element leaving the window.
    currentWindowSum += itemValues[counter];
    currentWindowSum -= itemValues[counter - windowSize];

    // If the current window's sum exceeds the previously stored maximum, update the maximum.
    if (finalResult < currentWindowSum) {
      finalResult = currentWindowSum;
    }
  }

  // Apply a final arithmetic transformation to the calculated maximum sum.
  finalResult = (finalResult + windowSize) / 2;

  console.log(finalResult);
}

// Execute the main processing function by reading input from the standard input stream.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());