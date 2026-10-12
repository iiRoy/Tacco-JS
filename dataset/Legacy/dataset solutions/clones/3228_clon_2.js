var readline = require('readline');

const inputBuffer = []; // Array to store each line read from standard input.

const inputReader = readline.createInterface({
  input: process.stdin, // Connects to the standard input stream.
  output: process.stdout, // Connects to the standard output stream.
});

inputReader.on('line', function (currentLine) {
  // Event handler for when a new line of input is received.
  inputBuffer.push(currentLine);
});

inputReader.on('close', function () {
  // Event handler for when the input stream ends.
  let initialConfigStr = inputBuffer.shift(); // Retrieve the first line containing N and M.
  let numSegmentsToKeep = Number(initialConfigStr.split(' ')[0]); // Parse the first number (N).
  let numPoints = Number(initialConfigStr.split(' ')[1]); // Parse the second number (M).
  let finalSum = 0; // Initialize the variable to accumulate the result.

  const pointCoordinates = Array(numPoints); // Declare an array to hold M point coordinates.
  const segmentLengths = Array(numPoints); // Declare an array to hold M-1 segment lengths (plus a dummy).

  let coordsStrArray = inputBuffer[0].split(' '); // Get the second line containing the coordinates.
  for (let idx = 0; idx < numPoints; idx++) {
    pointCoordinates[idx] = Number(coordsStrArray[idx]); // Convert string coordinates to numbers.
  }
  pointCoordinates.sort(function (valA, valB) {
    return valA - valB;
  }); // Sort the point coordinates in ascending order.

  segmentLengths[0] = 0; // Placeholder for the first element, as there are M-1 actual segments.
  for (let idx = 1; idx < numPoints; idx++) {
    segmentLengths[idx] = pointCoordinates[idx] - pointCoordinates[idx - 1]; // Calculate the length of each segment.
  }
  segmentLengths.sort(function (valA, valB) {
    return valA - valB;
  }); // Sort the calculated segment lengths in ascending order.

  // Sum the smallest segment lengths. We need to keep N segments, so we remove N-1 largest segments.
  // This means we sum the first `segmentLengths.length - (numSegmentsToKeep - 1)` elements.
  for (let idx = 0; idx < segmentLengths.length - (numSegmentsToKeep - 1); idx++) {
    finalSum = finalSum + segmentLengths[idx];
  }

  console.log(finalSum); // Output the final calculated sum.
});
