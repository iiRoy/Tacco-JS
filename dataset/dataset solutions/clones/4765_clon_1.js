/*
 * This JavaScript program calculates a specific value based on the prime factorization
 * of numbers up to N. Specifically, it computes the product of (exponent + 1) for
 * each prime factor found in the prime factorization of N!, modulo a large prime.
 *
 * This is a common technique used in combinatorics and number theory problems
 * to find the number of divisors of N factorial.
 */
function main( input ) { // Defines the main function that processes the input.

  // Parse the input string into an integer N.
  var n = parseInt( input ) ;


  // 'map' will store the cumulative counts of each prime factor
  // encountered across all numbers from 2 to N.
  var map = { } ;

  // Loop through each number from 2 up to N (inclusive).
  for ( var i = 2 ; i <= n ; i++ ) {

    // 't' is a temporary variable, initialized with the current number 'i'.
    // It will be modified as we extract its prime factors.
    var t = i ;

    // Inner loop to find prime factors of 't'.
    // We only need to check for factors up to the square root of 't'.
    for ( var j = 2 ; j * j <= t ; j++ ) {

      // Check if 'j' is a prime factor of 't'.
      if ( t % j == 0 ) {

        // 'cnt' will store the exponent of prime factor 'j' for the current number 't'.
        var cnt = 0 ;

        // Continuously divide 't' by 'j' as long as 'j' is a factor.
        while ( t % j == 0 ) {
          cnt++ ; // Increment the count of factor 'j'.
          t /= j ; // Reduce 't' by dividing it by 'j'.
        }

        // Update the global 'map' with the count of prime factor 'j'.
        if ( map[ j ] ) {
          // If 'j' already exists in the map, add the new count to its total.
          map[ j ] = map[ j ] + cnt ;
        } else {
          // If 'j' is a new prime factor, initialize its count in the map.
          map[ j ] = cnt ;
        }
      }
    }

    // After the inner loop, if 't' is not 1, it means the remaining 't' is a prime factor
    // itself (and it's greater than sqrt of the original 'i').
    if ( t != 1 ) {
      // Update the map for this remaining prime factor.
      if ( map[ t ] ) {
        // Increment its count if it already exists.
        map[ t ]++ ;
      } else {
        // Initialize its count to 1 if it's a new prime factor.
        map[ t ] = 1 ;
      }
    }
  }


  // Initialize 'ans' to 1. This variable will store the final computed answer.
  var ans = 1 ;

  // Define the modulo value. This is a common large prime used in competitive programming.
  var mod = 1000000007 ;

  // Iterate through each unique prime factor 'x' stored as a key in the 'map'.
  for ( var x in map ) {
    // The problem asks for the product of (exponent + 1) for each prime factor.
    // We apply the modulo operation at each step to prevent integer overflow.
    ans = ( ans * ( map[ x ] + 1 ) ) % mod ;
  }


  // Print the final calculated answer to the standard output.
  console.log( ans ) ;
}

// This line reads the input from standard input (typically /dev/stdin in Unix-like systems)
// and passes it as a UTF-8 string to the 'main' function.
main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;