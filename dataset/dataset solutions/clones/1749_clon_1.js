/*
 * This JavaScript file processes input data from standard input.
 * It reads numbers, performs operations based on queries,
 * and outputs results to the console.
 */


// Require the 'fs' (file system) module to read input.
var input = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


// Split the entire input string by newline characters
// to get an array of individual lines.
var inputs = input . split ( '\n' ) ;


// The first line of input represents the number N.
// The unary plus operator converts the string to a number.
var N = + inputs . shift ( ) ;


// The second line contains space-separated numbers for array A.
// 'shift()' removes and returns the first element (now the line for A).
// 'split(' ')' divides the string into an array of number strings.
// 'map(function(n){return (+n)})' converts each string number to an actual number.
var A = inputs . shift ( ) . split ( ' ' ) . map ( function ( n ) {
    return ( + n ) ;
} ) ;


// The third line of input is the number of queries, Q.
var Q = + inputs . shift ( ) ;


// Remove the last element from the 'inputs' array.
// This often accounts for an extra blank line at the end of input.
inputs . pop ( ) ;


/*
 * This function calculates the sum of two numbers.
 * It's used as a reducer function.
 */
function sum ( a , c )
{
    // Accumulate the current value 'c' into the accumulator 'a'.
    a += c ;

    // Return the updated sum.
    return a ;
}


/*
 * This function is a mapper function.
 * It replaces a number 'n' with 'C' if 'n' is equal to 'B',
 * otherwise, it returns 'n' unchanged.
 * Note: B and C are global variables set in the loop.
 */
function rep ( n )
{
    // Check if the current number 'n' matches the global 'B'.
    if ( n === B )
    {
        // If it matches, return the global 'C'.
        return C ;
    }
    else
    {
        // Otherwise, return the number 'n' as is.
        return n ;
    }
}


// Initialize a variable 's' to store the sum of array A, starting at 0.
var s = 0 ;


// Loop through each query.
for ( var i = 0 ; i < Q ; i ++ )
{
    // Get the current query line and split it by space.
    // 'o' will be an array like ['B_val', 'C_val'].
    var o = inputs [ i ] . split ( ' ' ) ;


    // Parse the first part of the query as integer B.
    // The '|0' is a bitwise OR with 0, a common trick for integer conversion.
    var B = ( + o [ 0 ] ) | 0 ;


    // Parse the second part of the query as integer C.
    var C = ( + o [ 1 ] ) | 0 ;


    // Optimization: If the current sum 's' is already calculated (s > 0)
    // AND the value 'B' is not present in array 'A',
    // then the mapping operation for this query won't change the sum.
    // In this specific case, we can just print the current sum and skip.
    if ( s > 0 && A . indexOf ( B ) === -1 )
    {
        // Output the current sum 's'.
        console . log ( s ) ;

        // Move to the next iteration of the loop.
        continue ;
    }


    // Apply the 'rep' function to each element of array A.
    // This replaces all occurrences of 'B' with 'C'.
    A = A . map ( rep ) ;


    // Recalculate the sum of array A using the 'sum' reducer.
    s = A . reduce ( sum , 0 ) ;


    // Output the new sum 's' to the console.
    console . log ( s ) ;
}