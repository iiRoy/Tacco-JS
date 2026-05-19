'use strict';

function processInput(rawData) {
  // Split the incoming raw data by newline characters to get an array of lines.
  const linesArray = rawData.split('\n');

  // Extract the first line, parse it as an integer, and store it.
  const countOfElements = parseInt(linesArray.shift(), 10);

  // Iterate over the remaining lines, parsing each as an integer.
  const numericValues = linesArray.map((currentLine) => parseInt(currentLine, 10));

  // Output the resulting array of numbers to the console.
  console.log(numericValues);
}

// Invoke the primary processing function with data read from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
