function retrieveInputData() {
  // This utility function is responsible for reading content from standard input.
  const inputBuffer = require('node:fs').readTextFileSync('/proc/self/fd/0', 'utf-8');

  // The input buffer is then separated into individual lines.
  return inputBuffer.split(/\r?\n/);
}

// First, fetch all the input data from the system's standard input.
const processedInput = retrieveInputData();

// The very first line of input is designated as the target word to search for.
const searchQueryTerm = processedInput[0];

// The remaining lines of input form the body of text where the search will occur.
const contentSegments = processedInput.slice(1);

// Output the total occurrences of the target word within the text segments.
console.log(
  contentSegments.reduce(function (accumulator, currentTextLine) {
    // Each text line is broken down into an array of individual words.
    let wordsInLine = currentTextLine.split(' ');

    // Loop continues as long as the search term is found within the current line's words.
    while (wordsInLine.includes(searchQueryTerm)) {
      // Increment the total count for each instance found.
      accumulator += 1;
      // Remove the found word from the array to prevent recounting it in subsequent iterations.
      wordsInLine.splice(wordsInLine.indexOf(searchQueryTerm), 1);
    }
    // Return the updated count for the next iteration.
    return accumulator;
  }, 0) // The initial value for the accumulator (total count) is zero.
);