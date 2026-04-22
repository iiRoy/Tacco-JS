/*
 * This is a Type I clone of a JavaScript program.
 * It processes input to calculate a specific maximum value.
 * The original logic and structure are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 */
function  main ( input )
{
  // Split the entire input string into individual lines.
  const  lines  =  input.split('\n') ;


  /*
   * The first line of input is expected to contain three space-separated integers: N, Z, and W.
   * We extract this line, split it by spaces, and then convert each part to an integer.
   * The result is stored in the `NZW` array.
   */
  const  NZW  =  lines.shift().split(' ').map( x  =>  parseInt(x) ) ;

  // Extract the individual values N, Z, and W from the parsed `NZW` array.
  // N represents the number of elements in array A.
  const  N  =  NZW[0] ;
  const  Z  =  NZW[1] ;
  const  W  =  NZW[2] ;

  // The second line of input contains a sequence of integers that form array A.
  // We extract this line, split it by spaces, and convert each part to an integer.
  const  A  =  lines.shift().split(' ').map( x  =>  parseInt(x) ) ;

  // --- Core Calculation Logic for determining the maximum value ---
  // The problem asks us to consider three different scenarios to find the maximum possible score.
  // The original problem statement indicates comparisons related to:
  // 1. The initial state (Z vs W).
  // 2. A state involving the (N-1)-th element (A[N-1] vs A[N-2]).
  // 3. A state involving the N-th element (A[N-1] vs W).

  /*
   * Scenario 1: Calculate the absolute difference between Z and W.
   * This represents an initial or base score.
   */
  const  initial  =  Math.abs( Z - W ) ;


  // Scenario 2: Calculate the absolute difference between the last element (A[N-1])
  // and the second-to-last element (A[N-2]) of array A.
  // This assumes N >= 2 for A[N-2] to be valid.
  const  fetch_n_1  =  Math.abs( A[N-1]  -  A[N-2] ) ;


  // Scenario 3: Calculate the absolute difference between the last element (A[N-1])
  // of array A and the value W.
  const  fetch_n  =  Math.abs( A[N-1] - W ) ;

  // Finally, determine the maximum value among these three calculated scores.
  const  result  =  Math.max( initial,  fetch_n_1,  fetch_n ) ;

  // Output the computed maximum result to the console.
  console.log( result ) ;

} // End of the main function definition


// This block handles the input reading and function invocation.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// and passes it to the `main` function for processing.
main( require('fs').readFileSync( '/dev/stdin' ,  'utf8' ) ) ;