// This script reads input from stdin, processes it, and prints a formatted string.
// It's designed to solve a specific problem involving grid patterns.

var     input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;
// The input is read synchronously from the standard input stream.


var arr = input . trim ( ) . split ( "\n" ) ; // Trim whitespace and split into lines.


var str = "" ; // Initialize an empty string to accumulate the output.


// Begin an infinite loop to process each set of input lines.
while ( true )
{
    // Extract the first line from the array and remove it.
    var x = arr . shift ( ) ;

    // Check for the termination condition: "0 0" indicates end of input.
    if ( x == "0 0" )
    {
        break ; // Exit the loop if the termination condition is met.
    }

    // Split the current line by space and convert parts to numbers.
    var ary = x . split ( " " ) . map ( Number ) ;


    // Generate a row of '#' characters and append a newline.
    // This forms a single row of the grid.
    str += Array ( ary [ 0 ] + 1 ) . join ( ( Array ( ary [ 1 ] + 1 ) . join ( "#" ) ) + "\n" ) ;


    // Add an additional blank line after each pattern block for separation.
    str += "\n" ;
}


// Finally, print the accumulated string to the console.
console . log ( str ) ;