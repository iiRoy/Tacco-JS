// Encapsulate the entire script within an immediately invoked function expression (IIFE)
// to prevent global variable pollution and manage scope effectively.
(function(rawInputContent) {
  // Define a constant for the smallest possible sum value. Using a constant improves
  // readability and maintainability compared to magic literals like -Infinity.
  const EXTREME_NEGATIVE_VALUE = Number.NEGATIVE_INFINITY;

  // --- Input Data Preprocessing ---
  // 1. Convert the raw input to a string, ensuring string methods can be safely called.
  // 2. Use .trim() to remove any leading or trailing whitespace, including newlines,
  //    which might affect subsequent splitting.
  // 3. Split the cleaned string by newline characters to get an array of string lines.
  // 4. Filter out any empty strings that might result from splitting (e.g., if there
  //    were multiple consecutive newlines or a newline at the very end after trimming).
  // 5. Map each remaining string line to an integer using parseInt with a radix of 10
  //    for explicit base conversion, creating our primary data stream.
  const processedNumericDataStream = String(rawInputContent)
    .trim()
    .split('\n')
    .filter(line => line.length > 0)
    .map(val => parseInt(val, 10));

  // --- Helper Function: Kadane's Algorithm for a Single Array ---
  // This function computes the maximum sum of a contiguous subarray within a given array.
  // Extracting this logic into a separate function enhances modularity and readability.
  const calculateMaxSumOfContiguousSubarray = (inputNumberSequence) => {
    // Guard clause: If the input sequence is null, undefined, or empty,
    // return 0 or EXTREME_NEGATIVE_VALUE depending on specific problem requirements
    // for an empty array. For Kadane's, if all numbers are negative, the max sum
    // would be the largest single negative number. If allowed an empty subarray, it'd be 0.
    // Given the problem context, we expect non-empty arrays if n > 0.
    if (!inputNumberSequence || inputNumberSequence.length === 0) {
      return 0; // Or handle as an error, or return EXTREME_NEGATIVE_VALUE.
    }

    // Initialize two key variables for Kadane's algorithm:
    // 1. `currentRunningSum`: Tracks the maximum sum of a subarray ending at the current position.
    //    It is reset or extended based on the current element.
    // 2. `overallHighestSum`: Stores the absolute maximum sum found across all subarrays processed so far.
    let currentRunningSum = EXTREME_NEGATIVE_VALUE;
    let overallHighestSum = EXTREME_NEGATIVE_VALUE;

    // Iterate through each numerical element in the provided sequence.
    for (let currentElementIndex = 0; currentElementIndex < inputNumberSequence.length; currentElementIndex++) {
      const valueOfCurrentElement = inputNumberSequence[currentElementIndex];

      // Core Kadane's logic:
      // The maximum sum ending at the current `valueOfCurrentElement` is the greater of:
      // a) The `valueOfCurrentElement` itself (meaning a new subarray starts here).
      // b) The `valueOfCurrentElement` added to the `currentRunningSum` from the previous position
      //    (meaning the current subarray is extended).
      currentRunningSum = Math.max(valueOfCurrentElement, currentRunningSum + valueOfCurrentElement);

      // Update the `overallHighestSum` if the `currentRunningSum` is greater than
      // the highest sum recorded so far.
      overallHighestSum = Math.max(overallHighestSum, currentRunningSum);
    }

    return overallHighestSum;
  };

  // --- Main Logic Loop for Processing Multiple Test Cases ---
  // This loop continues as long as there are numbers remaining in our pre-processed data stream.
  // Each iteration attempts to process one test case.
  while (processedNumericDataStream.length > 0) {
    // The first number in each test case batch represents the count of elements that follow.
    // Use `shift()` to remove and retrieve this count from the beginning of the stream.
    let batchElementCount = processedNumericDataStream.shift();

    // Termination condition: A batch element count of 0 signals the end of input.
    if (batchElementCount === 0) {
      break; // Exit the main processing loop.
    }

    // --- Input Validation for Batch Size ---
    // Check if the retrieved batchElementCount is a valid positive integer.
    // If it's NaN (e.g., due to parsing errors in input) or less than 1,
    // it indicates an invalid test case. Log an error and skip to the next potential batch.
    if (isNaN(batchElementCount) || batchElementCount < 1) {
      console.error(`Warning: Encountered an invalid batch size (${batchElementCount}). Skipping this test case.`);
      // As a robustness measure, if batchElementCount was negative, try to consume
      // that many elements to prevent misinterpreting data in subsequent iterations.
      // This is a heuristic for malformed input.
      for (let discardIndex = 0; discardIndex < Math.abs(batchElementCount); discardIndex++) {
        if (processedNumericDataStream.length > 0) {
          processedNumericDataStream.shift(); // Discard elements corresponding to the invalid batch size.
        } else {
          break; // No more data to discard.
        }
      }
      continue; // Move to the next iteration of the main loop.
    }

    // --- Collect Elements for the Current Test Case ---
    // Create a temporary array to store the numbers belonging to the current batch.
    const currentTestNumbersCollection = [];
    for (let elementGatherIndex = 0; elementGatherIndex < batchElementCount; elementGatherIndex++) {
      // Critical check: Ensure there are enough elements left in the stream
      // to satisfy the declared `batchElementCount`. If not, it's a malformed input.
      if (processedNumericDataStream.length === 0) {
        console.error(`Error: Insufficient data in stream. Expected ${batchElementCount} elements, but ran out after ${elementGatherIndex}.`);
        // Adjust batchElementCount to reflect what was actually collected,
        // or decide to abort entirely. Here, we'll process what we have.
        batchElementCount = elementGatherIndex;
        break; // Exit the inner collection loop.
      }
      currentTestNumbersCollection.push(processedNumericDataStream.shift());
    }

    // Another guard: If no numbers were collected (e.g., due to premature stream end),
    // output 0 as per typical problem interpretations for empty sets or skip.
    if (currentTestNumbersCollection.length === 0) {
        console.log(0);
        continue;
    }

    // --- Process and Output Result for Current Batch ---
    // Invoke the helper function to calculate the maximum subarray sum for the
    // numbers collected in `currentTestNumbersCollection`.
    const resultForThisTest = calculateMaxSumOfContiguousSubarray(currentTestNumbersCollection);

    // Print the calculated maximum sum to the console.
    console.log(resultForThisTest);
  }

// The input is read from standard input, typically '/dev/stdin' on Linux/macOS.
// `require('fs').readFileSync` is used for synchronous file reading.
// 'utf8' specifies the character encoding.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));