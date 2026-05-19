'use strict';

function processData(rawData) {
  // Remove leading/trailing whitespace, then split the string by spaces.
  // After splitting, convert each resulting string segment into a numerical value.
  let parsedNumbers = rawData.trim().split(' ').map(numStr => Number(numStr));

  // Evaluate the sum of the first three numerical elements.
  // If this sum exceeds twenty-one, output 'bust'; otherwise, output 'win'.
  console.log(parsedNumbers[0] + parsedNumbers[1] + parsedNumbers[2] > 21 ? 'bust' : 'win');
}

// Utilize Node.js's file system module to synchronously read content from standard input.
// The input stream is expected to be encoded in UTF-8.
// The retrieved content is then passed to our primary data processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
