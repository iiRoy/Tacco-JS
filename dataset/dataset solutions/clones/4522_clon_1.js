/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered.
 */

// Define the primary function that processes the input data.
function   Main   (   input   )
{
    // The 'input' parameter initially holds the entire raw input string.
    // We now split it into an array of strings, one for each line.
    input = input.split ( "\n" ) ;


    // The first line of input (input[0]) contains space-separated values.
    // We split this first line by spaces to get individual string components.
    var   tmp   =   input [ 0 ] . split ( " " ) ;

    // At this point, all elements in 'tmp' are still strings.
    // They need to be converted to numeric types for arithmetic operations.

    // Parse the string values into integers (base 10).
    // The parseInt function is used for this conversion.
    var r = parseInt ( tmp [ 0 ] , 10 ) ;
    var g = parseInt ( tmp [ 1 ] , 10 ) ;
    var b = parseInt ( tmp [ 2 ] , 10 ) ;

    // Perform a weighted sum calculation.
    var s = 100 * r + 10 * g + b ;

    // Output the result based on a condition.
    // Check if the calculated sum 's' is perfectly divisible by 4.
    if   (   s   %   4   ==   0   )
    {
        // If divisible by 4, print "YES".
        console . log ( '%s' ,   'YES' ) ;
    }
    else
    {
        // Otherwise (if not divisible by 4), print "NO".
        console . log ( '%s' ,   'NO' ) ;
    }

    /*
     * Note on console.log format specifiers:
     * '%s' is used here to format a string argument.
     * Other common specifiers include '%d' for integers.
     */
} /* End of Main function definition */

/*
 * The following line handles reading input from standard input
 * and calling the Main function. It must not be modified.
 * It's part of the standard competitive programming setup.
 */
Main( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;