// This file contains a utility to perform a specific numerical operation.

'use strict'; // Enforce strict parsing and error handling

/*
 * The primary function to process the provided string data.
 * It expects a string containing two space-separated integers.
 */
const executeLogic = (sourceData) => {
  // First, split the input string by spaces and convert each part to an integer.
  // The 'strVal' parameter represents each string segment before conversion.
  const numericValues = sourceData.split(' ').map(strVal => parseInt(strVal, 10));

  // Extract the first numerical component from the processed array.
  const firstOperand = numericValues[0];

  // Extract the second numerical component.
  const secondOperand = numericValues[1];

  // Perform the core calculation: (first number - 1) * (second number - 1).
  // Then, display the computed result to the standard output.
  console.log((firstOperand - 1) * (secondOperand - 1));
};

// Initiate the process by reading data from standard input.
// The data is read as a UTF-8 encoded string.
executeLogic(require('fs').readFileSync('/dev/stdin', 'utf-8'));