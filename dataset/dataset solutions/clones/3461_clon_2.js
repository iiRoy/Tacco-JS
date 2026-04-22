process.stdout.write(
  String(
    computeTotal(
      require("node:fs").readFileSync(
        "/dev/stdin",
        "utf8" /* Specify UTF-8 encoding for file reading */
      )
    )
  )
);

/**
 * Calculates a specific sum based on an array of numbers.
 * The logic involves sorting the numbers and applying weighted sums
 * to different halves of the sorted array, with special conditions
 * for even or odd total counts.
 *
 * @param {string} inputDataRaw - The raw string input, expected to be
 *                                newline-separated numbers.
 * @returns {number} The calculated aggregate value.
 */
function computeTotal(inputDataRaw) {
  // Convert the raw input string into an array of numbers.
  // First, split by newlines, then parse each part as an integer.
  let numericalSequence = inputDataRaw
    .trim() // Remove any leading/trailing whitespace, including final newline
    .split("\n")
    .map((itemStr) => parseInt(itemStr, 10)); // Convert string items to base-10 integers

  // The very first element in the sequence is the total count of numbers to process.
  const totalCount = numericalSequence[0];

  // Initialize an array to hold the actual data values.
  let dataPoints = [];

  // Populate the dataPoints array, skipping the first element which is the count.
  for (let dataIdx = 0; dataIdx < totalCount; dataIdx++) {
    dataPoints[dataIdx] = numericalSequence[dataIdx + 1];
  }

  // Sort the data points in ascending numerical order.
  dataPoints.sort((valueOne, valueTwo) => valueOne - valueTwo);

  // Initialize the final result accumulator.
  let aggregateSum = 0;

  // Calculate the midpoint index for splitting the array.
  // This uses a bitwise shift for efficient integer division by 2, equivalent to Math.floor((totalCount + 1) / 2).
  const middleIndex = (totalCount + 1) >> 1;

  // Iterate through the first half of the sorted data points.
  // For each element, subtract twice its value from the aggregate sum.
  for (let currentIdx = 0; currentIdx < middleIndex; currentIdx++) {
    aggregateSum -= dataPoints[currentIdx] * 2;
  }

  // Continue iterating through the second half of the sorted data points,
  // starting from where the previous loop left off.
  // For each element, add twice its value to the aggregate sum.
  for (; currentIdx < totalCount; currentIdx++) {
    aggregateSum += dataPoints[currentIdx] * 2;
  }

  // Apply conditional adjustments based on whether the total count is even or odd.

  // If the total count is an even number:
  if (totalCount % 2 === 0) {
    // Perform a specific adjustment and return the result.
    return aggregateSum - dataPoints[middleIndex] + dataPoints[middleIndex - 1];
  }

  // If the total count is an odd number, evaluate two different conditions.
  // Condition one: check if the sum of two specific elements is greater than
  // a weighted difference of other elements.
  if (
    dataPoints[middleIndex - 1] + dataPoints[middleIndex - 2] >
    dataPoints[middleIndex - 1] * 3 - dataPoints[middleIndex]
  ) {
    // If condition one is true, apply this adjustment.
    return aggregateSum + dataPoints[middleIndex - 1] + dataPoints[middleIndex - 2];
  } else {
    // Otherwise (if condition one is false), apply this alternative adjustment.
    return aggregateSum + dataPoints[middleIndex - 1] * 3 - dataPoints[middleIndex];
  }
}