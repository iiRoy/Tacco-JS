/* This script provides a solution for a problem that involves
 * sequence generation with modular arithmetic and cycle detection.
 * It calculates the sum of elements in a sequence up to a certain point N,
 * efficiently handling repeating patterns (cycles).
 */
function Main ( input ) {
  // The input string is first prepared:
  // 1. Trim leading/trailing whitespace.
  // 2. Split into lines based on newline characters.
  // 3. Each line is then split by spaces to form an array of string arrays.
  input = input . trim ( ) . split ( "\n" ) . map ( function ( x ) { return x . split ( " " ) } ) ;


  // Extract the numerical parameters from the first line of the processed input.
  let N = parseInt ( input [ 0 ] [ 0 ] , 10 ) ; // N: The target number of sequence terms to consider.
  let X = parseInt ( input [ 0 ] [ 1 ] , 10 ) ; // X: The initial term (A_1) of the sequence.
  let M = parseInt ( input [ 0 ] [ 2 ] , 10 ) ; // M: The modulus for all arithmetic operations (A_k = (A_{k-1})^2 mod M).

  // 'v_amari' is an array used for cycle detection.
  // It stores the step number (index 'i') at which a remainder 'j' (index 'j') was first encountered.
  // Initialized to all zeros, meaning no remainder has been seen yet.
  let v_amari = Array . from ( { length : M } , ( ) => 0 ) ;

  // 'tmp' holds the current value in the sequence, starting with X.
  let tmp = X ;

  // 'ans' accumulates the sum of sequence elements.
  let ans = 0 ;

  // 'sum_syuki' will store the sum of elements within a detected cycle, if any.
  let sum_syuki = 0 ;


  // Mark the initial value 'X' as seen at step 1.
  v_amari [ tmp ] = 1 ;

  // Begin generating the sequence from the second term (i = 2) up to N.
  for ( let i = 2 ; i <= N ; i ++ ) {

    // Calculate the next term: (current_term ^ 2) mod M.
    // Note: The inner 'mod' call ensures 'tmp' is within [0, M-1] before squaring.
    tmp = mod ( Math . pow ( mod ( tmp , M ) , 2 ) , M ) ;


    // Check if the current 'tmp' (remainder) has been encountered before.
    if ( v_amari [ tmp ] === 0 ) {
      // If it's a new remainder, record the current step 'i' as its first occurrence.
      v_amari [ tmp ] = i ;
    } else {
      // A cycle has been detected!
      // The value 'tmp' was first seen at step 'v_amari[tmp]'.
      // The cycle's length (period) is 'i - v_amari[tmp]'.
      let syuki = i - v_amari [ tmp ] ;

      // Calculate the sum of all unique elements that are part of this detected cycle.
      // These are elements whose first appearance index is at or after the cycle's start.
      for ( let j = 0 ; j < M ; j ++ ) {
        if ( v_amari [ j ] >= v_amari [ tmp ] ) {
          sum_syuki += j ; // Add the remainder 'j' to the cycle sum.
        }
      }

      // Add the contribution of full cycles to the total answer.
      // Determine how many complete cycles can fit into the remaining steps.
      ans += Math . floor ( ( N - v_amari [ tmp ] + 1 ) / syuki ) * sum_syuki ;

      // Adjust 'N' to represent the total number of steps to consider *before* the cycle repeats fully.
      // This effectively reduces 'N' to account for steps covered by full cycles,
      // leaving only the initial non-cyclic part and a partial cycle.
      N = ( N - v_amari [ tmp ] + 1 ) % syuki + v_amari [ tmp ] - 1 ;

      // After a cycle is handled and N is adjusted, the loop can continue naturally.
      // The condition 'i <= N' will eventually become false, terminating the loop.
      // The remaining elements up to the new N will be summed in the final loop.
    }
  }


  // After the main sequence generation loop (which might have detected a cycle and adjusted N),
  // iterate through all possible remainders from 0 to M-1.
  // Add any remainder 'i' to the total answer if it was encountered within the
  // (possibly adjusted) range of N steps and is a valid term (v_amari[i] > 0).
  for ( let i = 0 ; i < M ; i ++ ) {
    if ( v_amari [ i ] > 0 && v_amari [ i ] <= N ) {
      ans += i ; // Accumulate the value of the remainder itself.
    }
  }

  // Output the final calculated sum to the console.
  console . log ( ans ) ;

} // End of Main function definition.


/*
 * This is a utility function to compute the mathematical modulo.
 * JavaScript's built-in '%' operator can return a negative result
 * if the dividend 'i' is negative. This function ensures the result
 * is always non-negative, specifically in the range [0, j-1]
 * (assuming j is positive).
 *
 * Parameters:
 *   i: The number (dividend).
 *   j: The modulus (divisor).
 *
 * Returns:
 *   A non-negative integer representing 'i mod j'.
 */
function mod ( i , j ) {
  // Check if the standard JS modulo operation results in a negative value.
  // If it does, add 'j' (or its absolute value if j could be negative, though here it's expected positive)
  // to bring it into the positive range.
  // The `+ 0` parts are included to maintain exact Type I clone identity with the original code.
  return ( i % j ) < 0 ? ( i % j ) + 0 + ( j < 0 ? -j : j ) : ( i % j + 0 ) ;
}


// This is the entry point for executing the script.
// It reads the entire content of standard input (typically from a file or pipe),
// decodes it as UTF-8, and then passes the resulting string to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;