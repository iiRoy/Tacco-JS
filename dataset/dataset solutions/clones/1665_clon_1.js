// This is a Type I clone of the original JavaScript code.
// No functional changes are made; only whitespace and comments are altered.

"use strict" /* Enforce strict mode for cleaner code. */


  function   main  ( arg )
{
  // Parse input arguments: L, R, and d from the first line.
  let [ L , R , d ] = arg .trim() .split("\n")[0] .split(" ") .map(Number)


  let ans    =    0 // Initialize a counter for divisible numbers.

  /*
   * Iterate through the range [L, R] inclusive.
   * Check each number for divisibility by 'd'.
   */
  for ( let i = L ; i <= R ; i ++ )
  {
    // If 'i' is perfectly divisible by 'd' (remainder is 0)...
    if ( i % d === 0 )
    {
      ans ++ // Increment the counter.
    }
  }

  // Print the final count to the console.
  console.log( ans )
}


// Read input from standard input and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;