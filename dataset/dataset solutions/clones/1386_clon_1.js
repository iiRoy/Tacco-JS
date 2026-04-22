/*
 * This script processes input from standard input,
 * treating each line as a separate case.
 * It then outputs each case prefixed with a case number.
 */

var hoge = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// The 'hoge' variable now contains the entire content read from stdin.

var num = hoge . split ( '\n' ) ;
// The content is split into an array of strings, where each string is a line.


// Initialize a loop to iterate through each item in the 'num' array.
for ( var i = 0 , iz = num . length ; i < iz ; i ++ )
{
    // Calculate the 1-based case number for the current iteration.
    var init = i + 1 ;

    // Output the current case number along with the corresponding line content.
    console . log ( 'Case ' + init + ': ' + num [ i ] ) ;
}

// End of script execution.