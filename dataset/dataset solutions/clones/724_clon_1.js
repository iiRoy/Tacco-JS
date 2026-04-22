/*
 * This script processes input from standard input to determine if
 * bracket sequences are balanced.
 */

// Import the 'fs' module for file system operations.
var input = require('fs') . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


// Read the entire input, trim whitespace, and split it into an array of lines.
var Arr = ( input.trim() ) . split ( "\n" ) ;


// Iterate through each line in the array.
for ( var i = 0 ;   i < Arr . length ;   i++ ) {

    // Get the current line.
    var   str   =   Arr [ i ] ;

    // If the line is a single dot, terminate the processing loop.
    if (   str   ==   "."   )
    {
        break ; // Exit the loop.
    }

    // Remove all alphabetic characters, dots, and whitespace from the string.
    str   =   str . replace ( / [a-zA-Z] | \. | \s /g ,   "" ) ;

    /*
     * Continuously remove empty bracket pairs '[]' and '()'
     * until no more such pairs can be found.
     */
    while (   str . match ( / \[\] | \(\) / )   )
    {
        str   =   str . replace ( / \[\] | \(\) /g ,   "" ) ;
    }

    // After processing, if the string is empty, it means all brackets were balanced.
    // Otherwise, they were not.
    console . log (   ( str   ==   "" )   ?   "yes"   :   "no"   ) ;
}

// End of script.