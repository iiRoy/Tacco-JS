/*
 * This file processes input data to find the maximum sum of a sub-rectangle
 * within a given 2D array, utilizing a 2D prefix sum technique.
 *
 * Author: Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 */

// Import the Node.js 'fs' module for file system operations.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;

// Trim leading/trailing whitespace from the input string and split it into an array of lines.
var arr = input . trim() . split( "\n" ) ;

// Extract the first line, convert it to a number, and store it in 'n'.
// The '-0' is a common JavaScript trick to explicitly convert to a number.
var n = arr . shift() - 0 ;

// Initialize an empty array to store the 2D data (including the padding row/column).
var yx = [ ] ;

// Initialize an array named 'zero' which will be used for padding the first row.
var zero = [ ] ;

// Populate the 'zero' array with '0's for 'n+1' elements.
for ( var i = 0 ; i < n + 1 ; i ++ )
{
    zero . push( 0 ) ; // Add a zero to the zero array.
}

// Add the 'zero' array as the first row of 'yx' for easier prefix sum calculations.
yx . push( zero ) ;

// Process the remaining lines from 'arr' to populate the 'yx' array.
// Each line represents a row of data.
for ( var i = 0 ; i < n ; i ++ )
{
    // Prepend "0 " to each line, split by space, and convert elements to numbers.
    // This adds a leading zero column for prefix sum convenience.
    yx . push( ( "0 " + arr . shift() ) . split( " " ) . map( Number ) ) ;
}

// Increment 'n' to reflect the actual size of the padded matrix (n+1 x n+1).
n = n + 1 ;

// Initialize a 2D array 'sum' to store the prefix sums.
var sum = [ ] ;

// First pass: Initialize the 'sum' array and populate the first column with values from 'yx'.
for ( var i = 0 ; i < n ; i ++ )
{
    sum[ i ] = [ ] ;          // Create a new row for 'sum'.
    sum[ i ][ 0 ] = yx[ i ][ 0 ] ; // Copy the first element from 'yx' to 'sum'.
}

// Second pass: Calculate row-wise prefix sums.
// For each element, add its value to the value of the element to its left in the 'sum' array.
for ( var i = 0 ; i < n ; i ++ )
{
    for ( var j = 1 ; j < n ; j ++ )
    {
        sum[ i ][ j ] = sum[ i ][ j - 1 ] + yx[ i ][ j ] ; // Accumulate sum horizontally.
    }
}

// Third pass: Calculate column-wise prefix sums.
// For each element, add its value to the value of the element above it in the 'sum' array.
// This completes the 2D prefix sum calculation.
for ( var i = 1 ; i < n ; i ++ )
{
    for ( var j = 0 ; j < n ; j ++ )
    {
        sum[ i ][ j ] = sum[ i - 1 ][ j ] + sum[ i ][ j ] ; // Accumulate sum vertically.
    }
}


// Initialize 'max' to negative infinity to ensure any valid sum will be greater.
var max = - Infinity ;

// Iterate through all possible top-left corners (i, j) of sub-rectangles.
for ( var i = 0 ; i < n ; i ++ )
{
    for ( var j = 0 ; j < n ; j ++ )
    {
        // Iterate through all possible bottom-right corners (y, x) of sub-rectangles.
        // These corners must be strictly "after" the top-left corner.
        for ( var y = i + 1 ; y < n ; y ++ )
        {
            for ( var x = j + 1 ; x < n ; x ++ )
            {
                // Calculate the sum of the sub-rectangle using the 2D prefix sum formula:
                // Sum(i, j, y, x) = sum[y][x] - sum[i][x] - sum[y][j] + sum[i][j]
                var currentSubRectSum = sum[ y ][ x ] - sum[ i ][ x ] - sum[ y ][ j ] + sum[ i ][ j ] ;

                // Update 'max' if the current sub-rectangle sum is greater.
                max = Math . max( max , currentSubRectSum ) ;
            }
        }
    }
}

// Output the maximum sub-rectangle sum found.
console . log( max ) ;