/*
 * This is the main program entry point.
 * It processes input to calculate a specific value.
 */
function main ( s )
{

    // Split the input string into an array of lines based on the newline character.
    s = s.split( "\n" ) ;

    // Parse the first line as 'r' and the second line as 'g'
    // 'r' and 'g' are assumed to be integers.
    var r = parseInt( s [ 0 ] ) , g = parseInt( s [ 1 ] ) ;

    // Calculate the result using the formula 2*g - r and print it to the console.
    console.log( 2 * g - r ) ;

} /* end of main function */


// This section handles reading input from standard input and
// passing it to the main function for processing.
main( require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) ) ;