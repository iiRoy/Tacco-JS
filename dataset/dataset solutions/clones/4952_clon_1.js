/*
 * This is a Type I clone example.
 * It demonstrates extensive changes in whitespace and comments
 * while preserving the exact semantic structure and identifiers
 * of the original JavaScript code.
 */
( function ()
{
    'use strict' ; // Enable strict mode for cleaner code.


    var lines = [ ] ; // Initialize an empty array to hold all input lines.


    require ( 'readline' ) .createInterface ( // Use the 'readline' module to handle line-by-line input.
        {
            input  :  process .stdin , // Set the input source to standard input.
            output :  process .stdout   // Set the output destination to standard output.
        }
    ) .on ( 'line' , function ( line ) // Attach a listener for each 'line' event.
    {
        // When a new line is received, push it into our 'lines' array.
        lines .push ( line ) ;
    } ) ;


    // Set up another event listener, this time for when the standard input stream 'ends'.
    process .stdin .on ( 'end' , function ( )
    {
        // Once all input is received, process the first line.
        // It takes the first 4 characters, adds a space, then the rest of the line.
        console .log ( lines [ 0 ] .substring ( 0 , 4 ) + ' ' + lines [ 0 ] .substring ( 4 ) ) ;

    } ) ;

} ) ( ) ; // Immediately-invoked function expression (IIFE) closure.