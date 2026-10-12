'use strict';

// This script processes input from standard input to perform a specific calculation.
process.stdin.on('data', function (inputChunk) {
  // Convert the incoming data chunk to a string, then remove leading/trailing whitespace.
  var inputString = inputChunk.toString().trim();

  // Split the string by spaces and convert each part to a number.
  var numericValues = inputString.split(' ').map(Number);

  // Extract the three required numerical parameters.
  var firstNum = numericValues[0];
  var secondNum = numericValues[1];
  var thirdNum = numericValues[2];

  // Initialize a counter for the number of occurrences.
  var occurrenceCounter = 0;

  // Iterate from the first number up to (and including) the second number.
  for (var iteratorVar = firstNum; iteratorVar < secondNum + 1; iteratorVar++) {
    // Check if the third number is perfectly divisible by the current iterator value.
    if (thirdNum % iteratorVar === 0) {
      // If it is, increment the counter.
      occurrenceCounter++;
    }
  }

  // Output the final count to the console.
  console.log(occurrenceCounter);
});

// Ensure the standard input stream remains active to receive data.
process.stdin.resume();

// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding('utf8');
