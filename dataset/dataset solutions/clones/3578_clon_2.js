"use strict";

// This function serves as the primary entry point for processing the provided input data.
function ProcessInput(rawData) {
  // The raw input string is first split into an array of individual lines.
  rawData = rawData.split("\n");

  // The first line of the input is parsed as an integer to determine the total number of elements.
  let elementCount = parseInt(rawData[0]);

  // The subsequent lines (from the second line onwards) are processed.
  // Each line is converted to an integer, and then one is subtracted from it.
  // The resulting values form the main array for subsequent operations.
  let processedArray = rawData.slice(1).map(currentVal => parseInt(currentVal) - 1);

  // First validation phase: Check for parity consistency.
  // We iterate through the 'processedArray' from the beginning to the end.
  for (let idx = 0; idx < elementCount; idx += 1) {
    // If the parity (even or odd) of an element in 'processedArray' does not match
    // the parity of its corresponding index, then a specific condition is not met.
    if (processedArray[idx] % 2 !== idx % 2) {
      console.log("No"); // Output "No" to standard output.
      return; // Terminate execution immediately.
    }
  }

  // Second operational phase: Conditional element swapping.
  // This loop iterates backward through the 'processedArray', starting from the second-to-last element.
  for (let idx = elementCount - 1; idx > 1; idx -= 1) {
    // We check for a specific decreasing sequence pattern among three consecutive elements:
    // if processedArray[idx] is less than processedArray[idx-1], AND
    // if processedArray[idx-1] is less than processedArray[idx-2].
    if (processedArray[idx] < processedArray[idx - 1] && processedArray[idx - 1] < processedArray[idx - 2]) {
      // If the pattern is found, a swap operation is performed between
      // processedArray[idx] and processedArray[idx-2].
      let temporaryValue = processedArray[idx];
      processedArray[idx] = processedArray[idx - 2];
      processedArray[idx - 2] = temporaryValue;
    }
  }

  // Third validation phase: Final ordering check after potential swaps.
  // This loop also iterates backward, similar to the second phase.
  for (let idx = elementCount - 1; idx > 1; idx -= 1) {
    // A complex condition is checked:
    // if processedArray[idx] is less than processedArray[idx-2], AND
    // (if processedArray[idx] is greater than processedArray[idx-1] OR
    //  if processedArray[idx-1] is greater than processedArray[idx-2]).
    if (processedArray[idx] < processedArray[idx - 2] && (processedArray[idx] > processedArray[idx - 1] || processedArray[idx - 1] > processedArray[idx - 2])) {
      console.log("No"); // Output "No" if this condition is met.
      return; // Terminate execution.
    }
  }

  // If the program reaches this point, all validation and operational checks have passed successfully.
  console.log("Yes"); // Output "Yes" to indicate success.
  return;
}

// The program reads its input from standard input, assuming UTF-8 encoding.
// This input is then passed to the 'ProcessInput' function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
