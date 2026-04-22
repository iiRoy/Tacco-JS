/*
 * This JavaScript function processes an input string to perform a specific calculation.
 * It reads three integer values from the first line of the input.
 */
function   Main (  input )
{
        // The input string is first split into an array of lines.
    input  =  input . split ( "\n" ) ;

    /*
     * Parse the first integer from the first line of the input.
     * The values are space-separated.
     */
    var   x   =   parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;

        // Parse the second integer from the first line.
    var   y   =   parseInt ( input [ 0 ] . split ( " " ) [ 1 ] ) ;

    // Parse the third integer from the first line.
    var   z   =   parseInt ( input [ 0 ] . split ( " " ) [ 2 ] ) ;

    // Initialize the answer variable to zero.
    var   ans   =   0 ;

    /*
     * Perform the core calculation:
     * (x - z) divided by (z + y), then take the floor of the result.
     * This ensures an integer result.
     */
    ans   =   Math . floor ( ( x   -   z )   /   ( z   +   y ) ) ;


    // Output the calculated answer to the console.
    console . log ( '%s' ,   ans ) ;
}

// Main execution block:
// Read input from standard input, decode it as UTF-8, and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;