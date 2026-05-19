function ProcessInput(rawData) {
  // Enforce strict parsing and execution rules for better code quality.
  "use strict";

  // Split the raw input string into an array of lines using the newline character.
  const intermediateLines = rawData.split('\n');

  // Extract the initial character sequence from the very first line of input.
  // The .split() method without arguments on a string like "abc" results in ["abc"].
  const charSequence = intermediateLines.shift().split();

  // Parse the total number of operations from the subsequent line.
  // This variable is declared but not explicitly used in the loop, mirroring the original logic.
  const numOperations = parseInt(intermediateLines.shift(), 10);

  // Process the remaining lines to form a structured list of operations.
  // Each operation is represented as an array of strings.
  const operationList = intermediateLines.map(currentLine => currentLine.split(' '));

  // Initialize a flag to keep track of the current reversal state of the sequence.
  // A value of 0x0 indicates the sequence is not logically reversed, 0x1 indicates it is.
  let isReversedState = 0x0;

  // Iterate through each individual operation in the collected list.
  operationList.forEach(currentOp => {
    // Check if the current operation is a simple reversal command (indicated by its length).
    if (currentOp.length === 0x1) {
      // Toggle the reversal state: 0 becomes 1, 1 becomes 0.
      isReversedState = (isReversedState + 0x1) % 2;
    } else {
      // This branch handles insertion operations.
      // Determine the type of insertion based on the second element of the operation array.
      // This value, combined with the current reversal state, dictates whether to push or unshift.
      const insertionType = parseInt(currentOp[0x1], 10);
      const valueToInsert = currentOp[0x2];

      // The condition (isReversedState + insertionType % 2) === 0x0
      // effectively checks if the element should be added to the "end" of the logical sequence.
      // This happens if (state=0, type=0) or (state=1, type=1).
      if ((isReversedState + (insertionType % 2)) === 0x0) {
        // Append the value to the end of the physical array.
        charSequence.push(valueToInsert);
      } else {
        // Prepend the value to the beginning of the physical array.
        charSequence.unshift(valueToInsert);
      }
    }
  });

  // After processing all operations, check the final reversal state.
  if (isReversedState) {
    // If the sequence is logically reversed, perform a physical reversal before joining.
    console.log(charSequence.reverse().join(''));
  } else {
    // Otherwise, simply join the sequence elements as they are.
    console.log(charSequence.join(''));
  }
}

// The following line is crucial for standard input/output handling in this environment.
// It reads the entire content from standard input and passes it to the main processing function.
// This part should remain unchanged to ensure proper execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
