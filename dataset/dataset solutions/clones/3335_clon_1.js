'use strict'; // This directive enforces stricter parsing and error handling in the code.

( function ( input ) { // An immediately invoked function expression (IIFE) is used to encapsulate the code.

  // The input string is processed:
  // 1. .trim() removes leading/trailing whitespace.
  // 2. .split(/\s+/) splits the string into an array of substrings, using any sequence of whitespace as a delimiter.
  // 3. .map(x => x - 0) converts each substring in the array to a number.
  input = input . trim ( ) . split ( /\s+/ ) . map ( x => x - 0 ) ;

  // The first element of the numerical array is extracted and assigned to the constant N.
  const N = input . shift ( ) ;

  // The remaining elements of the array are assigned to the constant A.
  const A = input ;

  // A special boundary condition is set for array A at an unusual index.
  A [ -1 ] = 0 ;

  /*
   * A 2D array named 'dp' is initialized for dynamic programming.
   * It has N+1 rows.
   * Each inner array (row i) has N+1-i columns, all initialized to 0.
   */
  const dp = new Array ( N + 1 ) . fill ( 0 ) . map ( ( x , i ) => new Array ( N + 1 - i ) . fill ( 0 ) ) ;

  // Comment explaining the meaning of dp[i][j]:
  // dp[i][j] stores the maximum possible score (X - Y) for a subsequence of 'i' elements,
  // starting from the original array's index 'j'.
  // The final solution will be found at dp[N][0].

  // Outer loop iterates through possible lengths of subsequences, from 1 to N.
  for ( let i = 1 ; i <= N ; i ++ ) {

    // Inner loop iterates through possible starting indices for subsequences of length 'i'.
    // The starting index 'j' can range from 0 up to N-i to ensure a valid subsequence length.
    for ( let j = 0 ; j <= N - i ; j ++ ) {

      // The recurrence relation for dp[i][j] is calculated.
      // It takes the maximum of two options:
      // 1. Taking the element A[i+j-1] (the rightmost element of the current subsequence)
      //    and subtracting the result of the subproblem for the remaining i-1 elements starting at j.
      // 2. Taking the element A[j] (the leftmost element of the current subsequence)
      //    and subtracting the result of the subproblem for the remaining i-1 elements starting at j+1.
      dp [ i ] [ j ] = Math . max ( A [ i + j - 1 ] - dp [ i - 1 ] [ j ] , A [ j ] - dp [ i - 1 ] [ j + 1 ] ) ;

    } // End of the inner loop for starting index 'j'.
  } // End of the outer loop for subsequence length 'i'.

  // After filling the dp table, the final answer is located at dp[N][0].
  const ans = dp [ N ] [ 0 ] ;

  // console.log(dp); // This line is commented out in the original code, hence it remains commented here.

  // The calculated answer is printed to the standard output.
  console . log ( ans ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // The file content from '/dev/stdin' is read synchronously and passed as 'input'.