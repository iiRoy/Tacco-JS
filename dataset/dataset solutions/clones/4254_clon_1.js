/* This file enforces strict mode for better code quality. */
'use strict'



// This is the primary function responsible for the application's logic.
// It calculates the largest perfect square less than or equal to a given number 's'.
function main ( s )
{

  // Convert the input string 's' into a numerical value.
  const   n   =   Number ( s ) ;


  // Initialize 'max' to store the current maximum perfect square found.
  let max = 0 ;
  // Initialize 'i' as the base for squaring.
  let i = 0 ;


  /*
   * This loop iteratively finds the smallest integer 'i'
   * such that i*i (i squared) is greater than or equal to 'n'.
   */
  while  ( max  <  n )
  {
    // Increment the counter 'i' by one in each iteration.
    i  +=  1 ;
    // Calculate the square of the current 'i' and update 'max'.
    max = Math.pow( i , 2 ) ;
  }


  // After the loop, 'i' will be the first integer whose square is >= n.
  // We need the square of (i-1) to get the largest perfect square strictly less than 'n'.
  // Or, if n itself is a perfect square, it will be the largest perfect square less than or equal to n.
  const   ans   =   Math . pow ( i   -   1 ,   2 ) ;


  // Output the calculated answer to the console.
  console . log ( ans ) ;
}


// --- Program Execution Start ---
// Read input from standard input, decode it as UTF-8, and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;
// --- Program Execution End ---