'use strict'; // This directive enforces strict mode parsing and execution in JavaScript.


console.log ( function ( args ) { /* This is the primary anonymous function, designed to
                                   * process input arguments and compute a result.
                                   */

  // Declare a constant 'N' by trimming the 'args' string and converting it to an integer.
  const N = args . trim ( ) | 0 ;

  // Initialize a dynamic programming array 'dp' of size N+1.
  // All elements are initially set to 'Infinity', indicating an uncomputed or unreachable state.
  const dp = Array ( N + 1 ) . fill ( Infinity ) ;

  // The base case: it takes 0 operations to reach the number 0.
  dp [ 0 ] = 0 ;


  // Begin the main loop, iterating from i = 0 up to N - 1.
  for ( let i = 0 ;   i < N ;   i ++   )   {

    /*
     * Check if reaching the number (i + 1) from 'i'
     * requires fewer operations than the current best known way to reach (i + 1).
     * This step represents adding 1.
     */
    if ( dp [ i ] < dp [ i + 1 ] )
    {
      dp [ i + 1 ] = dp [ i ] + 1 ;
    }


    // Second inner loop: Consider adding powers of 6 (6, 36, 216, etc.) to 'i'.
    for ( let j = 6 ;   i + j <= N ;   j *= 6   )   {

      // If reaching (i + j) from 'i' is more efficient, update dp[i+j].
      if ( dp [ i ] < dp [ i + j ] ) {
        dp [ i + j ] = dp [ i ] + 1 ;
      }

    }


    // Third inner loop: Consider adding powers of 9 (9, 81, 729, etc.) to 'i'.
    for ( let j = 9 ;   i + j <= N ;   j *= 9   )   {

      // If reaching (i + j) from 'i' is more efficient, update dp[i+j].
      if ( dp [ i ] < dp [ i + j ] )
      {
        dp [ i + j ] = dp [ i ] + 1 ;
      }

    }

  }

  // After filling the dp array, return the minimum operations for N, converted to a string.
  return dp [ N ] . toString ( ) ;

} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // Immediately invoke the anonymous function with input read from standard input.