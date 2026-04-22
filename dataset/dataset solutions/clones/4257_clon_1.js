/*
 * This JavaScript file contains a solution for processing numerical data,
 * including a custom binary search function and a main logic block.
 * The primary goal is to compute a specific count based on relationships
 * between elements in three arrays (A, B, C).
 */

'use strict' ; // Enforce strict mode for better code quality and error checking.


/**
 * Implements a modified binary search algorithm.
 * It finds the smallest index `r` in the `src` array such that `src[r]` is strictly greater than `v`.
 * If no such element exists (i.e., all elements in `src` are less than or equal to `v`),
 * it returns `src.length`. The `src` array is assumed to be sorted in ascending order.
 *
 * @param {Array<number>} src - The sorted array of numbers to search within.
 * @param {number}        v   - The target value to compare against array elements.
 * @returns {number} The insertion point index (first element > v) or `src.length`.
 */
function bin ( src , v )
{
  // Initialize the search range.
  // `l` points to an index where `src[l] <= v` (or -1 if no such element found yet).
  // `r` points to an index where `src[r] > v` (or `src.length` if no such element found yet).
  let l = -1 ,
      r = src . length ;


  // Continue the binary search as long as there's a valid range to check.
  // The loop terminates when `r` and `l` are adjacent (r - l === 1).
  while ( r - l > 1 )
  {
    // Calculate the middle index.
    // Using `parseInt` ensures an integer result for array indexing.
    // The explicit base `10` is good practice.
    const m = parseInt ( l + ( ( r - l ) / 2 ) , 10 ) ;

    // Check if the element at the middle index is greater than the target value.
    if ( src [ m ] > v )
    {
      // If `src[m]` is greater than `v`, then `m` could be our target index
      // or the target is in the left half of the current range.
      r = m ; // Adjust the right boundary to `m`.
    }
    else // `src[m]` is less than or equal to `v`.
    {
      // If `src[m]` is less than or equal to `v`, then the target must be
      // in the right half of the current range (or `m` is the largest index where `src[m] <= v`).
      l = m ; // Adjust the left boundary to `m`.
    }
  }

  // After the loop, `r` will hold the smallest index such that `src[r] > v`.
  // If all elements are `<= v`, `r` will be `src.length`.
  return r ;
}


// This is the main execution block wrapped in an Immediately Invoked Function Expression (IIFE).
// It reads input from standard input, processes it, and prints the final result to the console.
console . log (
  ( function ( args )
    {
      // Process the raw input string.
      // 1. `trim()`: Removes leading/trailing whitespace.
      // 2. `split('\n')`: Splits the string into an array of lines.
      // 3. `map(...)`: Iterates over each line.
      //    `r.split(' ')`: Splits each line into an array of strings by space.
      //    `map(v => v | 0)`: Converts each string element to an integer using bitwise OR with 0.
      const tmp = args
        . trim ( )
        . split ( '\n' )
        . map ( r => r . split ( ' ' ) . map ( v => v | 0 ) ) ;

      // Extract problem-specific variables from the parsed input.
      // N is the first element of the first line.
      const N = tmp [ 0 ] [ 0 ] ;
      // A is the second line of input.
      const A = tmp [ 1 ] ;
      // B is the third line of input, sorted numerically.
      const B = tmp [ 2 ] . sort ( ( a , b ) => a - b ) ;
      // C is the fourth line of input, sorted numerically.
      const C = tmp [ 3 ] . sort ( ( a , b ) => a - b ) ;

      // Initialize a counter to accumulate the final result.
      let count = 0 ;

      // Outer loop: Iterate through each element `A[a]` in array A.
      for ( let a = 0 ; a < N ; a ++ )
      {
        // Find the index `i` in array B.
        // `i` represents the count of elements in B that are less than or equal to `A[a]`.
        // Or, more precisely, `i` is the first index such that `B[i] > A[a]`.
        let i = bin ( B , A [ a ] ) ;

        // Inner loop: Iterate through elements `B[b]` starting from index `i` in array B.
        // These are the elements `B[b]` that are strictly greater than `A[a]`.
        for ( let b = i ; b < N ; b ++ )
        {
          // For each `B[b]`, find how many elements in array C are strictly greater than `B[b]`.
          // `bin(C, B[b])` gives the count of elements in C that are less than or equal to `B[b]`.
          // Subtracting this from N gives the count of elements in C that are strictly greater than `B[b]`.
          count += N - bin ( C , B [ b ] ) ;
        }
      }

      // Convert the final accumulated count to a string as required for output.
      return count . toString ( ) ;
    }
    // Immediately invoke the IIFE with the content of `/dev/stdin` as the `args` parameter.
    ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) )
) ) ;