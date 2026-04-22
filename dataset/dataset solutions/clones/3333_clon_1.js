'use strict'
; // Enable strict mode for better error handling and cleaner code.

( function ( input ) // Define an Immediately Invoked Function Expression (IIFE) that takes 'input' as an argument.
 {
  // First, process the raw input string:
  // 1. Remove leading/trailing whitespace using .trim().
  // 2. Split the string into an array of substrings using any sequence of whitespace as a delimiter.
  // 3. Map each substring to a number by subtracting 0 (a common JavaScript trick for type conversion).
  input = input . trim ( ) . split ( / \s + / ) . map ( x => x - 0 ) ;

  // Extract the first element from the processed input array.
  // This element represents 'N', the total number of items or size.
  const   N   =   input . shift ( ) ;

  // The remaining elements in the 'input' array are now assigned to 'A'.
  // 'A' will be the primary data array for computations.
  const   A   =   input ;

  // Initialize a sentinel value at array index -1.
  // This is a common technique in dynamic programming or array-based problems
  // to avoid out-of-bounds checks or simplify base cases.
  A [ -1 ]   =   0 ;

  // Declare and initialize a 2D array named 'dp' for dynamic programming.
  // The dimensions are (N+1) x (variable, up to N+1-i).
  // It's filled with zeros initially.
  const   dp = new Array ( N + 1 ) . fill ( 0 ) . map ( ( x , i ) => new Array ( N + 1 - i ) . fill ( 0 ) ) ;

  /*
   * The 'dp' table will store the maximum X-Y value for subsegments.
   * 'dp[i][j]' represents the value for a segment of length 'i' starting at index 'j'.
   * The problem asks for the maximum X-Y value for the entire sequence,
   * which will eventually be stored in 'dp[N][0]'.
   */

  // Begin the iteration to fill the dynamic programming table.
  // The outer loop iterates through possible lengths of subsegments, from 1 to N.
  for ( let   i = 1 ;   i <= N ;   i ++ )
  { // Start of the outer loop's block.
    // The inner loop iterates through all possible starting indices 'j' for a segment of length 'i'.
    // 'j' ranges from 0 up to 'N - i' to ensure the segment fits within array 'A'.
    for ( let   j = 0 ;   j <= N - i ;   j ++ )
    { // Start of the inner loop's block.
      // Compute 'dp[i][j]' by taking the maximum of two choices:
      // 1. Consider taking the last element of the current segment: A[i + j - 1].
      //    Subtract the result of the subproblem for the remaining (i-1) segment starting at 'j'.
      // 2. Consider taking the first element of the current segment: A[j].
      //    Subtract the result of the subproblem for the remaining (i-1) segment starting at 'j+1'.
      dp [ i ] [ j ]   =   Math . max ( A [ i + j - 1 ]   -   dp [ i - 1 ] [ j ] ,   A [ j ]   -   dp [ i - 1 ] [ j + 1 ] ) ;
    } // End of the inner loop's block.
  } // End of the outer loop's block.

  // After filling the entire 'dp' table, the final answer is located at 'dp[N][0]'.
  // This represents the maximum X-Y value for the full array of length 'N' starting at index 0.
  const   ans   =   dp [ N ] [ 0 ] ;

  // Output the calculated answer to the standard console.
  console . log ( ans ) ;

 } ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // The IIFE is immediately invoked with input read from stdin.