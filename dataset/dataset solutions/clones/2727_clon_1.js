/*
 * This is a Type I clone example.
 * The original code calculates (input^2) * 3.
 * It reads input from standard input.
 */

'use strict' ; // Enforce strict mode for better error handling

// Main function definition
function   main ( stdin )
{
    // Convert the stdin string to a number
    const   input   =   Number ( stdin ) ;

    /*
     * Calculate the result:
     * 1. Raise the input to the power of 2 (square it).
     * 2. Multiply the result by 3.
     * 3. Print the final calculated value to the console.
     */
    console . log ( Math . pow ( input ,   2 )   *   3 ) ;
} // End of main function

// Execute the main function with data read from standard input
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;

// End of file