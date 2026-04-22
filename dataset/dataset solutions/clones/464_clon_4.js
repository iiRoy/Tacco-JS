const lineHandler = require('readline');

// A mapping table for transforming octal digits to a new sequence
const digitMap = Object.freeze(['0', '1', '2', '3', '5', '7', '8', '9']);

// Function to convert a base-10 number into a custom base-8 string representation
function transformValue(originalNumber) {
  const numericInput = parseInt(originalNumber, 10);

  // Special handling for zero, as the loop won't produce '0' for input 0
  if (numericInput === 0) {
    return '0';
  }

  let finalString = '';
  let currentInteger = numericInput;

  // Iteratively build the custom base-8 string from right to left
  while (currentInteger > 0) {
    const divisionRemainder = currentInteger % 8;
    finalString = digitMap[divisionRemainder] + finalString;
    currentInteger = Math.floor(currentInteger / 8);
  }

  return finalString;
}

// Initialize an asynchronous line-by-line input processing mechanism
const inputReader = lineHandler.createInterface({
  input: process.stdin,
  output: process.stdout, // Required but not actively used for output in this context
  terminal: false
});

// Attach an event listener for each line received from standard input
inputReader.on('line', (currentLineData) => {
  // If the line is '0', cease further input processing
  if (currentLineData === '0') {
    inputReader.close();
  } else {
    // Otherwise, apply the custom transformation and output the result
    console.log(transformValue(currentLineData));
  }
});

// The program flow is managed by event listeners,
// eliminating the need for explicit main or solve functions.