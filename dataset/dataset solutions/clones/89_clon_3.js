(function(sourceTextualData) {
  // Input processing: Convert the raw textual data into an array of integers.
  // This step filters out any completely empty lines and uses parseInt for robust
  // conversion, ensuring leading/trailing whitespace is handled.
  const numericalQueue = sourceTextualData
    .split('\n')
    .filter(lineContent => lineContent.trim().length > 0) // Ensures only lines with actual content are processed.
    .map(strValue => parseInt(strValue.trim(), 10)); // Converts each non-empty string to an integer.

  /**
   * Implements Kadane's algorithm to efficiently find the maximum sum of a
   * contiguous subarray within a given list of numbers. This function is
   * designed to handle cases where all numbers might be negative.
   *
   * @param {number[]} elementsList - An array of numbers (the subarray) to analyze.
   * @returns {number} The greatest possible sum of a contiguous subarray.
   *                   Returns -Infinity if the input list is empty, aligning with
   *                   the initial state of sum variables in the original problem.
   */
  const computeKadanesMaxSum = (elementsList) => {
    // If there are no elements to process, no sum can be computed.
    // Returning -Infinity reflects an inability to find any positive sum.
    if (elementsList.length === 0) {
      return -Infinity;
    }

    // Initialize 'currentMaxEndingHere' to track the maximum sum of a subarray
    // that ends at the current position being examined.
    // 'globalMaxSoFar' tracks the overall maximum sum encountered across all positions.
    // Initializing both to -Infinity allows correct handling of arrays with all negative numbers.
    let currentMaxEndingHere = -Infinity;
    let globalMaxSoFar = -Infinity;

    // Iterate through each numerical value in the provided list.
    for (const numberValue of elementsList) {
      // Kadane's core logic: For each number, we decide whether to extend the
      // current contiguous subarray (by adding 'numberValue' to 'currentMaxEndingHere')
      // or to start a brand new subarray with 'numberValue' itself.
      // We choose the option that yields a larger sum.
      currentMaxEndingHere = Math.max(numberValue, currentMaxEndingHere + numberValue);

      // After updating 'currentMaxEndingHere', compare it with 'globalMaxSoFar'.
      // If the sum ending at the current position is greater than any sum found
      // previously, update 'globalMaxSoFar'.
      globalMaxSoFar = Math.max(globalMaxSoFar, currentMaxEndingHere);
    }

    return globalMaxSoFar;
  };

  // --- Main processing loop: Iterates through multiple data sets ---
  let datasetSizeIndicator; // This variable will store the size of the current array segment.

  // The loop continues as long as there are numbers available in the numericalQueue
  // and the value retrieved (datasetSizeIndicator) is not equal to 0.
  // The `numericalQueue.shift()` operation extracts the first element from the queue,
  // effectively consuming the input data sequentially.
  while ((datasetSizeIndicator = numericalQueue.shift()) !== 0) {
    // A robustness check: ensure the datasetSizeIndicator is a valid, non-negative number.
    // While problem constraints typically guarantee valid input, this adds a layer of safety.
    if (typeof datasetSizeIndicator !== 'number' || datasetSizeIndicator < 0) {
        console.error("Warning: Encountered an invalid or negative dataset size. Skipping to next segment.");
        // Depending on the expected behavior for malformed input,
        // one might need to consume additional elements here if datasetSizeIndicator was garbage.
        // For this problem, we assume `0` correctly terminates, and other values are positive integers.
        continue;
    }

    // Extract the specific number of elements required for the current dataset.
    // `splice(0, count)` removes 'count' elements from the beginning of the array
    // and returns them as a new array. This directly modifies `numericalQueue`.
    const currentElementsForProcessing = numericalQueue.splice(0, datasetSizeIndicator);

    // Compute the maximum contiguous subarray sum for the extracted elements.
    const calculatedResult = computeKadanesMaxSum(currentElementsForProcessing);

    // Display the computed result for the current dataset.
    console.log(calculatedResult);
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));