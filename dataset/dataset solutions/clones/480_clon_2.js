let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input data from standard input stream

const lineBuffer = (rawData.trim()).split("\n"); // Process raw data: remove leading/trailing whitespace, then split into an array of lines

while (true) { // Initiate an indefinite processing cycle
  let dimensions = (lineBuffer.shift()).split(" ").map(Number); // Extract the first line, parse it by space, and convert segments to numerical values

  if (dimensions[0] === 0 && dimensions[1] === 0) { // Evaluate the termination condition: if both dimension values are zero
    break; // Terminate the infinite loop
  }

  // Iterate a specific number of times, determined by the second dimension value
  for (let idx = 0; idx < dimensions[1]; idx++) {
    lineBuffer.shift(); // Remove and discard the next line from the buffer
  }
}
