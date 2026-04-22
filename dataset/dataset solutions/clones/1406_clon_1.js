// This script reads input from stdin, processes it, and prints a pattern.
// It's a simple example demonstrating basic file I/O and string manipulation.

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
// The above line reads the entire content of standard input as a UTF-8 string.

var arr = input . trim ( ) . split ( "\n" ) ;
// The input string is then trimmed of leading/trailing whitespace
// and split into an array of lines based on the newline character.

/*
 * This is the main processing loop.
 * It continues indefinitely until a specific termination condition is met.
 */
while ( true )
{
    // Extract the first line from the array and remove it.
    var x = arr . shift ( ) ;

    // Check for the termination condition: "0 0"
    if ( x == "0 0" )
        break ; // Exit the loop if the condition is met.

    // Split the current line by space and convert parts to numbers.
    var ary = x . split ( " " ) . map ( Number ) ;

    /*
     * Generate the output string.
     * This involves creating a row of '#' characters,
     * then repeating that row multiple times,
     * effectively forming a rectangle of '#' symbols.
     * ary[0] determines the number of rows (height),
     * and ary[1] determines the number of '#' in each row (width).
     */
    var str = Array ( ary [ 0 ] + 1 ) . join ( ( Array ( ary [ 1 ] + 1 ) . join ( "#" ) ) + "\n" ) ;

    // Print the generated string to the console, followed by an additional newline.
    console . log ( str + "\n" ) ;

} // End of the main processing loop.