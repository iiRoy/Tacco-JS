'use strict' // This directive enables strict mode for the entire script, enforcing stricter parsing and error handling.

/*
 * sumCalc Function:
 * This utility function calculates the sum of elements within a specified range
 * [f, t] (inclusive) from an original array, using a precomputed prefix sum array.
 *
 * @param {number} f      - The starting index of the desired sum range.
 * @param {number} t      - The ending index of the desired sum range.
 * @param {number[]} prefix - The array containing prefix sums of the original array.
 * @returns {number}      - The sum of elements from index f to t.
 */
function sumCalc ( f, t, prefix )
{
  // If the starting index is 0, the sum from 0 to t is simply prefix[t].
  if ( f === 0 )
  {
    return prefix [ t ] ;
  }

  // Otherwise, the sum from f to t is prefix[t] - prefix[f-1].
  // This effectively subtracts the sum of elements before 'f' from the
  // total sum up to 't'.
  return prefix [ t ] - prefix [ f - 1 ] ;
}



/*
 * getPrefixSum Function:
 * This function computes and returns the prefix sum array for a given input array A.
 * The prefix sum at any index 'i' is the sum of all elements from A[0] to A[i].
 *
 * @param {number[]} A - The input array of numbers for which to compute prefix sums.
 * @returns {number[]}   - The computed prefix sum array.
 */
function getPrefixSum ( A )
{
  var prefix = new Array ( A.length ) ; // Initialize a new array to store prefix sums.

  prefix [ 0 ] = A [ 0 ] ; // The first element of the prefix sum array is simply the first element of A.

  // Iterate through the input array starting from the second element
  // to compute the cumulative sums.
  for ( var i = 1 ; i < A.length ; i ++ )
  {
    // Each prefix sum is the sum of the previous prefix sum and the current element of A.
    prefix [ i ] = prefix [ i - 1 ] + A [ i ] ;
  }

  return prefix ; // Return the fully populated prefix sum array.
}



/*
 * solve Function:
 * This is the main dynamic programming function that solves a problem,
 * typically related to optimal substructure, like matrix chain multiplication or
 * optimal binary search tree, where ranges are partitioned.
 *
 * @param {number} N - The size of the problem (e.g., number of elements).
 * @param {number[]} A - The input array containing values relevant to the problem.
 * @returns {number}   - The minimum cost or optimal value for the entire problem.
 */
function solve ( N, A )
{
  // Initialize a 2D DP array of size N x N.
  // Each dp[r][c] will store the minimum cost for the subproblem spanning from index 'r' to 'c'.
  var dp = new Array ( N ) . fill ( 0 ) . map ( e => new Array ( N ) . fill ( 0 ) ) ;

  // Precompute the prefix sums of array A. This allows O(1) retrieval of
  // the sum of any sub-array, which is crucial for efficiency.
  var prefix = getPrefixSum ( A ) ;

  var col = 1 ; // 'col' represents the length of the subproblem minus one (or the difference between c and r).
                // It iterates through the diagonals of the DP table.

  // Loop through different subproblem lengths.
  while ( col < N )
  {
    var c = col ; // 'c' is the current column index for the DP table.

    // Loop through the starting row index 'r' for the current subproblem length.
    for ( var r = 0 ; r < N ; r ++ )
    {
      // If the current column index 'c' goes out of bounds,
      // it means we've processed all valid subproblems for this diagonal.
      if ( c === N )
      {
        break ;
      }

      // Initialize dp[r][c] with a very large value (effectively infinity)
      // before finding the minimum possible cost for this subproblem.
      dp [ r ] [ c ] = Number . MAX_SAFE_INTEGER ;

      // Iterate through all possible split points 'k' within the range [r, c].
      // For each split point, we divide the problem into two smaller subproblems: [r, k] and [k+1, c].
      for ( var k = r ; k < c ; k ++ )
      {
        // Apply the dynamic programming recurrence relation.
        // The cost for dp[r][c] is the minimum of:
        // (cost of subproblem [r, k]) + (cost of subproblem [k+1, c]) + (cost of combining these two subproblems).
        // The combining cost here is the sum of elements in the range [r, k] plus the sum of elements in [k+1, c].
        dp [ r ] [ c ] = Math . min ( dp [ r ] [ c ], dp [ r ] [ k ] + dp [ k + 1 ] [ c ] + sumCalc ( r, k, prefix ) + sumCalc ( k + 1, c, prefix ) ) ;
      }

      c ++ ; // Move to the next column in the current diagonal.
    }

    col ++ ; // Move to the next diagonal, increasing the subproblem length.
  }

  // The final answer for the entire problem (from index 0 to N-1) is stored
  // in dp[0][N-1] after all subproblems have been solved.
  return dp [ 0 ] [ N - 1 ] ;
}



/*
 * main Function:
 * This is the entry point of the program. It handles reading input,
 * parsing it into the required data structures, calling the 'solve' function,
 * and then printing the result to the console.
 *
 * @param {string} input - The raw string input read from stdin.
 */
function main ( input )
{
  // Split the entire input string by newline characters to get an array of lines.
  var lines = input . split ( "\n" ) ;

  // Parse the first line to get the integer N.
  var N = parseInt ( lines [ 0 ] ) ;

  // Parse the second line: split by space, then map each string part to an integer,
  // creating the array A.
  var A = lines [ 1 ] . split ( ' ' ) . map ( l => parseInt ( l ) ) ;

  // Call the main solver function with the parsed N and A.
  var ans = solve ( N, A ) ;

  // Print the computed answer to the standard output.
  console . log ( ans ) ;
}

// Read the entire content of '/dev/stdin' as a UTF-8 string
// and pass it to the 'main' function to start execution.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) ) ;