(function(rawData) {
  // Process the raw input string: remove trailing newline, split by newline, and convert to numbers.
  var numericData = rawData.replace(/\n$/, '').split('\n').map(Number);

  // Initialize variables for Kadane's algorithm.
  // 'currentSum' tracks the maximum sum ending at the current position.
  var currentSum = -Infinity;
  // 'maxOverallSum' tracks the maximum sum found across all positions.
  var maxOverallSum = -Infinity;

  // Main processing loop. It continues until a specific termination condition is met.
  while (true) {
    // Extract the count of elements for the current test case.
    var elementCount = numericData.shift();

    // Check for the termination condition (elementCount of 0).
    if (elementCount === 0) {
      break; // Exit the loop if the count is zero.
    }

    // Reset the sum variables for each new test case.
    currentSum = -Infinity;
    maxOverallSum = -Infinity;

    // Iterate through the numbers for the current test case.
    for (var idx = 0; idx < elementCount; idx++) {
      // Get the next number from the processed data.
      var currentValue = numericData.shift();

      // Apply Kadane's algorithm logic:
      // If starting a new subarray with 'currentValue' yields a larger sum
      // than extending the previous subarray, then start a new one.
      if (currentValue > currentSum + currentValue) {
        currentSum = currentValue;
      } else {
        // Otherwise, extend the current subarray.
        currentSum = currentSum + currentValue;
      }

      // Update the overall maximum sum if the current sum is greater.
      if (currentSum > maxOverallSum) {
        maxOverallSum = currentSum;
      }
    }

    // Output the maximum subarray sum for the current test case.
    console.log(maxOverallSum);
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
