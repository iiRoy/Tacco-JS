function processSequence(currentSequence) {
  // This function attempts to reduce a given sequence by removing
  // consecutive identical digits (1s, 2s, or 3s) if they appear 4 or more times.
  // It continues until no more reductions are possible.
  let previousLength = 0;

  // Loop until the sequence length stabilizes, meaning no more patterns were replaced.
  while (previousLength !== currentSequence.length) {
    previousLength = currentSequence.length;
    // Replace occurrences of four or more consecutive 1s, 2s, or 3s with an empty string.
    currentSequence = currentSequence.replace(/1{4,}|2{4,}|3{4,}/g, "");
  }

  // Update the global minimum length found so far.
  minimumLength = Math.min(minimumLength, currentSequence.length);
}

// Import the file system module to read input.
const fileSystem = require('fs');

// Read all input from standard input, decode as UTF-8.
let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Trim whitespace from the input and split it into an array of lines.
let lineSegments = rawData.trim().split("\n");

// Global variable to store the minimum length found across all operations.
let minimumLength;

// Main processing loop.
while (true) {
  // Extract the first line, convert it to a number, and use it as the count for this test case.
  let segmentCount = lineSegments.shift() - 0;

  // If the count is 0, it signifies the end of input.
  if (segmentCount === 0) {
    break;
  }

  // Initialize an array to hold the numeric segments for the current test case.
  let numericSegments = [];

  // Populate the numericSegments array with 'segmentCount' values from the input.
  for (let idx = 0; idx < segmentCount; idx++) {
    let segmentValue = lineSegments.shift() - 0;
    numericSegments.push(segmentValue);
  }

  // Initialize the minimum length for the current test case to a very large number.
  minimumLength = Infinity;

  // This variable is declared but not used in the original logic.
  // It's kept for Type II clone fidelity.
  let initialStringRepresentation = numericSegments.join("");

  // Iterate through each position in the numeric segments array.
  for (let idx = 0; idx < segmentCount; idx++) {
    // Create two copies of the current numeric segments array.
    let modifiedSequenceA = numericSegments.slice();
    let modifiedSequenceB = numericSegments.slice();

    // Modify 'modifiedSequenceA': if not the last element, replace current with next.
    if (idx < segmentCount - 1) {
      modifiedSequenceA[idx] = modifiedSequenceA[idx + 1];
    }

    // Modify 'modifiedSequenceB': if not the first element, replace current with previous.
    if (idx > 0) {
      modifiedSequenceB[idx] = modifiedSequenceB[idx - 1];
    }

    // Process the first modified sequence.
    processSequence(modifiedSequenceA.join(""));
    // Process the second modified sequence.
    processSequence(modifiedSequenceB.join(""));
  }

  // Output the minimum length found for the current test case.
  console.log(minimumLength);
}
