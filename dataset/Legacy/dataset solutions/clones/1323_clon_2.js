'use strict';

// This immediately invoked function expression (IIFE) encapsulates the script's logic,
// taking standard input as its argument.
(function(inputDataBuffer) {
  // Convert the raw input buffer (from stdin) into a string.
  var rawTextContent = inputDataBuffer.toString();

  // The core logic is wrapped in another IIFE to process the text and calculate a result.
  var calculatedOccurrenceCount = (function(textLineSegments) {
    // The first line of the input is considered the target word.
    // It's extracted and converted to lowercase for case-insensitive comparison.
    var searchTargetWord = textLineSegments.shift().toLowerCase();

    // The remaining lines are joined into a single string, then split by spaces
    // to form an array of individual words.
    // This array is then filtered to count how many words match the target word
    // (after converting each to lowercase).
    return textLineSegments.join('').split(' ').filter(function(currentWordCandidate) {
      return currentWordCandidate.toLowerCase() === searchTargetWord;
    }).length; // The final count of matching words.

  }(
    // Preparation of the input for the inner processing function:
    // 1. Split the entire raw text by the 'END_OF_TEXT' marker and take the first part.
    // 2. Trim any leading or trailing whitespace from this part.
    // 3. Split the cleaned text into an array of strings, using newline characters as delimiters.
    rawTextContent.split('END_OF_TEXT')[0].trim().split('\n')
  ));

  // Output the final calculated count to the standard output.
  console.log(calculatedOccurrenceCount);

// This part reads the content of '/dev/stdin' synchronously using Node.js's 'fs' module,
// specifying 'utf8' encoding, and passes it as an argument to the main IIFE.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
