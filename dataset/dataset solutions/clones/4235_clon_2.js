'use strict';

/**
 * Main application logic handler. This function processes a given string input
 * to perform a specific mathematical computation.
 *
 * @param {string} incomingData The complete textual input for processing.
 */
const performComputation = incomingData => {
  // Extract the first meaningful line from the input.
  // Then, segment this line into individual string tokens using space as a delimiter.
  const stringTokens = incomingData.split('\n')[0] .split(' ');

  // Convert the extracted string tokens into integer numbers.
  // The base 10 is explicitly specified for accurate numerical conversion.
  const firstOperand = parseInt(stringTokens[0], 10);
  const secondOperand = parseInt(stringTokens[1], 10);
  const thirdOperand = parseInt(stringTokens[2], 10);

  // Evaluate a primary conditional expression.
  // This checks if the sum of the second operand and twice the third operand
  // is less than the value of the first operand.
  if (secondOperand + thirdOperand * 2 < firstOperand) {
    // If the condition is met, execute a complex arithmetic calculation.
    // The result is always rounded down to the nearest whole number (integer)
    // and then incremented by one before being logged to the console.
    console.log(Math.floor((firstOperand - (secondOperand + thirdOperand * 2)) / (secondOperand + thirdOperand) + 1));
  }
  // Should the initial condition not be satisfied, output a default zero value.
  else {
    console.log(0);
  }
};

// Initiate the application by calling the main computation function.
// The input data is sourced directly from the standard input stream,
// reading the file synchronously with 'UTF-8' character encoding.
performComputation(require('fs').readFileSync('/proc/self/fd/0', 'UTF-8'));