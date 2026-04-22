'use strict';

// This function processes the incoming string data to perform a specific calculation.
const executeCalculation = (sourceString) => {
  // Split the raw input string into individual lines, then further split each line
  // by spaces to get an array of string segments for each line.
  const parsedLines = sourceString
    .split('\n')
    .map(currentLine => currentLine.split(' '));

  // Parse the first element of the first line as an integer, using base 10.
  // This represents the primary numerical input for our operation.
  const primaryNum = parseInt(parsedLines[0][0], 10);

  // Parse the first element of the second line as an integer, using base 10.
  // This represents the secondary numerical input for our operation.
  const secondaryNum = parseInt(parsedLines[1][0], 10);

  // Perform the core calculation: (secondary value multiplied by two) minus the primary value.
  // The final computed result is then printed to the standard output.
  console.log(secondaryNum * 2 - primaryNum);
};

// Read the entire content from standard input (typically '/dev/stdin' on Linux-like systems)
// as a UTF-8 encoded string, and then pass this string to our main processing function.
executeCalculation(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);