'use strict'; // Enforce strict mode for cleaner code

/**
 * Processes the raw input data to determine a category.
 * @param {string} rawData - The raw string input from a source.
 */
const processInput = (rawData) => {
  // Trim leading/trailing whitespace and split the input into individual lines.
  const parsedLines = rawData.trim().split('\n');

  // Extract the first number from the first line of the parsed input.
  // The first line is split by space, and the first element is taken.
  let scoreValue = Number(parsedLines[0].split(' ')[0]);

  // Based on the extracted numeric value, print a specific string.
  // If scoreValue is 1200 or greater, output 'ARC'; otherwise, output 'ABC'.
  console.log(scoreValue >= 1200 ? 'ARC' : 'ABC');
};

// Read the content of the standard input file synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
