'use strict'; // Enforce strict mode for better code quality and error handling

// This is an Immediately Invoked Function Expression (IIFE)
// It encapsulates the script's logic and prevents global variable pollution.
(function(inputData) {
  // Split the entire input string by newline characters.
  // This creates an array where each element is a line from the input.
  var inputLines = inputData.split('\n');

  // Process the first line of input:
  // 1. Split it by spaces to get an array of string numbers.
  // 2. Use `map(Number)` to convert each string number into an actual number.
  // Note: This variable `numericParams` is declared but its value is not directly used
  // for the final output in the original code's logic, but it's part of the original execution path.
  var numericParams = inputLines[0].split(' ').map(Number);

  // Another IIFE is used here to perform the core sorting and formatting.
  // This ensures that the array passed to the sorting function is a fresh instance.
  var sortedOutput = (function(inputArray) {
    // Sort the array of numbers in ascending order.
    // The comparison function `valA - valB` is standard for numerical sorting.
    return inputArray.sort(function(valA, valB) {
        return valA - valB; // Returns a negative value if valA < valB, positive if valA > valB, zero if equal.
    })
    // After sorting, join the numbers back into a single string,
    // with each number separated by a single space.
    .join(' ');
  }(
    // The argument passed to the inner IIFE:
    // It re-processes the first line of input to create a new array of numbers.
    inputLines[0].split(' ').map(Number)
  ));

  // Print the final sorted string to the standard output.
  console.log(sortedOutput);

// The main IIFE is invoked immediately with the content read from standard input.
// `require('fs').readFileSync('/dev/stdin', 'utf8')` reads the entire file
// synchronously and returns its content as a UTF-8 encoded string.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
