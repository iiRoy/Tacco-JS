'use strict';

// This function processes the given input string.
function ProcessInput(rawData) {
  // Split the raw data by newline characters to get individual lines.
  // Take the first line, then split it by the character "1".
  // The length of the resulting array minus one gives the count of "1"s.
  var countOfOnes = rawData.split('\n')[0].split('1').length - 1;

  // Output the calculated count to the console.
  console.log(countOfOnes);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
