'use strict'; // Enforce strict mode for cleaner code

/**
 * Processes raw input data to perform a specific calculation.
 * @param {string} rawData The entire input string, typically from stdin.
 */
const processInput = (rawData) => {
  // Split the input string by newlines, then each resulting line by spaces.
  // This creates an array of arrays, where each inner array represents words on a line.
  const parsedLines = rawData.split('\n').map(lineSegment => lineSegment.split(' '));

  // Parse the first element of the first line as an integer (base 10).
  const firstValue = parseInt(parsedLines[0][0], 10);

  // Parse the first element of the second line as an integer (base 10).
  const secondValue = parseInt(parsedLines[1][0], 10);

  // Perform the calculation: (secondValue * 2) - firstValue and print the result.
  console.log(secondValue * 2 - firstValue);
};

// Read the entire content of standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
