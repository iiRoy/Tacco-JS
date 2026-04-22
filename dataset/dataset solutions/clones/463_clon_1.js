/*
 * This JavaScript code reads input from standard input,
 * processes each line as a number, converts it to octal,
 * and then maps its digits using a predefined array 'k'.
 * Finally, it prints the resulting mapped string.
 */

// Initialize file system module and variables for reading stdin.
var fs        = require('fs')
  , length    = fs.fstatSync( process.stdin.fd ).size          // Get the size of the input data.
  , buffer    = new Buffer( length )                            // Create a buffer to hold the input.
  , bytesRead = fs.readSync( process.stdin.fd , buffer , 0 , length , 0 ) // Read data into the buffer.
  , input     = buffer.toString( 'utf8' , 0 , bytesRead )       // Convert buffer to UTF-8 string.
                .split( '\n' )                                  // Split the string into an array of lines.
  ; // End of variable declarations.


/*
 * This is an Immediately Invoked Function Expression (IIFE).
 * It takes a single argument 'k', which is an array used for digit mapping.
 */
! function ( k ) {

    // Iterate over each line obtained from the standard input.
    input.forEach( function ( l ) {

        // The expression 'l - 0' attempts to convert 'l' to a number.
        // If 'l - 0' results in a truthy value (i.e., not 0 or NaN),
        // then the console.log statement is executed.
        return l - 0

            &&

            console.log(
                ( l - 0 )       // Explicitly convert the line 'l' to a number.
                    .toString( 8 ) // Convert the numeric value to its octal (base 8) string representation.
                    .split( '' )   // Split the octal string into an array of individual digit characters.
                    .map( function ( ch ) {
                        // For each character 'ch' (which is an octal digit),
                        // convert it back to a number and use it as an index
                        // to retrieve a value from the 'k' array.
                        return k[ ch - 0 ] ;
                    } )
                    .join( '' )    // Join the mapped values back into a single string.
            ) ; // End of console.log arguments.

    } ) ; // End of forEach loop.

}( [ 0 , 1 , 2 , 3 , 5 , 7 , 8 , 9 ] ) ; // The array 'k' used for mapping octal digits.
// This array defines the mapping: 0->0, 1->1, 2->2, 3->3, 4->5, 5->7, 6->8, 7->9.