"use strict";

/* This program processes a string of numeric values,
 * performs a specific calculation, and outputs the result. */
const executeTask = ( inputStr ) => {
  // Parse the input string into an array of numbers.
  // Each segment separated by a space is converted to a numerical type.
  let numericSequence = inputStr .  split(" ") . map( currentSegment => Number(currentSegment) );

  // Determine the final value based on a calculation involving specific elements
  // from the numeric sequence. If the intermediate result is negative, it defaults to zero.
  let finalCalculatedValue = (
      numericSequence[2] + numericSequence[1] - numericSequence[0] >= 0
    )
    ? ( numericSequence[2] + numericSequence[1] - numericSequence[0] )
    : 0;

  // Print the derived outcome to the standard output.
  console.log( finalCalculatedValue );
};

// Initiate the primary function by reading content from standard input.
executeTask( require('fs') . readFileSync( '/dev/stdin', 'utf8' ) );