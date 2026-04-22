/*
 * This JavaScript code processes a series of numerical inputs.
 * It reads data from standard input, performs some operations
 * based on specific conditions, and then outputs a count.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered. The logical structure and all identifiers
 * remain exactly the same as in the original source.
 */

var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ; // Read all input data

// Process the input: trim whitespace, split by newlines, and convert to numbers.
var arr = input . trim( ) . split( "\n" ) . map( Number ) ;


while ( true ) { // Main processing loop; continues until a specific break condition is met.

    var n = arr . shift( ) ; // Get the next number from the array, which represents the count for the next block.

    if ( n == 0 ) { // If n is zero, it's the termination signal.
        break ;    // Exit the main loop.
    }

    var ary = [ ] ;   // Initialize an empty array for current block processing.
    var flag = false ; // Initialize a boolean flag.

    /*
     * This loop processes 'n' items for the current block.
     */
    for ( var k = 0 ; k < n ; k ++ ) {

        var v = arr . shift( ) ; // Get the next value 'v' from the input array.
        var i = k ;              // Initialize 'i' with the current loop index 'k'.

        flag = ! flag ; // Toggle the flag's state.

        if ( flag ) {
            ary . push( v ) ; // If flag is true, simply push 'v' onto 'ary'.
        }
        else {
            // If flag is false, perform more complex logic.
            if ( ary[ ary . length - 1 ] == v ) {
                ary . push( v ) ; // If the last element of 'ary' is equal to 'v', push 'v'.
            }
            else {
                ary . push( v ) ; // Otherwise, push 'v'.
                i -- ;            // Decrement 'i'.

                // Inner loop to modify elements of 'ary' backwards.
                while ( true ) {
                    if ( i < 0 || ary[ i ] == v ) {
                        break ; // Break if 'i' goes below zero or element at 'i' equals 'v'.
                    }
                    else {
                        ary[ i ] = v ; // Replace element at 'i' with 'v'.
                        i -- ;         // Decrement 'i' to move to the previous element.
                    }
                }
            }
        }
    }

    var cnt = 0 ; // Initialize a counter for zero values.

    // Iterate through the processed array 'ary' to count occurrences of zero.
    ary . forEach( function ( v ) {
        if ( v == 0 ) {
            cnt ++ ; // Increment counter if the value is zero.
        }
    } ) ;

    console . log( cnt ) ; // Output the final count of zeros for the current block.

} // End of the main processing loop.