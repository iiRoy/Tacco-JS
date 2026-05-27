// This script processes multi-line input to calculate a sum based on a specific condition.
function ProcessData(sourceText) {
  // Split the entire input string into an array of individual lines.
  // The first element (index 0) will be the first line, and so on.
  let lineSegments = sourceText.split('\n');

  // Initialize a variable to store the accumulated sum.
  let cumulativeValue = 0;

  // Initialize a boolean flag to track if the target pattern has been found.
  let matchDetected = false;

  // Determine the total number of data lines to iterate through,
  // which is specified by the numeric value on the very first line of input.
  const totalLinesToExamine = Number(lineSegments[0]);

  // Loop through the relevant data lines, starting from the second line (index 1)
  // up to and including the line specified by totalLinesToExamine.
  for (let lineIndex = 1; lineIndex <= totalLinesToExamine; lineIndex++) {
    // Check if the match has not yet been detected.
    if (!matchDetected) {
      // If the current line contains the pattern found in the very last line of the input,
      // then set the matchDetected flag to true.
      if (lineSegments[lineIndex].match(lineSegments[lineSegments.length - 1])) {
        matchDetected = true;
        // Skip the rest of the current iteration and move to the next line.
        continue;
      }
    }

    // If the match has already been detected (or was just detected in this iteration),
    // then process the current line to add its numeric component to the sum.
    if (matchDetected) {
      // Split the current line by space and take the second part (index 1),
      // converting it to a number before adding it to the cumulative sum.
      cumulativeValue += Number(lineSegments[lineIndex].split(' ')[1]);
    }
  }

  // Output the final calculated sum to the console.
  console.log(cumulativeValue);
}

// Read the entire content of standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));
