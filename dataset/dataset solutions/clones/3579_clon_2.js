const inputRawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Parse the raw input string: split by newlines and convert each segment to a number.
const numericInputArray = inputRawData.split("\n").map(item => +item);

// Execute the primary logic function and print its result to the standard output.
console.log(evaluateSequence());

/**
 * Determines if a given sequence of numbers adheres to specific structural rules.
 * The function processes the numericInputArray, performing various checks based on
 * indices and values.
 *
 * @returns {string} "Yes" if the sequence is valid according to the rules, "No" otherwise.
 */
function evaluateSequence() {
  // Constant string for indicating an invalid sequence.
  const invalidSequenceIndicator = "No";
  // The first element of the array specifies the total number of elements to process.
  const totalElementsToProcess = numericInputArray[0];
  // An object used as a hash map to keep track of certain indices or values that have been "marked".
  const markedIndicesMap = {};

  // Iterate through the input array, starting from the second element (index 1) up to totalElementsToProcess.
  // The loop counter 'currentPosition' is intentionally modified within the loop body.
  for (let currentPosition = 1; currentPosition <= totalElementsToProcess; currentPosition++) {
    // First condition check: If the bitwise XOR of the current number and its index is odd,
    // the sequence is immediately invalid.
    if ((numericInputArray[currentPosition] ^ currentPosition) & 1) {
      return invalidSequenceIndicator;
    }

    // Initialize 'currentUpperLimit' with the value at the current position,
    // and 'currentComparisonValue' with the current position itself.
    let currentUpperLimit = numericInputArray[currentPosition];
    let currentComparisonValue = currentPosition;

    // Inner loop: continues as long as the 'currentPosition' is less than 'currentUpperLimit'.
    while (currentPosition < currentUpperLimit) {
      // Advance the 'currentPosition'.
      currentPosition++;
      // Second condition check: If the number at the new 'currentPosition' is not equal to 'currentPosition',
      // the sequence is invalid.
      if (numericInputArray[currentPosition] !== currentPosition) {
        return invalidSequenceIndicator;
      }

      // Advance the 'currentPosition' again.
      currentPosition++;
      // Third condition check: Similar to the first, if the XOR of the current number and its index is odd,
      // the sequence is invalid.
      if ((numericInputArray[currentPosition] ^ currentPosition) & 1) {
        return invalidSequenceIndicator;
      }

      // Conditional logic based on the relationship between 'currentUpperLimit' and the number at 'currentPosition'.
      if (currentUpperLimit < numericInputArray[currentPosition]) {
        // If the number at 'currentPosition' is greater than 'currentUpperLimit', update 'currentUpperLimit'.
        // Also, mark this new 'currentUpperLimit' in the 'markedIndicesMap'.
        currentUpperLimit = numericInputArray[currentPosition];
        markedIndicesMap[currentUpperLimit] = 1; // Mark as encountered/used
      } else if (currentComparisonValue === numericInputArray[currentPosition]) {
        // If 'currentComparisonValue' matches the number at 'currentPosition',
        // increment 'currentComparisonValue' by 2 repeatedly until an unmarked index is found in 'markedIndicesMap'.
        do {
          currentComparisonValue += 2;
        } while (markedIndicesMap[currentComparisonValue]); // Check if 'currentComparisonValue' is already marked
      } else {
        // If neither of the above conditions is met, the sequence is invalid.
        return invalidSequenceIndicator;
      }
    }
  }

  // If the function completes all loops and checks without returning "No", the sequence is valid.
  return "Yes";
}
