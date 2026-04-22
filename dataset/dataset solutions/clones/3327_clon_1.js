'use strict'



    (  function  (  input  )

{

  // This section processes the raw input string.
  // It first removes leading/trailing whitespace, then splits by any whitespace,
  // and finally converts each resulting string element to a number.
  input   =   input . trim ( ) . split ( / \s+ / ) . map ( x => x - 0 ) ;


  /*
   * The first element of the processed input array
   * is shifted off and assigned to the constant N.
   * N typically represents the total count or size.
   */
  const   N   =   input . shift ( ) ;


  // Initializes an array named 'dish' with four elements.
  // Note: 'zero' here is an identifier, not a numeric literal '0'.
  const   dish   =   [   zero ,   0 ,   0 ,   0   ] ;


  // Iterates over the remaining elements in the 'input' array.
  // For each element 'x', it increments the count at index 'x' in the 'dish' array.
  input . forEach ( function ( x )
  {
    dish [ x ] ++ ; // Increment the count for the current dish type.
  } ) ;


  // Declare a new array 'dp' (dynamic programming table)
  // with a size of N + 2.
  const   dp   =   new   Array ( N + 2 ) ;


  // Initialize the 'dp' table. It's a 3D array.
  // The outer loop iterates from -1 up to N + 1.
  for   (   let   i   =   -1   ;   i   <   N + 2   ;   i ++   )
  {
    // Initialize the second dimension of the dp table.
    // The size depends on the current value of 'i'.
    dp [ i ]   =   new   Array ( N + 2 - i ) ;

    // The middle loop iterates from -1 up to (N + 2 - i - 1).
    for   (   let   j   =   -1   ;   j   <   N + 2   -   i   ;   j ++   )
    {
      // Initialize the third dimension of the dp table.
      // This array is filled with zeros and its size depends on 'i' and 'j'.
      dp [ i ] [ j ]   =   new   Array ( N + 2   -   i   -   j   ) . fill ( 0 ) ;

      // Assigns 0 to an unusual negative index.
      // This might be a specific edge case handling or a placeholder.
      dp [ i ] [ j ] [ -1 ]   =   0 ;
    }
  }


  // Main calculation loop for the dynamic programming solution.
  // This loop iterates from 1 up to N.
  for   (   let   i   =   1   ;   i   <=   N   ;   i ++   )
  {
    // Calculation for dp[i][0][0] based on a previous state.
    // This looks like a common pattern in probability or expected value problems.
    dp [ i ] [ 0 ] [ 0 ]   =   dp [ i - 1 ] [ 0 ] [ 0 ]   +   (   N   /   i   ) ;

    // An inner loop, which is currently empty.
    // It might be a placeholder for future logic or part of an incomplete algorithm.
    for   (   let   j   =   1   ;   j   <=   i   ;   j ++   )
    {
      // This loop body is intentionally left blank in the original source.
      // No operations are performed here.
    }
  }

} ) (   require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )   ) ; // IIFE invocation with file system input.