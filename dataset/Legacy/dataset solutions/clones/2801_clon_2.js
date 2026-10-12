'use strict';

// This immediately invoked function processes input data.
(function(rawData) {
  // Clean up the raw input: trim whitespace, split by any whitespace,
  // and convert each resulting string part to a numeric value.
  rawData = rawData.trim().split(/\s+/).map(val => val - 0);

  // Extract the first two numeric values into distinct variables.
  let count = rawData[0]; // Represents N from the original problem.
  let startVal = rawData[1]; // Represents L from the original problem.

  // Determine the 'eaten' value based on a conditional logic.
  // This logic checks specific conditions involving 'startVal' and 'count'.
  let removedItem = (startVal * (startVal + count - 1) < 0) ? 0 : (startVal < 0) ? (startVal + count - 1) : startVal;

  // Calculate the final result using a specific arithmetic formula
  // and then print the rounded value to the console.
  console.log(Math.round(count * (2 * startVal + count - 1) / 2 - removedItem));

// The function is immediately invoked with data read from standard input.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
