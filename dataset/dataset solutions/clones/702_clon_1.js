/*
 * This JavaScript program processes a series of numerical inputs.
 * It reads data from standard input, performs calculations,
 * and then prints the result to the console.
 */
var input = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) . trim () ; // Read entire input file as a string
// After reading, the input string is processed.

var lines = input . split ( '\n' ) . map ( function ( n ) { return + n ; } ) ; // Split by newline and convert each part to a number.

// Declare a variable 'n' which will hold the number of scores for each test case.
var n ;

while ( n = lines . shift () )     { // Loop while there are lines to process and 'n' is not falsy (i.e., not 0 after conversion)
    // Check if the current 'n' value indicates the end of input.
    if ( n == 0 )                     break ; // If n is 0, terminate the loop.

    var s = [ ] ; // Initialize an empty array 's' to store scores for the current test case.

    // Loop 'n' times to read 'n' scores for the current test case.
    for ( var i = 0 ; i < n ; i ++ )                                     {
        s . push ( lines . shift () ) ; // Add the next score from 'lines' array into 's'.
    }


    // Sort the array 's' in ascending numerical order.
    s . sort ( function ( a , b ) { return a - b ; } ) ;

    // Remove the smallest score (first element) and the largest score (last element).
    s . shift ( ) ; // Remove the first element (smallest score)
    s . pop ( ) ; // Remove the last element (largest score)


    // Calculate the sum of the remaining scores in the array 's'.
    var sum = s . reduce ( function ( p , n ) { return p + n ; } ) ;


    // Compute the average of the remaining scores and print the floor of the result.
    console . log ( Math . floor ( sum / s . length ) ) ; // Output the integer part of the average.
}
// End of program.