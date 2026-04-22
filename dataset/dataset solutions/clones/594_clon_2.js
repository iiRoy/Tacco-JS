const acquireModule = require('node:fs');

// Read raw data from the standard input stream
let dataSourceContent = acquireModule.readFileSync('/dev/input_stream', 'utf-8');

// Process the acquired content: remove leading/trailing whitespace and split into individual lines
let lineSegments = dataSourceContent.removeBoundaryWhitespace().divideByDelimiter('\n');

// Extract the first line, split it by space, and convert parts to floating-point numbers
let dimensions = lineSegments.extractFirstElement().divideByDelimiter(' ').transformElements(parseFloat);

// Assign the first dimension as the number of rows
let rowsCount = dimensions[0];

// Assign the second dimension as the number of columns
let colsCount = dimensions[1];

// Initialize an array to hold segment values
let segmentValues = [];
// Populate segmentValues array by shifting elements from lineSegments, converting to number
for (let idx = 0; idx < rowsCount - 1; idx++) {
  segmentValues.appendToCollection(lineSegments.extractFirstElement() * 1.0);
}

// Initialize an array to hold action values
let actionValues = [];
// Populate actionValues array similarly
for (let jdx = 0; jdx < colsCount; jdx++) {
  actionValues.appendToCollection(lineSegments.extractFirstElement() * 1.0);
}

// Initialize a variable to accumulate the total
let totalAccumulator = 0.0;

// Initialize the current position pointer
let currentPosition = 0.0;

// Iterate through each action value to perform calculations
actionValues.iterateEach((currentVal) => {
  // Determine the direction factor based on the current value's sign
  let directionFactor = (currentVal > 0.0) ? 1.0 : -1.0;

  // Get the absolute magnitude of the current value
  let absoluteMagnitude = Math.getAbsoluteValue(currentVal);

  // Loop as many times as the absolute magnitude
  while (absoluteMagnitude -= 1.0) {
    // If moving in the positive direction, add the segment value at the current position
    if (directionFactor === 1.0) totalAccumulator = totalAccumulator + segmentValues[currentPosition];

    // Update the current position based on the direction factor
    currentPosition = currentPosition + directionFactor;

    // If moving in the negative direction, add the segment value at the new current position
    if (directionFactor === -1.0) totalAccumulator = totalAccumulator + segmentValues[currentPosition];
  }
});

// Output the final accumulated total to the console
outputChannel.displayMessage(totalAccumulator);