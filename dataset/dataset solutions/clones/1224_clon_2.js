'use strict'; // Enforce strict mode for cleaner code practices

(function (inputSource) { // An immediately-invoked function expression (IIFE) to encapsulate code, taking raw input.

  // Convert the raw input buffer to a string for text processing.
  var contentString = inputSource.toString();

  (function processAndLog(numberList) { // Another IIFE, designed to display the processed number array.

    // Output the resulting array of numbers to the console.
    console.log(numberList);

  // The argument for the inner IIFE:
  // 1. Splits the content string by newline, taking the first line.
  // 2. Splits that first line by spaces.
  // 3. Converts each resulting string part into an integer.
  }(contentString
      .split('\n')
      [0]
      .split(' ')
      .map(parseInt))); // Using parseInt for type conversion

// The argument for the outer IIFE:
// Reads content from standard input synchronously as a UTF-8 string.
}(require('fs')
    .readFileSync('/dev/stdin', 'utf8'))); // Reading from the standard input file path