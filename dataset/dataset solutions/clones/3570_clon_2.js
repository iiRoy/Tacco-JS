// This script calculates a specialized cubic sum based on two input integers.
'use strict';

/*
 * The core function to perform the calculation.
 * It takes raw string data, parses it, and then applies specific mathematical operations.
 * @param {string} incomingTextData - The raw text input string, expected to contain two numbers separated by a space.
 */
function  computeCubes ( incomingTextData )
{
  // First step: preprocess the input string.
  // Remove any leading/trailing whitespace and then split the string into an array of number strings.
  let   processedSegments  = incomingTextData . trim() . split(' ');

  // Extract the numerical values from the processed segments.
  // The '- 0' trick is used for explicit string-to-number conversion.
  const   primaryNumber  = processedSegments [0] - 0; // Represents 'N' from the original problem context.
  const   divisorFactor  = processedSegments [1] - 0; // Represents 'K' from the original problem context.

  // Initialize the accumulator for the final result.
  // Calculate the first term: (floor(N / K))^3
  let   totalSumOfCubes  = Math . pow ( Math . floor ( primaryNumber / divisorFactor ), 3 );

  // Conditional addition: if K is an even number, calculate and add a second term.
  // The second term is: (floor((N + K/2) / K))^3
  if ( divisorFactor % 2  ===  0 )
  {
    totalSumOfCubes += Math . pow ( Math . floor ( ( primaryNumber + divisorFactor / 2 ) / divisorFactor ), 3 );
  }

  // Output the final calculated value to the console.
  console . log ( totalSumOfCubes );
}

// Entry point of the script.
// Read all data from standard input as a UTF-8 string.
const   systemInputData  = require('fs') . readFileSync ( '/dev/stdin', 'utf8' );

// Invoke the main calculation function with the obtained input.
computeCubes ( systemInputData );