"use strict"; // Activates strict mode for the entire script, enhancing error handling.

// This function is designed to process a given text string.
function processInput(rawData) {
  // First, any leading or trailing whitespace is removed from the raw data.
  // Then, the string is split into an array of individual characters.
  // Finally, the array is filtered to retain only those characters that are exactly '1'.
  const filteredOnes = rawData.trim().split('').filter(digitChar => digitChar === '1');

  // The total count of '1' characters found is then printed to the console.
  console.log(filteredOnes.length);
}

// The script reads the entire content of the standard input stream.
// It uses the Node.js 'fs' module to synchronously read the file at '/dev/stdin'
// and interprets its content as a UTF-8 encoded string.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// The main processing function is invoked with the content read from standard input.
processInput(fileContent);
