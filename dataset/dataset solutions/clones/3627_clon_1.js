/*
 * This JavaScript file contains a core algorithm designed to find a specific
 * numerical representation based on a given input. It involves iterating
 * through a range of numbers and performing conversions to binary,
 * then evaluating a custom base-2-like sum.
 */

function   main ( arg ) {
  // First, process the raw input argument.
  // It's expected to be a string, potentially containing multiple lines.
  arg = arg . split ( "\n" ) ;


  // Convert the first element of the split array to an integer.
  // The radix '10' is explicitly specified for base-10 parsing.
  arg = parseInt ( arg [ 0 ] , 10 ) ;


  // Initialize necessary variables for the computation.
  var result = 0 ; // This variable will store the binary string of the found number.
  var i      = 0 ; // Loop counter for the main iteration.

  // Begin the primary loop. It iterates through numbers up to 10^9.
  // This loop searches for the integer 'i' that satisfies the condition.
  for ( i = 0 ; i < Math.pow ( 10 , 9 ) ; i++ ) {

    // Convert the current integer 'i' into its binary string representation.
    var num2 = i . toString ( 2 ) ;

    // Initialize a temporary variable to accumulate the custom base-2 sum.
    var tmp = 0 ;

    // Iterate through each character (digit) of the binary string.
    // The index 'j' represents the power for the base -2 calculation.
    for ( var j = 0 ; j < num2 . length ; j++ ) {
      // If the current digit is '0', it does not contribute to the sum.
      if ( num2 [ j ] === '0' ) {
        continue ; // Skip to the next digit.
      }
      // If the digit is '1', add (-2)^j to the temporary sum.
      // The `Math.pow` function handles the exponentiation.
      tmp += Math.pow ( -2 , j ) ;
    }

    // After calculating 'tmp' for the current 'num2', compare it with the target 'arg'.
    if ( tmp === arg ) {
      result = num2 ; // If they match, store the binary string.
      break ; // Exit the loop as the solution has been found.
    }
  }

  // Once the loop completes (either by breaking or finishing),
  // print the final result. The `num2` variable will hold the
  // binary string of the last `i` that matched `arg`.
  // The problem requires printing this binary string in reverse order.
  console . log ( num2 . split ( "" ) . reverse ( ) . join ( "" ) ) ;
}

// Invoke the main function.
// It reads input from standard input using Node.js's 'fs' module.
// The entire content of '/dev/stdin' is read as a UTF-8 string.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;