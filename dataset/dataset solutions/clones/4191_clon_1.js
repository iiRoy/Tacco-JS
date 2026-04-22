/*
 * This is a JavaScript program.
 * It processes a single integer input
 * and performs a specific calculation.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;


// --- Function Definition for Main ---
function Main( args )
{
  // Declare and initialize variables for the calculation.
  var N = parseInt( args , 10 ) ; // N will store the integer value of the input.
  var tmp = N ;                   // A temporary variable, initialized with N's value.
  var fx = 0 ;                    // fx will accumulate the sum of digits.

  // Loop to iterate through the digits of 'tmp'.
  // The loop continues as long as 'tmp' is truthy (non-zero).
  while ( tmp )
  {
    // Add the last digit of 'tmp' to 'fx'.
    // The modulo operator (%) extracts the last digit.
    fx += tmp % 10 ;

    // Divide 'tmp' by 10 to shift digits.
    // This operation changes 'tmp' and eventually leads to its termination.
    tmp /= 10 ;
  }

  // After the loop, 'fx' contains the sum of digits (potentially with floating point issues
  // due to the nature of JavaScript's division and modulo with floats if tmp was not floored).

  // Determine if N is perfectly divisible by fx.
  // The result is a boolean, which is then converted to 'Yes' or 'No' string.
  console.log( N % fx === 0 ? 'Yes' : 'No' ) ;
}

// End of script.