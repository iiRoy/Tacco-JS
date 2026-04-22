/*
 * This JavaScript file processes input data
 * to find a specific maximum value based on array partitioning.
 * It reads numbers, duplicates them for circular array logic,
 * and then searches for a maximum sum satisfying certain conditions.
 */
var input = require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ;


var lines = input.split( '\n' ) ; // Split the entire input string into an array of individual lines.

var n = lines[0] - 0 ; // The first line is expected to contain the integer 'n'. Convert it to a number.

var a = [ ] ; // Initialize an empty array 'a' which will store our numerical data.

var i , j , k ; // Declare loop counter variables, used extensively throughout the script.

// This loop populates array 'a' with the input numbers and duplicates them.
// The duplication allows for "circular" array access without needing modulo operations later on.
for ( i = 0 ; i < n ; i++ )
{
  a[i] = lines[ i + 1 ] - 0 ;        // Read the actual number from the input line.
  a[ i + n ] = a[ i ] ;              // Duplicate the number at an offset of 'n'.
  a[ i + n + n ] = a[ i ] ;          // Duplicate it again at an offset of '2n'.
}


// A simple function named 'sum', though it's not directly used with Array.prototype.reduce in the final logic.
var sum = function ( p , n )
{
  return p + n ; // Returns the sum of two numbers.
} ;


/*
 * Helper function to calculate the sum of elements within a specific range of an array.
 * This avoids creating new temporary arrays with slice() for performance.
 * @param {Array} arr   - The array from which to sum elements.
 * @param {number} start - The starting index (inclusive) of the sum range.
 * @param {number} end   - The ending index (exclusive) of the sum range.
 * @returns {number} The accumulated sum of elements in the specified range.
 */
function arrSum ( arr , start , end )
{
  var n = 0 , i ; // 'n' is a local sum accumulator, 'i' is a local loop counter.
  for ( i = start ; i < end ; i++ )
  {
    n += arr[ i ] ; // Add each element in the range to the accumulator.
  }
  return n ;
}


var max = 0 ; // Variable to store the overall maximum value found, initialized to 0.
var min = 0 ; // Variable to store the minimum of two segment sums for comparison.

var temp = 0 , arr ; // 'temp' stores the sum of the current first segment. 'arr' is declared but currently unused.

// The main triple-nested loop structure for finding the desired maximum.
// Outer loop: 'i' represents the length of the first segment.
for ( i = 1 ; i < n - 2 ; i++ )
{
  // Middle loop: 'j' represents the starting index of the first segment.
  for ( j = 0 ; j < n ; j++ )
  {
    // Calculate the sum of the first segment using the arrSum helper.
    temp = arrSum( a , j , j + i ) ;

    // The following line was commented out in the original code, indicating an alternative approach was considered.
    // arr = a.slice(j + i, j + n);

    // Inner loop: 'k' represents the split point for the remaining (n-i) elements into two sub-segments.
    for ( k = 1 ; k < n - i ; k++ )
    {
      // The following line was commented out in the original code, showing an alternative calculation using slice and reduce.
      // min = Math.min(a.slice(i + j, i + j + k).reduce(sum, 0), a.slice(i + j + k, j + n).reduce(sum, 0));

      // Calculate the minimum sum of the two subsequent segments.
      min = Math.min( arrSum( a , i + j , i + j + k ) , arrSum( a , i + j + k , j + n ) ) ;

      // This console.log was commented out in the original, likely for debugging purposes.
      // console.log(temp, min)

      // Check if the current 'temp' (first segment sum) meets the condition.
      if ( temp <= min )
      {
        // If the condition is met, update the overall maximum if 'temp' is greater.
        max = Math.max( max , temp ) ;
        // Another commented-out console.log for debugging the segments.
        // console.log(a.slice(j, j + i), a.slice(i + j,i + j + k), a.slice(i + j + k, j + n))
      }
    }
  }
}

// Print the final calculated maximum value to standard output.
console.log( max ) ;