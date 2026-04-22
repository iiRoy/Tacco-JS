/* This is a JavaScript program */
/* It reads input from standard input, processes it, and prints results to standard output */


var input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
// The above line reads the entire content of /dev/stdin as a UTF-8 string.

var Arr     =   ( input . trim ( ) ) . split ( "\n" ) . map ( Number ) ;
// The input string is trimmed, then split by newlines, and each part is converted to a number.
// This results in an array of numbers.


/* Loop through the array, processing pairs of numbers */
for ( var i   =   0 ;   i   <   Arr . length ;   i   =   i   +   2 )
{
    // Extract the two numbers for the current iteration
    var x   =   Arr [ i ] ;
    var h   =   Arr [ i   +   1 ] ;

    // Check for the termination condition: x=0 and h=0
    if ( x   ==   0   &&   h   ==   0 )
    {
        break ; // Exit the loop if the condition is met
    }

    /* Calculate the surface area S using the given formula */
    // Formula: x * sqrt(4 * h * h + x * x) + x * x
    var S   =   x   *   Math . sqrt ( 4   *   h   *   h   +   x   *   x )   +   x   *   x ;

    // Print the calculated surface area, formatted to 5 decimal places
    console . log ( S . toFixed ( 5 ) ) ;

} // End of the main processing loop


/* End of program */