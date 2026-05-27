'use strict';

// This function processes the provided raw input data.
function processData(rawData) {
  // Remove leading/trailing whitespace from the input string.
  const numericString = rawData.trim();

  // Determine the total character count of the processed string.
  const stringLength = numericString.length;

  // Convert the string to an integer using a bitwise NOT operator twice.
  const parsedNumber = ~~numericString;

  // Initialize a variable to hold a calculated modulus value.
  let remainderValue = 0;

  // Check if the string length is an odd number.
  if (stringLength % 2) {
    // If odd, calculate a specific modulus and add 1.
    remainderValue = (parsedNumber % Math.pow(10, stringLength - 1)) + 1;
  }

  // Calculate half of the string length, rounded down.
  const halfLength = Math.floor(stringLength / 2);

  // Initialize an empty string for building a temporary sequence.
  let generatedString = '';

  // Loop to construct the temporary string based on halfLength.
  for (let loopCounter = 1; loopCounter <= halfLength * 2; loopCounter++) {
    // Prepend '9' if the counter is odd, otherwise prepend '0'.
    generatedString = loopCounter % 2 ? '9' + generatedString : '0' + generatedString;
  }

  // Convert the generated string to an integer using base 10.
  generatedString = parseInt(generatedString, 10);

  // Output the sum of the generated integer and the calculated remainder value.
  console.log(generatedString + remainderValue);
}

// Read input from standard input synchronously and pass it to the processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
