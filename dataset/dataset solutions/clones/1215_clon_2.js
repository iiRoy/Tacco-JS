'use strict';

// This immediately invoked function expression (IIFE) encapsulates the entire script.
// It takes the standard input data as an argument.
(function (inputData) {
  // Convert the raw input buffer to a string, remove leading/trailing whitespace,
  // and then split it into an array of lines based on newline characters.
  var lines = inputData.toString().trim().split('\n');

  // Take the first line of input, split it by spaces, and convert each part to a number.
  // This assumes the first line contains two space-separated numbers.
  var numericalArguments = lines[0].split(' ').map(Number);

  // Another IIFE is used here to process the extracted numerical arguments.
  // It receives the first and second numbers as distinct parameters.
  (function (firstVal, secondVal) {
    // Call the comparison utility function and log its result to the console.
    console.log(compareValues(firstVal, secondVal));

    /**
     * Determines the relationship between two numerical values.
     * @param {number} valA - The initial numeric value.
     * @param {number} valB - The secondary numeric value.
     * @returns {string} A string indicating if valA is greater than, less than, or equal to valB.
     */
    function compareValues(valA, valB) {
      // Check if the first value is strictly greater than the second.
      if (valA > valB) {
        return 'a > b';
      }
      // Check if the first value is strictly less than the second.
      if (valA < valB) {
        return 'a < b';
      }
      // If neither of the above conditions is met, the values must be equal.
      return 'a == b';
    }
  }(numericalArguments[0], numericalArguments[1])); // Pass the first and second parsed numbers.

// The main IIFE is immediately invoked with the content read from standard input.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
