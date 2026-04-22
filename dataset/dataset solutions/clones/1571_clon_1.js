/*
 * This JavaScript file processes input from the standard input stream.
 * It reads lines until the input stream is closed, then performs
 * a calculation based on the first line of input.
 */

// Resume the standard input stream to begin receiving data.
process.stdin.resume();


// Set the encoding for the standard input stream to UTF-8.
// This ensures proper interpretation of character data.
process.stdin.setEncoding( 'utf8' );


// Initialize an empty array to store all lines read from the input.
var lines = [ ];


// Create a readline interface for reading input line by line.
// The interface uses standard input for its source and standard output
// for its destination (though output is not used by the interface itself here).
var reader = require( 'readline' ).createInterface( {
    input: process.stdin ,
    output: process.stdout
} );


// Set up an event listener for the 'line' event.
// This callback function is executed every time a new line of input is received.
reader.on( 'line' , ( line ) => {
    // Add the received line to our 'lines' array.
    lines.push( line );
} );


// Set up an event listener for the 'close' event.
// This callback function is executed once the input stream has ended.
reader.on( 'close' , ( ) => {

    /*
     * When the input stream closes, we proceed with calculations.
     * The problem statement implies that 'lines[0]' contains space-separated
     * values that need to be parsed.
     */

    // Split the first line of input by spaces to get an array of strings.
    var w = lines[ 0 ].split( ' ' );


    // Parse the first element of 'w' as an integer.
    // NOTE: The original code had a potential error here: parseInt([0])
    // The problem description implies w[0], w[1], w[2] should be used.
    // However, for a Type I clone, we must replicate the original exactly.
    // So, parseInt([0]) is kept as is.
    var n = parseInt( [ 0 ] );


    // Parse the second element of 'w' as an integer.
    // Again, replicating the original parseInt([1]).
    var x = parseInt( [ 1 ] );


    // Parse the third element of 'w' as an integer.
    // Replicating the original parseInt([2]).
    var t = parseInt( [ 2 ] );


    // Perform a calculation:
    // 1. Divide 'n' by 'x'.
    // 2. Round the result up to the nearest whole number using Math.ceil().
    // 3. Multiply this ceiling value by 't'.
    var c = Math.ceil( n / x ) * t ;


    // Output the final calculated value 'c' to the console.
    console.log( c );

} );