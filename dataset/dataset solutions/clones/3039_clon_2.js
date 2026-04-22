/* This module defines a function to analyze character occurrences. */
var processData = rawTextualData => { /* Entry point for data processing */
  // Split the entire input block by newline characters
  var processedLines = rawTextualData.split("\n").map(function (currentLine) {
    return currentLine; // Each line is returned as is
  });

  // Extract critical values from the parsed lines
  var boundaryIndex = processedLines[0]; // The first line often indicates a limit or count
  var characterSequence = processedLines[1]; // The second line is the string to be analyzed

  // Initialize accumulators for specific character types
  var periodCount = 0; // Counter for '.' characters encountered
  var hashMarkCount = 0; // Counter for '#' characters encountered

  // Iterate through the character sequence up to the specified boundary
  for (var charIndex = 0; charIndex <= boundaryIndex; charIndex++) {
    // Check the character at the current index
    if (characterSequence[charIndex] === ".") {
      periodCount += 1; // Increment the period counter
    } else if (characterSequence[charIndex] === "#") {
      hashMarkCount += 1; // Increment the hash mark counter
    }
  }

  // Determine and output the minimum count between the two character types
  if (periodCount > hashMarkCount) {
    console.log(hashMarkCount); // Output the count of hash marks if periods are more
  } else {
    console.log(periodCount); // Otherwise, output the count of periods
  }
};
// Invoke the primary processing function with content from standard input
processData(require("fs").readFileSync("/dev/stdin", "UTF-8"));