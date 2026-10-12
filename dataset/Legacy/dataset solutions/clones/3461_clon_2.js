console.log(calculateResult(require("fs").readFileSync("/dev/stdin", "utf8")));

/**
 * Processes an array of numbers to compute a specific sum based on sorting and conditional logic.
 * @param {string} inputDataString - The raw input string, expected to be numbers separated by newlines.
 * @returns {number} The calculated final sum.
 */
function calculateResult(inputDataString) {
  // Split the input string by newlines and convert each part to a number.
  let processedNumbers = inputDataString.split("\n").map(element => +element);

  // The first number in the input is the count of subsequent elements.
  const countElements = processedNumbers[0];

  // Initialize an array to hold the actual numbers for processing.
  let sortedNumbers = [];
  // Populate the array, skipping the first element which is the count.
  for (let loopIndex = 0; loopIndex < countElements; loopIndex++) {
    sortedNumbers[loopIndex] = processedNumbers[loopIndex + 0b1];
  }

  // Sort the numbers in ascending order.
  sortedNumbers.sort((valA, valB) => valA - valB);

  // Initialize the accumulator for the final sum.
  let finalSum = 0x0;

  // Calculate the midpoint index for array partitioning.
  // Equivalent to Math.floor((countElements + 1) / 2)
  const midpointIndex = (countElements + 0b1) >> 0b1;

  // First loop: subtract twice the value of elements from the first half.
  for (let loopIndex = 0; loopIndex < midpointIndex; loopIndex++) {
    finalSum -= sortedNumbers[loopIndex] * 0b10;
  }

  // Second loop: add twice the value of elements from the second half.
  // The loopIndex continues from where the previous loop left off.
  for (; loopIndex < countElements; loopIndex++) {
    finalSum += sortedNumbers[loopIndex] * 0b10;
  }

  // Apply final adjustments based on the parity of the element count.
  if ((countElements % 0b10) === 0x0) {
    // If the count is even, adjust the sum using elements around the midpoint.
    return finalSum - sortedNumbers[midpointIndex] + sortedNumbers[midpointIndex - 0b1];
  }

  // If the count is odd, apply a more complex conditional adjustment.
  // Compare two different expressions involving elements around the midpoint.
  if (sortedNumbers[midpointIndex - 0b1] + sortedNumbers[midpointIndex - 0b10] > sortedNumbers[midpointIndex - 0b1] * 0b11 - sortedNumbers[midpointIndex]) {
    return finalSum + sortedNumbers[midpointIndex - 0b1] + sortedNumbers[midpointIndex - 0b10];
  } else {
    return finalSum + sortedNumbers[midpointIndex - 0b1] * 0b11 - sortedNumbers[midpointIndex];
  }
}
