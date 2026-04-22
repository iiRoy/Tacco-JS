/* This is a configuration block for input/output. */
// The following line is commented out; it's for Windows systems, typically using CRLF.
// config = { input: 'tmp', newline: '\r\n' }; // Windows-specific settings for line endings.

// Current active configuration for Linux-like systems, which commonly use LF.
config = {
        input :   '/dev/stdin'  ,
        newline : '\n'
}; // This object holds file paths and newline characters relevant to the environment.


// Read input from the specified source file.
// The 'fs' (file system) module is utilized for file operations.
var line = require( 'fs' )
    .readFileSync( config.input , 'ascii' ) // Read the entire file content as an ASCII string.
    .split( config.newline , 2 ) ; // Split the content by the defined newline character, taking only the first two segments.


// Process the second line of the input.
// This line is expected to contain space-separated numbers.
A = line[ 1 ]
    .split( ' ' ) // Split the string by spaces to get an array of string numbers.
    .map( Number ) ; // Convert each string element in the array to its numerical representation.


// Call the partitioning function to rearrange array A.
// 'q' will store the final index of the pivot element after partitioning.
q = partition( A , 0 , A.length ) ;


// Visually mark the pivot element in the array.
A[ q ] = '[' + A[ q ] + ']' ; // Enclose the element at the pivot's final position with square brackets.


// Output the modified array to the console.
console.log( A.join( ' ' ) ) ; // Join all array elements back into a single string, separated by spaces, then print.


/**
 * Implements the Hoare partition scheme, a core component of the Quicksort algorithm.
 * This function rearranges a subarray A[p...r-1] in place around a pivot element.
 * Elements less than or equal to the pivot are moved to the left, and elements greater
 * than the pivot are moved to the right. The pivot itself is placed in its final sorted position.
 *
 * @param {Array<number>} A - The array of numbers to be partitioned.
 * @param {number} p - The starting index of the subarray to partition (inclusive).
 * @param {number} r - The ending index of the subarray to partition (exclusive).
 * @returns {number} The final index of the pivot element after partitioning.
 */
function   partition( A , p , r )
{
    // Declare local variables used within this function scope.
    var   x  ,   i  ,   j  ,   tmp  ;

    // Select the last element of the subarray as the pivot.
    x = A[ r - 1 ] ;

    // Initialize 'i' to the starting index 'p'. 'i' will track the boundary
    // between elements smaller than or equal to the pivot and elements greater than it.
    i = p ;

    // Iterate through the subarray from 'p + 1' up to, but not including, the pivot element itself.
    for ( j = p + 1 ; j < r - 1 ; j++ )
    {
        // If the current element A[j] is less than or equal to the pivot 'x'...
        if ( A[ j ] <= x )
        {
            // Perform a swap: exchange A[i] with A[j].
            // This moves A[j] (which is <= x) to the left side of the partition.
            tmp   =   A[ i ] ;
            A[ i ]   =   A[ j ] ;
            A[ j ]   =   tmp ;
            i++ ; // Increment 'i' to extend the "smaller or equal" section.
        }
    }

    // After the loop, 'i' is the correct position for the pivot.
    // Swap A[i] with the original pivot element (which is at A[r-1]).
    tmp   =   A[ i ] ;
    A[ i ]   =   A[ r - 1 ] ;
    A[ r - 1 ]   =   tmp ;

    // Return the final index of the pivot.
    return   i ;
}