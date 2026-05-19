'use strict'; // Enforce strict parsing and error handling for better code quality.

/**
 * Processes the raw input data to perform a specific calculation.
 * @param {string} rawData - The complete input string received from the source.
 */
const processInput = (rawData) => {
  // Split the input string by newline characters, then further split each line by spaces.
  // This creates a 2D array where each inner array represents words on a line.
  const parsedLines = rawData.split('\n').map((lineSegment) => lineSegment.split(' '));

  // Extract the first element from the first line, convert it to an integer.
  // The radix 10 is explicitly provided for safety.
  const initialValue = parseInt(parsedLines[0][0], 10);

  // Calculate the floor of the initial value divided by 3 and print the result to the console.
  // This effectively performs integer division.
  console.log(Math.floor(initialValue / 3));
};

// Read the input from standard input asynchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
// Once the file is read, the content is passed to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
