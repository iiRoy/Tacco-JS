/*
 * This JavaScript program processes input data to perform a specific
 * comparison logic. It reads from standard input, parses numerical arrays,
 * and then determines if certain conditions are met based on accumulated sums.
 *
 * Author: Clone Generator v1.0
 * Date: 2023-10-27
 */

// Import the Node.js 'fs' (file system) module to read input.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Trim whitespace from the input and split it into an array of lines.
var arr = input . trim ( ) . split ( "\n" ) ;


// Remove the first line, which is typically a count or metadata.
arr . shift ( ) ;


// Parse the next line into an array of numbers (array 'a').
var a = arr . shift ( ) . split ( " " ) . map ( Number ) ;


// Sort array 'a' in ascending numerical order.
a . sort ( function ( a , b ) {
    return a - b ;
} ) ;


// Remove another line from the input array.
arr . shift ( ) ;


// Parse the next line into an array of numbers (array 'b').
var b = arr . shift ( ) . split ( " " ) . map ( Number ) ;


// Parse the next line into an array of strings (array 'c').
var c = arr . shift ( ) . split ( " " ) ;


// Initialize a large array 'ary' to store precomputed sums.
// It will act as a lookup table.
var ary = [ ] ;


// Fill 'ary' with 'false' initially for a large range.
for ( var i = 0 ; i < 1000000 ; i ++ ) {
    ary [ i ] = false ;
}

// Initialize the first element of 'ary' with a base sum of [0, 0].
ary [ 0 ] = [ 0 , 0 ] ;


// Initialize the 'sum' variable, also a two-element array for large number handling.
var sum = [ 0 , 0 ] ;


// Iterate through array 'a' to precompute cumulative sums.
a . forEach ( function ( v ) {

    // Add the current value 'v' to the lower part of the sum.
    sum [ 1 ] += v ;

    // Check if the lower part of the sum has exceeded the threshold.
    if ( sum [ 1 ] >= 1000000000000 ) {
        // Increment the higher part of the sum.
        sum [ 0 ] ++ ;
        // Adjust the lower part of the sum by subtracting the threshold.
        sum [ 1 ] -= 1000000000000 ;
    }

    // Store a slice (copy) of the current 'sum' in 'ary' at index 'v'.
    ary [ v ] = sum . slice ( ) ;
} ) ;


// Process elements from array 'b' and compare them with precomputed sums.
b . forEach ( function ( v , i ) {

    // Loop to find the largest 'v' less than or equal to the current 'v'
    // for which a sum has been precomputed in 'ary'.
    while ( true ) {
        // If a sum is found for 'v', break the loop.
        if ( ary [ v ] !== false ) {
            break ;
        }
        // Decrement 'v' and try again.
        v -- ;
    }

    // Get the corresponding string from array 'c'.
    var str = c [ i ] ;

    // Parse the string 'str' into a two-element array 'big' representing a large number.
    // The string is split into two parts: a potential 'high' part and a 'low' part (last 13 digits).
    // Leading zeros are removed, and parts are converted to numbers.
    var big = [
        str . slice ( 0 , str . length - 13 ) . replace ( /^0+/ , "" ) - 0 ,
        str . slice ( -13 ) . replace ( /^0+/ , "" ) - 0
    ] ;

    // Initialize the answer string.
    var ans = "" ;

    // Perform the comparison logic.
    // Compare the 'big' number with the precomputed sum stored in 'ary[v]'.
    if ( big [ 0 ] < ary [ v ] [ 0 ] ) {
        // If the higher part of 'big' is smaller, then 'big' is smaller.
        ans = "Yes" ;
    } else if ( big [ 0 ] == ary [ v ] [ 0 ] && big [ 1 ] <= ary [ v ] [ 1 ] ) {
        // If higher parts are equal, compare the lower parts.
        // If the lower part of 'big' is less than or equal, then 'big' is smaller or equal.
        ans = "Yes" ;
    } else {
        // Otherwise, 'big' is larger.
        ans = "No" ;
    }

    // Print the result to the console.
    console . log ( ans ) ;
} ) ;