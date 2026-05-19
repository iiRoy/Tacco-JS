'use strict';

/*
 * This script processes a series of numerical inputs to generate a sequence.
 * It calculates subsequent values based on a recursive formula.
 */
function processInput(rawData) {
  // Clean up the raw input string and split it into an array of strings.
  // The input is expected to be space-separated numbers.
  rawData = rawData.trim().split(' ');

  // Extract the first numerical parameter, often referred to as 'r' in the problem context.
  const rateVal = Number(rawData[0]);

  // Extract the second numerical parameter, often referred to as 'D'.
  const subtractionVal = Number(rawData[1]);

  // Initialize the sequence with the third numerical input value.
  // This array will store the generated numbers.
  let resultSequence = [Number(rawData[2])];

  // Loop to generate the next 10 elements of the sequence.
  // The loop starts from index 1 because the 0th element is already initialized.
  for (let counter = 1; counter <= 10; counter++) {
    // Apply the recursive formula: current_value = rateVal * previous_value - subtractionVal
    resultSequence[counter] = rateVal * resultSequence[counter - 1] - subtractionVal;
  }

  // Remove the initial element from the sequence, as it's often just a starting point
  // and not part of the desired output series in some problem types.
  resultSequence.shift();

  // Output the generated sequence, with each number on a new line.
  // The join method concatenates array elements with the specified separator.
  console.log(resultSequence.join('\n'));
}

// Read input from standard input and pass it to the processing function.
// This is a common pattern for competitive programming in Node.js.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
