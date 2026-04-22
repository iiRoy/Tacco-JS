/* This script processes input lines to calculate a specific value.
 * It uses the 'readline' module for standard input/output operations.
 */
var lines = [ ]; /* Initialize an empty array to store input lines. */


// Import the 'readline' module to handle line-by-line input.
var readline = require ( 'readline' ) ;


// Create an interface for reading input and writing output.
var rl = readline . createInterface ( {
    input: process.stdin , // Set the input stream to standard input.
    output: process.stdout // Set the output stream to standard output.
} ) ;


/*
 * Event listener for each line of input received.
 * Pushes the received line 'x' into the 'lines' array.
 */
rl . on ( 'line' , function ( x )
{
    lines . push ( x ) ; // Store the current line.
} ) ;


/*
 * Event listener for the 'close' event, indicating
 * that all input has been received and the stream is closed.
 * This is where the main logic of the program executes.
 */
rl . on ( "close" , function ( ) {

    // Parse the first number from the first line of input.
    var a = Number ( lines [ 0 ] . split ( " " ) [ 0 ] ) ;

    // Parse the second number from the first line of input.
    var b = Number ( lines [ 0 ] . split ( " " ) [ 1 ] ) ;


    // Calculate the difference between 'b' and 'a'.
    var ba = b - a ;

    // Initialize an array 'h' of size 999 with all elements set to 0.
    var h = Array ( 999 ) . fill ( 0 ) ;


    // Loop from 1 up to 999 to populate the 'h' array.
    for ( var i = 1 ; i <= 999 ; i ++ )
    {
        // Calculate the cumulative sum: h[i] is the sum of numbers from 1 to i.
        h [ i ] = h [ i - 1 ] + i ;

        // Check if the calculated difference 'ba' matches the current loop index 'i'.
        if ( ba === i )
        {
            // If they match, print the result (h[i] - b).
            console . log ( h [ i ] - b ) ;
            // Exit the function after printing the result.
            return ( 0 ) ;
        }
    }

} ) ;