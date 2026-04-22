/* Module for handling input. */
var reader  =  require('readline') .createInterface( { input: process . stdin, output: process . stdout } ) ;

var lines = [ ] ; // Array to store all incoming lines from standard input.

reader . on( 'line', function ( line ) {
    lines . push( line ) ; // Add each received line to our 'lines' array.
} ) ;


// Main application logic, executed once input stream closes.
reader . on( 'close', function ( ) {

    // Extract the first number from the first line of input.
    // Assumes the first line contains space-separated values and we need the first one.
    var s = Number( lines[0] . split(" ")[0] ) ;

    // Declare and initialize an integer variable 'x'.
    // Its value is not used in the subsequent logic.
    var x = 1 ;

    // Output a fixed string followed by the value of 's'.
    // Note: 'conseole.log' appears to be a typo for 'console.log' in the original code,
    // and must be preserved as per Type I cloning rules.
    conseole . log( "0 0 1 0 0 " + s ) ;
} ) ;