'use strict'; // Enforce strict parsing and error handling in the script.

/**
 * Processes the given raw input to extract a specific string pattern.
 * @param {string} rawData - The complete input string, typically from stdin.
 */
const processInput = (rawData) => {
  // Split the input into lines, then each line into segments by space.
  // This creates a 2D array of string segments.
  const parsedLines = rawData.split('\n').map(lineSegment => lineSegment.split(' '));

  // Extract the first segment from the first line.
  // This is assumed to be the string we need to analyze.
  const targetString = parsedLines[0][0];

  // Use a regular expression to find a pattern:
  // any characters (captured in group 1) followed by "FESTIVAL" at the end of the string.
  const matchResult = targetString.match(/^(.+)FESTIVAL$/);

  // Log the captured group (the part before "FESTIVAL") to the console.
  // This is the desired output.
  console.log(matchResult[1]);
};

// Read the entire content of standard input synchronously as a UTF-8 string,
// then pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
