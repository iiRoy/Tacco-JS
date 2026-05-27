var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the raw input into an array of lines, removing any leading/trailing whitespace.
var lineSegments = (rawData.trim()).split("\n");

// Main processing loop. Continues indefinitely until a specific termination condition is met.
while (true) {
  // Extract the first line, split it by space, and convert parts to numbers.
  // This line typically contains configuration values for the current iteration.
  var configValues = (lineSegments.shift()).split(" ").map(Number);

  // Check for the termination condition: both configuration values are zero.
  if (configValues[0] === 0 && configValues[1] === 0) {
    break; // Exit the loop if termination condition is met.
  }

  // Initialize an array to hold the data sequence for the current iteration.
  var dataSequence = [];

  // Populate the data sequence based on the first configuration value.
  // It creates a descending sequence from configValues[0] down to 1.
  for (let idx = 0; idx < configValues[0]; idx++) {
    dataSequence[idx] = configValues[0] - idx;
  }

  // Perform a series of reordering operations on the data sequence.
  // The number of operations is determined by the second configuration value.
  for (let idx = 0; idx < configValues[1]; idx++) {
    // Read the next line, split by space, and convert parts to numbers.
    // These are the parameters for the current reordering operation.
    var operationParams = (lineSegments.shift()).split(" ").map(Number);

    // 'startIndex' is the 0-based index where the segment to move begins.
    var startIndex = operationParams[0] - 1;
    // 'countElements' is the number of elements to move from 'startIndex'.
    var countElements = operationParams[1];

    // Divide the current data sequence into three parts:
    // 1. 'firstPart': Elements before the segment to be moved.
    var firstPart = dataSequence.slice(0, startIndex);
    // 2. 'middlePart': The segment of elements to be moved.
    var middlePart = dataSequence.slice(startIndex, startIndex + countElements);
    // 3. 'lastPart': Elements after the segment to be moved.
    var lastPart = dataSequence.slice(startIndex + countElements);

    // Reconstruct the data sequence by concatenating the parts in a new order:
    // middlePart (moved segment) followed by firstPart (elements before), then lastPart (elements after).
    dataSequence = middlePart.concat(firstPart, lastPart);
  }

  // After all operations for the current iteration, print the first element of the final data sequence.
  console.log(dataSequence[0]);
}
