/* This is a JavaScript file implementing a solution for a competitive programming problem.
 * It strictly adheres to ECMAScript 5 strict mode for better error handling and cleaner code.
 *
 * Problem Description: Given a list of N integers, find the number of unique triplets
 * (a, b, c) from the list such that a, b, and c can form the sides of a non-degenerate triangle.
 * The input integers are assumed to be positive.
 */
'use strict' // Enforce strict mode for the entire script.

/**
 * The main function that processes the input and calculates the result.
 * @param {string} inp - The raw input string, typically read from standard input.
 *                       It contains N on the first line, followed by N space-separated numbers on the second line.
 */
function   main ( inp )
{
  // --- Input Processing Section ---

  // Trim any leading/trailing whitespace from the input string and split it into an array of lines.
  inp = inp . trim ( ) . split ( '\n' ) ;

  // The first line contains the count of numbers, N.
  // We extract it, convert it to a Number, and remove it from the input array.
  const   N   =   Number ( inp . shift ( ) ) ;

  // The remaining line contains the numbers themselves.
  // 1. Access the first (and only remaining) element of the `inp` array.
  // 2. Split it by spaces to get an array of number strings.
  // 3. Map each string to its numerical representation.
  // 4. Sort the numbers in ascending order. This is crucial for the triplet finding algorithm.
  inp   =   inp [ 0 ]
        . split ( ' ' )
        . map ( n   =>   Number ( n ) )
        . sort ( ( a ,   b )   =>   a   -   b ) ;


  // --- Helper Function Definition ---

  /**
   * Checks if three given side lengths can form a valid triangle.
   * A triangle is valid if the sum of any two sides is greater than the third side.
   * This is known as the Triangle Inequality Theorem.
   *
   * @param {number} a - The length of the first side.
   * @param {number} b - The length of the second side.
   * @param {number} c - The length of the third side.
   * @returns {boolean} True if a, b, and c can form a triangle, false otherwise.
   */
  const   check   =   ( a , b , c )   =>
  {
    // Apply the triangle inequality conditions.
    // All three conditions must be true for a valid triangle.
    return   ( a + b   >   c )   &&
             ( a + c   >   b )   &&
             ( b + c   >   a )
    ;
  } ;


  // --- Triangle Counting Logic ---

  let   ans   =   0 ; // Initialize a counter for the number of valid triangles.

  // Iterate through all possible combinations of three distinct numbers (i, j, k)
  // from the sorted input array.
  // The outer loop picks the first side `inp[i]`.
  for   ( let   i   =   0 ;   i   <   N ;   i ++ )
  {
    // The second loop picks the second side `inp[j]`.
    // It starts from `i+1` to ensure `j` is distinct from `i` and `inp[j] > inp[i]` (due to sorting).
    for   ( let   j   =   i + 1 ;   j   <   N ;   j ++ )
    {
      // The inner loop picks the third side `inp[k]`.
      // It starts from `j+1` to ensure `k` is distinct from `i` and `j`, and `inp[k] > inp[j]`.
      for   ( let   k   =   j + 1 ;   k   <   N ;   k ++ )
      {
        // Optimization: If the sum of the two smaller sides (inp[i], inp[j])
        // is not greater than the largest side (inp[k]), then no further `k`
        // values (which would be even larger) will satisfy the triangle inequality.
        // This is based on the sorted nature of the array: inp[i] <= inp[j] <= inp[k].
        // So, we only need to check a + b > c. If a + b <= c, then it's not a triangle.
        // And since k is increasing, all subsequent k's will also fail.
        if   ( inp [ i ]   +   inp [ j ]   <   inp [ k ] )
        {
          break ; // Exit the innermost loop (k loop) and proceed to the next 'j'.
        }

        // Check if the current triplet (inp[i], inp[j], inp[k]) forms a valid triangle.
        if   ( check ( inp [ i ] ,   inp [ j ] ,   inp [ k ] ) )
        {
          ans ++ ; // If it's a valid triangle, increment the counter.
        }
      } // End of inner loop (k)
    } // End of middle loop (j)
  } // End of outer loop (i)


  // --- Output Result ---

  // Print the final count of valid triangles to the console (standard output).
  console . log ( ans ) ;

} // End of main function definition.


/*
 * This part of the script is responsible for reading the input and calling the main function.
 * It uses Node.js 'fs' module to read from '/dev/stdin', which is the standard input stream.
 * The input is read synchronously and decoded as UTF-8.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;

// End of file.