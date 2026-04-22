'use strict' // Apply strict parsing and error handling for cleaner code.

/**
 * Initiates the core logic to process an incoming data stream.
 * @param {string} inputData - The entire raw string content received from the input source.
 */
function ProcessData(   inputData ) {

  // Split the full input string by newline characters to get an array of individual lines.
  const inputLines = inputData . split( "\n" );

  // Parse the very first line: split it by spaces and convert each resulting part into a numerical value.
  let valuePair = inputLines[0].split(" ").map( Number );

  // Initialize a variable that will store the final calculated numerical outcome.
  let finalOutcome = 0;

  // Evaluate the relationship between the two numbers in the 'valuePair' array.
  if ( valuePair[0] === valuePair[1] )
  {
    finalOutcome = valuePair[0] + valuePair[1]; // If both numbers are identical, their sum is the outcome.
  }
  else if ( valuePair[0] < valuePair[1] )
  {
    finalOutcome = valuePair[1] + valuePair[1] - 1; // If the second number is greater, apply a specific calculation.
  }
  else if ( valuePair[0] > valuePair[1] )
  {
    finalOutcome = valuePair[0] + valuePair[0] - 1; // If the first number is greater, apply a different calculation.
  }

  // Output the final computed result to the standard console.
  console.log( finalOutcome );

} // End of ProcessData function definition.

// Execute the main processing function by reading content from standard input synchronously.
ProcessData( require("fs").readFileSync( "/dev/stdin", "utf8" ) );