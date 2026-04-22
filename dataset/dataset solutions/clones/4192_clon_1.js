'use strict' // Enforces strict parsing and error handling in the script.

/*
 * This program takes a string of digits as input,
 * calculates the sum of its individual digits,
 * and then determines if the number represented by the input string
 * is perfectly divisible by the sum of its digits.
 * It outputs 'Yes' or 'No' accordingly.
 */
function main( input )
{
  // First, calculate the sum of the digits present in the input string.
  const sum = input
    .split( '' )         // Step 1: Convert the input string into an array of individual character digits.
    .map( v => ~~v )     // Step 2: Convert each character digit (e.g., '5') into its numeric equivalent (5).
                         //         The `~~` operator is a concise way to perform a floor operation on a number,
                         //         effectively converting string representations of numbers to actual numbers.
    .reduce( ( a, b ) => a + b ) // Step 3: Sum all the numeric digits in the array. 'a' is the accumulator, 'b' is the current value.
  ; // End of sum calculation.

  // Next, determine if the original number (parsed from the input string)
  // is divisible by the calculated sum of its digits.
  const ans = Number( input ) % sum === 0 // Check if the remainder of the division is zero.
    ? 'Yes'                              // If the remainder is zero, it means it's divisible.
    : 'No'                               // Otherwise, it's not divisible.
  ; // End of answer determination.

  // Finally, print the result to the console.
  console.log( ans )
  ; // End of console output.
} // End of the main function definition.

// This line reads the input from standard input and passes it to the main function.
// It uses Node.js's 'fs' module to read the file specified by '/dev/stdin'.
main( require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) )
; // End of program execution.