'use strict' ; //  Enabling strict mode for better error handling and cleaner code.

/*
 * This is an Immediately Invoked Function Expression (IIFE).
 * It ensures that all variables defined within it are scoped locally,
 * preventing pollution of the global namespace.
 */
( function ( input )
{

  // The raw input string is first processed.
  // We remove any leading/trailing whitespace using .trim(),
  // and then split the string into an array of lines based on newline characters.
  input = input . trim() . split( /\n/ ) ;


  /*
   * The first element of the input array (input[0])
   * represents the value of N.
   * The '- 0' is a common idiom in JavaScript to
   * explicitly convert a string to a number.
   */
  const   N   =   input[0]   -   0   ;


  // The second element (input[1]) contains a space-separated list of numbers.
  // We split this string by one or more whitespace characters (/\s+/)
  // and then use .map() to convert each resulting string into a number.
  const   p   =   input[1] . split( /\s+/ ) . map( x => x - 0 ) ;


  /*
   * Initialize a 2D array named 'dp' for dynamic programming.
   * It will have (N + 3) rows.
   * Each row 'i' will contain 'i + 1' columns, initialized to 0.
   * This setup is typical for problems requiring triangular DP tables.
   */
  const   dp   =   new   Array( N + 3 )
                      . fill( 0 )
                      . map( ( x , i ) => new Array( i + 1 ) . fill( 0 ) ) ;


  // Set the initial base case for our dynamic programming problem.
  // This specific cell is assigned a value of 1.
  dp[2][1] = 1 ;


  // Begin the main dynamic programming loop.
  // The outer loop iterates from 'i = 3' up to 'N + 2'.
  for ( let i = 3 ; i <= N + 2 ; i++ )
  {
    // The inner loop iterates for 'j' from '1' up to 'i - 1'.
    // This defines the valid range for the current row's columns.
    for ( let j = 1 ; j <= i - 1 ; j++ )
    {
      // This is the core recurrence relation for the DP solution.
      // It calculates the probability dp[i][j] based on previous states
      // and the probability 'p[i-3]'.
      dp[i][j] = p[i - 3] * dp[i - 1][j - 1] + ( 1 - p[i - 3] ) * dp[i - 1][j] ;
    } // End of the inner 'j' loop.
  } // End of the outer 'i' loop.


  // Declare a variable 'ans' to store the final computed answer.
  // It is initialized to zero before summation.
  var   ans   =   0   ;


  // Iterate through a specific range of 'j' values in the last computed row of 'dp'.
  // Sum up the probabilities from these cells to get the final answer.
  for ( let j = ( N + 3 ) / 2 ; j <= N + 1 ; j++ )
  {
    ans += dp[N + 2][j] ; // Accumulate the value from dp[N+2][j] into 'ans'.
  } // End of summation loop.


  // Output the final calculated answer to the console.
  console . log( ans ) ;


} ) ( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ; // The IIFE is invoked here, reading input from stdin.