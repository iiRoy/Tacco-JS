/*
 * This JavaScript code processes input data to solve a specific problem.
 * It reads from standard input, parses numerical arrays, and performs
 * calculations based on sums of subarrays.
 *
 * This is a Type I clone, meaning only whitespace and comments have been
 * altered. All original identifiers, operators, and expressions are
 * preserved exactly as they were in the source code.
 */

// Import the 'fs' module for file system operations.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' );

// Trim whitespace from the input and split it into an array of lines.
var arr = input . trim() . split( "\n" );

// Main processing loop. It continues indefinitely until a specific
// termination condition is met.
while ( true ) {

    // Extract the first line from the array. This line typically
    // contains the dimensions or control values for the current test case.
    var str = arr . shift();

    // Check for the termination condition: if the string is "0 0",
    // break out of the loop.
    if ( str == "0 0" )
        break;

    // Parse the current line into an array of numbers.
    // It splits by space and converts each part to a Number.
    var ary = str . split( " " ) . map( Number );

    // Initialize arrays to store 'h' and 'w' dimensions/values.
    var h = [];
    var w = [];

    // Populate the 'h' array based on the first element of 'ary'.
    // Each element is shifted from 'arr' and converted to a number.
    for ( var i = 0 ; i < ary[0] ; i++ ) {
        h . push( arr . shift() - 0 ); /* The '- 0' ensures explicit number conversion */
    }

    // Populate the 'w' array based on the second element of 'ary'.
    for ( var i = 0 ; i < ary[1] ; i++ ) {
        w . push( arr . shift() - 0 );
    }

    // Initialize an object (hash map) to store sums of 'h' subarrays.
    // Keys will be sums, values will be their frequencies.
    var H = {};

    // Calculate all possible subarray sums for 'h' and store their frequencies in H.
    for ( var i = 0 ; i < h . length ; i++ ) {
        var sum = 0; // Initialize sum for the current starting point 'i'.
        for ( var j = i ; j < h . length ; j++ ) {
            // If 'j' is not 'i', add the current element h[j] to the sum.
            // This effectively calculates sums of h[i], h[i]+h[i+1], h[i]+h[i+1]+h[i+2], etc.
            if ( j != i ) {
                sum += h[j];
            }
            // Check if the current sum (h[i] + sum) already exists as a key in H.
            // If it exists, increment its count; otherwise, initialize it to 1.
            ( H . hasOwnProperty( h[i] + sum ) ) ? H[ h[i] + sum ]++ : H[ h[i] + sum ] = 1;
        }
    }

    // Initialize an object (hash map) to store sums of 'w' subarrays.
    // Similar to H, but for 'w'.
    var W = {};

    // Calculate all possible subarray sums for 'w' and store their frequencies in W.
    for ( var i = 0 ; i < w . length ; i++ ) {
        var sum = 0; // Reset sum for each new starting point.
        for ( var j = i ; j < w . length ; j++ ) {
            // Accumulate sum for 'w' subarrays.
            if ( j != i ) {
                sum += w[j];
            }
            // Update frequency in W.
            ( W . hasOwnProperty( w[i] + sum ) ) ? W[ w[i] + sum ]++ : W[ w[i] + sum ] = 1;
        }
    }

    // Initialize a counter for the final result.
    var cnt = 0;

    /*
     * Iterate through the keys (sums) in H.
     * For each sum 'k' from H, check if it also exists in W.
     * If it does, multiply their frequencies and add to 'cnt'.
     * This finds the total number of pairs of subarrays (one from h, one from w)
     * that have the same sum.
     */
    for ( var k in H ) {
        if ( W . hasOwnProperty( k ) ) {
            cnt += H[k] * W[k];
        }
    }

    // Output the final count for the current test case.
    console . log( cnt );

} // End of while loop.