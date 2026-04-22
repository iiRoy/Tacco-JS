/*
 * This script processes a given text input to identify specific patterns.
 * It's designed to find "local extrema" (peaks or valleys) within a sequence of numbers.
 */
function ProcessInputData(rawInputText) /* Main processing routine */ {
  // Extract the relevant line from the input and split it into individual string values.
  // The original input is expected to be multi-line, and we're interested in the second line.
  var numericSequence = rawInputText
    .split('\n')[1]
    .split(' ');
  // Initialize a counter to track the number of identified patterns.
  var fluctuationTally = 0;
  // Iterate through the numeric sequence, focusing on elements that have both a predecessor and a successor.
  // The loop runs from the second element up to the second-to-last element.
  for (let currentIndex = 0; currentIndex <= (numericSequence.length - 2); currentIndex++) {
    // Check if the current element forms a "peak" or a "valley" with its immediate neighbors.
    // A peak: previous < current < next
    // A valley: previous > current > next
    if (
      (numericSequence[currentIndex - 1] < numericSequence[currentIndex] &&
        numericSequence[currentIndex] < numericSequence[currentIndex + 1]) ||
      (numericSequence[currentIndex - 1] > numericSequence[currentIndex] &&
        numericSequence[currentIndex] > numericSequence[currentIndex + 1])
    ) {
      // If the pattern (local extremum) is found, increment the tally.
      fluctuationTally += 1;
    }
  }
  // Output the final count of identified patterns to the console.
  console.log(fluctuationTally);
}

// Invoke the primary processing function.
// It reads input synchronously from standard input ('/dev/stdin') using Node.js 'fs' module.
ProcessInputData(
  require('fs')
  .readFileSync('/dev/stdin', 'utf8')
);