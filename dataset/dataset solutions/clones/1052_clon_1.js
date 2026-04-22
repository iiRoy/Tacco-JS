/*
 * This JavaScript program is designed to solve the subset sum problem.
 * It processes input from standard input to determine if a target sum
 * can be achieved by summing a subset of numbers from a given array.
 *
 * This file is a Type I clone, meaning its functionality and core
 * structure are identical to the original, with only variations
 * in whitespace and comments.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27
 */

// Import the 'fs' (file system) module to read input.
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// Split the entire input string into an array of lines.
var lines = input.split( '\n' );


// The first significant line of input contains the count of elements for array 'A'.
// The unary plus operator converts the string representation to a number.
var n = +lines.shift(); // 'n' stores the number of elements in array 'A'.


// The next line contains the elements of array 'A', space-separated.
// .trim() removes any leading or trailing whitespace.
// .split(' ') converts the string of numbers into an array of string numbers.
// .map(...) then iterates over this array, converting each string element to a numeric type.
var A = lines.shift().trim().split( ' ' ).map( function( i ) { return +i; } );


// The subsequent line provides the count of queries, 'q'.
var q = +lines.shift(); // 'q' indicates how many target sums are in array 'M'.


// Finally, the last line of input contains the target sums (queries) for array 'M'.
// Similar processing as for array 'A' is applied here.
var M = lines.shift().trim().split( ' ' ).map( function( i ) { return +i; } );


// Iterate over each target sum 'm' in the array 'M'.
// For each 'm', we attempt to find if a subset of 'A' sums up to 'm'.
M.forEach( function( m ) {
  // Call the recursive 'solve' function. It starts checking from the first element (index 0).
  if ( solve( 0, m ) ) {
    // If 'solve' returns true, a subset sum was found.
    console.log( 'yes' );
  } else {
    // Otherwise, no subset of 'A' sums to the current 'm'.
    console.log( 'no' );
  }
} );


/*
 * This is a recursive function to determine if a subset of array 'A'
 * from index 'i' onwards can sum up to the target value 'm'.
 *
 * @param {number} i - The current index in array 'A' being considered.
 * @param {number} m - The remaining target sum to achieve.
 * @returns {boolean} - True if a subset sum is found, false otherwise.
 */
function solve( i, m ) {
  // Base Case 1: If the current index 'i' is out of bounds (past the end of array 'A').
  // This means we have exhausted all elements in 'A' without reaching the target 'm'.
  if ( i >= n ) {
    return false; // No solution found from this path.
  }

  // Base Case 2: If the current element A[i] itself is equal to the target 'm'.
  // This means we have found a subset (A[i] alone) that sums to 'm'.
  if ( A[i] == m ) {
    return true; // Solution found!
  }

  // Recursive Step: Explore two possibilities for the current element A[i]:
  // 1. Exclude A[i]: Try to find the sum 'm' from the remaining elements (from index i + 1 onwards).
  // 2. Include A[i]: Try to find the remaining sum 'm - A[i]' from the elements (from index i + 1 onwards).
  // The '||' (OR) operator means if either of these paths leads to a solution, we return true.
  return solve( i + 1, m ) || solve( i + 1, m - A[i] );
}