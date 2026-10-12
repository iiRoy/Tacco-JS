function processInputData(rawData) {
  // The incoming raw text is divided into separate lines.
  let lineSegments = rawData.split("\n");

  // The initial line is then broken down into its constituent parts, separated by spaces.
  let firstLineParts = lineSegments[0].split(" ");

  // Similarly, the subsequent line is parsed into its individual values.
  let secondLineValues = lineSegments[1].split(" ");

  let resultCounter = 0; // A counter is initialized to keep track of qualifying entries.

  // A loop iterates a number of times, determined by the first element of the first line.
  for (let idx = 0; idx < firstLineParts[0]; idx++) {
    // Inside the loop, a condition checks if the second element of the first line
    // is less than or equal to the current value from the second line.
    if (firstLineParts[1] <= secondLineValues[idx]) {
      resultCounter++; // If the condition holds true, the counter is incremented.
    }
  }

  // The final tally is then displayed to the standard output.
  console.log(resultCounter);
}

// This part of the code is responsible for reading input from the system's standard input
// and passing it to the main processing function. It should remain unaltered.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
