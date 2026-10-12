// This JavaScript module processes input data to calculate a specific numerical range.
// It reads from standard input, performs calculations, and prints the result to standard output.
console.log((inputData => {
  // The input string is expected to contain two lines.
  // The first line has a single integer (idxVal), and the second line has a sequence of integers (numArr).
  const [[idxVal], numArr] = inputData
    .trim() // First, remove any leading or trailing whitespace from the entire input string.
    .split`\n` // Then, split the cleaned input string into an array of lines using the newline character.
    .map(lineStr => lineStr.split` `.map(itemVal => itemVal | 0)); // For each line, split it by spaces and convert each part to an integer.

  // A preliminary check: if the element at (idxVal - 1) in the numArr is greater than 2,
  // it indicates an invalid input state, and the function immediately returns '-1'.
  if (numArr[idxVal - 1] > 2) {
    return '-1'; // Output an error code.
  }

  // Initialize the lower and upper bounds of the range that will be determined.
  let lowerBound = 2; // The initial minimum value for the range.
  let upperBound = 3; // The initial maximum value for the range.

  // Iterate backwards through the numArr, starting from the element before idxVal-1, down to the first element.
  // This loop refines the lowerBound and upperBound based on the values in numArr.
  for (let loopCounter = idxVal - 2; loopCounter >= 0; loopCounter--) {
    // Recalculate the lowerBound: it must be a multiple of numArr[loopCounter]
    // and greater than or equal to the current lowerBound.
    lowerBound = Math.ceil(lowerBound / numArr[loopCounter]) * numArr[loopCounter];

    // Recalculate the upperBound: it must be a multiple of numArr[loopCounter] plus (numArr[loopCounter] - 1)
    // and less than or equal to the current upperBound.
    upperBound = Math.floor(upperBound / numArr[loopCounter]) * numArr[loopCounter] + numArr[loopCounter] - 1;

    // After updating the bounds, check for consistency.
    // If the upperBound falls below numArr[loopCounter] or if the lowerBound exceeds the upperBound,
    // it means no valid range can be formed, so an error is returned.
    if (upperBound < numArr[loopCounter] || lowerBound > upperBound) {
      return '-1'; // Output an error code for an impossible range.
    }
  }

  // If the loop completes without returning an error, the final calculated lowerBound and upperBound
  // represent the valid range, which is then returned as a space-separated string.
  return `${lowerBound} ${upperBound}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8'))); // This immediately invoked function expression (IIFE)
// reads the entire content of standard input as a UTF-8 string and passes it to the processing function.
