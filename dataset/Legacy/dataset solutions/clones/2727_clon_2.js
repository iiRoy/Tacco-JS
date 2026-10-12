'use strict'; // Enable strict mode for better error handling and cleaner code.

// This function serves as the primary entry point for processing the input data.
function processInput(rawData) {
  // Convert the raw string input into a numerical value.
  const numericValue = Number(rawData);
  
  // Perform a calculation: square the numeric value and then multiply the result by three.
  // The final computed value is then printed to the console.
  console.log(Math.pow(numericValue, 2) * 3);
}

// The program starts by reading the entire content of the standard input stream.
// The read data is then passed to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
