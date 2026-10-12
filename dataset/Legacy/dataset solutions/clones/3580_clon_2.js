let inputData = require("fs").readFileSync("/dev/stdin", "utf8"); // Read input from standard input
inputData = inputData.split("\n").map(val => Number(val)); // Split by newline and convert each part to a number
console.log(processInput()); // Execute the primary logic function and print its return value

/**
 * Processes the numerical input data according to a specific algorithm.
 * This function checks for certain patterns and conditions within the sequence
 * of numbers to determine if it meets a specific criteria.
 * @returns {string} "Yes" if the criteria are met, "No" otherwise.
 */
function processInput() {
  const negativeOutcome = "No"; // String constant for a negative result
  let countElements = inputData[0]; // The first element indicates the total number of subsequent elements to process

  // This variable is declared but not used in the original logic.
  // It's kept for structural similarity as per Type II cloning rules.
  const tempMap = {};

  // Iterate through the elements starting from the second one (index 1)
  // up to the total count specified by the first element.
  for (let currentIndex = 1; currentIndex <= countElements; currentIndex++) {
    // First condition check:
    // If the bitwise XOR of the current element and its index is odd,
    // it means one is even and the other is odd. This is a failure condition.
    if (((inputData[currentIndex] ^ currentIndex) & 1) !== 0) {
      return negativeOutcome; // Return "No" immediately if condition fails
    }

    // Initialize an upper bound and a lower bound for an inner loop.
    // The upper bound starts with the value of the current element.
    // The lower bound starts with the current index.
    let upperBound = inputData[currentIndex];
    let lowerBound = currentIndex;

    // Inner loop: continues as long as the current index is less than the determined upper bound.
    while (currentIndex < upperBound) {
      currentIndex++; // Increment the index

      // Second condition check:
      // The element at the new index must be equal to the new index itself.
      if (inputData[currentIndex] !== currentIndex) {
        return negativeOutcome; // Return "No" if condition fails
      }

      currentIndex++; // Increment the index again

      // Third condition check (similar to the first one):
      // If the bitwise XOR of the current element and its index is odd, fail.
      if (((inputData[currentIndex] ^ currentIndex) & 1) !== 0) {
        return negativeOutcome; // Return "No" if condition fails
      }

      // Logic to update the upper or lower bound based on the current element's value.
      // If the current element is greater than the current upper bound, update the upper bound.
      if (upperBound < inputData[currentIndex]) {
        upperBound = inputData[currentIndex];
      }
      // Otherwise, if the current index is greater than the current element's value
      // AND the lower bound is less than the current element's value, update the lower bound.
      else if (currentIndex > inputData[currentIndex] && lowerBound < inputData[currentIndex]) {
        lowerBound = inputData[currentIndex];
      }
      // If neither of the above conditions is met, it's a failure.
      else {
        return negativeOutcome; // Return "No"
      }
    }
  }

  // If the function completes all loops without returning "No",
  // it means all conditions were met.
  return "Yes"; // Return "Yes"
}
