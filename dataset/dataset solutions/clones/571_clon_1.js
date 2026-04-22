/*
 * This JavaScript code reads input from standard input,
 * processes each line, and counts occurrences of
 * specific three-character sequences: "JOI" and "IOI".
 *
 * It demonstrates basic string manipulation and iteration in Node.js.
 */

// Import the 'fs' module, which provides file system functionality.
// Read the entire content of '/dev/stdin' as a UTF-8 string.
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );


// Trim any leading or trailing whitespace from the input string.
// Then, split the string into an array of lines using the newline character as a delimiter.
var Arr = ( input.trim() ).split( "\n" );


// Iterate over each element (which is a line from the input) in the 'Arr' array.
// The current line is passed as the parameter 'v' to the callback function.
Arr.forEach( function ( v ) {

    // Initialize a counter for occurrences of "JOI".
    var cntA = 0;

    // Initialize a counter for occurrences of "IOI".
    var cntB = 0;


    // Loop through the current line 'v' to check for three-character sequences.
    // The loop condition 'i < v.length - 2' ensures that 'v[i+2]' is always a valid index.
    for ( var i = 0; i < v.length - 2; i++ ) {

        // Concatenate the current character and the next two characters to form a three-character string.
        var str = v[i] + v[i+1] + v[i+2];


        // Check if the formed string 'str' is exactly "JOI".
        if ( str === "JOI" ) {
            // If it is, increment the counter for "JOI".
            cntA++;
        }


        // Check if the formed string 'str' is exactly "IOI".
        if ( str === "IOI" ) {
            // If it is, increment the counter for "IOI".
            cntB++;
        }
    } // End of the inner 'for' loop.


    // After processing the entire line, print the total count of "JOI" occurrences.
    console.log( cntA );


    // Then, print the total count of "IOI" occurrences.
    console.log( cntB );

} ); // End of the 'forEach' loop.

// End of the script.