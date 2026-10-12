'use strict';

// This is the main execution wrapper, an Immediately Invoked Function Expression (IIFE).
// It takes the standard input as its argument.
(function(inputSource) {
  // Convert the raw input buffer into a string for easier processing.
  var rawTextContent = inputSource.toString();

  // Define a regular expression to identify specific data blocks.
  // Each block starts with one or more letters, followed by a newline,
  // then one or more lines each containing a positive integer followed by a newline.
  var segmentPattern = /[A-Za-z]+\n([1-9][0-9]*\n)+/g;

  // The core logic is encapsulated in another IIFE to process the matched segments.
  var processedResult = (function(parsedSegments) {
    // Iterate over each individual parsed segment.
    return parsedSegments
      .map(function(currentSegment) {
        // 'currentSegment' is an array, e.g., ['ABC', '1', '2'].
        // currentSegment[0] is the initial string (e.g., 'ABC').
        // currentSegment[1] is the count of shift operations (e.g., '1').
        // The remaining elements are the shift amounts.
        // We slice from the end to get the shift amounts, based on currentSegment[1].
        return currentSegment.slice(-currentSegment[1])
          .map(Number) // Convert the string shift amounts to actual numbers.
          .reduce(function(accumulatorString, shiftAmount) {
            // As per original behavior, log each shift amount.
            console.log(shiftAmount);
            // Perform a circular shift on the string:
            // Take the part from 'shiftAmount' to the end,
            // then append the part from the beginning up to 'shiftAmount'.
            return accumulatorString.slice(shiftAmount) + accumulatorString.slice(0, shiftAmount);
          }, currentSegment[0]); // Start the reduction with the initial string from the segment.
      })
      .join('\n'); // Join all the final processed strings with newline characters.
  }(
    // First, find all occurrences matching the 'segmentPattern' in the raw text.
    rawTextContent.match(segmentPattern)
      // Then, for each matched block (which is a string),
      // trim any leading/trailing whitespace and split it into an array of lines.
      .map(function(matchedBlock) {
        return matchedBlock.trim().split('\n');
      })
  ));

  // Output the final aggregated result to the console.
  console.log(processedResult);

// The input source is read from '/dev/stdin' using Node.js's 'fs' module,
// and specified to be UTF-8 encoded.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
