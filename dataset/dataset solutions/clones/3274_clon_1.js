/*
 * This is an extensively modified Type I clone
 * of the original JavaScript code.
 * All identifiers, operators, and expressions remain identical.
 * Only whitespace and comments have been altered.
 */

"use strict" ; // Enforce strict mode for the script.


process.stdin . resume ( ) ; // Ensure stdin is open.
process.stdin . setEncoding ( "utf8" ) ; // Set the encoding for input.


var lines = [ ] ; // Initialize an array to store parsed input lines.


// Create a readline interface for managing input and output.
var reader = require ( "readline" ) . createInterface ( {
    input : process.stdin ,   // Use standard input.
    output : process.stdout   // Use standard output.
} ) ;


reader . on ( "line" , line => {
    // Event listener for each line of input received.
    // Split the line by whitespace, then parse each part as an integer.
    lines . push ( line . split ( / \s / ) . map ( x => parseInt ( x ) ) ) ;
} ) ;


reader . on ( "close" , ( ) => {
    // Event listener for when the input stream closes.
    // This is where the main logic of the program executes.

    let n = lines . shift ( ) ; // The first line contains 'n'.
    let a = lines . shift ( ) ; // The second line contains array 'a'.
    let b = lines . shift ( ) ; // The third line contains array 'b'.


    let aSum = a . reduce ( ( a , i ) => a + i ) ; // Calculate sum of array 'a'.
    let bSum = b . reduce ( ( a , i ) => a + i ) ; // Calculate sum of array 'b'.


    // If sum 'a' is less than sum 'b', print -1 and exit.
    if ( aSum < bSum ) {
        console . log ( -1 ) ;
        return ;
    }


    // Initialize variables for the main calculation.
    let count = 0 ;
    let positiveArr = [ ] ;
    let positiveSum = 0 ;
    let negativeSum = 0 ;
    let index = 0 ;


    // Iterate through the arrays to calculate differences.
    for ( let i = 0 ; i < n ; i ++ ) {
        let tmp = a [ i ] - b [ i ] ; // Calculate difference at current index.
        if ( tmp > 0 ) {
            positiveArr . push ( tmp ) ; // If difference is positive, add to positiveArr.
        } else {
            count += 1 ;         // If difference is non-positive, increment count.
            negativeSum += tmp ; // Add to negativeSum.
        }
    }


    // Sort positive differences in descending order.
    positiveArr . sort ( ( a , b ) => b - a ) ;


    // While the combined sum of positive and negative differences is still negative,
    // add the largest available positive difference.
    while ( positiveSum + negativeSum < 0 ) {
        positiveSum += positiveArr [ index ] ; // Add current positive value to positiveSum.
        index ++ ;                             // Move to the next positive value.
    }

    // Output the final result: count of non-positive differences plus count of
    // positive differences needed to overcome the negative sum.
    console . log ( count + index ) ;
} ) ;