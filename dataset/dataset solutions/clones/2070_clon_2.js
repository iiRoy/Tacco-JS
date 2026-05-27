'use strict';

function processInputData(rawData) {
  // First, remove any leading/trailing whitespace from the input string.
  // Then, split the string into an array of substrings using space as a delimiter.
  // Finally, convert each substring in the array to a numeric type.
  let numericValues = rawData.trim().split(' ').map(strVal => strVal * 1);

  // Calculate the product of the first two numbers, divide by two,
  // and then round the result up to the nearest whole number.
  let finalOutcome = Math.ceil((numericValues[0] * numericValues[1]) / 2);

  // Display the computed final outcome to the standard output.
  console.log(finalOutcome);
}

// Read the entire content from standard input synchronously,
// using UTF-8 encoding, and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
