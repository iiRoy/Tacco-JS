// This script processes numerical data from standard input.
console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));

/**
 * Main function to process the incoming string data.
 * @param {string} inputTxt - The raw input string read from a source.
 * @returns {number} The calculated final numerical result.
 */
function processInputData(inputTxt) {
  // Convert the input string into an array of numbers.
  // Each line is treated as a separate number after splitting.
  let numericValues = inputTxt
    .split("\n")
    .map(currentVal => +currentVal);

  // The first element of the array is assumed to be the total count
  // of relevant elements for subsequent operations.
  let elementCount = numericValues[0];

  // Perform a specific swap operation:
  // Replace the first element with the element at the index specified by elementCount.
  numericValues[0] = numericValues[elementCount];

  // Remove the last element from the array. This alters the array's size.
  numericValues.pop();

  // Sort the array in ascending numerical order.
  // This is a crucial step for the subsequent summation logic.
  numericValues.sort((currentVal, nextVal) => currentVal - nextVal);

  // Initialize a variable to accumulate the result of various calculations.
  let finalResult = 0;

  // Calculate the midpoint index.
  // Using bitwise right shift for integer division by 2, which is efficient.
  let middleIdx = (elementCount + 1) >> 1;

  // First summation loop: Iterates up to the midpoint index (exclusive).
  // This loop subtracts twice the value of each element from the result.
  for (let loopVar = 0; loopVar < middleIdx; loopVar++) {
    finalResult -= numericValues[loopVar] * 2;
  }

  // Second summation loop: Continues from where the first loop left off,
  // up to the total element count (exclusive).
  // This loop adds twice the value of each element to the result.
  for (; loopVar < elementCount; loopVar++) {
    finalResult += numericValues[loopVar] * 2;
  }

  // Conditional logic based on whether the element count is an even number.
  // If the count is even, perform a specific adjustment to the final result.
  if (elementCount % 2 === 0) {
    return finalResult - numericValues[middleIdx] + numericValues[middleIdx - 1];
  }

  // Additional conditional check for odd element counts.
  // This involves a more complex comparison of specific array elements.
  if (numericValues[middleIdx - 1] + numericValues[middleIdx - 2] > numericValues[middleIdx - 1] * 3 - numericValues[middleIdx]) {
    return finalResult + numericValues[middleIdx - 1] + numericValues[middleIdx - 2];
  } else {
    // This is the default return path for odd counts if the above condition is not met.
    return finalResult + numericValues[middleIdx - 1] * 3 - numericValues[middleIdx];
  }
}