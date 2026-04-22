'use strict';
/* This helper function outputs a message to the console. */
const printLine = (messageText) => console.log(messageText);

// The primary input data is received as a single string.
function ProcessInputData(rawData) {

  // The raw input string is separated into individual lines.
  let lineSegments = rawData.split("\n");

  // The first segment, parsed as an integer, represents the value to examine.
  let numericValue = parseInt(lineSegments[0].split(' ')[0], 10);

  let containsDigitSeven = false; // Flag to track if the digit 7 is found.

  // Iterate through the digits of the number until it's reduced to 1 or less.
  while (numericValue > 1) {
    let currentDigit = numericValue % 10; // Extract the last digit.
    if (currentDigit === 7) {
      containsDigitSeven = true; // Set flag if 7 is found.
      break; // Exit the loop early.
    }
    numericValue = Math.floor(numericValue / 10); // Remove the last digit (integer division).
  }

  // Output the result based on whether the digit 7 was present.
  if (containsDigitSeven) printLine('Yes');
  else printLine('No');
}

// Do not modify the code below this line (handles standard input/output and calls the main processing function).
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));