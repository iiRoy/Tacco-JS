/*
 * This JavaScript program defines a function 'Main' that processes input.
 * It calculates the maximum value among the sum, difference, and product
 * of two numbers provided in the input.
 *
 * This is a Type I code clone, meaning its functionality is identical
 * to the original, with variations only in whitespace and comments.
 */

function   Main   (   input   )
{
    // The 'Main' function begins its execution here.

    input   =   input   .   trim   ( ) ;
    /*
     * First, any leading or trailing whitespace characters are removed
     * from the 'input' string to ensure clean processing.
     */


    input   =   input   .   split   (   " "   )   .   map   (   Number   ) ;
    // The trimmed input string is then split into an array of substrings
    // using a space as the delimiter. Each substring is subsequently
    // converted into a numerical type.


    var   A   =   Math   .   max   (   input   [   0   ]   +   input   [   1   ]   ,
                                  input   [   0   ]   -   input   [   1   ]   ,
                                  input   [   0   ]   *   input   [   1   ]   ) ;
    /*
     * A new variable 'A' is declared and initialized.
     * Its value is determined by finding the maximum among three possible calculations
     * involving the first two numbers from the processed input array:
     * 1. Their sum (input[0] + input[1])
     * 2. Their difference (input[0] - input[1])
     * 3. Their product (input[0] * input[1])
     */


    if   (   A   ==   -0   )
    {
        // This conditional block checks for a specific edge case.
        // If the calculated value of 'A' happens to be negative zero (-0),
        // it is then explicitly set to positive zero (0) for consistency.
        A   =   0   ;
    }


    console   .   log   (   A   ) ;
    // Finally, the resulting value stored in variable 'A' is printed
    // to the standard output console.

} // End of the 'Main' function definition.


/*
 * This part of the script handles the initial call to the 'Main' function.
 * It uses Node.js's 'fs' module to synchronously read the entire content
 * of the standard input file ('/dev/stdin') as a UTF-8 encoded string.
 * This read content is then passed as the 'input' argument to the 'Main' function.
 */
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   ) ;