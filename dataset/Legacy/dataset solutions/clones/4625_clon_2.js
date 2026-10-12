var inputNumbers = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .split("\n")[1]
  .split(" ")
  .map((elementStr) => parseInt(elementStr, 10));

/**
 * Calculates the minimum operations required to make all prefix sums
 * alternate in sign, starting with a specified sign.
 * @param {boolean} isPositiveStart - True if the first prefix sum should be positive, false if negative.
 * @returns {number} The total count of operations.
 */
function CalculateMinOperations(isPositiveStart) {
  let currentSum = 0; // Accumulator for current prefix sum
  let operationCount = 0; // Counter for operations needed

  // Iterate through each number in the input array
  for (const numVal of inputNumbers) {
    currentSum += numVal; // Update the prefix sum

    // If the current target is a positive sum
    if (isPositiveStart) {
      // If the current sum is not positive (i.e., zero or negative)
      if (currentSum <= 0) {
        // Adjust the sum to be 1 (the smallest positive integer)
        // and add the necessary operations to the count.
        // Operations = (1 - currentSum)
        operationCount += 1 - currentSum;
        currentSum = 1;
      }
      // Switch the target for the next iteration to be a negative sum
      isPositiveStart = false;
    }
    // If the current target is a negative sum
    else {
      // If the current sum is not negative (i.e., zero or positive)
      if (currentSum >= 0) {
        // Adjust the sum to be -1 (the largest negative integer)
        // and add the necessary operations to the count.
        // Operations = (1 + currentSum)
        operationCount += 1 + currentSum;
        currentSum = -1;
      }
      // Switch the target for the next iteration to be a positive sum
      isPositiveStart = true;
    }
  }
  return operationCount; // Return the total operations
}

// Calculate the minimum operations for both starting conditions (positive or negative)
// and print the smaller of the two results.
console.log(Math.min(CalculateMinOperations(false), CalculateMinOperations(true)));
