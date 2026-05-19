'use strict'; // Enforce strict mode for cleaner code

/**
 * Processes the provided text input to check for a specific substring.
 * @param {string} inputData - The raw string data received.
 */
const processInput = (inputData) => {
  // Split the entire input by newline characters and take only the very first line.
  const firstLine = inputData.split('\n')[0];

  // Check if the extracted initial line contains the target sequence "hi".
  if (firstLine.includes('hi')) {
    // If "hi" is found, output a positive confirmation.
    console.log('Yes');
  } else {
    // Otherwise, output a negative confirmation.
    console.log('No');
  }
};

// Read the entire content from standard input synchronously and then pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
