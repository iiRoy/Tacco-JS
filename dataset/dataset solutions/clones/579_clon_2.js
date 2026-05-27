const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the raw input into an array of lines, removing any leading/trailing whitespace
let lineSegments = rawData.trim().split("\n");

// Begin the main processing loop, which continues until no more lines are available
while (true) {
  // Check if the array of line segments is empty; if so, break the loop
  if (lineSegments.length === 0) {
    break;
  }

  // Extract the first two lines from the array and convert each into a character array
  const firstSequence = lineSegments.shift().split("");
  const secondSequence = lineSegments.shift().split("");

  // Initialize variables for storing the maximum result and a counter for the inner loop's range
  let finalResult = 0;
  let currentCount = 0;

  // Outer loop: iterates backwards through the 'firstSequence'
  // This loop effectively defines the starting point for a sliding window comparison
  for (let outerIndex = firstSequence.length - 1; outerIndex >= 0; outerIndex--) {
    currentCount++; // Increment the counter, expanding the comparison window for 'secondSequence'
    let tempIndex = outerIndex; // Initialize a temporary index for 'firstSequence'
    let currentMax = 0; // Reset the current maximum consecutive match length for this outer iteration

    // Inner loop: iterates through a segment of 'secondSequence'
    // The length of this segment is determined by 'currentCount'
    for (let innerIndex = 0; innerIndex < currentCount; innerIndex++) {
      // Compare characters from 'firstSequence' (at 'tempIndex') and 'secondSequence' (at 'innerIndex')
      if (firstSequence[tempIndex] === secondSequence[innerIndex]) {
        currentMax++; // If characters match, increment the current consecutive match count
      } else {
        // If characters do not match, the current consecutive sequence is broken.
        // Update the overall maximum result if 'currentMax' is greater than 'finalResult'.
        finalResult = Math.max(finalResult, currentMax);
        currentMax = 0; // Reset 'currentMax' as the match sequence has been interrupted.
      }
      tempIndex++; // Advance the temporary index for 'firstSequence'
    }
    // Note: 'finalResult' is only updated when a mismatch occurs.
    // If the inner loop ends with a match, that 'currentMax' is not immediately transferred to 'finalResult'.
  }
  // After processing both sequences, print the final calculated result
  console.log(finalResult);
}
