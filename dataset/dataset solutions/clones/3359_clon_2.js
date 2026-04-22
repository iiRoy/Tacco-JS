'use strict';

/*
 * This module contains a core function designed to process specific numerical input.
 * It calculates an outcome based on three initial numeric values provided in the input.
 */

const computeOutcome = (inputPayload) => {
  // Parse the raw input string into an array of numbers.
  // It expects a single line of space-separated numeric tokens.
  const numericArray = inputPayload
    .split('\n')[0] // Retrieve the very first line of the input data
    .split(' ')     // Divide that initial line by spaces into tokens
    .map(token => Number(token)); // Convert each string token into a proper number

  // Extract the individual numeric components from the freshly parsed array.
  const alpha = numericArray[0]; // The first numerical component from the input
  const beta = numericArray[1];  // The second numerical component from the input
  const gamma = numericArray[2]; // The third numerical component from the input

  let finalCalculation; // Declare a variable to hold the ultimate result of the computation

  // Evaluate a specific condition involving the three components.
  // This conditional logic determines which calculation path to execute.
  if (gamma <= alpha + beta) {
    // Path 1: If the condition is satisfied, perform a straightforward summation.
    finalCalculation = gamma + beta;
  } else {
    // Path 2: If the condition is not met, execute a more intricate calculation.
    // This particular formula involves a sequence of subtraction and addition operations.
    finalCalculation = (gamma + beta) - (gamma - beta - alpha) + 1;
  }

  // Display the computed numerical result to the standard output stream.
  console.log(finalCalculation);
}; // End of the primary data processing function definition

// Initiate the entire processing sequence by reading data from the standard input stream.
// The incoming data is anticipated to be encoded using UTF-8.
computeOutcome( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );