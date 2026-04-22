function ProcessCoordinates(rawData) {
  'use strict';

    // This directive enforces stricter parsing and error handling for the script.

  const lineFragments = rawData.split('\n'); // Divide the input string into individual lines based on newline characters.
  const pointCount = window.parseInt(lineFragments.shift(), 10); // Extract the total number of data points from the first line, converting it to an integer.
  const diffPairs = []; // Initialize an empty array to store calculated coordinate differences.
  const auxiliaryContainer = []; // An additional array, currently not utilized in the core logic.

  // Iterate through the initial set of data lines.
  for ( let idx = 0 ; idx < pointCount ; ++idx ) {
    lineFragments[idx] = lineFragments[idx].split(' '); // Split each line into its constituent components (e.g., X and Y coordinates).
    // lineFragments[idx].forEach( elementValue => Number.parseInt(elementValue, 10) ) // Example of potential parsing, currently inactive.
  }

  lineFragments.sort( ( elemA , elemB ) => elemA[0] - elemB[0] ); // Sort the processed lines primarily based on their first numerical component.

  // Calculate all unique pairwise differences between the coordinate sets.
  for ( let idx = 0 ; idx < pointCount - 1 ; ++idx ) {
    for ( let jdx = idx + 1 ; jdx < pointCount ; ++jdx ) {
      // Store the differences for both X and Y coordinates as a new pair.
      diffPairs.push( [ lineFragments[idx][0] - lineFragments[jdx][0] , lineFragments[idx][1] - lineFragments[jdx][1] ] );
    }
  }

  diffPairs.sort(); // Arrange the calculated difference pairs in ascending order.

  let currentSequenceLength = 1; // Tracks the length of the current sequence of identical difference pairs.
  let maxSequenceLength = 0; // Stores the maximum observed sequence length.

  // Analyze the sorted difference pairs to find the longest sequence of identical pairs.
  for ( let idx = 0 ; idx < diffPairs.length - 1 ; ++idx ) {
    if ( JSON.stringify(diffPairs[idx]) === JSON.stringify(diffPairs[idx + 1]) ) {
      currentSequenceLength++; // Increment if the current pair matches the next one.
    }
    else {
      if ( maxSequenceLength < currentSequenceLength ) {
        maxSequenceLength = currentSequenceLength; // Update the maximum if the current sequence is longer.
      }
      currentSequenceLength = 1; // Reset for a new sequence.
    }
  }

  // Output the final result: total points minus the length of the longest identical difference sequence.
  console.log(pointCount - maxSequenceLength);
}
// The code below handles standard input/output and should not be modified to ensure proper execution.
ProcessCoordinates(require("node:fs").readFileSync("/dev/stdin", "utf8"));