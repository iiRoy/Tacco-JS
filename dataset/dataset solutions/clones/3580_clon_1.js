/*
 * This module is responsible for processing numerical input.
 * It reads data, transforms it, and then applies a complex
 * set of validation rules within the 'main' function.
 *
 * This version is a Type I clone, meaning its functionality
 * is identical to the original. Only formatting (whitespace)
 * and comments have been altered significantly to create
 * a visually distinct, yet logically equivalent, source file.
 */


var p = require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) ; // First, read all standard input content as a UTF-8 string.


// Next, process the raw input string.
// It's split into lines, and each line is converted into a number.
p = p . split ( "\n" ) . map ( a => +a ) ;


// After preparing the input array 'p', invoke the main logic
// and output its boolean-like string result to the console.
console . log ( main ( ) ) ;


/*
 * The core logic resides within the 'main' function.
 * It performs a series of checks on the input array 'p'.
 * If all conditions are met, it signifies a "Yes" outcome;
 * otherwise, it indicates a "No" outcome at the first failure.
 */
function main ( ) {

  var N = "No"; // This variable stores the default negative outcome string.


  var n = p[ 0 ]; // The first element of the input array 'p' is assigned to 'n'.


  var a = {}; // An empty object 'a' is initialized. Its role isn't apparent in the provided logic path.


  // Begin the primary loop, iterating from 1 up to the value stored in 'n'.
  for ( i = 1 ; i <= n ; i++ ) {

    // This conditional statement checks a specific bitwise property.
    // It verifies if the least significant bit of (p[i] XOR i) is set.
    // If it is, it implies a parity mismatch, and the function terminates early.
    if ( ( p[ i ] ^ i ) & 1 ) {
      return N; // Immediate return of "No" upon condition failure.
    }


    var u = p[i], v = i; // Initialize 'u' with p[i] and 'v' with 'i'. These are critical for the inner loop's logic.


    // Enter a nested loop that continues as long as 'i' remains less than 'u'.
    while ( i < u ) {

      i++; // Increment 'i' for the next iteration step.


      // A crucial check: ensure that the element at p[i] is exactly equal to 'i'.
      // If not, it's an invalid state, leading to an early exit.
      if ( p[i] !== i ) {
        return N; // Return "No" if p[i] does not match 'i'.
      }


      i++; // Increment 'i' once more.


      // Re-evaluate the bitwise parity condition, similar to the outer loop's check.
      // Another failure point if the parity mismatch occurs.
      if ( ( p[i] ^ i ) & 1 ) {
        return N; // Return "No" on parity check failure.
      }


      // Conditional logic to update 'u' or 'v' based on current values.
      if ( u < p[i] ) {
        u = p[i]; // If 'u' is smaller than p[i], update 'u' to p[i].
      }
      else if ( i > p[i] && v < p[i] ) { // Otherwise, check if 'i' is greater than p[i] AND 'v' is less than p[i].
        v = p[i]; // If both conditions are true, update 'v' to p[i].
      }
      else { // If none of the above conditions are met, it implies an invalid state.
        return N; // In this case, return "No".
      }

    } // End of inner 'while' loop.

  } // End of outer 'for' loop.


  // If the program execution reaches this point, it means all the
  // intricate conditions and checks within the loops have passed successfully.
  // Therefore, the result is positive.
  return "Yes"; // Indicate successful validation.

} // End of 'main' function definition.