/*
 * This is a JavaScript program designed to read input lines
 * from standard input, process them, and then output a result
 * to standard output. It utilizes the 'readline' module.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Import the 'readline' module, which is essential for line-by-line input processing.
var      readline     =     require('readline' ) ;


// Initialize a readline interface to handle input and output streams.
var reader =  readline . createInterface ( {
    input   :      process . stdin    ,    /* Standard input stream */
    output  :      process . stdout       // Standard output stream
} ) ;



// This array will store all the lines read from the standard input.
var lines = [ ] ;


// Attach an event listener for the 'line' event.
// This function executes every time a new line of input is available.
reader.on ( 'line' ,   function ( line )
{
    // Add the currently read line to the 'lines' array.
    lines . push ( line ) ;
} ) ;


// Attach an event listener for the 'close' event.
// This function executes once the input stream has ended (e.g., EOF or process exit).
reader.on ( 'close' ,   function ( )
{
    /*
     * When the input stream closes, we proceed with the main logic.
     * The first line of input (lines[0]) is expected to be a number, N.
     * We will calculate the sum of numbers from 0 to N-1.
     */
    var   N    =    Number ( lines [ 0 ] )   ,   ans    =    0   ;  // Declare and initialize N and ans.

    // Begin a loop that iterates from i = 0 up to N-1.
    for ( var   i   =   0 ;   i   <   N ;   ++i )
    {
        ans    +=    i ;   // Accumulate the current value of 'i' into 'ans'.
    }

    // Finally, print the computed sum to the console.
    console . log ( ans ) ;
} ) ;