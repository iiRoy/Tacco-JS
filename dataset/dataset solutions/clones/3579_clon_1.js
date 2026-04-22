var p = require( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ; // Read the entire file content as a string.

// Process the input string: split by newline and convert each part to a number.
p = p . split ( "\n" ) . map ( a => +a ) ;


// Execute the main logic and print the result to the console.
console . log ( main ( ) ) ;


/**
 * This is the core function that implements the problem's logic.
 * It iterates through the processed input array 'p' and applies
 * a series of checks to determine if a specific pattern holds.
 *
 * @returns {string} Returns "Yes" if all conditions are met, otherwise "No".
 */
function main ( ) {

  var N = "No" ; // Constant string for negative outcome.

  var n = p[0] ; // The first element of 'p' is interpreted as the count 'n'.

  var a = { } ; // An object used as a hash map or set for tracking visited/processed values.

  // The primary loop iterates from 1 up to 'n' (inclusive).
  for ( i = 1 ; i <= n ; i++ ) {

    // First validation check: bitwise operation on p[i] and i.
    // If the least significant bit of (p[i] XOR i) is 1, return "No".
    if ( ( p[i] ^ i ) & 1 ) {
      return N ;
    }

    // Initialize two temporary variables 'u' and 'v' for internal loop logic.
    var u = p[i] ,
        v = i ;

    // Nested loop: continues as long as 'i' is strictly less than 'u'.
    while ( i < u ) {

      i++ ; // Increment 'i' before the next check.

      // Second validation check: p[i] must be equal to 'i'.
      if ( p[i] !== i ) {
        return N ;
      }

      i++ ; // Increment 'i' again for the subsequent check.

      // Third validation check: another bitwise operation.
      // Similar to the first check, ensures a specific parity.
      if ( ( p[i] ^ i ) & 1 ) {
        return N ;
      }

      // Conditional branching based on the relationship between 'u' and p[i].
      if ( u < p[i] ) {
        u = p[i] ; // Update 'u' to the new value.
        a[u] = 1 ; // Mark this new 'u' value in the 'a' object.
      }
      else if ( v === p[i] ) {
        // If 'v' matches p[i], enter a do-while loop.
        do {
          v += 2 ; // Increment 'v' by 2.
        } while ( a[v] ) // Continue looping as long as 'v' is a key in 'a'.
      }
      else {
        // If neither of the above conditions are met, the sequence is invalid.
        return N ;
      }

    } // End of the inner 'while' loop.

  } // End of the outer 'for' loop.

  // If the program reaches this point, all conditions were satisfied.
  return "Yes" ;

} // End of the 'main' function definition.