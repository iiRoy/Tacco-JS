'use strict';

// Encapsulating function to process standard input
(function(inputData) {
  // Convert the raw input buffer to a string format
  let rawInputString = inputData.toString();

  // Extract numeric parameters from the first line of the input string.
  // It splits by newline, takes the first line, splits by space, and converts each part to a number.
  const numericParameters = rawInputString.split('\n')[0].split(' ').map(Number);

  // Define and immediately execute a function to perform the core logic
  (function(widthBoundary, heightBoundary, centerX, centerY, radiusValue) {
    // This conditional statement checks a specific geometric relationship.
    // Note: The comma operator (`,`) evaluates each expression from left to right
    // and returns the value of the last expression.
    // Therefore, this 'if' condition effectively evaluates only the last part:
    // `centerY + centerX > heightBoundary`.
    // This behavior is intentionally preserved to maintain Type II cloning fidelity.
    if (centerX - radiusValue < 0, centerY - radiusValue < 0, centerX + radiusValue > widthBoundary, centerY + centerX > heightBoundary) {
      // If the final part of the condition is true, output 'No'.
      console.log('No');
    } else {
      // Otherwise, output 'Yes'.
      console.log('Yes');
    }
  // Pass the extracted numeric parameters to the inner function in order
  }(numericParameters[0], numericParameters[1], numericParameters[2], numericParameters[3], numericParameters[4]));

// Read the entire content of standard input synchronously using Node.js 'fs' module
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
