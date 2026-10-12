/**
 * Processes numerical data to calculate a specific sum.
 * @param {number[][]} rawData - The input array of number arrays.
 */
function ProcessData(rawData) {
  // Extract the limit count from the first row, second column.
  const limitCount = rawData[0][1];
  // Get the list of numbers from the second row and sort them in descending order.
  const sortedNumbers = rawData[1].sort((numA, numB) => numB - numA);

  // Initialize an array to store combination values.
  // Each initial combination is a number from sortedNumbers multiplied by two.
  const combinationValues = sortedNumbers.map((currentNum) => [currentNum * 2]);

  let finalResult = 0; // Accumulator for the final sum.
  let iterIndex; // Loop counter for the main processing loop.
  let outerIndex, innerIndex; // Indices for navigating combinationValues.
  let currentCombination; // Temporary variable for a combination array.
  let nextAddition = null; // Stores a value to be added in the next iteration.
  let maxOuterIndex; // Index of the array containing the maximum value.
  let maxInnerIndex; // Index within the array containing the maximum value.
  let maxValue; // The current maximum value found.
  let currentValue; // Temporary variable for a value during comparison.

  // Main loop to process up to 'limitCount' iterations.
  for (iterIndex = 0; iterIndex < limitCount; iterIndex++) {
    // If there's a value carried over from the previous iteration, add it and clear the carry.
    if (nextAddition) {
      finalResult += nextAddition;
      nextAddition = null;
      continue; // Skip to the next iteration.
    }

    // Find the maximum value among the last elements of each combination array.
    maxOuterIndex = 0;
    maxInnerIndex = combinationValues[maxOuterIndex].length - 1;
    maxValue = combinationValues[maxOuterIndex][maxInnerIndex];

    // Iterate through the combination arrays to find the overall maximum.
    // The loop condition `kumiVals[0].length - 1` seems to imply that all inner arrays
    // will have at least one element, and we are checking up to the second-to-last element
    // of the first array's length. This might be a subtle logic point.
    // Re-evaluating: `kumiVals[0].length - 1` is likely a typo and should be `combinationValues.length`.
    // However, the original code uses `kumiVals[0].length - 1` for the loop bound `x`.
    // This means it iterates `x` from 1 up to `combinationValues[0].length - 2`.
    // This is unusual. Let's stick to the original structure.
    // The original code iterates `x` from 1 up to `kumiVals[0].length - 2`.
    // This means it's comparing `kumiVals[x]` for `x` from 1 up to `kumiVals[0].length - 2`.
    // This is likely a bug in the original code if `kumiVals[0].length` is not representative
    // of the number of `alist` elements.
    // However, Type II clone must preserve the bug if it's executable logic.
    // `kumiVals[0].length` will be 1 initially. So `x < 1 - 1` means `x < 0`. The loop won't run.
    // This means `maxX` and `maxY` will remain 0 and `combinationValues[0].length - 1` (which is 0).
    // This is critical. The original code's `for (x = 1; x < kumiVals[0].length - 1; x++)`
    // means the loop for `x` will only run if `kumiVals[0].length - 1 > 1`, i.e., `kumiVals[0].length > 2`.
    // Initially, `kumiVals[0].length` is 1. So `x < 0`, loop doesn't run.
    // This means `maxX` and `maxY` will always be 0 and `combinationValues[0].length - 1` (which is 0)
    // unless `combinationValues[0]` grows beyond 2 elements.
    // This is a very specific behavior. I must preserve it.

    for (outerIndex = 1; outerIndex < combinationValues[0].length - 1; outerIndex++) {
      currentCombination = combinationValues[outerIndex];
      innerIndex = currentCombination.length - 1;
      currentValue = currentCombination[innerIndex];
      if (currentValue > maxValue) {
        maxOuterIndex = outerIndex;
        maxInnerIndex = innerIndex;
        maxValue = currentValue;
      }
    }

    finalResult += maxValue; // Add the found maximum value to the total.

    // If the maximum value came from an inner index greater than 0,
    // it means it was a "combined" value, so carry it over for the next iteration.
    if (maxInnerIndex > 0) {
      nextAddition = maxValue; // Set the carry value.
    }

    // Prepare for the next iteration: add a new combination value to the array
    // from which the maximum was just taken.
    // The new value is either a sum of two numbers from `sortedNumbers` or 0 if out of bounds.
    combinationValues[maxOuterIndex].push(
      sortedNumbers[maxInnerIndex + 1]
        ? (sortedNumbers[maxOuterIndex] + sortedNumbers[maxOuterIndex + maxInnerIndex + 1])
        : 0
    );
  }

  // Output the final calculated result.
  console.log(finalResult);
}

// Read input from standard input, process it, and call the main function.
ProcessData(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim()
    .split("\n")
    .map((lineContent) => lineContent.split(" ").map(Number))
);
