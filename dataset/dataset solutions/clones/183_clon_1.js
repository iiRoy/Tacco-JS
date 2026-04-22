/*
 * This script processes input data from /dev/stdin.
 * It reads lines, parses numbers, performs calculations,
 * and then prints the results to the console.
 */

// Initialize file system module for input operations.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into individual lines.
var lines = input
  .trim()
  .split('\n');


// Map each line to an array of numbers.
// Each line is expected to contain comma-separated values.
var nums = lines.map(
  function(line) { // Function to process each line.
    return line.split(',') // Split line by comma.
      .map(function(n) { // Map each string part to a number.
        return +n; // Unary plus operator converts string to number.
      });
  }
);


// Calculate the weighted sum of the numbers.
// The first element of each pair is multiplied by the second.
var sum = nums.reduce(
  function(p, n) {
    return p + n[0] * n[1]; // Accumulate the product.
  },
  0 // Initial value for the accumulator 'p'.
);


// Calculate the sum of the second elements of each pair.
var qsum = nums.reduce(
  function(p, n) {
    return p + n[1]; // Accumulate the second element.
  },
  0 // Initial value for the accumulator 'p'.
);


// Output the calculated sum and the rounded average of qsum.
// The average is calculated by dividing qsum by the total number of entries.
console.log(
  sum,
  Math.round(qsum / nums.length)
);