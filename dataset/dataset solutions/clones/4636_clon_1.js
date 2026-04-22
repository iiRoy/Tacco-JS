'use strict'

// This section contains global constants and utility functions.
// It's a common practice to define these at the top of a script.

// Mathematical constant representing a large number.
// Often used as an initial value for minimum/maximum calculations
// or to signify an infinite value in algorithms.
const INF = 900719925474099; /* This value is approximately
                                 Math.floor(Number.MAX_SAFE_INTEGER / 10).
                                 It provides a sufficiently large integer
                                 for many computational tasks without
                                 exceeding JavaScript's safe integer limit. */

/**
 * Parses a string of space-separated numbers into an array of integers.
 * @param {string} line - The input string containing numbers separated by spaces.
 * @returns {number[]} An array where each element is an integer parsed from the input string.
 */
function mapint(line) {
  // Split the input string by spaces to get an array of string numbers.
  // Then, use map to convert each string number to an integer.
  return line.split(' ').map( ( v ) => parseInt( v ) )
}


/**
 * Implements a binary search algorithm to find the lower bound of a value in a sorted array.
 * The lower bound is the index of the first element that is not less than the specified value.
 * This function assumes the input array 'd' is sorted in ascending order.
 *
 * @param {number[]} d - The sorted array to search within.
 * @param {number} a - The starting index of the search range.
 * @param {number} b - The ending index of the search range (exclusive).
 * @param {number} e - The value to search for.
 * @returns {number} The index of the first element in 'd' that is greater than or equal to 'e'.
 *                   If 'e' is greater than all elements, it returns 'b' (or 'd.length').
 */
function lower_bound( d, a, b, e ) {
  // Loop continues as long as the search range contains at least two elements.
  for ( var c; 1 < b - a; ) {
    // Calculate the middle index. Using bitwise OR 0 for integer truncation.
    c = 0 | ( a + b ) / 2;

    // If the element at the middle index is less than 'e',
    // then 'e' must be in the upper half.
    if ( d[ c ] < e ) {
      a = c; // Adjust the lower bound of the search range.
    } else {
      b = c; // Otherwise, 'e' is in the lower half (or 'd[c]' is the lower bound).
    }
  }

  // After the loop, 'a' and 'b' are adjacent.
  // Check 'd[a]' to determine the final lower bound.
  // If 'd[a]' is still less than 'e', then 'b' is the correct index.
  // Otherwise, 'a' is the correct index.
  return d[ a ] < e ? b : a
}


// A commonly used modulus value in competitive programming for
// preventing integer overflow in calculations that involve large numbers.
const MOD = 1000000007; // This is a prime number often used for modular arithmetic.

// End of global declarations and utility functions.


/**
 * The main function that processes the input and produces the output.
 * @param {string} input - The raw input string, typically read from standard input.
 */
function Main( input ) {
  // Trim leading/trailing whitespace and split the input into lines.
  let temp = input.trim().split( '\n' );

  // Process the first line of input to get N, L, and T.
  let temp2 = mapint( temp[ 0 ] );
  let n = temp2[ 0 ]; // Number of elements/ants.
  let l = temp2[ 1 ]; // Length of the circular track.
  let t = temp2[ 2 ] % l; // Time elapsed, modulo L for circularity.

  // The second line contains information about the first ant (f).
  let f = mapint( temp[ 1 ] );

  // Initialize an array to store the final positions of the ants.
  let ans = new Array( n );

  // 'num' keeps track of the relative shift in ant order due to collisions.
  let num = 0;

  // 'aa' is a temporary variable used in collision calculations.
  let aa;

  // Loop through each ant to calculate collisions and final positions.
  // The loop starts from 1 because temp[0] is N, L, T, and temp[1] is the first ant 'f'.
  // Subsequent temp[i] (for i >= 1) corresponds to the i-th ant in the input.
  for ( let i = 1; i <= n; i++ ) {
    // Get the current ant's initial position and direction.
    temp2 = mapint( temp[ i ] );

    // Collision calculation logic:
    // We only need to consider collisions with the first ant 'f'.
    // The relative order changes only when ants pass each other.
    // If two ants pass each other, it's equivalent to them passing through each other
    // and continuing their paths, effectively swapping identities.
    // This simplifies the problem as we only need to count how many times
    // a specific ant (here, the first ant 'f') would pass other ants.

    aa = t + 1; // Initialize 'aa' to a value greater than 't' to signify no collision yet.

    // Case 1: First ant moves clockwise (f[1]===2) and current ant moves counter-clockwise (temp2[1]===1).
    if ( f[ 1 ] === 2 && temp2[ 1 ] === 1 ) {
      // Calculate the distance they need to travel to meet.
      // If f is ahead of temp2 in clockwise direction:
      if ( f[ 0 ] < temp2[ 0 ] ) {
        aa = ( l + f[ 0 ] - temp2[ 0 ] ) / 2;
      } else { // If temp2 is ahead of f:
        aa = ( f[ 0 ] - temp2[ 0 ] ) / 2
      }

      // If a collision occurs within time 't':
      if ( aa <= t ) {
        // Each collision with 'f' increments 'num' by 'n' then takes modulo 'n',
        // essentially resetting 'num' to 0 if it goes over 'n' and acts as a counter.
        num += n;
        // If they collide and pass each other *again* within time t (meaning they cross the half-L mark)
        // or effectively two collisions happen, reduce num by 2.
        if ( aa + l / 2 <= t ) {
          num -= 2;
        } else { // Otherwise, only one collision effectively happened.
          num -= 1;
        }
        num %= n; // Ensure 'num' stays within [0, n-1].
      }
      // console.log('Collision type 2,1:', aa, t, num); // Debugging line, commented out.
    }

    // Case 2: First ant moves counter-clockwise (f[1]===1) and current ant moves clockwise (temp2[1]===2).
    if ( f[ 1 ] === 1 && temp2[ 1 ] === 2 ) {
      // Calculate the distance they need to travel to meet.
      // If f is ahead of temp2 in counter-clockwise direction:
      if ( f[ 0 ] > temp2[ 0 ] ) {
        aa = ( l - f[ 0 ] + temp2[ 0 ] ) / 2;
      } else { // If temp2 is ahead of f:
        aa = ( temp2[ 0 ] - f[ 0 ] ) / 2
      }

      // If a collision occurs within time 't':
      if ( aa <= t ) {
        // Similar logic as Case 1 for updating 'num'.
        if ( aa + l / 2 <= t ) {
          num += 2;
        } else {
          num += 1;
        }
        num %= n; // Ensure 'num' stays within [0, n-1].
      }
      // console.log('Collision type 1,2:', aa, t, num); // Debugging line, commented out.
    }

    // Calculate the final position of the current ant after time 't'.
    // If direction is 1 (counter-clockwise, decreasing position):
    if ( temp2[ 1 ] === 1 ) {
      ans[ i - 1 ] = ( temp2[ 0 ] + t ) % l;
    } else { // If direction is 2 (clockwise, increasing position):
      // Add 'l' to handle negative results from subtraction before taking modulo.
      ans[ i - 1 ] = ( temp2[ 0 ] - t + l ) % l;
    }
  }

  // Store the final position of the *first* ant (from the original input).
  let fa = ans[ 0 ];

  // Sort the calculated final positions.
  // This array now contains the final positions of all ants, but not necessarily in their original order.
  ans.sort( ( a, b ) => a - b );

  // Use lower_bound to find the index of 'fa' (the first ant's final position) in the sorted 'ans' array.
  let low = lower_bound( ans, 0, ans.length, fa );

  // console.log(ans, fa, num, low); // Another debugging line, commented out.

  // Create a new array to store the final positions in the correct original ant order.
  let ans2 = new Array( n );

  // Reconstruct the final order of ants.
  // 'num' represents the offset due to collisions.
  // 'low' represents the index of the first ant's final position in the sorted array.
  for ( let i = 0; i < n; i++ ) {
    // The ant that was originally at index 'num' (after accounting for swaps)
    // will now be at the position `ans[low]`.
    ans2[ num ] = ans[ low ];

    low++; // Move to the next position in the sorted array.
    num++; // Move to the next ant in the original order (conceptually).

    // Wrap around for circular array access.
    low %= n;
    num %= n;
  }

  // Output the final positions, each on a new line.
  console.log( ans2.join( '\n' ) );

} // End of Main function.


// Entry point of the script when run in Node.js.
// Reads the entire content of standard input, decodes it as UTF-8,
// and passes it to the Main function.
Main( require("fs").readFileSync("/dev/stdin", "utf8") );