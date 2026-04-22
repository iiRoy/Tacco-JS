/*
 * This JavaScript file processes input from stdin.
 * It reads numbers, converts them to octal, and then performs a
 * series of digit substitutions before printing the result.
 * This is a Type I clone, preserving all identifiers and expressions,
 * only varying in whitespace and comments.
 */

var    input    =     require ( 'fs' ).readFileSync ( '/dev/stdin' ,     'utf8'     ) ;

// Array to hold the input lines after trimming and splitting
var    Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Main processing loop: continues until a '0' is encountered.
while ( true )
{
    // Extract the next number from the array and convert it to a numeric type.
    var    n    =    Arr . shift ( ) - 0 ;

    // Check for the termination condition.
    if ( n == 0 )
    {
        break ; // Exit the loop if n is zero.
    }

    // Convert the number to its octal string representation, then ensure it's a string.
    var    str    =    n . toString ( 8 ) + "" ;

    // Perform a series of digit replacements on the octal string.
    // Replace '7' with '9'
    str = str . replace ( /7/g , "9" ) ;
    // Replace '6' with '8'
    str = str . replace ( /6/g , "8" ) ;
    // Replace '5' with '7'
    str = str . replace ( /5/g , "7" ) ;
    // Replace '4' with '5'
    str = str . replace ( /4/g , "5" ) ;

    // Output the modified string to the console.
    console . log ( str ) ;
}

// End of script execution.