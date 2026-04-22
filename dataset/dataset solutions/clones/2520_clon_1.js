/*
 * This script processes input from stdin, collects lines,
 * and then performs a calculation on the first line.
 */
// Ensure standard input stream is active.
process. stdin . resume ( ) ;

    // Set the character encoding for the input stream to UTF-8.
    process . stdin . setEncoding ( 'utf8' ) ;


/* Declare a variable to store all input lines. */
var       lines    =    [ ]    ;


// Initialize the readline interface to handle input and output.
var      reader      =      require ( 'readline' )
            . createInterface (
                {
                    // Input stream source.
                    input:   process.stdin,

                    // Output stream destination.
                    output:  process.stdout
                }
            )
; // End of reader initialization.


/*
 * Event handler for each new line received from stdin.
 * The 'line' argument contains the current line of input.
 */
reader . on ( 'line' ,   (   line   )   =>   {

        // Store the received line in our array.
        lines . push ( line ) ;

} ) ;


/*
 * Event handler for when the input stream closes.
 * This is where final processing and output occurs.
 */
reader . on ( 'close' ,   (   )   =>   {

    // Parse the first line of input as a number.
    var     n     =     Number ( lines [ 0 ] ) ;

    // Perform a specific calculation and print the result to stdout.
    // The formula is (n + (n % 2)) / (2 * n).
    console . log (    (    n    +    (    n    %    2    )    )    /    (    2    *    n    )    ) ;

    // The commented-out loop for printing all lines has been removed.

} ) ;