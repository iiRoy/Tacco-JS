// This script processes numerical data from standard input to compute a specific value.
// It reads the entire content of /dev/stdin, processes it, and prints the final result.
console.log(calculateValue(require("fs").readFileSync("/dev/stdin", "utf8")));

/**
 * Computes a result based on a list of numbers derived from the input string.
 * The first number in the input indicates the effective count of elements to consider.
 *
 * @param {string} rawInputContent The complete string content read from standard input.
 * @returns {number} The final calculated numerical result.
 */
function calculateValue(rawInputContent) {
  // Split the input string by newline characters and convert each segment to a number.
  // The unary plus operator (`+`) is used for type conversion.
  let numericalData = rawInputContent.split("\n").map(lineSegment => +lineSegment);

  // The very first element of the processed array represents the actual number of items
  // that should be considered for the main calculation.
  const totalItems = numericalData[0];

  // Replace the first element (which was the count) with the element located at the 'totalItems' index.
  // This effectively shifts data and prepares for the next step.
  numericalData[0] = numericalData[totalItems];

  // Remove the last element from the array. This is often an empty string converted to 0
  // if the input ends with a newline, or a redundant element after the previous step.
  numericalData.pop();

  // Sort the array of numbers in ascending order. This is a crucial step for the algorithm.
  numericalData.sort((firstVal, secondVal) => firstVal - secondVal);

  // Initialize a variable to accumulate the result of the calculations.
  let accumulatedSum = 0;

  // Determine the midpoint index for array partitioning.
  // This is equivalent to Math.floor((totalItems + 1) / 2).
  const middlePoint = (totalItems + 1) >> 1;

  // Iterate through the first half of the sorted array (up to the midpoint).
  // For each element, subtract twice its value from the accumulated sum.
  for (let currentIdx = 0; currentIdx < middlePoint; currentIdx++) {
    accumulatedSum -= numericalData[currentIdx] * 2;
  }

  // Continue iterating from the midpoint to the end of the array.
  // For each element in this second half, add twice its value to the accumulated sum.
  for (; currentIdx < totalItems; currentIdx++) {
    accumulatedSum += numericalData[currentIdx] * 2;
  }

  // Apply a final adjustment based on whether the total number of items is even or odd.
  if (totalItems % 2 === 0) {
    // If the count is even, perform a specific adjustment involving elements around the midpoint.
    return accumulatedSum - numericalData[middlePoint] + numericalData[middlePoint - 1];
  }

  // If the count is odd, a more complex conditional adjustment is applied.
  // This involves comparing two different expressions using elements near the midpoint.
  if (numericalData[middlePoint - 1] + numericalData[middlePoint - 2] > numericalData[middlePoint - 1] * 3 - numericalData[middlePoint]) {
    return accumulatedSum + numericalData[middlePoint - 1] + numericalData[middlePoint - 2];
  } else {
    return accumulatedSum + numericalData[middlePoint - 1] * 3 - numericalData[middlePoint];
  }
}
