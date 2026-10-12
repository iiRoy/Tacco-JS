'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes the raw input string to perform a specific string manipulation.
 * If the first line of input has a length of 2, it prints it as is.
 * Otherwise, it reverses the first line and prints the reversed string.
 * @param {string} rawData - The entire input string, potentially multi-line.
 */
const processInput = (rawData) => {
  // Split the incoming data into an array of individual lines
  const linesArray = rawData.split('\n');

  // Extract the very first line from the parsed input
  const firstLine = linesArray[0];

  // Check the character count of the initial string
  if (firstLine.length === 2) {
    // If the length is exactly two, output the string without changes
    console.log(firstLine);
  } else {
    // For any other length, reverse the string and then print it
    console.log(firstLine.split('').reverse().join(''));
  }
};

// Read the content from standard input and pass it to our processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
