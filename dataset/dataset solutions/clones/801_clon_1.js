/*
 * This JavaScript code reads input from standard input,
 * processes it in a loop, and prints a calculated result.
 * It's designed to solve a specific problem involving
 * percentages and sums.
 */

// Import the 'fs' (file system) module to read input.
var input = require('fs') . readFileSync(
    // Specify the path to read from standard input.
    '/dev/stdin',
    // Define the character encoding for the input.
    'utf8'
) ;

// Trim any leading/trailing whitespace from the input
// and then split it into an array of lines.
var Arr = ( input . trim() ) . split( "\n" ) ;


// Start an infinite loop to process multiple test cases.
while ( true ) {

    // Extract the first line, split it by spaces, and convert parts to numbers.
    var nmp = ( Arr . shift() ) . split( " " ) . map( Number ) ;

    // Check for the termination condition: n, m, and p are all zero.
    if ( nmp[0] == 0 && nmp[1] == 0 && nmp[2] == 0 ) {
        // If the condition is met, exit the loop.
        break ;
    }

    // Assign parsed values to descriptive variables.
    var n = nmp[0] ;  // The count of items.
    var m = nmp[1] - 1 ; // The index of a specific item (0-based).
    var p = nmp[2] ; // A percentage value.

    // Initialize an empty array to store values.
    var arr = [] ;
    // Initialize a variable to accumulate sum.
    var sum = 0 ;

    // Loop 'n' times to read 'n' values.
    for ( var i = 0 ; i < n ; i++ ) {
        // Read a value from the array of lines and convert it to a number.
        var v = Arr . shift() - 0 ;
        // Add the value to our 'arr' array.
        arr . push( v ) ;
        // Accumulate the sum, multiplying each value by 100.
        sum += ( v * 100 ) ;
    }

    // Apply the percentage calculation to the total sum.
    // This effectively reduces the sum by 'p' percent.
    sum = sum * ( 100 - p ) / 100 ;

    // Initialize the answer variable.
    var ans = 0 ;

    // Check if the specific item at index 'm' is not zero
    // to avoid division by zero errors.
    if ( arr[m] != 0 ) {
        // Calculate the answer by dividing the modified sum
        // by the value at index 'm', then floor the result.
        ans = Math . floor( sum / arr[m] ) ;
    }

    // Print the calculated answer to the console.
    console . log( ans ) ;

} // End of the while loop.